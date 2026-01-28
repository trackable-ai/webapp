import { createClient } from "@/lib/supabase/server";
import { getGmailClient } from "@/lib/gmail/client";
import { NextResponse } from "next/server";
import type {
  GmailMessage,
  GmailMessagePart,
  ParsedOrderEmail,
} from "@/lib/gmail/types";
import { ingestEmail } from "@/lib/trackable-agent/client";
import type { EmailIngestionResult } from "@/lib/trackable-agent/types";

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

    // Submit emails to Trackable API for ingestion
    const ingestionResults = await Promise.allSettled(
      parsedEmails.map((email) =>
        ingestEmail(
          {
            email_content: email.rawBody,
            email_subject: email.subject,
            email_from: email.from,
          },
          user.id,
        ),
      ),
    );

    // Map ingestion results to emails
    const emailsWithIngestion = parsedEmails.map((email, index) => {
      const result = ingestionResults[index];
      let ingestion: EmailIngestionResult | undefined;

      if (result.status === "fulfilled") {
        ingestion = result.value;
      } else {
        ingestion = { success: false, error: result.reason?.message };
      }

      return {
        id: email.messageId,
        subject: email.subject,
        from: email.from,
        date: email.date,
        snippet: email.snippet,
        rawBody: email.rawBody,
        ingestion,
      };
    });

    // Update last synced time
    await supabase
      .from("user_gmail_tokens")
      .update({ updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      count: emailsWithIngestion.length,
      emails: emailsWithIngestion,
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
      { status: 500 },
    );
  }
}
