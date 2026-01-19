import type { TrackingResult, TrackingEvent, Carrier, TrackingStatus } from "./types";

/**
 * Detect carrier from tracking number pattern
 */
function detectCarrier(trackingNumber: string): Carrier {
  const normalized = trackingNumber.toUpperCase().replace(/\s/g, "");

  // UPS: starts with 1Z
  if (normalized.startsWith("1Z")) return "UPS";

  // FedEx: 12-15 digits or starts with specific patterns
  if (/^\d{12,15}$/.test(normalized)) return "FedEx";
  if (/^(96\d{20}|61\d{18})$/.test(normalized)) return "FedEx";

  // USPS: 20-22 digits starting with 9
  if (/^9[234]\d{19,21}$/.test(normalized)) return "USPS";
  if (/^(94|93|92|91)\d{18,22}$/.test(normalized)) return "USPS";

  // DHL: 10 digits or starts with JJD
  if (/^\d{10}$/.test(normalized)) return "DHL";
  if (normalized.startsWith("JJD")) return "DHL";

  // Amazon: TBA
  if (normalized.startsWith("TBA")) return "Amazon";

  return "unknown";
}

/**
 * Simple hash function to get deterministic results from tracking number
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Generate mock tracking events based on status
 */
function generateEvents(
  trackingNumber: string,
  status: TrackingStatus,
  carrier: Carrier
): TrackingEvent[] {
  const hash = hashCode(trackingNumber);
  const now = new Date();

  const cities = [
    "Memphis, TN",
    "Louisville, KY",
    "Indianapolis, IN",
    "Chicago, IL",
    "Los Angeles, CA",
    "New York, NY",
    "Dallas, TX",
    "Atlanta, GA",
    "Phoenix, AZ",
    "Seattle, WA",
  ];

  const originCity = cities[hash % cities.length];
  const transitCity = cities[(hash + 3) % cities.length];
  const destCity = cities[(hash + 7) % cities.length];

  const events: TrackingEvent[] = [];

  // Origin event (always present)
  const originDate = new Date(now);
  originDate.setDate(originDate.getDate() - 3);
  events.push({
    timestamp: originDate.toISOString(),
    status: "Label Created",
    location: originCity,
    description: `Shipping label created, ${carrier} awaiting item`,
  });

  if (status === "pre_transit") {
    return events;
  }

  // Picked up
  const pickupDate = new Date(originDate);
  pickupDate.setHours(pickupDate.getHours() + 6);
  events.push({
    timestamp: pickupDate.toISOString(),
    status: "Picked Up",
    location: originCity,
    description: "Package picked up by carrier",
  });

  // In transit events
  const transitDate = new Date(pickupDate);
  transitDate.setDate(transitDate.getDate() + 1);
  events.push({
    timestamp: transitDate.toISOString(),
    status: "In Transit",
    location: transitCity,
    description: `Package arrived at ${carrier} facility`,
  });

  if (status === "in_transit") {
    const departedDate = new Date(transitDate);
    departedDate.setHours(departedDate.getHours() + 8);
    events.push({
      timestamp: departedDate.toISOString(),
      status: "In Transit",
      location: transitCity,
      description: "Package departed facility",
    });
    return events.reverse();
  }

  // Arrived at destination
  const arrivalDate = new Date(transitDate);
  arrivalDate.setDate(arrivalDate.getDate() + 1);
  events.push({
    timestamp: arrivalDate.toISOString(),
    status: "Arrived",
    location: destCity,
    description: "Package arrived at local facility",
  });

  if (status === "out_for_delivery") {
    const outDate = new Date(now);
    outDate.setHours(8, 30, 0, 0);
    events.push({
      timestamp: outDate.toISOString(),
      status: "Out for Delivery",
      location: destCity,
      description: "Package is out for delivery",
    });
    return events.reverse();
  }

  if (status === "delivered") {
    const deliveredDate = new Date(now);
    deliveredDate.setHours(14, 23, 0, 0);
    events.push({
      timestamp: deliveredDate.toISOString(),
      status: "Delivered",
      location: destCity,
      description: "Package delivered to front door",
    });
    return events.reverse();
  }

  if (status === "failed") {
    const failedDate = new Date(now);
    failedDate.setHours(15, 45, 0, 0);
    events.push({
      timestamp: failedDate.toISOString(),
      status: "Delivery Failed",
      location: destCity,
      description: "Delivery attempted - recipient not available",
    });
    return events.reverse();
  }

  return events.reverse();
}

/**
 * Fetch tracking information (mock implementation)
 */
export async function fetchTracking(
  trackingNumber: string,
  carrier?: string
): Promise<TrackingResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const detectedCarrier = carrier
    ? (carrier.toUpperCase() as Carrier)
    : detectCarrier(trackingNumber);

  const hash = hashCode(trackingNumber);

  // Determine status based on hash (deterministic)
  const statuses: TrackingStatus[] = [
    "in_transit",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "delivered",
    "pre_transit",
  ];
  const status = statuses[hash % statuses.length];

  // Generate estimated delivery
  const now = new Date();
  let estimatedDelivery: string | null = null;
  if (status === "in_transit" || status === "out_for_delivery") {
    const estDate = new Date(now);
    estDate.setDate(estDate.getDate() + (status === "out_for_delivery" ? 0 : 2));
    estimatedDelivery = estDate.toISOString().split("T")[0];
  }

  const events = generateEvents(trackingNumber, status, detectedCarrier);
  const lastEvent = events[0];

  return {
    trackingNumber,
    carrier: detectedCarrier,
    status,
    estimatedDelivery,
    lastUpdate: lastEvent?.timestamp || now.toISOString(),
    lastLocation: lastEvent?.location || "Unknown",
    events,
  };
}
