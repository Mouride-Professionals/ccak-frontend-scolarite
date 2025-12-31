"use client";

/**
 * React Query hooks for Faculty Members
 */

import { useQuery } from "@tanstack/react-query";
import type { FacultyMember } from "@/types/academic";
import { getFacultyMembers } from "@/lib/api/deliberations";

// =====================
// QUERY KEYS
// =====================

export const facultyMembersKeys = {
  all: ["faculty-members"] as const,
  lists: () => [...facultyMembersKeys.all, "list"] as const,
};

// =====================
// QUERIES
// =====================

/**
 * Get all faculty members for dropdown/selection
 */
export function useFacultyMembers() {
  return useQuery({
    queryKey: facultyMembersKeys.lists(),
    queryFn: () => getFacultyMembers(),
    staleTime: 60000, // 1 minute
  });
}
