export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export type TrackingStatus =
  | "pre_transit"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "unknown";

export type Carrier = "USPS" | "UPS" | "FedEx" | "DHL" | "Amazon" | "unknown";

export interface TrackingResult {
  trackingNumber: string;
  carrier: Carrier;
  status: TrackingStatus;
  estimatedDelivery: string | null;
  lastUpdate: string;
  lastLocation: string;
  events: TrackingEvent[];
}
