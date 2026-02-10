import { withAuth } from "@/lib/supabase/auth";
import { fetchOrders, getTrackableApiUrl } from "@/lib/trackable-agent/client";
import { mapApiOrderToOrder } from "@/lib/trackable-agent/order-mapper";
import { NextRequest, NextResponse } from "next/server";
import type { CreateOrderRequest } from "@/lib/trackable-agent/types";

export async function GET(request: NextRequest) {
  return withAuth(async (user) => {
    try {
      const { searchParams } = request.nextUrl;
      const status = searchParams.get("status") ?? undefined;
      const limit = searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : undefined;
      const offset = searchParams.get("offset")
        ? Number(searchParams.get("offset"))
        : undefined;

      const data = await fetchOrders(user.id, { status, limit, offset });
      const orders = data.orders.map(mapApiOrderToOrder);

      return NextResponse.json({
        orders,
        total: data.total,
        limit: data.limit,
        offset: data.offset,
      });
    } catch (error) {
      console.error("Orders GET error:", error);

      if (
        error instanceof Error &&
        error.message.includes("TRACKABLE_API_URL")
      ) {
        return NextResponse.json(
          { error: "API not configured" },
          { status: 503 },
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 },
      );
    }
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      // Parse request body
      const body: CreateOrderRequest = await request.json();
      const { merchant, items, trackingNumber, orderDate, source, sourceJobId } =
        body;

      // Call backend to create order
      const trackableApiUrl = getTrackableApiUrl();

      const response = await fetch(`${trackableApiUrl}/api/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": user.id,
        },
        body: JSON.stringify({
          merchant,
          items: items || [],
          tracking_number: trackingNumber,
          order_date: orderDate,
          source,
          source_job_id: sourceJobId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Order creation error:", response.status, errorText);

        // If backend doesn't support order creation yet, return success for demo
        // This allows the UI to work while backend is being developed
        if (response.status === 404) {
          console.log(
            "Backend order creation not available, returning mock success",
          );
          return NextResponse.json({
            success: true,
            order_id: `mock_${Date.now()}`,
            message: "Order created (mock mode - backend endpoint not available)",
          });
        }

        return NextResponse.json(
          { error: "Failed to create order" },
          { status: response.status },
        );
      }

      const data = await response.json();
      return NextResponse.json({
        success: true,
        order_id: data.order_id || data.id,
      });
    } catch (error) {
      console.error("Orders route error:", error);

      // If TRACKABLE_API_URL is not set, return mock success for development
      if (
        error instanceof Error &&
        error.message.includes("TRACKABLE_API_URL")
      ) {
        console.log("TRACKABLE_API_URL not set, returning mock success");
        return NextResponse.json({
          success: true,
          order_id: `mock_${Date.now()}`,
          message: "Order created (mock mode - API URL not configured)",
        });
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  });
}
