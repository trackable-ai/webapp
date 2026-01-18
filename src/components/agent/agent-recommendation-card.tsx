"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  RotateCcw,
  Package,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  Truck,
  Clock,
} from "lucide-react";
import type { AgentRecommendation } from "@/types";

interface AgentRecommendationCardProps {
  recommendation: AgentRecommendation;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

const typeIcons = {
  return: RotateCcw,
  exchange: RefreshCw,
  track: Package,
  contact_support: MessageSquare,
  deadline_warning: AlertTriangle,
  delivery_update: Truck,
};

const urgencyStyles = {
  critical: "border-l-4 border-l-status-alert bg-status-alert/5",
  high: "border-l-4 border-l-status-processing bg-status-processing/5",
  medium: "border-l-4 border-l-status-shipped bg-status-shipped/5",
  low: "border-l-4 border-l-muted-foreground/30",
};

const urgencyBadgeStyles = {
  critical: "bg-status-alert/10 text-status-alert border-status-alert/20",
  high: "bg-status-processing/10 text-status-processing border-status-processing/20",
  medium: "bg-status-shipped/10 text-status-shipped border-status-shipped/20",
  low: "bg-muted text-muted-foreground border-border",
};

export function AgentRecommendationCard({
  recommendation,
  onPrimaryAction,
  onSecondaryAction,
  className,
}: AgentRecommendationCardProps) {
  const Icon = typeIcons[recommendation.type] || Package;

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        urgencyStyles[recommendation.urgency],
        className
      )}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              recommendation.urgency === "critical"
                ? "bg-status-alert/10"
                : recommendation.urgency === "high"
                ? "bg-status-processing/10"
                : "bg-primary/10"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                recommendation.urgency === "critical"
                  ? "text-status-alert"
                  : recommendation.urgency === "high"
                  ? "text-status-processing"
                  : "text-primary"
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm">{recommendation.title}</h3>
              {(recommendation.urgency === "critical" ||
                recommendation.urgency === "high") && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    urgencyBadgeStyles[recommendation.urgency]
                  )}
                >
                  {recommendation.urgency === "critical" ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Urgent
                    </span>
                  ) : (
                    "Action needed"
                  )}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {recommendation.description}
            </p>
            {recommendation.reasoning && (
              <p className="mt-2 text-xs text-muted-foreground/80 italic">
                {recommendation.reasoning}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {(recommendation.primaryAction || recommendation.secondaryAction) && (
        <CardFooter className="gap-2 pt-0">
          {recommendation.primaryAction && (
            <Button
              size="sm"
              onClick={onPrimaryAction}
              className={cn(
                recommendation.urgency === "critical" &&
                  "bg-status-alert hover:bg-status-alert/90"
              )}
            >
              {recommendation.primaryAction.label}
            </Button>
          )}
          {recommendation.secondaryAction && (
            <Button size="sm" variant="ghost" onClick={onSecondaryAction}>
              {recommendation.secondaryAction.label}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
