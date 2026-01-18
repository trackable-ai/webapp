"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentBriefingProps {
  userName?: string;
  ordersCount: number;
  urgentCount: number;
  className?: string;
}

export function AgentBriefing({
  userName = "there",
  ordersCount,
  urgentCount,
  className,
}: AgentBriefingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getBriefingMessage = () => {
    if (urgentCount > 0) {
      return `Here's what needs your attention today. You have ${urgentCount} urgent ${
        urgentCount === 1 ? "item" : "items"
      } requiring action.`;
    }
    if (ordersCount > 0) {
      return `I'm keeping an eye on ${ordersCount} ${
        ordersCount === 1 ? "order" : "orders"
      } for you. Everything looks good for now.`;
    }
    return "Connect your Gmail to start tracking your orders automatically.";
  };

  return (
    <Card className={cn("bg-agent-message", className)}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <p className="text-lg font-medium">
              {getGreeting()}, {userName}!
            </p>
            <p className="text-muted-foreground">{getBriefingMessage()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
