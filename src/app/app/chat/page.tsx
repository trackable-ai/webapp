"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useMemo } from "react";
import { ChatMessage, ChatInput, ChatSuggestions } from "@/components/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Helper to extract text content from message parts
function getMessageContent(message: UIMessage): string {
  if (!message.parts || message.parts.length === 0) {
    return "";
  }
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

const suggestions = [
  "Where's my MacBook?",
  "Can I return the Nike shoes?",
  "Show my return deadlines",
  "What orders do I have?",
];

export default function ChatPage() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Create transport with custom API endpoint
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/agent/chat" }),
    []
  );

  const { messages, sendMessage, status, error } =
    useChat({
      transport,
      messages: [
        {
          id: "welcome",
          role: "assistant",
          parts: [
            {
              type: "text" as const,
              text: `Hi there! I'm Trackable, your personal shopping assistant. I can help you with:

• **Tracking orders** - Check delivery status and ETAs
• **Managing returns** - Understand policies and deadlines
• **Return deadlines** - Never miss a return window
• **Support** - Help contacting merchants

I'm currently tracking 5 orders for you. What would you like to know?`,
            },
          ],
        },
      ] as UIMessage[],
    });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (content: string) => {
    if (content.trim()) {
      sendMessage({ text: content });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold">Ask Trackable</h1>
          <p className="text-sm text-muted-foreground">
            Your AI shopping assistant
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || "Failed to get response. Please check your API key."}
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 py-4" ref={scrollAreaRef}>
        <div className="space-y-6 pr-4">
          {messages.map((message) => {
            const content = getMessageContent(message);
            if (!content) return null;
            return (
              <ChatMessage
                key={message.id}
                role={message.role === "user" ? "user" : "agent"}
                content={content}
              />
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-agent-message px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="py-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
          <ChatSuggestions
            suggestions={suggestions}
            onSelect={handleSend}
          />
        </div>
      )}

      {/* Input */}
      <div className="pt-4 border-t">
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          placeholder="Ask about your orders, returns, or tracking..."
        />
      </div>
    </div>
  );
}
