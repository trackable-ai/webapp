import type {
  IngestEmailRequest,
  IngestEmailResponse,
  EmailIngestionResult,
} from "./types";

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
