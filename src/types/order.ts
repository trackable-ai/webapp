export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type CarrierCode =
  | "fedex"
  | "ups"
  | "usps"
  | "dhl"
  | "amazon"
  | "ontrac"
  | "lasership"
  | "other";

export type ShipmentStatus =
  | "pre_transit"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned";

export type ReturnType =
  | "full_refund"
  | "store_credit"
  | "exchange_only"
  | "no_returns";

export type ReturnStatus =
  | "none"
  | "eligible"
  | "initiated"
  | "shipped"
  | "received"
  | "refunded"
  | "ineligible";

export interface Merchant {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  returnPolicyUrl?: string;
  supportEmail?: string;
  supportUrl?: string;
  defaultReturnWindowDays: number;
}

export interface OrderItem {
  id: string;
  name: string;
  description?: string;
  variant?: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
  totalCents: number;
  imageUrl?: string;
  productUrl?: string;
  returnStatus: ReturnStatus;
}

export interface TrackingEvent {
  id: string;
  status: string;
  statusDetail?: string;
  location?: string;
  occurredAt: string;
}

export interface Shipment {
  id: string;
  carrier: CarrierCode;
  carrierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: ShipmentStatus;
  estimatedDeliveryAt?: string;
  actualDeliveryAt?: string;
  deliveryLocation?: string;
  events: TrackingEvent[];
}

export interface ReturnPolicy {
  id: string;
  isEligible: boolean;
  returnWindowDays?: number;
  deadlineAt?: string;
  daysRemaining?: number;
  returnType: ReturnType;
  freeReturn: boolean;
  restockingFeePercent?: number;
  conditionRequirements?: string[];
  returnInstructions?: string;
  returnLabelUrl?: string;
  returnPortalUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  externalOrderId?: string;
  merchant: Merchant;
  items: OrderItem[];
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  status: OrderStatus;
  orderedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  shipment?: Shipment;
  returnPolicy?: ReturnPolicy;
  source: "gmail" | "manual" | "screenshot";
  sourceEmailId?: string;
  sourceConfidence: number;
}
