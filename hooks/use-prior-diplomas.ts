"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreatePriorDiplomaInput } from "@/types/student";
import * as priorDiplomasApi from "@/lib/api/prior-diplomas";

export const priorDiplomaKeys = {
  all: ["prior-diplomas"] as const,
  list: (studentId: string) => [...priorDiplomaKeys.all, "list", studentId] as const,
};

export function usePriorDiplomas(studentId: string, enabled = true) {
  return useQuery({
    queryKey: priorDiplomaKeys.list(studentId),
    queryFn: () => priorDiplomasApi.getPriorDiplomas(studentId),
    enabled: enabled && !!studentId,
    staleTime: 30000,
  });
}

export function useCreatePriorDiploma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePriorDiplomaInput) => priorDiplomasApi.createPriorDiploma(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: priorDiplomaKeys.list(data.diplomable_id) });
    },
  });
}

export function useDeletePriorDiploma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, id }: { studentId: string; id: string }) =>
      priorDiplomasApi.deletePriorDiploma(studentId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: priorDiplomaKeys.list(variables.studentId) });
    },
  });
}
