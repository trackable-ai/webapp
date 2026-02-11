"use client";

import Link from "next/link";
import {
  MetricCard,
  AgentCard,
  DeliveryCard,
  RecommendationCard,
} from "@/components/dashboard";
import { OrderCard } from "@/components/orders";
import { mockRecommendations } from "@/data";
import { useOrders } from "@/hooks/use-orders";
import { useUser } from "@/stores/user-store";
import type { User } from "@supabase/supabase-js";
import {
  TrendingUp,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  Search,
  Bell,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const user = useUser();
  const { orders } = useOrders();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getDisplayName = (user: User | null) => {
    if (!user) return "there";
    return (
      user.user_metadata?.full_name?.split(" ")[0] ||
      user.user_metadata?.name?.split(" ")[0] ||
      user.email?.split("@")[0] ||
      "there"
    );
  };

  const activeOrders = orders.filter(
    (o) =>
      o.status !== "delivered" && o.status !== "cancelled" && o.status !== "returned"
  );
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const returnEligibleOrders = orders.filter(
    (o) => o.status === "delivered" && o.returnPolicy?.isEligible
  );
  const urgentRecommendations = mockRecommendations.filter(
    (r) => r.status === "pending" && (r.urgency === "high" || r.urgency === "critical")
  );
  const pendingActions =
    urgentRecommendations.length +
    mockRecommendations.filter(
      (r) => r.status === "pending" && r.urgency !== "high" && r.urgency !== "critical"
    ).length;

  // Get the next delivery order
  const inTransitOrder = activeOrders.find(
    (o) => o.status === "shipped" && o.shipment
  );

  // Get agent message based on context
  const getAgentMessage = () => {
    if (inTransitOrder) {
      const itemName = inTransitOrder.items[0]?.name || "your order";
      return `I noticed your ${itemName} is out for delivery today. I'll keep you updated on its progress!`;
    }
    if (urgentRecommendations.length > 0) {
      return `You have ${urgentRecommendations.length} urgent ${urgentRecommendations.length === 1 ? "item" : "items"} requiring your attention. Would you like me to help you with them?`;
    }
    if (activeOrders.length > 0) {
      return `I'm keeping an eye on ${activeOrders.length} active ${activeOrders.length === 1 ? "order" : "orders"} for you. Everything looks good for now!`;
    }
    return "Connect your Gmail to start tracking your orders automatically. I'll help you stay on top of deliveries and returns.";
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:px-10 md:py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold text-[#0D0D0D] md:text-[28px]">
            {getGreeting()}, {getDisplayName(user)}
          </h1>
          <p className="text-sm font-normal text-[#7A7A7A]">
            Here&apos;s what&apos;s happening with your orders today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex flex-1 items-center gap-2 rounded border border-[#E8E8E8] bg-[#FAFAFA] px-4 py-2.5 md:flex-none">
            <Search className="h-4 w-4 text-[#B0B0B0]" />
            <span className="text-[13px] font-normal text-[#B0B0B0]">
              Search orders...
            </span>
          </div>
          {/* Notifications */}
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#E8E8E8] bg-[#FAFAFA] transition-colors hover:bg-[#F5F5F5]">
            <Bell className="h-[18px] w-[18px] text-[#7A7A7A]" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
        <MetricCard
          label="Active Orders"
          value={activeOrders.length}
          trend={{
            icon: TrendingUp,
            text: "+3 this week",
            color: "text-[#10B981]",
          }}
        />
        <MetricCard
          label="Delivered"
          value={deliveredOrders.length}
          trend={{
            icon: CheckCircle,
            text: "Last 30 days",
            color: "text-[#10B981]",
          }}
        />
        <MetricCard
          label="Return Eligible"
          value={returnEligibleOrders.length}
          trend={{
            icon: RotateCcw,
            text: "2 expiring soon",
            color: "text-[#8B5CF6]",
          }}
        />
        <MetricCard
          label="Pending Actions"
          value={pendingActions}
          trend={{
            icon: AlertCircle,
            text: "Requires attention",
            color: "text-[#F59E0B]",
          }}
        />
      </div>

      {/* Content Row */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left Column */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Agent Card */}
          <AgentCard message={getAgentMessage()} />

          {/* Recent Orders Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-[#0D0D0D]">
                Recent Orders
              </h2>
              <Link
                href="/app/orders"
                className="flex items-center gap-2 rounded px-4 py-2.5 text-[13px] font-medium text-[#7A7A7A] transition-colors hover:bg-[#FAFAFA]"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {orders.slice(0, 3).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex w-full flex-col gap-6 lg:w-[360px] lg:shrink-0">
          {/* Next Delivery Card */}
          {inTransitOrder && <DeliveryCard order={inTransitOrder} />}

          {/* Recommendations Card */}
          <div className="flex flex-col gap-4 rounded-lg border border-[#E8E8E8] bg-white p-6">
            <h3 className="font-heading text-base font-semibold text-[#0D0D0D]">
              Recommendations
            </h3>
            <div className="flex flex-col gap-3">
              {urgentRecommendations.length > 0 && (
                <RecommendationCard
                  type="warning"
                  title="Return window closing"
                  description="Nike Air Max 90 return expires in 3 days"
                />
              )}
              {inTransitOrder && (
                <RecommendationCard
                  type="info"
                  title="Package arriving today"
                  description={`${inTransitOrder.items[0]?.name || "Your order"} is out for delivery`}
                />
              )}
              {urgentRecommendations.length === 0 && !inTransitOrder && (
                <p className="text-sm text-[#7A7A7A]">
                  No recommendations at this time.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
