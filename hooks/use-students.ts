"use client";

/**
 * React Query hooks for Students
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Student,
  StudentFilters,
  CreateStudentInput,
  UpdateStudentInput,
} from "@/types/student";
import * as studentsApi from "@/lib/api/students";

// =====================
// QUERY KEYS
// =====================

export const studentKeys = {
  all: ["students"] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  list: (filters?: StudentFilters) => [...studentKeys.lists(), filters] as const,
  details: () => [...studentKeys.all, "detail"] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
};

// =====================
// QUERIES
// =====================

/**
 * Get all students with filters
 */
export function useStudents(filters?: StudentFilters) {
  return useQuery({
    queryKey: studentKeys.list(filters),
    queryFn: () => studentsApi.getStudents(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get a single student by ID
 */
export function useStudent(id: string, enabled = true) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentsApi.getStudent(id),
    enabled: enabled && !!id,
    staleTime: 30000,
  });
}

// =====================
// MUTATIONS
// =====================

/**
 * Create a new student
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStudentInput) => studentsApi.createStudent(input),
    onSuccess: () => {
      // Invalidate all lists to refetch
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

/**
 * Update an existing student
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStudentInput }) =>
      studentsApi.updateStudent(id, input),
    onSuccess: (data) => {
      // Update the specific student in cache
      queryClient.setQueryData(studentKeys.detail(data.id), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

/**
 * Delete a student
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentsApi.deleteStudent(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: studentKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

/**
 * Update student status
 */
export function useUpdateStudentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Student["status"] }) =>
      studentsApi.updateStudentStatus(id, status),
    onSuccess: (data) => {
      queryClient.setQueryData(studentKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}
