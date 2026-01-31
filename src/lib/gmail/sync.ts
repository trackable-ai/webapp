import type { gmail_v1 } from "googleapis";
import type {
  GmailMessage,
  GmailMessagePart,
  GmailSyncResult,
  GmailHistoryResponse,
} from "./types";
import { ingestEmail } from "@/lib/trackable-agent/client";

// Recursively find text content in MIME parts
function findTextBody(
  part: GmailMessagePart,
  preferredType: "text/plain" | "text/html" = "text/plain"
): string {
  if (part.body?.data && part.mimeType === preferredType) {
    return Buffer.from(part.body.data, "base64").toString("utf-8");
  }

  if (part.body?.data && !part.mimeType && !part.parts) {
    return Buffer.from(part.body.data, "base64").toString("utf-8");
  }

  if (part.parts) {
    const preferred = part.parts.find((p) => p.mimeType === preferredType);
    if (preferred?.body?.data) {
      return Buffer.from(preferred.body.data, "base64").toString("utf-8");
    }

    for (const subPart of part.parts) {
      if (subPart.mimeType?.startsWith("multipart/") || subPart.parts) {
        const body = findTextBody(subPart, preferredType);
        if (body) return body;
      }
    }
  }

  return "";
}

function extractEmailBody(payload: GmailMessagePart): string {
  let body = findTextBody(payload, "text/plain");
  if (body) return body;

  body = findTextBody(payload, "text/html");
  if (body) {
    return body
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return "";
}

function parseOrderEmail(message: GmailMessage) {
  const headers = message.payload.headers;
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;

  const subject = getHeader("subject") || "";
  const from = getHeader("from") || "";
  const date = new Date(parseInt(message.internalDate));
  const body = extractEmailBody(message.payload);

  return {
    messageId: message.id,
    from,
    subject,
    date,
    snippet: message.snippet,
    rawBody: body,
  };
}

/**
 * Fetch and process messages by IDs.
 * Shared between manual sync and webhook processing.
 */
export async function fetchAndProcessMessages(
  gmail: gmail_v1.Gmail,
  messageIds: string[],
  userId: string
): Promise<GmailSyncResult["emails"]> {
  const results: GmailSyncResult["emails"] = [];

  for (const messageId of messageIds) {
    try {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const parsed = parseOrderEmail(detail.data as GmailMessage);

      let ingestion: { success: boolean; error?: string };
      try {
        const result = await ingestEmail(
          {
            email_content: parsed.rawBody,
            email_subject: parsed.subject,
            email_from: parsed.from,
          },
          userId
        );
        ingestion = { success: result.success, error: result.error };
      } catch (err) {
        ingestion = {
          success: false,
          error: err instanceof Error ? err.message : "Ingestion failed",
        };
      }

      results.push({
        id: parsed.messageId,
        subject: parsed.subject,
        from: parsed.from,
        date: parsed.date,
        snippet: parsed.snippet,
        ingestion,
      });
    } catch (err) {
      console.error(`Failed to fetch message ${messageId}:`, err);
    }
  }

  return results;
}

/**
 * Get new messages since last sync using History API.
 * Shared between manual sync and webhook processing.
 */
export async function partialSync(
  gmail: gmail_v1.Gmail,
  startHistoryId: string
): Promise<{ messageIds: string[]; historyId: string | null }> {
  const response = await gmail.users.history.list({
    userId: "me",
    startHistoryId,
    historyTypes: ["messageAdded"],
  });

  const history = response.data as GmailHistoryResponse;
  const messageIds: string[] = [];

  if (history.history) {
    for (const record of history.history) {
      if (record.messagesAdded) {
        for (const added of record.messagesAdded) {
          messageIds.push(added.message.id);
        }
      }
    }
  }

  return {
    messageIds,
    historyId: history.historyId || null,
  };
}
