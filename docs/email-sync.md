# Gmail Email Sync Strategy

This document describes how Trackable synchronizes order-related emails from users' Gmail accounts.

## Overview

Trackable uses Gmail's [History API](https://developers.google.com/workspace/gmail/api/guides/sync) for efficient incremental synchronization. Instead of re-fetching all emails on every sync, we track the `historyId` to fetch only new messages since the last sync.

## Sync Types

### 1. Full Sync

**When:** First-time sync or when `forceFullSync: true` is passed.

**How:**
1. Search Gmail with order-related keywords
2. Fetch and process matching messages
3. Store `historyId` from the most recent message

```
POST /api/gmail/sync
{ "forceFullSync": true }
```

### 2. Partial Sync (Incremental)

**When:** User has a stored `last_history_id` from a previous sync.

**How:**
1. Call `history.list` with `startHistoryId`
2. Extract `messagesAdded` events
3. Filter messages matching order keywords
4. Process only new messages
5. Update stored `historyId`

```
POST /api/gmail/sync
```

### 3. Date-Filtered Sync (Fallback)

**When:** History API returns 404 (history expired, typically after ~1 week of inactivity).

**How:**
1. Use `last_sync_at` timestamp to build query: `(keywords) after:YYYY/MM/DD`
2. Fetch messages from that date range
3. Process matching messages
4. Store new `historyId`

This limits the scope to emails received since the last successful sync, rather than re-scanning the entire mailbox.

## Database Schema

```sql
-- Columns in user_gmail_tokens table
last_history_id TEXT      -- Gmail historyId for incremental sync
last_sync_at    TIMESTAMPTZ  -- Timestamp for date-filtered fallback
```

## API Reference

### POST `/api/gmail/sync`

Triggers a sync operation.

**Request:**
```json
{
  "maxResults": 50,        // Optional, default 50
  "forceFullSync": false   // Optional, forces full re-sync
}
```

**Response:**
```json
{
  "success": true,
  "syncType": "partial",   // "full" | "partial" | "date-filtered"
  "totalProcessed": 3,
  "newHistoryId": "12345",
  "emails": [
    {
      "id": "abc123",
      "subject": "Your order has shipped",
      "from": "orders@example.com",
      "date": "2025-01-30T10:00:00Z",
      "snippet": "Your order #12345...",
      "ingestion": {
        "success": true
      }
    }
  ]
}
```

### GET `/api/gmail/sync`

Returns current sync status.

**Response:**
```json
{
  "connected": true,
  "email": "user@example.com",
  "lastSynced": "2025-01-30T10:00:00Z",
  "hasHistoryId": true
}
```

## Order Keywords

Emails are filtered using these keywords:

- `order confirmation`
- `your order`
- `order receipt`
- `purchase confirmation`
- `shipping confirmation`
- `has shipped`
- `order #`
- `tracking number`

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        POST /api/gmail/sync                      │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Has last_history_id?   │
                    └─────────────────────────┘
                         │              │
                        No             Yes
                         │              │
                         ▼              ▼
                  ┌──────────┐   ┌─────────────────┐
                  │Full Sync │   │ history.list()  │
                  └──────────┘   └─────────────────┘
                         │              │
                         │         ┌────┴────┐
                         │      Success    404 Error
                         │         │          │
                         │         ▼          ▼
                         │   ┌──────────┐  ┌─────────────────┐
                         │   │ Partial  │  │ Has last_sync_at?│
                         │   │  Sync    │  └─────────────────┘
                         │   └──────────┘       │         │
                         │         │           Yes        No
                         │         │            │         │
                         │         │            ▼         ▼
                         │         │    ┌────────────┐ ┌──────────┐
                         │         │    │Date-Filter │ │Full Sync │
                         │         │    │   Sync     │ └──────────┘
                         │         │    └────────────┘      │
                         │         │            │           │
                         ▼         ▼            ▼           ▼
                    ┌─────────────────────────────────────────┐
                    │         Process & Ingest Emails          │
                    └─────────────────────────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │  Update last_history_id & last_sync_at  │
                    └─────────────────────────────────────────┘
```

## Error Handling

| Error | Handling |
|-------|----------|
| History expired (404) | Automatic fallback to date-filtered or full sync |
| Gmail rate limit | Return partial results, preserve sync state |
| Ingestion failure | Log error, continue processing other emails |

## Push Notifications (Phase 2)

Real-time email sync using [Gmail Push Notifications](https://developers.google.com/gmail/api/guides/push) via Google Cloud Pub/Sub.

### How It Works

```
Gmail → Pub/Sub Topic → POST /api/gmail/webhook → partialSync() → ingestEmail()
```

1. When Gmail connects, we call `gmail.users.watch()` to subscribe to notifications
2. Gmail sends a notification to Pub/Sub when new emails arrive
3. Pub/Sub pushes to our webhook with `emailAddress` and `historyId`
4. Webhook uses existing History API logic to process new messages

### API Reference

#### POST `/api/gmail/watch`

Set up watch subscription (called automatically on Gmail connect).

**Response:**
```json
{
  "success": true,
  "expiration": "2025-02-06T10:00:00Z",
  "resourceId": "12345"
}
```

#### GET `/api/gmail/watch`

Get watch subscription status.

**Response:**
```json
{
  "active": true,
  "expiration": "2025-02-06T10:00:00Z",
  "expiresIn": 604800
}
```

#### DELETE `/api/gmail/watch`

Stop watching for notifications.

#### POST `/api/gmail/webhook`

Receives Pub/Sub notifications (no auth - called by Google).

### Database Schema

```sql
-- Additional columns in user_gmail_tokens table
email             TEXT         -- User's email for webhook lookup
watch_expiration  TIMESTAMPTZ  -- When watch subscription expires (7 days)
watch_resource_id TEXT         -- Resource ID from watch response
```

### GCP Setup

1. Create Pub/Sub topic:
   ```bash
   gcloud pubsub topics create gmail-push-notifications
   ```

2. Grant Gmail publish permission:
   ```bash
   gcloud pubsub topics add-iam-policy-binding gmail-push-notifications \
     --member="serviceAccount:gmail-api-push@system.gserviceaccount.com" \
     --role="roles/pubsub.publisher"
   ```

3. Create push subscription:
   ```bash
   gcloud pubsub subscriptions create gmail-push-subscription \
     --topic=gmail-push-notifications \
     --push-endpoint=https://yourdomain.com/api/gmail/webhook
   ```

4. Set environment variable:
   ```
   GMAIL_PUBSUB_TOPIC=projects/{project-id}/topics/gmail-push-notifications
   ```

### Watch Renewal

Watch subscriptions expire after 7 days. Currently, watches must be renewed manually by calling `POST /api/gmail/watch` or reconnecting Gmail. Automatic renewal via cron can be added in the future.
