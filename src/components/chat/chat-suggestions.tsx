"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Suggestion } from "@/types";

interface ChatSuggestionsProps {
  suggestions: Suggestion[];
  onSelect: (prompt: string) => void;
  className?: string;
}

export function ChatSuggestions({
  suggestions,
  onSelect,
  className,
}: ChatSuggestionsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion.prompt)}
          className="h-8 text-xs"
        >
          {suggestion.label}
        </Button>
      ))}
    </div>
  );
}
