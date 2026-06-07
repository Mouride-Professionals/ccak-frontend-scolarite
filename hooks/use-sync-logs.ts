"use client";

// Admin-only hook

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as syncLogsApi from "@/lib/api/sync-logs";
import type { SyncLogsFilters } from "@/lib/api/sync-logs";

export const syncLogKeys = {
  all: ["sync-logs"] as const,
  lists: () => [...syncLogKeys.all, "list"] as const,
  list: (filters?: SyncLogsFilters) => [...syncLogKeys.lists(), filters] as const,
  stats: () => [...syncLogKeys.all, "stats"] as const,
};

export function useSyncLogs(filters?: SyncLogsFilters) {
  return useQuery({
    queryKey: syncLogKeys.list(filters),
    queryFn: () => syncLogsApi.getSyncLogs(filters),
    staleTime: 30_000,
  });
}

export function useSyncStats() {
  return useQuery({
    queryKey: syncLogKeys.stats(),
    queryFn: syncLogsApi.getSyncStats,
    staleTime: 60_000,
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entityType?: string) => syncLogsApi.triggerSync(entityType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncLogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: syncLogKeys.stats() });
    },
  });
}
