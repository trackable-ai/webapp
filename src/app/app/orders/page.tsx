"use client";

import { useState } from "react";
import { OrderCard } from "@/components/orders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { mockOrders } from "@/data";
import { Search, Package } from "lucide-react";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filterOrders = (status?: string) => {
    let filtered = mockOrders;

    if (status === "active") {
      filtered = filtered.filter(
        (o) =>
          o.status !== "delivered" &&
          o.status !== "cancelled" &&
          o.status !== "returned"
      );
    } else if (status === "delivered") {
      filtered = filtered.filter((o) => o.status === "delivered");
    } else if (status === "returns") {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            View and manage all your orders in one place.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({mockOrders.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active (
            {
              mockOrders.filter(
                (o) =>
                  o.status !== "delivered" &&
                  o.status !== "cancelled" &&
                  o.status !== "returned"
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({mockOrders.filter((o) => o.status === "delivered").length})
          </TabsTrigger>
          <TabsTrigger value="returns">
            Returns Eligible (
            {
              mockOrders.filter(
                (o) => o.status === "delivered" && o.returnPolicy?.isEligible
              ).length
            }
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filterOrders().length > 0 ? (
            filterOrders().map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <EmptyState searchQuery={searchQuery} />
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {filterOrders("active").length > 0 ? (
            filterOrders("active").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <EmptyState message="No active orders" />
          )}
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          {filterOrders("delivered").length > 0 ? (
            filterOrders("delivered").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <EmptyState message="No delivered orders" />
          )}
        </TabsContent>

        <TabsContent value="returns" className="space-y-4">
          {filterOrders("returns").length > 0 ? (
            filterOrders("returns").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <EmptyState message="No return-eligible orders" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({
  searchQuery,
  message,
}: {
  searchQuery?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
      <Package className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 font-semibold">
        {searchQuery ? "No orders found" : message || "No orders yet"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {searchQuery
          ? `No orders match "${searchQuery}"`
          : "Connect your Gmail to start tracking orders automatically."}
      </p>
    </div>
  );
}
