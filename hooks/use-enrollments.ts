"use client";

/**
 * React Query hooks for Enrollments
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Enrollment,
  EnrollmentFilters,
  CreateEnrollmentInput,
  UpdateEnrollmentInput,
} from "@/types/enrollment";
import * as enrollmentsApi from "@/lib/api/enrollments";

// =====================
// QUERY KEYS
// =====================

export const enrollmentKeys = {
  all: ["enrollments"] as const,
  lists: () => [...enrollmentKeys.all, "list"] as const,
  list: (filters?: EnrollmentFilters) => [...enrollmentKeys.lists(), filters] as const,
  details: () => [...enrollmentKeys.all, "detail"] as const,
  detail: (id: string) => [...enrollmentKeys.details(), id] as const,
};

// =====================
// QUERIES
// =====================

/**
 * Get all enrollments with filters
 */
export function useEnrollments(filters?: EnrollmentFilters) {
  return useQuery({
    queryKey: enrollmentKeys.list(filters),
    queryFn: () => enrollmentsApi.getEnrollments(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get a single enrollment by ID
 */
export function useEnrollment(id: string, enabled = true) {
  return useQuery({
    queryKey: enrollmentKeys.detail(id),
    queryFn: () => enrollmentsApi.getEnrollment(id),
    enabled: enabled && !!id,
    staleTime: 30000,
  });
}

// =====================
// MUTATIONS
// =====================

/**
 * Create a new enrollment
 */
export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEnrollmentInput) => enrollmentsApi.createEnrollment(input),
    onSuccess: () => {
      // Invalidate all lists to refetch
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
    },
  });
}

/**
 * Update an existing enrollment
 */
export function useUpdateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEnrollmentInput }) =>
      enrollmentsApi.updateEnrollment(id, input),
    onSuccess: (data) => {
      // Update the specific enrollment in cache
      queryClient.setQueryData(enrollmentKeys.detail(data.id), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
    },
  });
}

/**
 * Delete an enrollment
 */
export function useDeleteEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => enrollmentsApi.deleteEnrollment(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: enrollmentKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
    },
  });
}

/**
 * Update enrollment status
 */
export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Enrollment["status"] }) =>
      enrollmentsApi.updateEnrollmentStatus(id, status),
    onSuccess: (data) => {
      queryClient.setQueryData(enrollmentKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
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
    queryFn: () => enrollmentsApi.getStudents(),
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Get all academic programs for form selects
 */
export function useAcademicPrograms() {
  return useQuery({
    queryKey: ["academic-programs"],
    queryFn: () => enrollmentsApi.getAcademicPrograms(),
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Get all academic years for form selects
 */
export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: () => enrollmentsApi.getAcademicYears(),
    staleTime: 300000,
  });
}
