"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTeachingAssignmentInput,
  TeachingAssignmentFilters,
} from "@/types/teaching-assignment";
import * as teachingAssignmentsApi from "@/lib/api/teaching-assignments";

export const teachingAssignmentKeys = {
  all: ["teaching-assignments"] as const,
  lists: () => [...teachingAssignmentKeys.all, "list"] as const,
  list: (filters?: TeachingAssignmentFilters) =>
    [...teachingAssignmentKeys.lists(), filters] as const,
};

export function useTeachingAssignments(filters?: TeachingAssignmentFilters) {
  return useQuery({
    queryKey: teachingAssignmentKeys.list(filters),
    queryFn: () => teachingAssignmentsApi.getTeachingAssignments(filters),
    staleTime: 30_000,
  });
}

export function useCreateTeachingAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTeachingAssignmentInput) =>
      teachingAssignmentsApi.createTeachingAssignment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teachingAssignmentKeys.lists() });
    },
  });
}

export function useDeleteTeachingAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teachingAssignmentsApi.deleteTeachingAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teachingAssignmentKeys.lists() });
    },
  });
}

export function useTeachingAssignmentConflictCheck() {
  return useMutation({
    mutationFn: (input: CreateTeachingAssignmentInput) =>
      teachingAssignmentsApi.checkTeachingAssignmentConflicts(input),
  });
}
