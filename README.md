# Trackable

Agentic AI tool for post-purchase experiences.

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

See [cloudbuild.yaml](cloudbuild.yaml) for Cloud Run deployment instructions.

## API Routes

| Endpoint | Method | Auth | DB Client | Description |
|----------|--------|------|-----------|-------------|
| `/api/agent/chat` | POST | User session | `createClient` | AI chat proxy to trackable-agent |
| `/api/agent/chat` | DELETE | User session | `createClient` | Clear chat session |
| `/api/agent/chat` | GET | None | None | Health check |
| `/api/orders` | POST | User session | `createClient` | Create order |
| `/api/orders/upload` | POST | User session | `createClient` | Upload order image |
| `/api/gmail/sync` | GET | User session | `createClient` | Get sync status |
| `/api/gmail/sync` | POST | User session | `createClient` | Trigger email sync |
| `/api/gmail/watch` | GET | User session | `createClient` | Get watch status |
| `/api/gmail/watch` | POST | User session | `createClient` | Setup Gmail watch |
| `/api/gmail/watch` | DELETE | User session | `createClient` | Stop Gmail watch |
| `/api/gmail/webhook` | POST | Webhook secret | `createAdminClient` | Pub/Sub push notifications |
| `/api/auth/callback` | GET | OAuth code | `createClient` | OAuth callback |

### Supabase Clients

- **`createClient`**: Uses user session from cookies. Subject to RLS policies. Use for user-initiated requests.
- **`createAdminClient`**: Uses service role key. Bypasses RLS. Use for webhooks, cron jobs, or any server-to-server context without a user session.
