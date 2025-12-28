"use client";

/**
 * React Query hooks for Departments
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Department,
  DepartmentFilters,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "@/types/department";
import * as departmentsApi from "@/lib/api/departments";

// =====================
// QUERY KEYS
// =====================

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  list: (filters?: DepartmentFilters) =>
    [...departmentKeys.lists(), filters] as const,
  details: () => [...departmentKeys.all, "detail"] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
};

// =====================
// QUERIES
// =====================

/**
 * Get all departments with filters
 */
export function useDepartments(filters?: DepartmentFilters) {
  return useQuery({
    queryKey: departmentKeys.list(filters),
    queryFn: () => departmentsApi.getDepartments(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get a single department by ID
 */
export function useDepartment(id: string, enabled = true) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentsApi.getDepartment(id),
    staleTime: 30000,
    enabled,
  });
}

// =====================
// MUTATIONS
// =====================

/**
 * Create a new department
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDepartmentInput) =>
      departmentsApi.createDepartment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}

/**
 * Update an existing department
 */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateDepartmentInput) =>
      departmentsApi.updateDepartment(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(data.id) });
    },
  });
}

/**
 * Delete a department
 */
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => departmentsApi.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}
