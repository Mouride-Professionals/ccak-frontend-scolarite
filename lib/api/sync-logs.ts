// Admin-only API module

import { api } from "@/lib/api-client";
import { toPaginated } from "@/lib/api/api-response";
import type { SyncLog, SyncLogsResponse, SyncStats } from "@/types/sync-log";

export interface SyncLogsFilters {
  page?: number;
  limit?: number;
  entity_type?: string;
}

export async function getSyncLogs(filters?: SyncLogsFilters): Promise<SyncLogsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.set("page", filters.page.toString());
  if (filters?.limit) params.set("per_page", filters.limit.toString());
  if (filters?.entity_type) params.set("entity_type", filters.entity_type);

  const query = params.toString();
  const response = await api.get(`/admin/sync-logs${query ? `?${query}` : ""}`);
  return toPaginated<SyncLog>(response);
}

export async function getSyncStats(): Promise<SyncStats> {
  const response = await api.get("/admin/sync-stats");
  const wrapped = response as { data?: SyncStats };
  return wrapped.data ?? (response as SyncStats);
}

export async function triggerSync(entityType?: string): Promise<SyncLog[]> {
  const body = entityType ? { entity_type: entityType } : {};
  const response = await api.post("/admin/sync", body);
  if (Array.isArray(response)) return response as SyncLog[];
  const wrapped = response as { data?: SyncLog[] };
  return wrapped.data ?? [];
}
