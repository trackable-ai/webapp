"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriceDisplay, DeadlineCountdown } from "@/components/common";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Package, ChevronRight, Truck } from "lucide-react";
import type { Order } from "@/types";

interface OrderCardProps {
  order: Order;
  variant?: "default" | "compact";
  className?: string;
}

export function OrderCard({
  order,
  variant = "default",
  className,
}: OrderCardProps) {
  const firstItem = order.items[0];
  const additionalItems = order.items.length - 1;

  if (variant === "compact") {
    return (
      <Link href={`/orders/${order.id}`}>
        <Card
          className={cn(
            "transition-all hover:shadow-md hover:border-primary/20 cursor-pointer",
            className
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Product image */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {firstItem.imageUrl ? (
                  <Image
                    src={firstItem.imageUrl}
                    alt={firstItem.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Order info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{firstItem.name}</p>
                  {additionalItems > 0 && (
                    <span className="text-xs text-muted-foreground">
                      +{additionalItems} more
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {order.merchant.name} · #{order.orderNumber}
                </p>
              </div>

              {/* Status */}
              <StatusBadge status={order.status} className="shrink-0" />

              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product image */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
            {firstItem.imageUrl ? (
              <Image
                src={firstItem.imageUrl}
                alt={firstItem.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Order details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{firstItem.name}</h3>
                {firstItem.variant && (
                  <p className="text-sm text-muted-foreground">
                    {firstItem.variant}
                  </p>
                )}
                {additionalItems > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    +{additionalItems} more {additionalItems === 1 ? "item" : "items"}
                  </p>
                )}
              </div>
              <PriceDisplay cents={order.totalCents} size="lg" />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {order.merchant.name}
              </span>
              <span>Order #{order.orderNumber}</span>
              <span>
                {order.status === "delivered"
                  ? `Delivered ${format(new Date(order.deliveredAt!), "MMM d")}`
                  : `Ordered ${format(new Date(order.orderedAt), "MMM d")}`}
              </span>
            </div>

            {/* Status and tracking */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StatusBadge status={order.status} />

              {order.shipment &&
                order.status === "shipped" &&
                order.shipment.estimatedDeliveryAt && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>
                      Est. delivery{" "}
                      {format(new Date(order.shipment.estimatedDeliveryAt), "MMM d")}
                    </span>
                  </div>
                )}

              {order.returnPolicy?.isEligible &&
                order.status === "delivered" &&
                order.returnPolicy.daysRemaining && (
                  <DeadlineCountdown
                    daysRemaining={order.returnPolicy.daysRemaining}
                    className="ml-auto"
                  />
                )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/orders/${order.id}`}>View Details</Link>
              </Button>
              {order.shipment && order.status !== "delivered" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/orders/${order.id}?tab=tracking`}>
                    Track Package
                  </Link>
                </Button>
              )}
              {order.returnPolicy?.isEligible && order.status === "delivered" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/orders/${order.id}?tab=return`}>
                    Return Options
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
