import type {
  Order,
  OrderItem,
  OrderStatus,
  Merchant,
  Shipment,
  ShipmentStatus,
  CarrierCode,
  TrackingEvent,
  ReturnPolicy,
  ReturnStatus,
} from "@/types";

// ── Backend API types (snake_case, matching OpenAPI spec) ────────────

interface ApiMoney {
  amount: string;
  currency?: string;
}

interface ApiMerchant {
  id: string;
  name: string;
  domain?: string | null;
  aliases?: string[];
  support_email?: string | null;
  support_url?: string | null;
  return_portal_url?: string | null;
}

interface ApiItem {
  id: string;
  order_id: string;
  name: string;
  description?: string | null;
  quantity: number;
  price?: ApiMoney | null;
  sku?: string | null;
  size?: string | null;
  color?: string | null;
  image_url?: string | null;
  is_returnable?: boolean | null;
  return_requested?: boolean;
  exchange_requested?: boolean;
}

interface ApiTrackingEvent {
  timestamp: string;
  status: string;
  location?: string | null;
  description?: string | null;
}

interface ApiShipment {
  id: string;
  order_id: string;
  tracking_number?: string | null;
  carrier: string;
  status: string;
  shipping_address?: string | null;
  return_address?: string | null;
  shipped_at?: string | null;
  estimated_delivery?: string | null;
  delivered_at?: string | null;
  tracking_url?: string | null;
  events?: ApiTrackingEvent[];
  last_updated?: string | null;
}

export interface ApiOrder {
  id: string;
  user_id: string;
  merchant: ApiMerchant;
  order_number: string;
  order_date?: string | null;
  status: string;
  country_code?: string | null;
  items: ApiItem[];
  subtotal?: ApiMoney | null;
  tax?: ApiMoney | null;
  shipping_cost?: ApiMoney | null;
  total?: ApiMoney | null;
  shipments: ApiShipment[];
  return_window_start?: string | null;
  return_window_end?: string | null;
  return_window_days?: number | null;
  exchange_window_end?: string | null;
  is_monitored?: boolean;
  source_type: string;
  source_id?: string | null;
  confidence_score?: number | null;
  order_url?: string | null;
  receipt_url?: string | null;
  refund_initiated?: boolean;
  created_at: string;
  updated_at: string;
  notes?: string[];
}

export interface ApiOrderListResponse {
  orders: ApiOrder[];
  total: number;
  limit: number;
  offset: number;
}

// ── Conversion helpers ───────────────────────────────────────────────

function moneyToCents(money?: ApiMoney | null): number {
  if (!money?.amount) return 0;
  return Math.round(parseFloat(money.amount) * 100);
}

function mapOrderStatus(status: string): OrderStatus {
  const mapping: Record<string, OrderStatus> = {
    detected: "pending",
    confirmed: "confirmed",
    shipped: "shipped",
    in_transit: "shipped",
    delivered: "delivered",
    returned: "returned",
    refunded: "returned",
    cancelled: "cancelled",
    unknown: "pending",
  };
  return mapping[status] ?? "pending";
}

function mapCarrier(carrier: string): CarrierCode {
  const mapping: Record<string, CarrierCode> = {
    usps: "usps",
    ups: "ups",
    fedex: "fedex",
    dhl: "dhl",
    amazon_logistics: "amazon",
    other: "other",
    unknown: "other",
  };
  return mapping[carrier] ?? "other";
}

const carrierNames: Record<string, string> = {
  usps: "USPS",
  ups: "UPS",
  fedex: "FedEx",
  dhl: "DHL",
  amazon: "Amazon Logistics",
  amazon_logistics: "Amazon Logistics",
  other: "Other",
  unknown: "Carrier",
};

function mapShipmentStatus(status: string): ShipmentStatus {
  const mapping: Record<string, ShipmentStatus> = {
    pending: "pre_transit",
    label_created: "pre_transit",
    in_transit: "in_transit",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
    delivery_attempted: "failed",
    exception: "failed",
    returned_to_sender: "returned",
    unknown: "pre_transit",
  };
  return mapping[status] ?? "pre_transit";
}

function mapSourceType(sourceType: string): "gmail" | "manual" | "screenshot" {
  const mapping: Record<string, "gmail" | "manual" | "screenshot"> = {
    email: "gmail",
    screenshot: "screenshot",
    photo: "screenshot",
    manual: "manual",
    api: "manual",
  };
  return mapping[sourceType] ?? "manual";
}

function mapTrackingEvents(events?: ApiTrackingEvent[]): TrackingEvent[] {
  if (!events?.length) return [];
  return events.map((evt, i) => ({
    id: `evt_${i}`,
    status: evt.status,
    statusDetail: evt.description ?? undefined,
    location: evt.location ?? undefined,
    occurredAt: evt.timestamp,
  }));
}

function mapShipment(apiShipment: ApiShipment): Shipment {
  const carrier = mapCarrier(apiShipment.carrier);
  return {
    id: apiShipment.id,
    carrier,
    carrierName: carrierNames[apiShipment.carrier] ?? carrierNames[carrier] ?? "Carrier",
    trackingNumber: apiShipment.tracking_number ?? "",
    trackingUrl: apiShipment.tracking_url ?? undefined,
    status: mapShipmentStatus(apiShipment.status),
    estimatedDeliveryAt: apiShipment.estimated_delivery ?? undefined,
    actualDeliveryAt: apiShipment.delivered_at ?? undefined,
    events: mapTrackingEvents(apiShipment.events),
  };
}

function mapItem(apiItem: ApiItem): OrderItem {
  const unitPriceCents = moneyToCents(apiItem.price);
  const variantParts = [apiItem.size, apiItem.color].filter(Boolean);

  let returnStatus: ReturnStatus = "none";
  if (apiItem.return_requested) {
    returnStatus = "initiated";
  } else if (apiItem.is_returnable === true) {
    returnStatus = "eligible";
  } else if (apiItem.is_returnable === false) {
    returnStatus = "ineligible";
  }

  return {
    id: apiItem.id,
    name: apiItem.name,
    description: apiItem.description ?? undefined,
    variant: variantParts.length > 0 ? variantParts.join(", ") : undefined,
    sku: apiItem.sku ?? undefined,
    unitPriceCents,
    quantity: apiItem.quantity,
    totalCents: unitPriceCents * apiItem.quantity,
    imageUrl: apiItem.image_url ?? undefined,
    returnStatus,
  };
}

function mapMerchant(apiMerchant: ApiMerchant, returnWindowDays?: number | null): Merchant {
  return {
    id: apiMerchant.id,
    name: apiMerchant.name,
    domain: apiMerchant.domain ?? "",
    supportEmail: apiMerchant.support_email ?? undefined,
    supportUrl: apiMerchant.support_url ?? undefined,
    returnPolicyUrl: apiMerchant.return_portal_url ?? undefined,
    defaultReturnWindowDays: returnWindowDays ?? 30,
  };
}

function buildReturnPolicy(apiOrder: ApiOrder): ReturnPolicy | undefined {
  if (!apiOrder.return_window_end) return undefined;

  const deadline = new Date(apiOrder.return_window_end);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isEligible = mapOrderStatus(apiOrder.status) === "delivered" && daysRemaining > 0;

  return {
    id: `policy_${apiOrder.id}`,
    isEligible,
    returnWindowDays: apiOrder.return_window_days ?? undefined,
    deadlineAt: apiOrder.return_window_end,
    daysRemaining,
    returnType: "full_refund",
    freeReturn: false,
    returnPortalUrl: apiOrder.merchant.return_portal_url ?? undefined,
  };
}

// ── Main mapper ──────────────────────────────────────────────────────

export function mapApiOrderToOrder(apiOrder: ApiOrder): Order {
  const shipment = apiOrder.shipments?.[0] ? mapShipment(apiOrder.shipments[0]) : undefined;
  const firstShipment = apiOrder.shipments?.[0];

  return {
    id: apiOrder.id,
    userId: apiOrder.user_id,
    orderNumber: apiOrder.order_number,
    merchant: mapMerchant(apiOrder.merchant, apiOrder.return_window_days),
    items: apiOrder.items.map(mapItem),
    subtotalCents: moneyToCents(apiOrder.subtotal),
    taxCents: moneyToCents(apiOrder.tax),
    shippingCents: moneyToCents(apiOrder.shipping_cost),
    totalCents: moneyToCents(apiOrder.total),
    currency: apiOrder.total?.currency ?? "USD",
    status: mapOrderStatus(apiOrder.status),
    orderedAt: apiOrder.order_date ?? apiOrder.created_at,
    shippedAt: firstShipment?.shipped_at ?? undefined,
    deliveredAt: firstShipment?.delivered_at ?? undefined,
    shipment,
    returnPolicy: buildReturnPolicy(apiOrder),
    source: mapSourceType(apiOrder.source_type),
    sourceEmailId: apiOrder.source_id ?? undefined,
    sourceConfidence: apiOrder.confidence_score ?? 0,
  };
}
