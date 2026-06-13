"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AcademicYearFilters,
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
} from "@/types/academic-year";
import * as academicYearsApi from "@/lib/api/academic-years";

export const academicYearKeys = {
  all: ["academic-years"] as const,
  lists: () => [...academicYearKeys.all, "list"] as const,
  list: (filters?: AcademicYearFilters) => [...academicYearKeys.lists(), filters] as const,
  details: () => [...academicYearKeys.all, "detail"] as const,
  detail: (id: string) => [...academicYearKeys.details(), id] as const,
  current: () => [...academicYearKeys.all, "current"] as const,
};

export function useAcademicYears(filters?: AcademicYearFilters) {
  return useQuery({
    queryKey: academicYearKeys.list(filters),
    queryFn: () => academicYearsApi.getAcademicYears(filters),
    staleTime: 30000,
  });
}

export function useAcademicYear(id: string, enabled = true) {
  return useQuery({
    queryKey: academicYearKeys.detail(id),
    queryFn: () => academicYearsApi.getAcademicYear(id),
    enabled,
    staleTime: 30000,
  });
}

export function useCurrentAcademicYear() {
  return useQuery({
    queryKey: academicYearKeys.current(),
    queryFn: () => academicYearsApi.getCurrentAcademicYear(),
    staleTime: 30000,
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAcademicYearInput) => academicYearsApi.createAcademicYear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.lists() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.current() });
    },
  });
}

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAcademicYearInput) => academicYearsApi.updateAcademicYear(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.lists() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.current() });
    },
  });
}

export function useDeleteAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicYearsApi.deleteAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.lists() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.current() });
    },
  });
}

export function useSetAcademicYearCurrent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicYearsApi.setAcademicYearAsCurrent(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.lists() });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: academicYearKeys.current() });
    },
  });
}
