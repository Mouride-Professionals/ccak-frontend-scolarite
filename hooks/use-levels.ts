"use client";

import { useQuery } from "@tanstack/react-query";
import * as levelsApi from "@/lib/api/levels";
import type { LevelFilters } from "@/types/level";

export const levelKeys = {
  all: ["levels"] as const,
  lists: () => [...levelKeys.all, "list"] as const,
  list: (filters?: LevelFilters) => [...levelKeys.lists(), filters] as const,
  detail: (id: string) => [...levelKeys.all, "detail", id] as const,
};

export function useLevels(filters?: LevelFilters) {
  return useQuery({
    queryKey: levelKeys.list(filters),
    queryFn: () => levelsApi.getLevels(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLevel(id: string, enabled = true) {
  return useQuery({
    queryKey: levelKeys.detail(id),
    queryFn: () => levelsApi.getLevel(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}
