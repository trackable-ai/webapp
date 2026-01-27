import { createClient } from "@/lib/supabase/server";
import { createSSETransformStream } from "@/lib/trackable-agent/sse-transformer";
import { NextResponse } from "next/server";

export const maxDuration = 30;

const TRACKABLE_API_URL = process.env.TRACKABLE_API_URL;
if (!TRACKABLE_API_URL) {
  throw new Error("TRACKABLE_API_URL environment variable is required");
}

interface MessagePart {
  type: string;
  text?: string;
}

interface Message {
  role: string;
  content?: string;
  parts?: MessagePart[];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const messages: Message[] = body.messages || [];

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert Vercel AI SDK message format to OpenAI format
    const openaiMessages = messages.map((msg) => {
      // Extract text content from parts if present (Vercel AI SDK format)
      const content =
        msg.parts
          ?.filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("") ||
        msg.content ||
        "";

      return {
        role: msg.role as "system" | "user" | "assistant",
        content,
      };
    });

    // Filter out empty messages
    const validMessages = openaiMessages.filter((msg) => msg.content.trim());

    if (validMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No valid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build OpenAI-compatible request
    const openaiRequest = {
      model: "gemini-2.5-flash",
      messages: validMessages,
      stream: true,
      user: user?.id,
    };

    console.log(
      "Calling trackable-agent:",
      `${TRACKABLE_API_URL}/api/v1/chat/completions`,
    );

    // Call trackable-agent OpenAI-compatible endpoint
    const response = await fetch(
      `${TRACKABLE_API_URL}/api/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // TODO: Add service to service auth (webapp-api to trackable-agent) for production
          // "Authorization": `Bearer ${await getIdentityToken()}`,
        },
        body: JSON.stringify(openaiRequest),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Trackable-agent error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Trackable API error: ${response.status}` }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!response.body) {
      return new Response(JSON.stringify({ error: "No response body" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform OpenAI SSE stream to Vercel AI SDK Data Stream format
    const transformStream = createSSETransformStream();
    const transformedStream = response.body.pipeThrough(transformStream);

    return new Response(transformedStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Endpoint to clear chat session
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${TRACKABLE_API_URL}/api/v1/chat/sessions?user=${encodeURIComponent(user.id)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // TODO: Add service to service auth for production
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to clear session:", response.status, errorText);
      return NextResponse.json(
        { error: `Failed to clear session: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Clear session error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
}
