import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { buildSystemPrompt } from "@/lib/gemini/prompts";
import { mockOrders } from "@/data";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const maxDuration = 30;

// Test endpoint
export async function GET() {
  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received body:", JSON.stringify(body, null, 2));

    // Convert UI messages to model messages format
    const messages: Message[] = (body.messages || []).map(
      (msg: { role: string; parts?: { type: string; text: string }[]; content?: string }) => ({
        role: msg.role as "user" | "assistant",
        content:
          msg.parts
            ?.filter((p: { type: string }) => p.type === "text")
            .map((p: { text: string }) => p.text)
            .join("") || msg.content || "",
      })
    );

    console.log("Converted messages:", JSON.stringify(messages, null, 2));

    // Check if API key is set
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build system prompt with current order context
    const systemPrompt = buildSystemPrompt(mockOrders);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
