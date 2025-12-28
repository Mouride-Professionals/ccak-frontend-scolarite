"use client";

/**
 * React Query hooks for Deliberation Sessions
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DeliberationSession,
  DeliberationSessionFilters,
  CreateDeliberationSessionInput,
  UpdateDeliberationSessionInput,
  DeliberationResult,
  CreateDeliberationResultInput,
  UpdateDeliberationResultInput,
} from "@/types/deliberation";
import * as deliberationsApi from "@/lib/api/deliberations";

// =====================
// QUERY KEYS
// =====================

export const deliberationKeys = {
  all: ["deliberations"] as const,
  lists: () => [...deliberationKeys.all, "list"] as const,
  list: (filters?: DeliberationSessionFilters) =>
    [...deliberationKeys.lists(), filters] as const,
  details: () => [...deliberationKeys.all, "detail"] as const,
  detail: (id: string) => [...deliberationKeys.details(), id] as const,
};

// =====================
// QUERIES
// =====================

/**
 * Get all deliberation sessions with filters
 */
export function useDeliberationSessions(filters?: DeliberationSessionFilters) {
  return useQuery({
    queryKey: deliberationKeys.list(filters),
    queryFn: () => deliberationsApi.getDeliberationSessions(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get a single deliberation session by ID
 */
export function useDeliberationSession(id: string, enabled = true) {
  return useQuery({
    queryKey: deliberationKeys.detail(id),
    queryFn: () => deliberationsApi.getDeliberationSession(id),
    enabled: enabled && !!id,
    staleTime: 30000,
  });
}

// =====================
// MUTATIONS
// =====================

/**
 * Create a new deliberation session
 */
export function useCreateDeliberationSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDeliberationSessionInput) =>
      deliberationsApi.createDeliberationSession(input),
    onSuccess: () => {
      // Invalidate all lists to refetch
      queryClient.invalidateQueries({ queryKey: deliberationKeys.lists() });
    },
  });
}

/**
 * Update an existing deliberation session
 */
export function useUpdateDeliberationSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDeliberationSessionInput }) =>
      deliberationsApi.updateDeliberationSession(id, input),
    onSuccess: (data) => {
      // Update the specific session in cache
      queryClient.setQueryData(deliberationKeys.detail(data.id), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: deliberationKeys.lists() });
    },
  });
}

/**
 * Delete a deliberation session
 */
export function useDeleteDeliberationSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deliberationsApi.deleteDeliberationSession(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: deliberationKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: deliberationKeys.lists() });
    },
  });
}

/**
 * Update deliberation session status
 */
export function useUpdateDeliberationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DeliberationSession["status"] }) =>
      deliberationsApi.updateDeliberationStatus(id, status),
    onSuccess: (data) => {
      queryClient.setQueryData(deliberationKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: deliberationKeys.lists() });
    },
  });
}

// =====================
// HELPER QUERIES
// =====================

/**
 * Get all academic programs for form selects
 */
export function useAcademicPrograms() {
  return useQuery({
    queryKey: ["academic-programs"],
    queryFn: () => deliberationsApi.getAcademicPrograms(),
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Get all academic years for form selects
 */
export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: () => deliberationsApi.getAcademicYears(),
    staleTime: 300000,
  });
}

/**
 * Get all faculty members for form selects
 */
export function useFacultyMembers() {
  return useQuery({
    queryKey: ["faculty-members"],
    queryFn: () => deliberationsApi.getFacultyMembers(),
    staleTime: 300000,
  });
}

// =====================
// DELIBERATION RESULTS
// =====================

export const deliberationResultKeys = {
  all: ["deliberation-results"] as const,
  lists: () => [...deliberationResultKeys.all, "list"] as const,
  list: (sessionId: string, filters?: any) =>
    [...deliberationResultKeys.lists(), sessionId, filters] as const,
  details: () => [...deliberationResultKeys.all, "detail"] as const,
  detail: (id: string) => [...deliberationResultKeys.details(), id] as const,
};

/**
 * Get deliberation results for a session
 */
export function useDeliberationResults(
  sessionId: string,
  filters?: any
) {
  return useQuery({
    queryKey: deliberationResultKeys.list(sessionId, filters),
    queryFn: () => deliberationsApi.getDeliberationResults(sessionId, filters),
    enabled: !!sessionId,
    staleTime: 10000, // 10 seconds (shorter for active editing)
  });
}

/**
 * Create a deliberation result
 */
export function useCreateDeliberationResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deliberationsApi.createDeliberationResult,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: deliberationResultKeys.lists(),
      });
    },
  });
}

/**
 * Update a deliberation result
 */
export function useUpdateDeliberationResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) =>
      deliberationsApi.updateDeliberationResult(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deliberationResultKeys.lists(),
      });
    },
  });
}

/**
 * Batch update deliberation results
 */
export function useBatchUpdateDeliberationResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deliberationsApi.batchUpdateDeliberationResults,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deliberationResultKeys.lists(),
      });
    },
  });
}
