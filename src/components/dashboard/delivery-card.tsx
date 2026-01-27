"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Package } from "lucide-react";
import type { Order } from "@/types";

interface DeliveryCardProps {
  order: Order;
}

export function DeliveryCard({ order }: DeliveryCardProps) {
  const firstItem = order.items[0];
  const progress =
    order.shipment?.status === "out_for_delivery"
      ? 90
      : order.shipment?.status === "in_transit"
        ? 60
        : 30;

  const getStatusLabel = () => {
    if (order.shipment?.status === "out_for_delivery") return "Out for Delivery";
    if (order.shipment?.status === "in_transit") return "In Transit";
    return "Processing";
  };

  const getExpectedTime = () => {
    if (order.shipment?.estimatedDeliveryAt) {
      const date = new Date(order.shipment.estimatedDeliveryAt);
      return `Expected by ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }
    return "Estimated delivery pending";
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[#E8E8E8] bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-heading text-base font-semibold text-[#0D0D0D]">
          Next Delivery
        </span>
        <div className="rounded-full bg-[#ECFDF5] px-2.5 py-1">
          <span className="text-[11px] font-medium text-[#10B981]">Today</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {/* Item */}
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-[#FAFAFA]">
            {firstItem.imageUrl ? (
              <Image
                src={firstItem.imageUrl}
                alt={firstItem.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-6 w-6 text-[#B0B0B0]" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-heading text-sm font-medium text-[#0D0D0D]">
              {firstItem.name}
            </span>
            <span className="text-xs font-normal text-[#7A7A7A]">
              {order.merchant.name}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-[#10B981]">
            {getStatusLabel()}
          </span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className="h-full rounded-full bg-[#10B981] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-normal text-[#7A7A7A]">
            {getExpectedTime()}
          </span>
        </div>
      </div>

      {/* Action */}
      <Link
        href={`/app/orders/${order.id}?tab=tracking`}
        className="flex w-full items-center justify-center gap-2 rounded bg-[#3B82F6] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2563EB]"
      >
        <MapPin className="h-4 w-4" />
        Track Shipment
      </Link>
    </div>
  );
}
