export interface GmailMessagePart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailMessagePart[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: GmailMessagePart & {
    headers: Array<{ name: string; value: string }>;
  };
  internalDate: string;
}

export interface ParsedOrderEmail {
  messageId: string;
  from: string;
  subject: string;
  date: Date;
  snippet: string;
  merchantName?: string;
  orderNumber?: string;
  totalAmount?: number;
  items?: Array<{
    name: string;
    quantity: number;
    price?: number;
  }>;
  trackingNumber?: string;
  rawBody: string;
}

export interface GmailTokens {
  id: string;
  user_id: string;
  email: string | null;
  access_token: string;
  refresh_token: string | null;
  token_type: string;
  expires_at: string | null;
  scope: string | null;
  created_at: string;
  updated_at: string;
  last_history_id: string | null;
  last_sync_at: string | null;
  // Push notification fields
  watch_expiration: string | null;
  watch_resource_id: string | null;
}

export interface GmailSyncResult {
  success: boolean;
  syncType: "full" | "partial" | "date-filtered";
  totalProcessed: number;
  newHistoryId: string | null;
  emails: Array<{
    id: string;
    subject: string;
    from: string;
    date: Date;
    snippet: string;
    ingestion?: {
      success: boolean;
      error?: string;
    };
  }>;
}

export interface GmailHistoryResponse {
  history?: Array<{
    id: string;
    messagesAdded?: Array<{
      message: {
        id: string;
        threadId: string;
        labelIds?: string[];
      };
    }>;
  }>;
  historyId: string;
  nextPageToken?: string;
}
