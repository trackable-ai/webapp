import { createClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/supabase/auth";
import { getGmailClient } from "@/lib/gmail/client";
import { NextResponse } from "next/server";
import type { GmailSyncResult } from "@/lib/gmail/types";
import { fetchAndProcessMessages, partialSync } from "@/lib/gmail/sync";
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

// Format date for Gmail query (YYYY/MM/DD)
function formatDateForGmail(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

// Build the keyword search query
function buildKeywordQuery(): string {
  return ORDER_KEYWORDS.map((k) => `"${k}"`).join(" OR ");
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

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      const body = await request.json().catch(() => ({}));
      const maxResults = body.maxResults || 50;
      const forceFullSync = body.forceFullSync || false;

      const gmail = await getGmailClient();

      // Get current sync state from database
      const supabase = await createClient();
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
  });
}

export async function GET() {
  return withAuth(async (user) => {
    try {
      const supabase = await createClient();
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
  });
}
