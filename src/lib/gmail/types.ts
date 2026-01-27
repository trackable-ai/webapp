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
  access_token: string;
  refresh_token: string | null;
  token_type: string;
  expires_at: string | null;
  scope: string | null;
  created_at: string;
  updated_at: string;
}
