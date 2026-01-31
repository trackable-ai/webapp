import { createClient } from "@/lib/supabase/server";
import { getGmailClient } from "@/lib/gmail/client";
import { NextResponse } from "next/server";
import type {
  GmailMessage,
  GmailMessagePart,
  ParsedOrderEmail,
  GmailSyncResult,
  GmailHistoryResponse,
} from "@/lib/gmail/types";
import { ingestEmail } from "@/lib/trackable-agent/client";
import type { gmail_v1 } from "googleapis";

const ORDER_KEYWORDS = [
  "order confirmation",
  "your order",
  "order receipt",
  "purchase confirmation",
  "shipping confirmation",
  "has shipped",
  "order #",
  "tracking number",
];

// Recursively find text content in MIME parts
function findTextBody(
  part: GmailMessagePart,
  preferredType: "text/plain" | "text/html" = "text/plain",
): string {
  // Direct body data - check if this part matches what we want
  if (part.body?.data && part.mimeType === preferredType) {
    return Buffer.from(part.body.data, "base64").toString("utf-8");
  }

  // For parts without mimeType (top-level), check if body has data
  if (part.body?.data && !part.mimeType && !part.parts) {
    return Buffer.from(part.body.data, "base64").toString("utf-8");
  }

  // Recurse into nested parts
  if (part.parts) {
    // First, look for the preferred type at this level
    const preferred = part.parts.find((p) => p.mimeType === preferredType);
    if (preferred?.body?.data) {
      return Buffer.from(preferred.body.data, "base64").toString("utf-8");
    }

    // Recurse into multipart/* containers
    for (const subPart of part.parts) {
      if (subPart.mimeType?.startsWith("multipart/") || subPart.parts) {
        const body = findTextBody(subPart, preferredType);
        if (body) return body;
      }
    }
  }

  return "";
}

// Extract body, preferring text/plain but falling back to text/html
function extractEmailBody(payload: GmailMessagePart): string {
  // Try text/plain first
  let body = findTextBody(payload, "text/plain");
  if (body) return body;

  // Fall back to text/html (strip tags for plain text)
  body = findTextBody(payload, "text/html");
  if (body) {
    // Basic HTML tag stripping
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

function parseOrderEmail(message: GmailMessage): ParsedOrderEmail {
  const headers = message.payload.headers;
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;

  const subject = getHeader("subject") || "";
  const from = getHeader("from") || "";
  const date = new Date(parseInt(message.internalDate));

  // Extract body content (handles nested MIME structures)
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

// Format date for Gmail query (YYYY/MM/DD)
function formatDateForGmail(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

// Build the keyword search query
function buildKeywordQuery(): string {
  return ORDER_KEYWORDS.map((k) => `"${k}"`).join(" OR ");
}

// Fetch and process messages by IDs
async function fetchAndProcessMessages(
  gmail: gmail_v1.Gmail,
  messageIds: string[],
  userId: string,
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

      // Ingest email
      let ingestion: { success: boolean; error?: string };
      try {
        const result = await ingestEmail(
          {
            email_content: parsed.rawBody,
            email_subject: parsed.subject,
            email_from: parsed.from,
          },
          userId,
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
 * Searches for messages with keywords. No filters.
 *
 * @param gmail
 * @param maxResults
 * @returns
 */
async function fullSync(
  gmail: gmail_v1.Gmail,
  maxResults: number,
): Promise<{ messageIds: string[]; historyId: string | null }> {
  const query = buildKeywordQuery();
  const response = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  const messages = response.data.messages || [];
  const messageIds = messages.map((m) => m.id!);

  // Get historyId from the most recent message
  let historyId: string | null = null;
  if (messages.length > 0) {
    const firstMsg = await gmail.users.messages.get({
      userId: "me",
      id: messages[0].id!,
      format: "minimal",
    });
    historyId = firstMsg.data.historyId || null;
  }

  return { messageIds, historyId };
}

// Date-filtered sync: search with keywords + after:date
async function dateFilteredSync(
  gmail: gmail_v1.Gmail,
  lastSyncAt: Date,
  maxResults: number,
): Promise<{ messageIds: string[]; historyId: string | null }> {
  const dateStr = formatDateForGmail(lastSyncAt);
  const query = `(${buildKeywordQuery()}) after:${dateStr}`;

  const response = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  const messages = response.data.messages || [];
  const messageIds = messages.map((m) => m.id!);

  // Get historyId from the most recent message
  let historyId: string | null = null;
  if (messages.length > 0) {
    const firstMsg = await gmail.users.messages.get({
      userId: "me",
      id: messages[0].id!,
      format: "minimal",
    });
    historyId = firstMsg.data.historyId || null;
  }

  return { messageIds, historyId };
}

/**
 * Calls history.list API to get new messages since last sync
 *
 * @param gmail
 * @param startHistoryId
 * @returns
 */
async function partialSync(
  gmail: gmail_v1.Gmail,
  startHistoryId: string,
): Promise<{ messageIds: string[]; historyId: string | null }> {
  const response = await gmail.users.history.list({
    userId: "me",
    startHistoryId,
    historyTypes: ["messageAdded"],
  });

  const history = response.data as GmailHistoryResponse;
  const messageIds: string[] = [];

  // Extract message IDs from messagesAdded events
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const maxResults = body.maxResults || 50;
    const forceFullSync = body.forceFullSync || false;

    const gmail = await getGmailClient();

    // Get current sync state from database
    const { data: tokenData } = await supabase
      .from("user_gmail_tokens")
      .select("last_history_id, last_sync_at")
      .eq("user_id", user.id)
      .single();

    const lastHistoryId = forceFullSync ? null : tokenData?.last_history_id;
    const lastSyncAt = tokenData?.last_sync_at
      ? new Date(tokenData.last_sync_at)
      : null;

    let syncType: GmailSyncResult["syncType"];
    let messageIds: string[];
    let newHistoryId: string | null;

    if (!lastHistoryId) {
      // First sync or forced full sync
      console.log("Performing full sync");
      syncType = "full";
      const result = await fullSync(gmail, maxResults);
      messageIds = result.messageIds;
      newHistoryId = result.historyId;
    } else {
      // Try partial sync with history API
      try {
        console.log("Attempting partial sync with historyId:", lastHistoryId);
        const result = await partialSync(gmail, lastHistoryId);
        syncType = "partial";

        // Don't need to filter newly added messages on partial sync
        messageIds = result.messageIds;
        newHistoryId = result.historyId;
      } catch (err) {
        // Check if history expired (404 error)
        const isHistoryExpired =
          err instanceof Error &&
          (err.message.includes("404") ||
            err.message.includes("notFound") ||
            (err as { code?: number }).code === 404);

        if (isHistoryExpired && lastSyncAt) {
          // Fall back to date-filtered sync
          console.log("History expired, falling back to date-filtered sync");
          syncType = "date-filtered";
          const result = await dateFilteredSync(gmail, lastSyncAt, maxResults);
          messageIds = result.messageIds;
          newHistoryId = result.historyId;
        } else if (isHistoryExpired) {
          // No lastSyncAt, do full sync
          console.log("History expired and no lastSyncAt, doing full sync");
          syncType = "full";
          const result = await fullSync(gmail, maxResults);
          messageIds = result.messageIds;
          newHistoryId = result.historyId;
        } else {
          throw err;
        }
      }
    }

    // Fetch and process the messages
    const emails = await fetchAndProcessMessages(gmail, messageIds, user.id);

    // Update sync state in database
    const now = new Date().toISOString();
    await supabase
      .from("user_gmail_tokens")
      .update({
        last_history_id: newHistoryId,
        last_sync_at: now,
        updated_at: now,
      })
      .eq("user_id", user.id);

    const result: GmailSyncResult = {
      success: true,
      syncType,
      totalProcessed: emails.length,
      newHistoryId,
      emails,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gmail sync error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to sync emails";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: tokens } = await supabase
      .from("user_gmail_tokens")
      .select("updated_at, last_history_id, last_sync_at")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      connected: !!tokens,
      email: user.email,
      lastSynced: tokens?.last_sync_at || tokens?.updated_at,
      hasHistoryId: !!tokens?.last_history_id,
    });
  } catch (error) {
    console.error("Gmail status error:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 },
    );
  }
}
