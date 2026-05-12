// Admin-only type — never imported in public UI components

export enum SyncStatus {
  SUCCESS = "SUCCESS",
  PARTIAL = "PARTIAL",
  FAILED = "FAILED",
}

export interface SyncLog {
  id: string;
  batch_date: string;
  source: string;
  entity_type: string;
  total_received: number;
  total_created: number;
  total_updated: number;
  total_errors: number;
  error_details: Array<{ id?: string; error: string }> | null;
  started_at: string | null;
  completed_at: string | null;
  status: SyncStatus;
  created_at: string;
  updated_at: string;
}

export interface SyncLogsResponse {
  data: SyncLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
