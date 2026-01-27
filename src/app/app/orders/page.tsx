"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockOrders } from "@/data";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Search, Filter, Package, ChevronLeft, ChevronRight } from "lucide-react";
import type { Order } from "@/types";

const tabs = [
  { id: "all", label: "All Orders" },
  { id: "active", label: "Active" },
  { id: "delivered", label: "Delivered" },
  { id: "returns", label: "Return Eligible" },
];

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
    <div className={cn("rounded-full px-2.5 py-1", config.bg)}>
      <span className={cn("text-xs font-medium", config.text)}>
        {config.label}
      </span>
    </div>
  );
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filterOrders = () => {
    let filtered = mockOrders;

    if (activeTab === "active") {
      filtered = filtered.filter(
        (o) =>
          o.status !== "delivered" &&
          o.status !== "cancelled" &&
          o.status !== "returned"
      );
    } else if (activeTab === "delivered") {
      filtered = filtered.filter((o) => o.status === "delivered");
    } else if (activeTab === "returns") {
      filtered = filtered.filter(
        (o) => o.status === "delivered" && o.returnPolicy?.isEligible
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.merchant.name.toLowerCase().includes(query) ||
          o.items.some((i) => i.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredOrders = filterOrders();
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 px-10 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[28px] font-semibold text-[#0D0D0D]">
            Orders
          </h1>
          <p className="text-sm font-normal text-[#7A7A7A]">
            Manage and track all your orders in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex w-[280px] items-center gap-2 rounded border border-[#E8E8E8] bg-[#FAFAFA] px-4 py-2.5">
            <Search className="h-4 w-4 text-[#B0B0B0]" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-transparent text-[13px] font-normal text-[#0D0D0D] placeholder:text-[#B0B0B0] focus:outline-none"
            />
          </div>
          {/* Filter */}
          <button className="flex items-center gap-2 rounded border border-[#E8E8E8] bg-white px-5 py-2.5 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#FAFAFA]">
            <Filter className="h-4 w-4 text-[#7A7A7A]" />
            Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E8E8E8]">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
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

      {/* Orders List */}
      <div className="overflow-hidden rounded-lg border border-[#E8E8E8] bg-white">
        {paginatedOrders.length > 0 ? (
          <div className="divide-y divide-[#E8E8E8]">
            {paginatedOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState searchQuery={searchQuery} tab={activeTab} />
        )}
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-normal text-[#7A7A7A]">
            Showing {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded border border-[#E8E8E8] bg-white transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 text-[#7A7A7A]" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded text-[13px] font-medium transition-colors",
                  currentPage === page
                    ? "bg-[#3B82F6] text-white"
                    : "border border-[#E8E8E8] bg-white text-[#0D0D0D] hover:bg-[#FAFAFA]"
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded border border-[#E8E8E8] bg-white transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4 text-[#7A7A7A]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const firstItem = order.items[0];
  const showReturnEligible =
    order.status === "delivered" && order.returnPolicy?.isEligible;

  return (
    <Link
      href={`/app/orders/${order.id}`}
      className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#FAFAFA]"
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Product image */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-[#FAFAFA]">
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

      {/* Middle - Order number */}
      <div className="hidden md:block">
        <span className="text-sm font-normal text-[#7A7A7A]">
          #{order.orderNumber}
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-8">
        {/* Status */}
        <div className="w-28">
          {showReturnEligible ? (
            <div className="inline-flex rounded-full bg-[#F5F3FF] px-2.5 py-1">
              <span className="text-xs font-medium text-[#8B5CF6]">
                Return Eligible
              </span>
            </div>
          ) : (
            <StatusBadge status={order.status} />
          )}
        </div>

        {/* Date */}
        <span className="w-24 text-right text-xs font-normal text-[#7A7A7A]">
          {format(
            new Date(order.deliveredAt || order.orderedAt),
            "MMM d, yyyy"
          )}
        </span>
      </div>
    </Link>
  );
}

function EmptyState({
  searchQuery,
  tab,
}: {
  searchQuery?: string;
  tab: string;
}) {
  const getMessage = () => {
    if (searchQuery) return `No orders match "${searchQuery}"`;
    if (tab === "active") return "No active orders";
    if (tab === "delivered") return "No delivered orders";
    if (tab === "returns") return "No return-eligible orders";
    return "No orders yet";
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAFA]">
        <Package className="h-6 w-6 text-[#B0B0B0]" />
      </div>
      <h3 className="mt-4 font-heading text-sm font-medium text-[#0D0D0D]">
        {getMessage()}
      </h3>
      <p className="mt-1 text-xs font-normal text-[#7A7A7A]">
        {searchQuery
          ? "Try a different search term"
          : "Connect your Gmail to start tracking orders automatically."}
      </p>
    </div>
  );
}
