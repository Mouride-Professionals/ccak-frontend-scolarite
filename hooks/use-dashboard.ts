"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardOverview,
  getEnrollmentsTrend,
  getRecentActivities,
  getStudentsByLevel,
  getValidationRate,
} from "@/lib/api/dashboard";
import type { DashboardFilters, DashboardTrendPeriod } from "@/types/dashboard";

export function useDashboardOverview(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "overview", filters],
    queryFn: () => getDashboardOverview(filters),
    staleTime: 60000,
  });
}

export function useDashboardStudentsByLevel(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "students-by-level", filters],
    queryFn: () => getStudentsByLevel(filters),
    staleTime: 60000,
  });
}

export function useDashboardEnrollmentsTrend(
  period: DashboardTrendPeriod,
  filters?: DashboardFilters
) {
  return useQuery({
    queryKey: ["dashboard", "enrollments-trend", period, filters],
    queryFn: () => getEnrollmentsTrend(period, filters),
    staleTime: 60000,
  });
}

export function useDashboardValidationRate(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "validation-rate", filters],
    queryFn: () => getValidationRate(filters),
    staleTime: 60000,
  });
}

export function useDashboardRecentActivities(limit = 10, filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "recent-activities", limit, filters],
    queryFn: () => getRecentActivities(limit, filters),
    staleTime: 30000,
  });
}
