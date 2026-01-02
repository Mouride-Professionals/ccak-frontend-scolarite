"use client";

import { useQuery } from "@tanstack/react-query";
import type { FacultyMemberFilters } from "@/types/academic";
import { getFacultyMembers, getFacultyMember } from "@/lib/api/faculty-members";

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
