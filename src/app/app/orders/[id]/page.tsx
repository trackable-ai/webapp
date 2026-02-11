"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TrackingTimeline, ReturnPolicyCard } from "@/components/orders";
import { useOrder } from "@/hooks/use-orders";
import { format } from "date-fns";
import {
  ArrowLeft,
  Package,
  ExternalLink,
  Copy,
  MessageSquare,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<
  Order["status"],
  { label: string; bg: string; text: string }
> = {
  pending: { label: "Processing", bg: "bg-[#FEF3C7]", text: "text-[#F59E0B]" },
  confirmed: { label: "Confirmed", bg: "bg-[#EFF6FF]", text: "text-[#3B82F6]" },
  processing: { label: "Processing", bg: "bg-[#FEF3C7]", text: "text-[#F59E0B]" },
  shipped: { label: "Shipped", bg: "bg-[#EFF6FF]", text: "text-[#3B82F6]" },
  delivered: { label: "Delivered", bg: "bg-[#ECFDF5]", text: "text-[#10B981]" },
  cancelled: { label: "Cancelled", bg: "bg-[#FEF2F2]", text: "text-[#EF4444]" },
  returned: { label: "Returned", bg: "bg-[#F5F3FF]", text: "text-[#8B5CF6]" },
};

function StatusBadge({ status }: { status: Order["status"] }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <div className={cn("inline-flex items-center justify-center rounded-full px-2.5 py-1", config.bg)}>
      <span className={cn("text-xs font-medium leading-none", config.text)}>{config.label}</span>
    </div>
  );
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const tabs = [
  { id: "tracking", label: "Tracking" },
  { id: "return", label: "Return Policy" },
  { id: "details", label: "Order Details" },
];

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const { order, loading, error } = useOrder(id);
  const [activeTab, setActiveTab] = useState("tracking");
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
        <p className="mt-3 text-sm font-normal text-[#7A7A7A]">
          Loading order...
        </p>
      </div>
    );
  }

  if (error || !order) {
    if (error?.includes("404")) notFound();
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-sm font-normal text-[#EF4444]">
          {error ?? "Order not found"}
        </p>
        <Link
          href="/app/orders"
          className="mt-2 text-sm font-medium text-[#3B82F6] hover:underline"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const handleCopyTracking = async () => {
    if (order.shipment) {
      await navigator.clipboard.writeText(order.shipment.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:px-10 md:py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/app/orders"
          className="flex h-10 w-10 items-center justify-center rounded border border-[#E8E8E8] bg-white transition-colors hover:bg-[#FAFAFA]"
        >
          <ArrowLeft className="h-4 w-4 text-[#7A7A7A]" />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold text-[#0D0D0D] md:text-[28px]">
            Order Details
          </h1>
          <p className="text-sm font-normal text-[#7A7A7A]">
            {order.merchant.name} · #{order.orderNumber}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Order items */}
          <div className="rounded-lg border border-[#E8E8E8] bg-white p-4 md:p-6">
            <h2 className="font-heading text-base font-semibold text-[#0D0D0D]">
              Items
            </h2>
            <div className="mt-4 flex flex-col divide-y divide-[#E8E8E8]">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#FAFAFA]">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-5 w-5 text-[#B0B0B0]" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                        {item.name}
                      </span>
                      {item.variant && (
                        <span className="text-xs font-normal text-[#7A7A7A]">
                          {item.variant}
                        </span>
                      )}
                      <span className="text-xs font-normal text-[#7A7A7A]">
                        Qty: {item.quantity}
                      </span>
                      {item.returnStatus !== "none" && item.returnStatus !== "eligible" && item.returnStatus !== "ineligible" && (
                        <div className="mt-1">
                          <span className="rounded-full bg-[#F5F3FF] px-2 py-0.5 text-xs font-medium text-[#8B5CF6]">
                            {item.returnStatus === "initiated"
                              ? "Return Initiated"
                              : item.returnStatus === "shipped"
                                ? "Return Shipped"
                                : item.returnStatus === "received"
                                  ? "Return Received"
                                  : item.returnStatus === "refunded"
                                    ? "Refunded"
                                    : item.returnStatus}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="font-heading text-sm font-medium text-[#0D0D0D] sm:text-right">
                      {formatCents(item.totalCents)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto border-b border-[#E8E8E8]">
              <div className="flex min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-5 py-3 text-sm font-normal transition-colors",
                      activeTab === tab.id
                        ? "border-b-2 border-[#3B82F6] font-medium text-[#3B82F6]"
                        : "text-[#7A7A7A] hover:text-[#0D0D0D]"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            {activeTab === "tracking" && (
              <div className="rounded-lg border border-[#E8E8E8] bg-white p-4 md:p-6">
                {order.shipment ? (
                  <>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#0D0D0D]" />
                        <span className="font-heading text-base font-semibold text-[#0D0D0D]">
                          {order.shipment.carrierName}
                        </span>
                      </div>
                      <div className="self-start sm:self-auto">
                        <StatusBadge status={order.shipment.status as Order["status"]} />
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-normal text-[#7A7A7A] break-all">
                        {order.shipment.trackingNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyTracking}
                          className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-[#FAFAFA]"
                        >
                          {copied ? (
                            <CheckCircle className="h-3 w-3 text-[#10B981]" />
                          ) : (
                            <Copy className="h-3 w-3 text-[#7A7A7A]" />
                          )}
                        </button>
                        {order.shipment.trackingUrl && (
                          <a
                            href={order.shipment.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-[#FAFAFA]"
                          >
                            <ExternalLink className="h-3 w-3 text-[#7A7A7A]" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="mt-6">
                      <TrackingTimeline
                        events={order.shipment.events}
                        currentStatus={order.shipment.status}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAFA]">
                      <Package className="h-6 w-6 text-[#B0B0B0]" />
                    </div>
                    <h3 className="mt-4 font-heading text-sm font-medium text-[#0D0D0D]">
                      No tracking information yet
                    </h3>
                    <p className="mt-1 text-xs font-normal text-[#7A7A7A]">
                      Tracking will appear once your order ships.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "return" && (
              <div className="rounded-lg border border-[#E8E8E8] bg-white p-4 md:p-6">
                {order.returnPolicy ? (
                  <ReturnPolicyCard policy={order.returnPolicy} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAFA]">
                      <Package className="h-6 w-6 text-[#B0B0B0]" />
                    </div>
                    <h3 className="mt-4 font-heading text-sm font-medium text-[#0D0D0D]">
                      Return policy unavailable
                    </h3>
                    <p className="mt-1 text-xs font-normal text-[#7A7A7A]">
                      We couldn&apos;t find return policy information for this order.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div className="rounded-lg border border-[#E8E8E8] bg-white p-4 md:p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-[#7A7A7A]">
                      Order Number
                    </span>
                    <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-[#7A7A7A]">
                      Order Date
                    </span>
                    <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                      {format(new Date(order.orderedAt), "MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-[#7A7A7A]">Status</span>
                    <StatusBadge status={order.status} />
                  </div>
                  {order.deliveredAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-normal text-[#7A7A7A]">
                        Delivered
                      </span>
                      <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                        {format(new Date(order.deliveredAt), "MMMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="my-2 h-px bg-[#E8E8E8]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-[#7A7A7A]">Subtotal</span>
                    <span className="text-sm font-normal text-[#0D0D0D]">
                      {formatCents(order.subtotalCents)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-[#7A7A7A]">Shipping</span>
                    <span className="text-sm font-normal text-[#0D0D0D]">
                      {order.shippingCents === 0 ? (
                        <span className="text-[#10B981]">Free</span>
                      ) : (
                        formatCents(order.shippingCents)
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-[#7A7A7A]">Tax</span>
                    <span className="text-sm font-normal text-[#0D0D0D]">
                      {formatCents(order.taxCents)}
                    </span>
                  </div>
                  <div className="my-2 h-px bg-[#E8E8E8]" />
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-base font-medium text-[#0D0D0D]">
                      Total
                    </span>
                    <span className="font-heading text-lg font-semibold text-[#0D0D0D]">
                      {formatCents(order.totalCents)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex w-full flex-col gap-6 lg:w-[360px] lg:shrink-0">
          {/* Order Summary Card */}
          <div className="rounded-lg border border-[#E8E8E8] bg-white p-4 md:p-6">
            <h3 className="font-heading text-base font-semibold text-[#0D0D0D]">
              Order Summary
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAFAFA]">
                {order.merchant.logoUrl ? (
                  <Image
                    src={order.merchant.logoUrl}
                    alt={order.merchant.name}
                    width={24}
                    height={24}
                  />
                ) : (
                  <Package className="h-5 w-5 text-[#B0B0B0]" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                  {order.merchant.name}
                </span>
                <span className="text-xs font-normal text-[#7A7A7A]">
                  {order.merchant.domain}
                </span>
              </div>
            </div>

            <div className="my-4 h-px bg-[#E8E8E8]" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-normal text-[#7A7A7A]">Items</span>
                <span className="text-sm font-normal text-[#0D0D0D]">
                  {order.items.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-normal text-[#7A7A7A]">Total</span>
                <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                  {formatCents(order.totalCents)}
                </span>
              </div>
            </div>

            <div className="my-4 h-px bg-[#E8E8E8]" />

            {order.merchant.supportUrl && (
              <a
                href={order.merchant.supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded border border-[#E8E8E8] bg-white py-2.5 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA]"
              >
                <MessageSquare className="h-4 w-4 text-[#7A7A7A]" />
                Contact Support
              </a>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-[#E8E8E8] bg-white p-4 md:p-6">
            <h3 className="font-heading text-base font-semibold text-[#0D0D0D]">
              Quick Actions
            </h3>
            <div className="mt-4 flex flex-col gap-2">
              {order.shipment && order.shipment.trackingUrl && (
                <a
                  href={order.shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 rounded border border-[#E8E8E8] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA]"
                >
                  <ExternalLink className="h-4 w-4 text-[#7A7A7A]" />
                  Track on {order.shipment.carrierName}
                </a>
              )}
              {order.returnPolicy?.isEligible && (
                <button className="flex w-full items-center gap-2 rounded border border-[#E8E8E8] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA]">
                  <Package className="h-4 w-4 text-[#7A7A7A]" />
                  Start Return
                </button>
              )}
              <Link
                href={`/app/chat?q=${encodeURIComponent(`Tell me about my order #${order.orderNumber} from ${order.merchant.name}`)}`}
                className="flex w-full items-center gap-2 rounded border border-[#E8E8E8] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA]"
              >
                <MessageSquare className="h-4 w-4 text-[#7A7A7A]" />
                Ask Trackable
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
