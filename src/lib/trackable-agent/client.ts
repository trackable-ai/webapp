import type {
  IngestEmailRequest,
  IngestEmailResponse,
  EmailIngestionResult,
  IngestImageRequest,
  IngestImageResponse,
  ImageIngestionResult,
} from "./types";
import type { ApiOrder, ApiOrderListResponse } from "./order-mapper";

export function getTrackableApiUrl(): string {
  const url = process.env.TRACKABLE_API_URL;
  if (!url) {
    throw new Error("TRACKABLE_API_URL environment variable is required");
  }
  return url;
}

export async function ingestEmail(
  request: IngestEmailRequest,
  userId: string,
): Promise<EmailIngestionResult> {
  const trackableApiUrl = getTrackableApiUrl();

  try {
    const response = await fetch(`${trackableApiUrl}/api/v1/ingest/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": userId,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Email ingestion error:", response.status, errorText);
      return {
        success: false,
        error: `Ingestion failed: ${response.status}`,
      };
    }

    const data: IngestEmailResponse = await response.json();
    return {
      success: true,
      job_id: data.job_id,
      source_id: data.source_id,
      status: data.status,
    };
  } catch (error) {
    console.error("Email ingestion request failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function ingestImage(
  request: IngestImageRequest,
  userId: string,
): Promise<ImageIngestionResult> {
  const trackableApiUrl = getTrackableApiUrl();

  try {
    const response = await fetch(`${trackableApiUrl}/api/v1/ingest/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": userId,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Image ingestion error:", response.status, errorText);
      return {
        success: false,
        error: `Ingestion failed: ${response.status}`,
      };
    }

    const data: IngestImageResponse = await response.json();
    return {
      success: true,
      job_id: data.job_id,
      source_id: data.source_id,
      status: data.status,
      extracted: data.extracted,
    };
  } catch (error) {
    console.error("Image ingestion request failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchOrders(
  userId: string,
  options?: { status?: string; limit?: number; offset?: number },
): Promise<ApiOrderListResponse> {
  const trackableApiUrl = getTrackableApiUrl();
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  const url = `${trackableApiUrl}/api/v1/orders${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url, {
    headers: { "X-User-ID": userId },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch orders: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function fetchOrder(
  userId: string,
  orderId: string,
): Promise<ApiOrder> {
  const trackableApiUrl = getTrackableApiUrl();
  const response = await fetch(
    `${trackableApiUrl}/api/v1/orders/${orderId}/latest`,
    { headers: { "X-User-ID": userId } },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch order: ${response.status} ${errorText}`);
  }

  return response.json();
}
