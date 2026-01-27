import { createSSETransformStream } from "@/lib/trackable-agent/sse-transformer";

export const maxDuration = 30;

const TRACKABLE_API_URL = process.env.TRACKABLE_API_URL || "http://127.0.0.1:8000";

// Health check endpoint
export async function GET() {
  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
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

    // TODO: Get user ID from Supabase auth when implemented
    const userId = "default_user";

    // Build OpenAI-compatible request
    const openaiRequest = {
      model: "gemini-2.5-flash",
      messages: validMessages,
      stream: true,
      user: userId,
    };

    console.log("Calling trackable-agent:", `${TRACKABLE_API_URL}/api/v1/chat/completions`);

    // Call trackable-agent OpenAI-compatible endpoint
    const response = await fetch(`${TRACKABLE_API_URL}/api/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: Add GCP Identity Token for production
        // "Authorization": `Bearer ${await getIdentityToken()}`,
      },
      body: JSON.stringify(openaiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Trackable-agent error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Trackable API error: ${response.status}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
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

// Endpoint to clear session (kept for potential future use)
export async function DELETE() {
  return new Response(JSON.stringify({ message: "Session cleared" }), {
    headers: { "Content-Type": "application/json" },
  });
}
