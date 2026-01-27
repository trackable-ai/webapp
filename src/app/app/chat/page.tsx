"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useMemo } from "react";
import { ChatMessage, ChatInput, ChatSuggestions } from "@/components/chat";
import { Sparkles, AlertCircle } from "lucide-react";

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

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/agent/chat" }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({
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
    <div className="flex h-[calc(100vh-56px)] flex-col px-10 py-8 lg:h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E8E8E8] pb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF]">
          <Sparkles className="h-5 w-5 text-[#3B82F6]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-base font-semibold text-[#0D0D0D]">
            Ask Trackable
          </h1>
          <p className="text-xs font-normal text-[#7A7A7A]">
            Your AI shopping assistant
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#FEF2F2] p-4">
          <AlertCircle className="h-5 w-5 text-[#EF4444]" />
          <span className="text-sm font-normal text-[#EF4444]">
            {error.message || "Failed to get response. Please try again."}
          </span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto py-6">
        <div className="space-y-6">
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF]">
                <Sparkles className="h-4 w-4 animate-pulse text-[#3B82F6]" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-[#EFF6FF] px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#3B82F6]/40 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#3B82F6]/40 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#3B82F6]/40" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="border-t border-[#E8E8E8] py-4">
          <p className="mb-2 text-xs font-normal text-[#7A7A7A]">Try asking:</p>
          <ChatSuggestions suggestions={suggestions} onSelect={handleSend} />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[#E8E8E8] pt-4">
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          placeholder="Ask about your orders, returns, or tracking..."
        />
      </div>
    </div>
  );
}
