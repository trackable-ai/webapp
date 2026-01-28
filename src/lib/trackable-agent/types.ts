export interface IngestEmailRequest {
  email_content: string;
  email_subject?: string;
  email_from?: string;
}

export interface IngestEmailResponse {
  job_id: string;
  source_id: string;
  status: string;
  message: string;
}

export interface EmailIngestionResult {
  success: boolean;
  job_id?: string;
  source_id?: string;
  status?: string;
  error?: string;
}

export interface IngestImageRequest {
  image_data: string;
  filename?: string;
}

export interface IngestImageResponse {
  job_id: string;
  source_id: string;
  status: string;
  message: string;
  extracted?: {
    merchant?: string;
    items?: string;
    trackingNumber?: string;
    orderDate?: string;
    confidence?: number;
  };
}

export interface ImageIngestionResult {
  success: boolean;
  job_id?: string;
  source_id?: string;
  status?: string;
  extracted?: IngestImageResponse["extracted"];
  error?: string;
}

export interface CreateOrderRequest {
  merchant: string;
  items: string[];
  trackingNumber?: string;
  orderDate?: string;
  source: "manual" | "screenshot";
  sourceJobId?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order_id?: string;
  error?: string;
}
