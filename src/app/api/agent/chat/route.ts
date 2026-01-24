import { cookies } from "next/headers";
import { createSSETransformStream } from "@/lib/trackable-agent/sse-transformer";

export const maxDuration = 30;

const TRACKABLE_API_URL = process.env.TRACKABLE_API_URL || "http://127.0.0.1:8000";

// Health check endpoint
export async function GET() {
  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract the last user message
    const messages = body.messages || [];
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return new Response(JSON.stringify({ error: "No user message found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract text content from message
    const messageText =
      lastMessage.parts
        ?.filter((p: { type: string }) => p.type === "text")
        .map((p: { text: string }) => p.text)
        .join("") ||
      lastMessage.content ||
      "";

    if (!messageText.trim()) {
      return new Response(JSON.stringify({ error: "Empty message" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get session ID from cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("chat_session_id")?.value;

    // TODO: Get user ID from Supabase auth when implemented
    const userId = "default_user";

    // Build request to trackable-agent
    const trackableRequest = {
      message: messageText,
      user_id: userId,
      ...(sessionId && { session_id: sessionId }),
    };

    console.log("Calling trackable-agent:", TRACKABLE_API_URL, trackableRequest);

    // Call trackable-agent streaming endpoint
    const response = await fetch(`${TRACKABLE_API_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: Add GCP Identity Token for production
        // "Authorization": `Bearer ${await getIdentityToken()}`,
      },
      body: JSON.stringify(trackableRequest),
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

    // Transform SSE stream from trackable-agent format to Vercel AI SDK format
    const transformStream = createSSETransformStream();

    const transformedStream = response.body.pipeThrough(transformStream);

    // Create response with session cookie if new session
    const responseHeaders = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Note: We can't set cookies during streaming, so we'll handle session
    // persistence differently - the session ID is sent in the SSE stream
    // and the client can store it

    return new Response(transformedStream, { headers: responseHeaders });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Endpoint to clear session
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("chat_session_id");
  return new Response(JSON.stringify({ message: "Session cleared" }), {
    headers: { "Content-Type": "application/json" },
  });
}
