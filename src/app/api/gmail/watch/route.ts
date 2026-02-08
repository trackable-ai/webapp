import { createClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/supabase/auth";
import { NextResponse } from "next/server";
import { setupWatch, stopWatch, getWatchStatus } from "@/lib/gmail/watch";
import type { GmailTokens } from "@/lib/gmail/types";

/**
 * GET /api/gmail/watch - Get watch subscription status
 */
export async function GET() {
  return withAuth(async (user) => {
    try {
      const status = await getWatchStatus(user.id);
      return NextResponse.json(status);
    } catch (error) {
      console.error("Watch status error:", error);
      return NextResponse.json(
        { error: "Failed to get watch status" },
        { status: 500 }
      );
    }
  });
}

/**
 * POST /api/gmail/watch - Set up watch subscription
 */
export async function POST() {
  return withAuth(async (user) => {
    try {
      // Get user's Gmail tokens
      const supabase = await createClient();
      const { data: tokens } = await supabase
        .from("user_gmail_tokens")
        .select("access_token, refresh_token")
        .eq("user_id", user.id)
        .single<GmailTokens>();

      if (!tokens) {
        return NextResponse.json(
          { error: "Gmail not connected" },
          { status: 400 }
        );
      }

      const result = await setupWatch(
        tokens.access_token,
        tokens.refresh_token,
        user.id
      );

      return NextResponse.json(result);
    } catch (error) {
      console.error("Watch setup error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to setup watch";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  });
}

/**
 * DELETE /api/gmail/watch - Stop watch subscription
 */
export async function DELETE() {
  return withAuth(async (user) => {
    try {
      await stopWatch(user.id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Watch stop error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to stop watch";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  });
}
