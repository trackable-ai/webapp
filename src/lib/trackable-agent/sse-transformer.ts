/**
 * Transforms SSE events from OpenAI-compatible API to Vercel AI SDK Data Stream format.
 *
 * OpenAI streaming format:
 * - data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}
 * - data: {"id":"chatcmpl-...","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}
 * - data: {"id":"chatcmpl-...","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}
 * - data: [DONE]
 *
 * Vercel AI SDK Data Stream format:
 * - start, start-step, text-start, text-delta, text-end, finish-step, finish
 */

interface OpenAIChunkDelta {
  role?: string;
  content?: string;
}

interface OpenAIChunkChoice {
  index: number;
  delta: OpenAIChunkDelta;
  finish_reason: string | null;
}

interface OpenAIChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChunkChoice[];
}

export function createSSETransformStream(): TransformStream<Uint8Array, Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";
  let started = false;
  const textId = "text-0";

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });

      // Process complete SSE messages (separated by double newlines)
      const messages = buffer.split("\n\n");
      buffer = messages.pop() || ""; // Keep incomplete message in buffer

      for (const message of messages) {
        if (!message.trim()) continue;

        // Parse SSE data line
        const dataMatch = message.match(/^data:\s*(.+)$/m);
        if (!dataMatch) continue;

        const data = dataMatch[1].trim();

        // Handle [DONE] signal
        if (data === "[DONE]") {
          if (started) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-end", id: textId })}\n\n`));
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "finish-step" })}\n\n`));
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "finish", finishReason: "stop" })}\n\n`));
          }
          continue;
        }

        let openaiChunk: OpenAIChunk;
        try {
          openaiChunk = JSON.parse(data);
        } catch {
          console.error("Failed to parse OpenAI SSE chunk:", data);
          continue;
        }

        const choice = openaiChunk.choices?.[0];
        if (!choice) continue;

        const delta = choice.delta;
        const finishReason = choice.finish_reason;

        // Emit start sequence on first content
        if (!started && (delta.role || delta.content)) {
          started = true;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "start" })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "start-step" })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-start", id: textId })}\n\n`));
        }

        // Emit text delta
        if (delta.content) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "text-delta", id: textId, delta: delta.content })}\n\n`)
          );
        }

        // Handle finish reason (alternative to [DONE])
        if (finishReason && started) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-end", id: textId })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "finish-step" })}\n\n`));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "finish", finishReason: finishReason })}\n\n`)
          );
          started = false; // Prevent duplicate finish on [DONE]
        }
      }
    },

    flush(controller) {
      // Ensure we close properly if stream ends unexpectedly
      if (started) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-end", id: textId })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "finish-step" })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "finish", finishReason: "stop" })}\n\n`));
      }
    },
  });
}
