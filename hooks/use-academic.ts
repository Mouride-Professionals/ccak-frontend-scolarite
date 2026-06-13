"use client";

/**
 * React Query hooks for Academic Data
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AcademicProgramFilters,
  CreateProgrammeInput,
  UpdateProgrammeInput,
} from "@/lib/api/academic";
import * as academicApi from "@/lib/api/academic";

// =====================
// QUERY KEYS
// =====================

export const academicKeys = {
  all: ["academic"] as const,
  programs: () => [...academicKeys.all, "programs"] as const,
  programLists: () => [...academicKeys.programs(), "list"] as const,
  programList: (filters?: AcademicProgramFilters) =>
    [...academicKeys.programLists(), filters] as const,
  programDetails: () => [...academicKeys.programs(), "detail"] as const,
  programDetail: (id: string) => [...academicKeys.programDetails(), id] as const,
  departments: () => [...academicKeys.all, "departments"] as const,
};

// =====================
// QUERIES
// =====================

/**
 * Get all academic programs with filters
 */
export function useAcademicPrograms(filters?: AcademicProgramFilters) {
  return useQuery({
    queryKey: academicKeys.programList(filters),
    queryFn: () => academicApi.getAcademicPrograms(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get a single academic program by ID
 */
export function useAcademicProgram(id: string, enabled = true) {
  return useQuery({
    queryKey: academicKeys.programDetail(id),
    queryFn: () => academicApi.getAcademicProgram(id),
    enabled,
    staleTime: 30000,
  });
}

/**
 * Get all departments
 */
export function useDepartments() {
  return useQuery({
    queryKey: academicKeys.departments(),
    queryFn: () => academicApi.getDepartments(),
    staleTime: 30000,
  });
}

// =====================
// MUTATIONS
// =====================

/**
 * Create a new academic program
 */
export function useCreateAcademicProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProgrammeInput) => academicApi.createAcademicProgram(input),
    onSuccess: () => {
      // Invalidate and refetch programs
      queryClient.invalidateQueries({ queryKey: academicKeys.programLists() });
    },
  });
}

/**
 * Update an academic program
 */
export function useUpdateAcademicProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProgrammeInput) => academicApi.updateAcademicProgram(input),
    onSuccess: (updatedProgram) => {
      // Update the specific program in cache
      queryClient.setQueryData(academicKeys.programDetail(updatedProgram.id), updatedProgram);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: academicKeys.programLists() });
    },
  });
}

/**
 * Delete an academic program
 */
export function useDeleteAcademicProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicApi.deleteAcademicProgram(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: academicKeys.programDetail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: academicKeys.programLists() });
    },
  });
}
