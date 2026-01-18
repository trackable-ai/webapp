"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TrackingTimeline, ReturnPolicyCard } from "@/components/orders";
import { StatusBadge, PriceDisplay } from "@/components/common";
import { AgentRecommendationCard } from "@/components/agent";
import { getOrderById, mockRecommendations } from "@/data";
import { format } from "date-fns";
import {
  ArrowLeft,
  Package,
  ExternalLink,
  Copy,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const order = getOrderById(id);

  if (!order) {
    notFound();
  }

  const recommendation = mockRecommendations.find((r) => r.orderId === order.id);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">
            {order.merchant.name} · #{order.orderNumber}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Insight */}
          {recommendation && (
            <Card className="bg-agent-recommendation border-status-delivered/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Agent Insight</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {recommendation.description}
                    </p>
                    {recommendation.primaryAction && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm">
                          {recommendation.primaryAction.label}
                        </Button>
                        {recommendation.secondaryAction && (
                          <Button size="sm" variant="ghost">
                            {recommendation.secondaryAction.label}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.variant && (
                            <p className="text-sm text-muted-foreground">
                              {item.variant}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <PriceDisplay cents={item.totalCents} />
                      </div>
                      {item.returnStatus !== "none" && (
                        <div className="mt-2">
                          <StatusBadge status={item.returnStatus} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tabs for Tracking / Return Policy */}
          <Tabs defaultValue="tracking">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="return">Return Policy</TabsTrigger>
              <TabsTrigger value="details">Order Details</TabsTrigger>
            </TabsList>

            <TabsContent value="tracking" className="mt-4">
              {order.shipment ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {order.shipment.carrierName}
                      </CardTitle>
                      <StatusBadge status={order.shipment.status} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{order.shipment.trackingNumber}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          navigator.clipboard.writeText(order.shipment!.trackingNumber)
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {order.shipment.trackingUrl && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                          <a
                            href={order.shipment.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TrackingTimeline
                      events={order.shipment.events}
                      currentStatus={order.shipment.status}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 font-medium">No tracking information yet</p>
                    <p className="text-sm text-muted-foreground">
                      Tracking will appear once your order ships.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="return" className="mt-4">
              {order.returnPolicy ? (
                <ReturnPolicyCard policy={order.returnPolicy} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 font-medium">Return policy unavailable</p>
                    <p className="text-sm text-muted-foreground">
                      We couldn&apos;t find return policy information for this order.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Number</span>
                      <span className="font-medium">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Date</span>
                      <span className="font-medium">
                        {format(new Date(order.orderedAt), "MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <StatusBadge status={order.status} />
                    </div>
                    {order.deliveredAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivered</span>
                        <span className="font-medium">
                          {format(new Date(order.deliveredAt), "MMMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <PriceDisplay cents={order.subtotalCents} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {order.shippingCents === 0 ? (
                          <span className="text-status-delivered">Free</span>
                        ) : (
                          <PriceDisplay cents={order.shippingCents} />
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <PriceDisplay cents={order.taxCents} />
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base">
                      <span className="font-medium">Total</span>
                      <PriceDisplay cents={order.totalCents} size="lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {order.merchant.logoUrl ? (
                    <Image
                      src={order.merchant.logoUrl}
                      alt={order.merchant.name}
                      width={24}
                      height={24}
                    />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{order.merchant.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.merchant.domain}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span>{order.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <PriceDisplay cents={order.totalCents} />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={order.merchant.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.shipment && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a
                    href={order.shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Track on {order.shipment.carrierName}
                  </a>
                </Button>
              )}
              {order.returnPolicy?.isEligible && (
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Start Return
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask Trackable
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
