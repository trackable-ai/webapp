"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Package,
  Truck,
  CheckCircle2,
  Circle,
  MapPin,
} from "lucide-react";
import type { TrackingEvent, ShipmentStatus } from "@/types";

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: ShipmentStatus;
  className?: string;
}

const statusIcons: Record<string, typeof Package> = {
  Delivered: CheckCircle2,
  "Out for Delivery": Truck,
  "In Transit": Package,
  Shipped: Package,
};

export function TrackingTimeline({
  events,
  currentStatus,
  className,
}: TrackingTimelineProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="space-y-0">
        {events.map((event, index) => {
          const isFirst = index === 0;
          const isLast = index === events.length - 1;
          const Icon = statusIcons[event.status] || Circle;

          return (
            <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Timeline line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[15px] top-8 h-full w-0.5",
                    isFirst ? "bg-primary" : "bg-border"
                  )}
                />
              )}

              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  isFirst
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={cn(
                        "font-medium",
                        isFirst ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {event.status}
                    </p>
                    {event.statusDetail && (
                      <p className="text-sm text-muted-foreground">
                        {event.statusDetail}
                      </p>
                    )}
                  </div>
                  <time className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(event.occurredAt), "MMM d, h:mm a")}
                  </time>
                </div>
                {event.location && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
