import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGmailClientByUserId } from "@/lib/gmail/client";
import { partialSync, fetchAndProcessMessages } from "@/lib/gmail/sync";
import type { GmailTokens } from "@/lib/gmail/types";

interface PubSubMessage {
  message: {
    data: string;
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

interface GmailNotification {
  emailAddress: string;
  historyId: string;
}

/**
 * POST /api/gmail/webhook - Handle Gmail push notifications from Pub/Sub
 *
 * This endpoint is called by Google Pub/Sub when new emails arrive.
 * Authentication is via a secret token in the URL query parameter.
 */
export async function POST(request: Request) {
  // Validate webhook secret
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token || token !== process.env.WEBHOOK_SECRET) {
    console.error("Webhook: Invalid or missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as PubSubMessage;

    // Parse the base64-encoded message data
    if (!body.message?.data) {
      console.error("Webhook: Missing message data");
      return NextResponse.json(
        { error: "Missing message data" },
        { status: 400 },
      );
    }

    const decodedData = Buffer.from(body.message.data, "base64").toString(
      "utf-8",
    );
    const notification = JSON.parse(decodedData) as GmailNotification;

    console.log("Webhook received:", {
      emailAddress: notification.emailAddress,
      historyId: notification.historyId,
      messageId: body.message.messageId,
    });

    // Look up user by email address in user_gmail_tokens
    const supabase = await createClient();

    const { data: tokens } = await supabase
      .from("user_gmail_tokens")
      .select("user_id, last_history_id, last_sync_at")
      .eq("email", notification.emailAddress.toLowerCase())
      .single<GmailTokens>();

    if (!tokens) {
      console.log(
        "Webhook: No tokens found for email:",
        notification.emailAddress,
      );
      // Return 200 to acknowledge - don't want Pub/Sub to retry
      return NextResponse.json({ status: "user_not_found" });
    }

    const userId = tokens.user_id;
    const lastHistoryId = tokens.last_history_id;

    // Skip if we don't have a history ID to compare against
    if (!lastHistoryId) {
      console.log("Webhook: No last_history_id, skipping");
      return NextResponse.json({ status: "no_history_id" });
    }

    // Skip if the notification historyId is not newer
    if (BigInt(notification.historyId) <= BigInt(lastHistoryId)) {
      console.log("Webhook: History ID not newer, skipping");
      return NextResponse.json({ status: "already_synced" });
    }

    // Process new messages
    const gmail = await getGmailClientByUserId(userId);

    try {
      const syncResult = await partialSync(gmail, lastHistoryId);

      if (syncResult.messageIds.length > 0) {
        console.log(
          `Webhook: Processing ${syncResult.messageIds.length} new messages`,
        );
        await fetchAndProcessMessages(gmail, syncResult.messageIds, userId);
      }

      // Update sync state
      const now = new Date().toISOString();
      await supabase
        .from("user_gmail_tokens")
        .update({
          last_history_id: syncResult.historyId || notification.historyId,
          last_sync_at: now,
          updated_at: now,
        })
        .eq("user_id", userId);

      return NextResponse.json({
        status: "processed",
        messagesProcessed: syncResult.messageIds.length,
      });
    } catch (err) {
      // Check if history expired (404)
      const isHistoryExpired =
        err instanceof Error &&
        (err.message.includes("404") ||
          err.message.includes("notFound") ||
          (err as { code?: number }).code === 404);

      if (isHistoryExpired) {
        console.log("Webhook: History expired, updating historyId only");
        // Just update the history ID so next sync works
        await supabase
          .from("user_gmail_tokens")
          .update({
            last_history_id: notification.historyId,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        return NextResponse.json({ status: "history_expired_updated" });
      }

      throw err;
    }
  } catch (error) {
    console.error("Webhook error:", error);
    // Return 200 to prevent Pub/Sub retries for unrecoverable errors
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
