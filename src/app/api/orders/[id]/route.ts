import { createClient } from "@/lib/supabase/server";
import { fetchOrder } from "@/lib/trackable-agent/client";
import { mapApiOrderToOrder } from "@/lib/trackable-agent/order-mapper";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const apiOrder = await fetchOrder(user.id, id);
    const order = mapApiOrderToOrder(apiOrder);

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order GET error:", error);

    if (
      error instanceof Error &&
      error.message.includes("TRACKABLE_API_URL")
    ) {
      return NextResponse.json(
        { error: "API not configured" },
        { status: 503 },
      );
    }

    const status =
      error instanceof Error && error.message.includes("404") ? 404 : 500;
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status },
    );
  }
}
