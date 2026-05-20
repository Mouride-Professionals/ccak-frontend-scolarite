"use client";

import { useQuery } from "@tanstack/react-query";
import type { MaquetteFilters } from "@/types/maquette";
import * as maquetteApi from "@/lib/api/maquette";

export const maquetteKeys = {
  all: ["maquette"] as const,
  list: (filters?: MaquetteFilters) => [...maquetteKeys.all, filters] as const,
};

export function useMaquette(filters?: MaquetteFilters) {
  return useQuery({
    queryKey: maquetteKeys.list(filters),
    queryFn: () => maquetteApi.getMaquette(filters),
    staleTime: 60_000,
  });
}
