"use client";

/**
 * React Query hooks for Grades
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Grade, GradeFilters, CreateGradeInput, UpdateGradeInput } from "@/types/grade";
import * as gradesApi from "@/lib/api/grades";

// =====================
// QUERY KEYS
// =====================

export const gradeKeys = {
  all: ["grades"] as const,
  lists: () => [...gradeKeys.all, "list"] as const,
  list: (filters?: GradeFilters) => [...gradeKeys.lists(), filters] as const,
  details: () => [...gradeKeys.all, "detail"] as const,
  detail: (id: string) => [...gradeKeys.details(), id] as const,
};

// =====================
// QUERIES
// =====================

/**
 * Get all grades with filters
 */
export function useGrades(filters?: GradeFilters) {
  return useQuery({
    queryKey: gradeKeys.list(filters),
    queryFn: () => gradesApi.getGrades(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get a single grade by ID
 */
export function useGrade(id: string, enabled = true) {
  return useQuery({
    queryKey: gradeKeys.detail(id),
    queryFn: () => gradesApi.getGrade(id),
    enabled: enabled && !!id,
    staleTime: 30000,
  });
}

// =====================
// MUTATIONS
// =====================

/**
 * Create a new grade
 */
export function useCreateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGradeInput) => gradesApi.createGrade(input),
    onSuccess: () => {
      // Invalidate all lists to refetch
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
    },
  });
}

/**
 * Update an existing grade
 */
export function useUpdateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGradeInput }) =>
      gradesApi.updateGrade(id, input),
    onSuccess: (data) => {
      // Update the specific grade in cache
      queryClient.setQueryData(gradeKeys.detail(data.id), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
    },
  });
}

/**
 * Delete a grade
 */
export function useDeleteGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gradesApi.deleteGrade(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: gradeKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
    },
  });
}

/**
 * Update grade status
 */
export function useUpdateGradeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Grade["status"] }) =>
      gradesApi.updateGradeStatus(id, status),
    onSuccess: (data) => {
      queryClient.setQueryData(gradeKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
    },
  });
}

/**
 * Validate multiple grades at once
 */
export function useValidateGrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => gradesApi.validateGrades(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
    },
  });
}

// =====================
// HELPER QUERIES
// =====================

/**
 * Get all students for form selects
 */
export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => gradesApi.getStudents(),
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Get all courses for form selects
 */
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => gradesApi.getCourses(),
    staleTime: 300000,
  });
}

/**
 * Get all evaluation types for form selects
 */
export function useEvaluationTypes() {
  return useQuery({
    queryKey: ["evaluation-types"],
    queryFn: () => gradesApi.getEvaluationTypes(),
    staleTime: 300000,
  });
}

/**
 * Get grade statistics for a student
 */
export function useStudentGradeStats(studentId: string, enabled = true) {
  return useQuery({
    queryKey: ["student-grade-stats", studentId],
    queryFn: () => gradesApi.getStudentGradeStats(studentId),
    enabled: enabled && !!studentId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get grade statistics for a course
 */
export function useCourseGradeStats(courseId: string, enabled = true) {
  return useQuery({
    queryKey: ["course-grade-stats", courseId],
    queryFn: () => gradesApi.getCourseGradeStats(courseId),
    enabled: enabled && !!courseId,
    staleTime: 60000,
  });
}
