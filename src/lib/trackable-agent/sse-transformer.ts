/**
 * Transforms SSE events from trackable-agent API to Vercel AI SDK UIMessageChunk format.
 *
 * trackable-agent events:
 * - session: { type: "session", session_id, user_id }
 * - delta: { type: "delta", content }
 * - done: { type: "done", full_response }
 * - error: { type: "error", message }
 *
 * Vercel AI SDK UIMessageChunk events:
 * - start, start-step, text-start, text-delta, text-end, finish-step, finish
 */

interface TrackableEvent {
  type: "session" | "delta" | "done" | "error";
  session_id?: string;
  user_id?: string;
  content?: string;
  full_response?: string;
  message?: string;
}

export function createSSETransformStream(
  onSessionId?: (sessionId: string) => void
): TransformStream<Uint8Array, Uint8Array> {
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

        let event: TrackableEvent;
        try {
          event = JSON.parse(dataMatch[1]);
        } catch {
          console.error("Failed to parse SSE event:", dataMatch[1]);
          continue;
        }

        const chunks = transformEvent(event, started, textId, onSessionId);
        if (!started && chunks.length > 0) {
          started = true;
        }

        for (const uiChunk of chunks) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(uiChunk)}\n\n`));
        }
      }
    },

    flush(controller) {
      // Ensure we close properly if stream ends without done event
      if (started) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "text-end", id: textId })}\n\n`)
        );
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "finish-step" })}\n\n`));
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "finish", finishReason: "stop" })}\n\n`
          )
        );
      }
    },
  });
}

function transformEvent(
  event: TrackableEvent,
  started: boolean,
  textId: string,
  onSessionId?: (sessionId: string) => void
): object[] {
  const chunks: object[] = [];

  switch (event.type) {
    case "session":
      if (event.session_id && onSessionId) {
        onSessionId(event.session_id);
      }
      // Emit start sequence
      chunks.push({ type: "start" });
      chunks.push({ type: "start-step" });
      chunks.push({ type: "text-start", id: textId });
      break;

    case "delta":
      if (!started) {
        // If we get delta before session, emit start sequence first
        chunks.push({ type: "start" });
        chunks.push({ type: "start-step" });
        chunks.push({ type: "text-start", id: textId });
      }
      if (event.content) {
        chunks.push({ type: "text-delta", id: textId, delta: event.content });
      }
      break;

    case "done":
      chunks.push({ type: "text-end", id: textId });
      chunks.push({ type: "finish-step" });
      chunks.push({ type: "finish", finishReason: "stop" });
      break;

    case "error":
      chunks.push({ type: "error", errorText: event.message || "Unknown error" });
      break;
  }

  return chunks;
}
