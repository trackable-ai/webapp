"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sparkles, User } from "lucide-react";
import type { MessageRole, MessageAction } from "@/types";

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  actions?: MessageAction[];
  onActionClick?: (action: MessageAction) => void;
  userAvatarUrl?: string | null;
  className?: string;
}

export function ChatMessage({
  role,
  content,
  actions,
  onActionClick,
  userAvatarUrl,
  className,
}: ChatMessageProps) {
  const isAgent = role === "agent";

  return (
    <div
      className={cn(
        "flex gap-3",
        !isAgent && "flex-row-reverse",
        className
      )}
    >
      <Avatar className={cn("h-8 w-8 shrink-0", !isAgent && "order-2")}>
        {isAgent ? (
          <AvatarFallback className="bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </AvatarFallback>
        ) : (
          <>
            <AvatarImage src={userAvatarUrl || undefined} />
            <AvatarFallback className="bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-2 max-w-[80%]",
          !isAgent && "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5",
            isAgent
              ? "bg-agent-message rounded-tl-sm"
              : "bg-primary text-primary-foreground rounded-tr-sm"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={() => onActionClick?.(action)}
                className="h-8"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
