"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useOrders } from "@/hooks/use-orders";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Search, Filter, Package, ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import type { Order } from "@/types";
import { AddOrderModal } from "@/components/orders";

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
    <div className={cn("inline-flex items-center justify-center rounded-full px-2.5 py-1", config.bg)}>
      <span className={cn("text-xs font-medium leading-none", config.text)}>
        {config.label}
      </span>
    </div>
  );
}

export default function OrdersPage() {
  const { orders, loading, error, refetch } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [addOrderOpen, setAddOrderOpen] = useState(false);
  const itemsPerPage = 5;

  const filterOrders = () => {
    let filtered = orders;

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
          {/* Add Order */}
          <button
            onClick={() => setAddOrderOpen(true)}
            className="flex items-center gap-2 rounded bg-[#3B82F6] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2563EB]"
          >
            <Plus className="h-4 w-4" />
            Add Order
          </button>
        </div>
      </div>

      {/* Add Order Modal */}
      <AddOrderModal
        open={addOrderOpen}
        onOpenChange={(open) => {
          setAddOrderOpen(open);
          if (!open) refetch();
        }}
      />

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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
            <p className="mt-3 text-sm font-normal text-[#7A7A7A]">
              Loading orders...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm font-normal text-[#EF4444]">
              Failed to load orders
            </p>
            <button
              onClick={refetch}
              className="mt-2 text-sm font-medium text-[#3B82F6] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : paginatedOrders.length > 0 ? (
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
      className="grid grid-cols-[auto_1fr_minmax(120px,auto)_120px_100px] items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FAFAFA]"
    >
      {/* Product image */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-[#FAFAFA]">
        {firstItem?.imageUrl ? (
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
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate font-heading text-sm font-medium text-[#0D0D0D]">
          {order.merchant.name || firstItem?.name || "Order"}
        </span>
        <span className="truncate text-xs font-normal text-[#7A7A7A]">
          {order.merchant.name
            ? `${firstItem?.name ?? "Order"}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}`
            : order.items.length > 1
              ? `${order.items.length} items`
              : ""}
        </span>
      </div>

      {/* Order number */}
      <span className="hidden truncate text-sm font-normal text-[#7A7A7A] md:block">
        #{order.orderNumber}
      </span>

      {/* Status */}
      <div>
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
      <span className="text-right text-xs font-normal text-[#7A7A7A]">
        {format(
          new Date(order.deliveredAt || order.orderedAt),
          "MMM d, yyyy"
        )}
      </span>
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
