"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  FacultyMemberFilters,
  CreateFacultyMemberInput,
  UpdateFacultyMemberInput,
  CreateFacultyDocumentInput,
  CreateFacultyContractInput,
} from "@/types/academic";
import {
  getFacultyMembers,
  getFacultyMember,
  createFacultyMember,
  updateFacultyMember,
  getFacultyDocuments,
  createFacultyDocument,
  getFacultyContracts,
  createFacultyContract,
  getFacultyWorkload,
} from "@/lib/api/faculty-members";

export const facultyMemberListKeys = {
  all: ["faculty-member-directory"] as const,
  lists: () => [...facultyMemberListKeys.all, "list"] as const,
  list: (filters?: FacultyMemberFilters) => [...facultyMemberListKeys.lists(), filters] as const,
  details: () => [...facultyMemberListKeys.all, "detail"] as const,
  detail: (id: string) => [...facultyMemberListKeys.details(), id] as const,
};

export function useFacultyMembersList(
  filters?: FacultyMemberFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: facultyMemberListKeys.list(filters),
    queryFn: () => getFacultyMembers(filters),
    enabled: options?.enabled ?? true,
    staleTime: 30000,
  });
}

export function useFacultyMember(id: string, enabled = true) {
  return useQuery({
    queryKey: facultyMemberListKeys.detail(id),
    queryFn: () => getFacultyMember(id),
    enabled,
    staleTime: 30000,
  });
}

export function useCreateFacultyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFacultyMemberInput) => createFacultyMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facultyMemberListKeys.lists() });
    },
  });
}

export function useUpdateFacultyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFacultyMemberInput }) =>
      updateFacultyMember(id, input),
    onSuccess: (faculty) => {
      queryClient.setQueryData(facultyMemberListKeys.detail(faculty.id), faculty);
      queryClient.invalidateQueries({ queryKey: facultyMemberListKeys.lists() });
    },
  });
}

export function useFacultyDocuments(facultyId: string, enabled = true) {
  return useQuery({
    queryKey: ["faculty-documents", facultyId],
    queryFn: () => getFacultyDocuments(facultyId),
    enabled: enabled && !!facultyId,
    staleTime: 30000,
  });
}

export function useCreateFacultyDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ facultyId, input }: { facultyId: string; input: CreateFacultyDocumentInput }) =>
      createFacultyDocument(facultyId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["faculty-documents", variables.facultyId] });
    },
  });
}

export function useFacultyContracts(facultyId: string, enabled = true) {
  return useQuery({
    queryKey: ["faculty-contracts", facultyId],
    queryFn: () => getFacultyContracts(facultyId),
    enabled: enabled && !!facultyId,
    staleTime: 30000,
  });
}

export function useCreateFacultyContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ facultyId, input }: { facultyId: string; input: CreateFacultyContractInput }) =>
      createFacultyContract(facultyId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["faculty-contracts", variables.facultyId] });
    },
  });
}

export function useFacultyWorkload(facultyId: string, enabled = true) {
  return useQuery({
    queryKey: ["faculty-workload", facultyId],
    queryFn: () => getFacultyWorkload(facultyId),
    enabled: enabled && !!facultyId,
    staleTime: 30000,
  });
}
