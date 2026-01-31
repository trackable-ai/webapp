import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import type { GmailTokens } from "./types";

export interface WatchResult {
  success: boolean;
  expiration: string | null;
  /** The historyId at the time the watch was set up */
  historyId: string | null;
}

/**
 * Set up Gmail watch subscription for push notifications.
 * Requires GMAIL_PUBSUB_TOPIC env variable to be set.
 */
export async function setupWatch(
  accessToken: string,
  refreshToken: string | null,
  userId: string
): Promise<WatchResult> {
  const topicName = process.env.GMAIL_PUBSUB_TOPIC;
  if (!topicName) {
    throw new Error("GMAIL_PUBSUB_TOPIC environment variable not set");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const response = await gmail.users.watch({
    userId: "me",
    requestBody: {
      topicName,
      labelIds: ["INBOX"],
      labelFilterBehavior: "include",
    },
  });

  const expiration = response.data.expiration
    ? new Date(parseInt(response.data.expiration)).toISOString()
    : null;
  // The watch API returns historyId (stored in watch_resource_id column for tracking)
  const historyId = response.data.historyId || null;

  // Store watch info in database
  const supabase = await createClient();
  await supabase
    .from("user_gmail_tokens")
    .update({
      watch_expiration: expiration,
      watch_resource_id: historyId,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return {
    success: true,
    expiration,
    historyId,
  };
}

/**
 * Stop Gmail watch subscription for a user.
 */
export async function stopWatch(userId: string): Promise<void> {
  const supabase = await createClient();

  const { data: tokens } = await supabase
    .from("user_gmail_tokens")
    .select("access_token, refresh_token")
    .eq("user_id", userId)
    .single<GmailTokens>();

  if (!tokens) {
    throw new Error("Gmail not connected");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  await gmail.users.stop({ userId: "me" });

  // Clear watch info from database
  await supabase
    .from("user_gmail_tokens")
    .update({
      watch_expiration: null,
      watch_resource_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

/**
 * Get watch status for a user.
 */
export async function getWatchStatus(userId: string): Promise<{
  active: boolean;
  expiration: string | null;
  expiresIn: number | null;
}> {
  const supabase = await createClient();

  const { data: tokens } = await supabase
    .from("user_gmail_tokens")
    .select("watch_expiration")
    .eq("user_id", userId)
    .single();

  if (!tokens?.watch_expiration) {
    return { active: false, expiration: null, expiresIn: null };
  }

  const expirationDate = new Date(tokens.watch_expiration);
  const now = new Date();
  const expiresIn = Math.max(0, expirationDate.getTime() - now.getTime());
  const active = expiresIn > 0;

  return {
    active,
    expiration: tokens.watch_expiration,
    expiresIn: active ? Math.floor(expiresIn / 1000) : null,
  };
}
