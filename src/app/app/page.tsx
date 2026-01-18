import { AgentBriefing, AgentRecommendationCard } from "@/components/agent";
import { OrderCard } from "@/components/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockOrders, mockRecommendations } from "@/data";
import { format } from "date-fns";
import {
  ArrowRight,
  Package,
  RotateCcw,
  Truck,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const urgentRecommendations = mockRecommendations.filter(
    (r) => r.status === "pending" && (r.urgency === "high" || r.urgency === "critical")
  );
  const otherRecommendations = mockRecommendations.filter(
    (r) => r.status === "pending" && r.urgency !== "high" && r.urgency !== "critical"
  );

  const activeOrders = mockOrders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled" && o.status !== "returned"
  );
  const deliveredOrders = mockOrders.filter((o) => o.status === "delivered");
  const returnEligibleOrders = mockOrders.filter(
    (o) => o.status === "delivered" && o.returnPolicy?.isEligible
  );

  // Get the next delivery
  const inTransitOrder = activeOrders.find((o) => o.status === "shipped");

  return (
    <div className="space-y-8">
      {/* Agent Briefing */}
      <AgentBriefing
        userName="John"
        ordersCount={mockOrders.length}
        urgentCount={urgentRecommendations.length}
      />

      {/* Urgent Actions */}
      {urgentRecommendations.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Needs Your Attention</h2>
            <Badge variant="destructive" className="text-xs">
              {urgentRecommendations.length} urgent
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {urgentRecommendations.map((rec) => (
              <AgentRecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </section>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-shipped/10">
                <Package className="h-6 w-6 text-status-shipped" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeOrders.length}</p>
                <p className="text-sm text-muted-foreground">Active Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-delivered/10">
                <Truck className="h-6 w-6 text-status-delivered" />
              </div>
              <div>
                <p className="text-2xl font-bold">{deliveredOrders.length}</p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-processing/10">
                <Clock className="h-6 w-6 text-status-processing" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {urgentRecommendations.length + otherRecommendations.length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Delivery */}
      {inTransitOrder && inTransitOrder.shipment?.estimatedDeliveryAt && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Next Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {inTransitOrder.items[0].name} from {inTransitOrder.merchant.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">
                  {format(new Date(inTransitOrder.shipment.estimatedDeliveryAt), "EEEE, MMM d")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {inTransitOrder.shipment.carrierName} ·{" "}
                  {inTransitOrder.shipment.status === "in_transit"
                    ? "In Transit"
                    : "Out for Delivery"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Recommendations */}
      {otherRecommendations.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Suggestions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {otherRecommendations.map((rec) => (
              <AgentRecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Orders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/orders" className="flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="space-y-4">
          {mockOrders.slice(0, 3).map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </section>
    </div>
  );
}
