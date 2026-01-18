"use client";

import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface DeadlineCountdownProps {
  daysRemaining: number;
  deadlineDate?: string;
  className?: string;
}

export function DeadlineCountdown({
  daysRemaining,
  deadlineDate,
  className,
}: DeadlineCountdownProps) {
  const getUrgencyLevel = (days: number) => {
    if (days <= 1) return "critical";
    if (days <= 3) return "high";
    if (days <= 7) return "medium";
    return "low";
  };

  const urgency = getUrgencyLevel(daysRemaining);

  const urgencyStyles = {
    critical: "bg-status-alert/10 text-status-alert border-status-alert/20",
    high: "bg-status-processing/10 text-status-processing border-status-processing/20",
    medium: "bg-status-shipped/10 text-status-shipped border-status-shipped/20",
    low: "bg-muted text-muted-foreground border-border",
  };

  const progressPercentage = Math.max(0, Math.min(100, (daysRemaining / 30) * 100));

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2",
        urgencyStyles[urgency],
        className
      )}
    >
      {urgency === "critical" ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>
            {daysRemaining === 0
              ? "Expires today"
              : daysRemaining === 1
              ? "1 day left"
              : `${daysRemaining} days left`}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-background/50">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              urgency === "critical"
                ? "bg-status-alert"
                : urgency === "high"
                ? "bg-status-processing"
                : urgency === "medium"
                ? "bg-status-shipped"
                : "bg-muted-foreground"
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
