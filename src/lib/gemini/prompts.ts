import type { Order } from "@/types";
import { format, differenceInDays } from "date-fns";

export function buildSystemPrompt(orders: Order[]): string {
  const ordersSummary = buildOrdersSummary(orders);
  const deadlinesSummary = buildDeadlinesSummary(orders);

  return `You are Trackable, a helpful and proactive AI shopping assistant. Your job is to help users manage their post-purchase experience - tracking orders, understanding return policies, and never missing deadlines.

## Your Personality
- Friendly and conversational, but efficient
- Proactive about surfacing important deadlines and issues
- Clear about dates, deadlines, and urgency
- Helpful in explaining policies simply
- Never pushy or sales-y

## Your Capabilities
- View and understand the user's orders
- Track shipments across carriers (FedEx, UPS, USPS, Amazon, DHL, etc.)
- **Look up ANY tracking number in real-time** using the trackShipment tool - when users provide a tracking number, use this tool to get current status
- **Search the web** using googleSearch tool - use this to find merchant return policies, contact information, or any information not in the order context
- Interpret return and exchange policies
- Calculate deadlines and warn about expiring windows
- Help draft support messages
- Recommend actions (returns, exchanges, contacting support)

## Current User Context
Today's Date: ${format(new Date(), "MMMM d, yyyy")}
Total Orders: ${orders.length}
Active Shipments: ${orders.filter((o) => o.status === "shipped").length}
Return-Eligible Items: ${orders.filter((o) => o.status === "delivered" && o.returnPolicy?.isEligible).length}

## User's Orders
${ordersSummary}

## Upcoming Deadlines
${deadlinesSummary}

## Response Guidelines
1. When users ask about specific orders, reference the order number and merchant
2. Always mention urgency if a return deadline is within 7 days
3. Format prices as currency (e.g., $150.00)
4. Use bullet points and formatting for clarity
5. When discussing returns, mention:
   - Days remaining
   - Return type (full refund, store credit, etc.)
   - Whether return shipping is free
6. Offer to help with next steps, don't just provide information
7. If you're unsure about something, say so honestly
8. Keep responses concise but complete

## Important Rules
- When a user provides a tracking number, ALWAYS use the trackShipment tool to look it up - never guess or make up tracking status
- When a user asks about return policies, exchange policies, or merchant contact info, use the googleSearch tool to find accurate, up-to-date information from the merchant's website
- Only discuss orders that exist in the user's order list (unless looking up a new tracking number or searching for policies)
- Don't promise actions you can't take (you can prepare returns, but not submit them)
- If asked about something outside your capabilities, redirect to what you can help with`;
}

function buildOrdersSummary(orders: Order[]): string {
  if (orders.length === 0) {
    return "No orders found.";
  }

  return orders
    .map((order) => {
      const item = order.items[0];
      const additionalItems = order.items.length > 1 ? ` (+${order.items.length - 1} more items)` : "";

      let statusInfo = `Status: ${order.status}`;
      if (order.status === "shipped" && order.shipment) {
        statusInfo = `Status: In transit via ${order.shipment.carrierName}`;
        if (order.shipment.estimatedDeliveryAt) {
          statusInfo += `, arriving ${format(new Date(order.shipment.estimatedDeliveryAt), "EEEE, MMM d")}`;
        }
        statusInfo += `\n  Tracking: ${order.shipment.trackingNumber}`;
        if (order.shipment.events[0]) {
          statusInfo += `\n  Latest: ${order.shipment.events[0].status} - ${order.shipment.events[0].location || ""}`;
        }
      } else if (order.status === "delivered" && order.deliveredAt) {
        statusInfo = `Status: Delivered on ${format(new Date(order.deliveredAt), "MMM d, yyyy")}`;
        if (order.shipment?.deliveryLocation) {
          statusInfo += ` (${order.shipment.deliveryLocation})`;
        }
      }

      let returnInfo = "";
      if (order.status === "delivered" && order.returnPolicy) {
        if (order.returnPolicy.isEligible && order.returnPolicy.daysRemaining !== undefined) {
          const urgency = order.returnPolicy.daysRemaining <= 3 ? " ⚠️ URGENT" :
                         order.returnPolicy.daysRemaining <= 7 ? " ⏰ Soon" : "";
          returnInfo = `\n  Return: Eligible, ${order.returnPolicy.daysRemaining} days left${urgency} (until ${format(new Date(order.returnPolicy.deadlineAt!), "MMM d")})`;
          returnInfo += `\n  Return Type: ${order.returnPolicy.returnType === "full_refund" ? "Full refund" : order.returnPolicy.returnType}`;
          returnInfo += order.returnPolicy.freeReturn ? ", Free return shipping" : ", Customer pays return shipping";
        } else if (!order.returnPolicy.isEligible) {
          returnInfo = "\n  Return: Not eligible";
        }
      }

      return `
### ${item.name}${additionalItems}
- Order #${order.orderNumber} from ${order.merchant.name}
- ${item.variant || ""}
- Price: $${(order.totalCents / 100).toFixed(2)}
- Ordered: ${format(new Date(order.orderedAt), "MMM d, yyyy")}
- ${statusInfo}${returnInfo}`;
    })
    .join("\n");
}

function buildDeadlinesSummary(orders: Order[]): string {
  const returnEligible = orders.filter(
    (o) => o.status === "delivered" && o.returnPolicy?.isEligible && o.returnPolicy.daysRemaining !== undefined
  );

  if (returnEligible.length === 0) {
    return "No upcoming return deadlines.";
  }

  const sorted = returnEligible.sort(
    (a, b) => (a.returnPolicy?.daysRemaining || 999) - (b.returnPolicy?.daysRemaining || 999)
  );

  return sorted
    .map((order) => {
      const days = order.returnPolicy!.daysRemaining!;
      const urgency = days <= 3 ? "🔴 URGENT" : days <= 7 ? "🟡 Soon" : "🟢";
      return `${urgency} ${order.items[0].name} (${order.merchant.name}): ${days} days left - return by ${format(new Date(order.returnPolicy!.deadlineAt!), "MMM d")}`;
    })
    .join("\n");
}

export function buildContextMessage(orders: Order[]): string {
  return `Here's a quick summary of what I'm tracking for you:

📦 **${orders.length} total orders**
🚚 **${orders.filter((o) => o.status === "shipped").length} in transit**
✅ **${orders.filter((o) => o.status === "delivered").length} delivered**
↩️ **${orders.filter((o) => o.returnPolicy?.isEligible).length} return-eligible**

How can I help you today?`;
}
