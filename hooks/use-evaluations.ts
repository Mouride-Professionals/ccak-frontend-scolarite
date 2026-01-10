"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as evaluationApi from "@/lib/api/evaluations";
import type { Evaluation, EvaluationFilters, EvaluationResponseInput } from "@/types/evaluation";

export const evaluationKeys = {
  all: ["evaluations"] as const,
  lists: () => [...evaluationKeys.all, "list"] as const,
  list: (filters?: EvaluationFilters) => [...evaluationKeys.lists(), filters] as const,
  detail: (id: string) => [...evaluationKeys.all, "detail", id] as const,
  results: (id: string) => [...evaluationKeys.all, "results", id] as const,
  student: (studentId: string) => [...evaluationKeys.all, "student", studentId] as const,
};

export function useEvaluations(filters?: EvaluationFilters) {
  return useQuery({
    queryKey: evaluationKeys.list(filters),
    queryFn: () => evaluationApi.getEvaluations(filters),
    staleTime: 30000,
  });
}

export function useEvaluation(id: string, enabled = true) {
  return useQuery({
    queryKey: evaluationKeys.detail(id),
    queryFn: () => evaluationApi.getEvaluation(id),
    enabled: !!id && enabled,
  });
}

export function useEvaluationResults(id: string) {
  return useQuery({
    queryKey: evaluationKeys.results(id),
    queryFn: () => evaluationApi.getEvaluationResults(id),
    enabled: !!id,
  });
}

export function useStudentEvaluations(studentId: string) {
  return useQuery({
    queryKey: evaluationKeys.student(studentId),
    queryFn: () => evaluationApi.getStudentEvaluations(studentId),
    enabled: !!studentId,
  });
}

export function useCreateEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: evaluationApi.createEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
    },
  });
}

export function useUpdateEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Evaluation> }) =>
      evaluationApi.updateEvaluation(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
    },
  });
}

export function useDeleteEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: evaluationApi.deleteEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
    },
  });
}

export function useShareEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: evaluationApi.shareEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
    },
  });
}

export function useCreateEvaluationResponse() {
  return useMutation({
    mutationFn: (input: EvaluationResponseInput) => evaluationApi.createEvaluationResponse(input),
  });
}
