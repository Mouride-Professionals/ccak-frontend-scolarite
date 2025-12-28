"use client";

/**
 * React Query hooks for Faculties
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Faculty,
  FacultyFilters,
  CreateFacultyInput,
  UpdateFacultyInput,
} from "@/types/faculty";
import * as facultiesApi from "@/lib/api/faculties";

// =====================
// QUERY KEYS
// =====================

export const facultyKeys = {
  all: ["faculties"] as const,
  lists: () => [...facultyKeys.all, "list"] as const,
  list: (filters?: FacultyFilters) => [...facultyKeys.lists(), filters] as const,
  details: () => [...facultyKeys.all, "detail"] as const,
  detail: (id: string) => [...facultyKeys.details(), id] as const,
};

// =====================
// QUERIES
// =====================

/**
 * Get all faculties with filters
 */
export function useFaculties(filters?: FacultyFilters) {
  return useQuery({
    queryKey: facultyKeys.list(filters),
    queryFn: () => facultiesApi.getFaculties(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get a single faculty by ID
 */
export function useFaculty(id: string, enabled = true) {
  return useQuery({
    queryKey: facultyKeys.detail(id),
    queryFn: () => facultiesApi.getFaculty(id),
    staleTime: 30000,
    enabled,
  });
}

// =====================
// MUTATIONS
// =====================

/**
 * Create a new faculty
 */
export function useCreateFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFacultyInput) => facultiesApi.createFaculty(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facultyKeys.lists() });
    },
  });
}

/**
 * Update an existing faculty
 */
export function useUpdateFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateFacultyInput) => facultiesApi.updateFaculty(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: facultyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: facultyKeys.detail(data.id) });
    },
  });
}

/**
 * Delete a faculty
 */
export function useDeleteFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => facultiesApi.deleteFaculty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facultyKeys.lists() });
    },
  });
}
