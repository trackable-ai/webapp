"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Package } from "lucide-react";
import type { Order } from "@/types";

interface OrderCardProps {
  order: Order;
  className?: string;
}

const statusConfig = {
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
    <div className={cn("rounded-full px-2.5 py-1", config.bg)}>
      <span className={cn("text-xs font-medium", config.text)}>
        {config.label}
      </span>
    </div>
  );
}

export function OrderCard({ order, className }: OrderCardProps) {
  const firstItem = order.items[0];
  const showReturnEligible =
    order.status === "delivered" && order.returnPolicy?.isEligible;

  return (
    <Link href={`/app/orders/${order.id}`}>
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-lg border border-[#E8E8E8] bg-white p-4 transition-all hover:border-[#3B82F6]/20 hover:shadow-sm",
          className
        )}
      >
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Product image */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-[#FAFAFA]">
            {firstItem.imageUrl ? (
              <Image
                src={firstItem.imageUrl}
                alt={firstItem.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-5 w-5 text-[#B0B0B0]" />
              </div>
            )}
          </div>

          {/* Order info */}
          <div className="flex flex-col gap-1">
            <span className="font-heading text-sm font-medium text-[#0D0D0D]">
              {order.merchant.name}
            </span>
            <span className="text-xs font-normal text-[#7A7A7A]">
              {firstItem.name}
              {order.items.length > 1 && ` +${order.items.length - 1} more`}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-1">
          {showReturnEligible ? (
            <div className="rounded-full bg-[#F5F3FF] px-2.5 py-1">
              <span className="text-xs font-medium text-[#8B5CF6]">
                Return Eligible
              </span>
            </div>
          ) : (
            <StatusBadge status={order.status} />
          )}
          <span className="text-xs font-normal text-[#7A7A7A]">
            {format(
              new Date(order.deliveredAt || order.orderedAt),
              "MMM d, yyyy"
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
