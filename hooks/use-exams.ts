"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ExamSessionFilters,
  CreateExamSessionInput,
  UpdateExamSessionInput,
  CreateExamScheduleInput,
  UpdateExamScheduleInput,
  CheckConflictsInput,
} from "@/types/exam";
import * as examsApi from "@/lib/api/exams";

// =====================
// QUERY KEYS
// =====================

export const examKeys = {
  all: ["exam-sessions"] as const,
  lists: () => [...examKeys.all, "list"] as const,
  list: (filters?: ExamSessionFilters) => [...examKeys.lists(), filters] as const,
  details: () => [...examKeys.all, "detail"] as const,
  detail: (id: string) => [...examKeys.details(), id] as const,
  schedules: (sessionId: string) => [...examKeys.detail(sessionId), "schedules"] as const,
};

// =====================
// SESSION QUERIES
// =====================

export function useExamSessions(filters?: ExamSessionFilters) {
  return useQuery({
    queryKey: examKeys.list(filters),
    queryFn: () => examsApi.getExamSessions(filters),
    staleTime: 30000,
  });
}

export function useExamSession(id: string, enabled = true) {
  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: () => examsApi.getExamSession(id),
    enabled: enabled && !!id,
    staleTime: 30000,
  });
}

// =====================
// SESSION MUTATIONS
// =====================

export function useCreateExamSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExamSessionInput) => examsApi.createExamSession(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: examKeys.lists() }),
  });
}

export function useUpdateExamSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExamSessionInput }) =>
      examsApi.updateExamSession(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.detail(id) });
    },
  });
}

export function useDeleteExamSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examsApi.deleteExamSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: examKeys.lists() }),
  });
}

export function usePublishExamSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examsApi.publishExamSession(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.detail(id) });
    },
  });
}

export function useCloseExamSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examsApi.closeExamSession(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.detail(id) });
    },
  });
}

// =====================
// SCHEDULE MUTATIONS
// =====================

export function useCreateExamSchedule(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExamScheduleInput) =>
      examsApi.createExamSchedule(sessionId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: examKeys.schedules(sessionId) });
    },
  });
}

export function useUpdateExamSchedule(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, input }: { scheduleId: string; input: UpdateExamScheduleInput }) =>
      examsApi.updateExamSchedule(sessionId, scheduleId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: examKeys.schedules(sessionId) });
    },
  });
}

export function useDeleteExamSchedule(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: string) => examsApi.deleteExamSchedule(sessionId, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: examKeys.schedules(sessionId) });
    },
  });
}

export function useCheckConflicts() {
  return useMutation({
    mutationFn: (input: CheckConflictsInput) => examsApi.checkConflicts(input),
  });
}
