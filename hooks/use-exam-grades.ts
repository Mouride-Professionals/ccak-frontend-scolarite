"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as examGradesApi from "@/lib/api/exam-grades";

export const examGradeKeys = {
  all: ["exam-grades"] as const,
  gradeSheet: (examScheduleId: string) =>
    [...examGradeKeys.all, "grade-sheet", examScheduleId] as const,
};

export function useExamGradeSheet(examScheduleId: string) {
  return useQuery({
    queryKey: examGradeKeys.gradeSheet(examScheduleId),
    queryFn: () => examGradesApi.getExamGradeSheet(examScheduleId),
    staleTime: 0,
    enabled: !!examScheduleId,
  });
}

export function useCreateExamGrade(examScheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof examGradesApi.createExamGrade>[1]) =>
      examGradesApi.createExamGrade(examScheduleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examGradeKeys.gradeSheet(examScheduleId) });
    },
  });
}

export function useUpdateExamGrade(examScheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof examGradesApi.updateExamGrade>[1]) =>
      examGradesApi.updateExamGrade(examScheduleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examGradeKeys.gradeSheet(examScheduleId) });
    },
  });
}
