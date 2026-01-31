import { google } from "googleapis";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { GmailTokens } from "./types";

export async function getGmailClient() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: tokens, error } = await supabase
    .from("user_gmail_tokens")
    .select("*")
    .eq("user_id", user.id)
    .single<GmailTokens>();

  if (error || !tokens) {
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

  // Handle token refresh
  oauth2Client.on("tokens", async (newTokens) => {
    if (newTokens.access_token) {
      await supabase
        .from("user_gmail_tokens")
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token ?? tokens.refresh_token,
          expires_at: newTokens.expiry_date
            ? new Date(newTokens.expiry_date).toISOString()
            : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function getGmailConnectionStatus() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { connected: false, email: null };

  const { data: tokens } = await supabase
    .from("user_gmail_tokens")
    .select("updated_at")
    .eq("user_id", user.id)
    .single();

  return {
    connected: !!tokens,
    email: user.email,
    lastSynced: tokens?.updated_at,
  };
}

/**
 * Get Gmail client for a specific user by ID.
 * Used by webhook handler where there's no session context.
 * Uses admin client to bypass RLS.
 */
export async function getGmailClientByUserId(userId: string) {
  const supabase = createAdminClient();

  const { data: tokens, error } = await supabase
    .from("user_gmail_tokens")
    .select("*")
    .eq("user_id", userId)
    .single<GmailTokens>();

  if (error || !tokens) {
    throw new Error("Gmail not connected for user");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  // Handle token refresh
  oauth2Client.on("tokens", async (newTokens) => {
    if (newTokens.access_token) {
      await supabase
        .from("user_gmail_tokens")
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token ?? tokens.refresh_token,
          expires_at: newTokens.expiry_date
            ? new Date(newTokens.expiry_date).toISOString()
            : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    }
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function disconnectGmail() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get the token to revoke it on Google's end
  const { data: tokens } = await supabase
    .from("user_gmail_tokens")
    .select("access_token")
    .eq("user_id", user.id)
    .single<GmailTokens>();

  if (tokens?.access_token) {
    // Revoke token on Google's end
    try {
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${tokens.access_token}`,
        { method: "POST" }
      );
    } catch {
      // Continue even if revocation fails
    }
  }

  // Delete tokens from database
  await supabase.from("user_gmail_tokens").delete().eq("user_id", user.id);
}
