"use client";

/**
 * React Query hooks for Guardians
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Guardian, CreateGuardianInput, UpdateGuardianInput } from "@/types/student";
import * as guardiansApi from "@/lib/api/guardians";

// =====================
// QUERY KEYS
// =====================

export const guardianKeys = {
  all: ["guardians"] as const,
  lists: () => [...guardianKeys.all, "list"] as const,
  list: (studentId: string) => [...guardianKeys.lists(), studentId] as const,
  details: () => [...guardianKeys.all, "detail"] as const,
  detail: (id: string) => [...guardianKeys.details(), id] as const,
};

// =====================
// QUERIES
// =====================

/**
 * Get all guardians for a student
 */
export function useGuardians(studentId: string, enabled = true) {
  return useQuery({
    queryKey: guardianKeys.list(studentId),
    queryFn: () => guardiansApi.getGuardians(studentId),
    enabled: enabled && !!studentId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get a single guardian by ID
 */
export function useGuardian(id: string, enabled = true) {
  return useQuery({
    queryKey: guardianKeys.detail(id),
    queryFn: () => guardiansApi.getGuardian(id),
    enabled: enabled && !!id,
    staleTime: 30000,
  });
}

// =====================
// MUTATIONS
// =====================

/**
 * Create a new guardian
 */
export function useCreateGuardian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGuardianInput) => guardiansApi.createGuardian(input),
    onSuccess: (data) => {
      // Invalidate the student's guardians list
      queryClient.invalidateQueries({ queryKey: guardianKeys.list(data.student_id) });
    },
  });
}

/**
 * Update an existing guardian
 */
export function useUpdateGuardian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGuardianInput }) =>
      guardiansApi.updateGuardian(id, input),
    onSuccess: (data) => {
      // Update the specific guardian in cache
      queryClient.setQueryData(guardianKeys.detail(data.id), data);
      // Invalidate the student's guardians list
      queryClient.invalidateQueries({ queryKey: guardianKeys.list(data.student_id) });
    },
  });
}

/**
 * Delete a guardian
 */
export function useDeleteGuardian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => guardiansApi.deleteGuardian(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: guardianKeys.detail(id) });
      // Invalidate all lists (we don't know which student this guardian belonged to)
      queryClient.invalidateQueries({ queryKey: guardianKeys.lists() });
    },
  });
}
