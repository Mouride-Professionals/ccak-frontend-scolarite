"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AssessmentFilters,
  CreateAssessmentInput,
  UpdateAssessmentInput,
} from "@/types/assessment";
import * as assessmentsApi from "@/lib/api/assessments";

export const assessmentKeys = {
  all: ["assessments"] as const,
  lists: () => [...assessmentKeys.all, "list"] as const,
  list: (filters?: AssessmentFilters) => [...assessmentKeys.lists(), filters] as const,
  detail: (id: string) => [...assessmentKeys.all, "detail", id] as const,
  gradeSheet: (id: string) => [...assessmentKeys.all, "grade-sheet", id] as const,
  byCourse: (courseId: string) => [...assessmentKeys.all, "course", courseId] as const,
};

export function useAssessments(filters?: AssessmentFilters) {
  return useQuery({
    queryKey: assessmentKeys.list(filters),
    queryFn: () => assessmentsApi.getAssessments(filters),
    staleTime: 30_000,
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: assessmentKeys.detail(id),
    queryFn: () => assessmentsApi.getAssessment(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useAssessmentsByCourse(courseId: string) {
  return useQuery({
    queryKey: assessmentKeys.byCourse(courseId),
    queryFn: () => assessmentsApi.getAssessmentsByCourse(courseId),
    staleTime: 30_000,
    enabled: !!courseId,
  });
}

export function useAssessmentGradeSheet(id: string) {
  return useQuery({
    queryKey: assessmentKeys.gradeSheet(id),
    queryFn: () => assessmentsApi.getAssessmentGradeSheet(id),
    staleTime: 0,
    enabled: !!id,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAssessmentInput) => assessmentsApi.createAssessment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}

export function useUpdateAssessment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAssessmentInput) => assessmentsApi.updateAssessment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) });
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assessmentsApi.deleteAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}

export function usePublishAssessmentGrades(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => assessmentsApi.publishAssessmentGrades(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}
