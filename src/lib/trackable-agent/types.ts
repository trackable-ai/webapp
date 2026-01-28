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
