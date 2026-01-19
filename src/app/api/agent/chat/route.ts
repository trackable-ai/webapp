import { google } from "@ai-sdk/google";
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/gemini/prompts";
import { mockOrders } from "@/data";
import { fetchTracking } from "@/lib/tracking/mock-tracking-api";

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
      stopWhen: stepCountIs(5),
      toolChoice: "auto",
      onStepFinish: ({ stepType, toolCalls, toolResults, finishReason, text }) => {
        console.log("Step finished:", {
          stepType,
          finishReason,
          hasText: !!text,
          textLength: text?.length,
          toolCalls: toolCalls?.length,
          toolResults: toolResults?.length,
        });
        if (finishReason === "tool-calls") {
          console.log("Tool results being sent back to model for continuation...");
        }
      },
      onFinish: ({ text, finishReason, steps }) => {
        console.log("Stream finished:", {
          finishReason,
          textLength: text?.length,
          totalSteps: steps?.length,
        });
      },
      tools: {
        // Google Search for return policies, merchant info, etc.
        googleSearch: google.tools.googleSearch({
          description:
            "Search the web for information. Use this when users ask about return policies, merchant contact info, or any information not in the order context. Especially useful for finding official return/exchange policies from merchant websites.",
        }),
        // Package tracking tool
        trackShipment: tool({
          description:
            "Look up the real-time tracking status for a package. Call this function when a user provides a tracking number or asks about shipment status. You MUST extract the tracking number from the user message and pass it as the trackingNumber parameter.",
          parameters: z.object({
            trackingNumber: z.string({
              required_error: "Tracking number is required",
              description: "The tracking number to look up (e.g., 1Z999AA10123456784, 9400111899223456789012)",
            }),
            carrier: z.enum(["USPS", "UPS", "FedEx", "DHL", "Amazon"]).optional().describe(
              "The shipping carrier if known. Will be auto-detected if not provided."
            ),
          }),
          execute: async (args) => {
            console.log("trackShipment called with args:", JSON.stringify(args, null, 2));
            const { trackingNumber, carrier } = args;
            if (!trackingNumber) {
              return { error: "No tracking number provided" };
            }
            console.log(`Tracking shipment: ${trackingNumber}, carrier: ${carrier}`);
            const result = await fetchTracking(trackingNumber, carrier);
            console.log("Tracking result:", JSON.stringify(result, null, 2));
            return result;
          },
        }),
      },
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
