"use client";

import Link from "next/link";
import Image from "next/image";
import { useOrders } from "@/hooks/use-orders";
import { format } from "date-fns";
import { RotateCcw, Package, AlertCircle, ArrowRight } from "lucide-react";

export default function ReturnsPage() {
  const { orders } = useOrders();
  const returnEligibleOrders = orders.filter(
    (o) => o.status === "delivered" && o.returnPolicy?.isEligible
  );

  const sortedOrders = [...returnEligibleOrders].sort((a, b) => {
    const daysA = a.returnPolicy?.daysRemaining ?? 999;
    const daysB = b.returnPolicy?.daysRemaining ?? 999;
    return daysA - daysB;
  });

  const expiringOrders = sortedOrders.filter(
    (o) => (o.returnPolicy?.daysRemaining ?? 0) <= 7
  );

  return (
    <div className="flex flex-col gap-6 px-10 py-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[28px] font-semibold text-[#0D0D0D]">
          Returns & Exchanges
        </h1>
        <p className="text-sm font-normal text-[#7A7A7A]">
          Manage returns for your delivered orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-lg border border-[#E8E8E8] bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5F3FF]">
            <RotateCcw className="h-6 w-6 text-[#8B5CF6]" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-2xl font-semibold text-[#0D0D0D]">
              {returnEligibleOrders.length}
            </span>
            <span className="text-sm font-normal text-[#7A7A7A]">
              Return Eligible
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-[#E8E8E8] bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FEF3C7]">
            <AlertCircle className="h-6 w-6 text-[#F59E0B]" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-2xl font-semibold text-[#0D0D0D]">
              {expiringOrders.length}
            </span>
            <span className="text-sm font-normal text-[#7A7A7A]">
              Expiring Soon
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-[#E8E8E8] bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EFF6FF]">
            <Package className="h-6 w-6 text-[#3B82F6]" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-2xl font-semibold text-[#0D0D0D]">
              0
            </span>
            <span className="text-sm font-normal text-[#7A7A7A]">
              In Progress
            </span>
          </div>
        </div>
      </div>

      {/* Return eligible orders */}
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold text-[#0D0D0D]">
          Return Eligible Items
        </h2>

        {sortedOrders.length > 0 ? (
          <div className="flex flex-col gap-4">
            {sortedOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 rounded-lg border border-[#E8E8E8] bg-white p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Product image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-[#FAFAFA]">
                    {order.items[0].imageUrl ? (
                      <Image
                        src={order.items[0].imageUrl}
                        alt={order.items[0].name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-[#B0B0B0]" />
                      </div>
                    )}
                  </div>

                  {/* Order details */}
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="font-heading text-sm font-medium text-[#0D0D0D]">
                      {order.items[0].name}
                    </span>
                    <span className="text-xs font-normal text-[#7A7A7A]">
                      {order.merchant.name} · #{order.orderNumber}
                    </span>
                    <span className="text-xs font-normal text-[#7A7A7A]">
                      Delivered{" "}
                      {format(new Date(order.deliveredAt!), "MMMM d, yyyy")}
                    </span>
                  </div>

                  {/* Deadline */}
                  {order.returnPolicy?.daysRemaining !== undefined && (
                    <div
                      className={`rounded-full px-3 py-1.5 ${
                        order.returnPolicy.daysRemaining <= 3
                          ? "bg-[#FEF2F2]"
                          : order.returnPolicy.daysRemaining <= 7
                            ? "bg-[#FEF3C7]"
                            : "bg-[#ECFDF5]"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          order.returnPolicy.daysRemaining <= 3
                            ? "text-[#EF4444]"
                            : order.returnPolicy.daysRemaining <= 7
                              ? "text-[#F59E0B]"
                              : "text-[#10B981]"
                        }`}
                      >
                        {order.returnPolicy.daysRemaining} days left
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                    href={`/app/orders/${order.id}?tab=return`}
                    className="flex items-center justify-center gap-2 rounded bg-[#3B82F6] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2563EB]"
                  >
                    Start Return
                  </Link>
                  <Link
                    href={`/app/orders/${order.id}`}
                    className="flex items-center justify-center gap-2 rounded border border-[#E8E8E8] bg-white px-5 py-2.5 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA]"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  {/* Policy badges */}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="rounded-full border border-[#E8E8E8] px-2.5 py-1 text-xs font-normal text-[#7A7A7A]">
                      {order.returnPolicy?.freeReturn
                        ? "Free return"
                        : "Paid return"}
                    </span>
                    <span className="rounded-full border border-[#E8E8E8] px-2.5 py-1 text-xs font-normal text-[#7A7A7A]">
                      {order.returnPolicy?.returnType === "full_refund"
                        ? "Full refund"
                        : order.returnPolicy?.returnType === "store_credit"
                          ? "Store credit"
                          : "Exchange only"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[#E8E8E8] bg-white py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAFA]">
              <RotateCcw className="h-6 w-6 text-[#B0B0B0]" />
            </div>
            <h3 className="mt-4 font-heading text-sm font-medium text-[#0D0D0D]">
              No return-eligible items
            </h3>
            <p className="mt-1 text-xs font-normal text-[#7A7A7A]">
              Items become return-eligible after delivery.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
