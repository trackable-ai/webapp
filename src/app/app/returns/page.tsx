"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeadlineCountdown, PriceDisplay } from "@/components/common";
import { mockOrders } from "@/data";
import { format } from "date-fns";
import { RotateCcw, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ReturnsPage() {
  const returnEligibleOrders = mockOrders.filter(
    (o) => o.status === "delivered" && o.returnPolicy?.isEligible
  );

  const sortedOrders = [...returnEligibleOrders].sort((a, b) => {
    const daysA = a.returnPolicy?.daysRemaining ?? 999;
    const daysB = b.returnPolicy?.daysRemaining ?? 999;
    return daysA - daysB;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Returns & Exchanges</h1>
        <p className="text-muted-foreground">
          Manage returns for your delivered orders.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-return/10">
                <RotateCcw className="h-6 w-6 text-status-return" />
              </div>
              <div>
                <p className="text-2xl font-bold">{returnEligibleOrders.length}</p>
                <p className="text-sm text-muted-foreground">Return Eligible</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-alert/10">
                <Package className="h-6 w-6 text-status-alert" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {sortedOrders.filter((o) => (o.returnPolicy?.daysRemaining ?? 0) <= 7).length}
                </p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-processing/10">
                <RotateCcw className="h-6 w-6 text-status-processing" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Return eligible orders */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Return Eligible Items</h2>

        {sortedOrders.length > 0 ? (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product image */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {order.items[0].imageUrl ? (
                        <Image
                          src={order.items[0].imageUrl}
                          alt={order.items[0].name}
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
                        <div>
                          <h3 className="font-semibold">{order.items[0].name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {order.merchant.name} · #{order.orderNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Delivered{" "}
                            {format(new Date(order.deliveredAt!), "MMMM d, yyyy")}
                          </p>
                        </div>
                        <PriceDisplay cents={order.totalCents} />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        {order.returnPolicy?.daysRemaining !== undefined && (
                          <DeadlineCountdown
                            daysRemaining={order.returnPolicy.daysRemaining}
                          />
                        )}

                        <div className="flex gap-2 ml-auto">
                          <Button size="sm" asChild>
                            <Link href={`/orders/${order.id}?tab=return`}>
                              Start Return
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/orders/${order.id}`}>
                              View Details
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {/* Policy summary */}
                      <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        <Badge variant="outline">
                          {order.returnPolicy?.freeReturn
                            ? "Free return"
                            : "Paid return"}
                        </Badge>
                        <Badge variant="outline">
                          {order.returnPolicy?.returnType === "full_refund"
                            ? "Full refund"
                            : order.returnPolicy?.returnType === "store_credit"
                            ? "Store credit"
                            : "Exchange only"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold">No return-eligible items</h3>
              <p className="text-sm text-muted-foreground">
                Items become return-eligible after delivery.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
