import { createClient } from "@/lib/supabase/server";
import { getGmailClient } from "@/lib/gmail/client";
import { NextResponse } from "next/server";
import type { GmailMessage, ParsedOrderEmail } from "@/lib/gmail/types";

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

function parseOrderEmail(message: GmailMessage): ParsedOrderEmail {
  const headers = message.payload.headers;
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;

  const subject = getHeader("subject") || "";
  const from = getHeader("from") || "";
  const date = new Date(parseInt(message.internalDate));

  // Extract body content
  let body = "";
  if (message.payload.body?.data) {
    body = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
  } else if (message.payload.parts) {
    const textPart = message.payload.parts.find(
      (p) => p.mimeType === "text/plain"
    );
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
    }
  }

  return {
    messageId: message.id,
    from,
    subject,
    date,
    snippet: message.snippet,
    rawBody: body,
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
    const maxResults = body.maxResults || 20;

    const gmail = await getGmailClient();

    // Build search query for order-related emails
    const query = ORDER_KEYWORDS.map((k) => `"${k}"`).join(" OR ");

    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults,
    });

    const messages = response.data.messages || [];
    const parsedEmails: ParsedOrderEmail[] = [];

    for (const msg of messages) {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "full",
      });

      const parsed = parseOrderEmail(detail.data as GmailMessage);
      parsedEmails.push(parsed);
    }

    // Update last synced time
    await supabase
      .from("user_gmail_tokens")
      .update({ updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      count: parsedEmails.length,
      emails: parsedEmails.map((e) => ({
        id: e.messageId,
        subject: e.subject,
        from: e.from,
        date: e.date,
        snippet: e.snippet,
      })),
    });
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
      .select("updated_at")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      connected: !!tokens,
      email: user.email,
      lastSynced: tokens?.updated_at,
    });
  } catch (error) {
    console.error("Gmail status error:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}
