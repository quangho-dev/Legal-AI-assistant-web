export type DocumentRecord = {
  id: string;
  filename: string;
  s3_key: string;
  file_size: number;
  file_type: string;
  processing_status: string;
  task_id?: string | null;
  source_type: string;
  source_url?: string | null;
  processing_details?: Record<string, unknown>;
  created_at: string;
};

export type DocumentMonitorRecord = DocumentRecord & {
  chunk_count: number;
};

export type UploadUrlResponse = {
  upload_url: string;
  s3_key: string;
  document: DocumentRecord;
};

export type ProcessingElementsSummary = {
  text?: number;
  tables?: number;
  images?: number;
  titles?: number;
  other?: number;
};

export type SummarisingProgress = {
  current_chunk?: number;
  total_chunks?: number;
};
