"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MaquetteFilters } from "@/types/maquette";
import * as maquetteApi from "@/lib/api/maquette";
import type { ImportMaquetteParams } from "@/lib/api/maquette";

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

export function useImportMaquette() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, params }: { file: File; params: ImportMaquetteParams }) =>
      maquetteApi.importMaquette(file, params),
    onSuccess: (result) => {
      if (!result.dry_run) {
        queryClient.invalidateQueries({ queryKey: maquetteKeys.all });
      }
    },
  });
}
