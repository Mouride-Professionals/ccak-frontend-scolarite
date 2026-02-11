"use client";

import { useQuery } from "@tanstack/react-query";
import { getEnrollmentDashboard } from "@/lib/api/enrollment-dashboard";

export function useEnrollmentDashboard() {
  return useQuery({
    queryKey: ["enrollment-dashboard"],
    queryFn: getEnrollmentDashboard,
    staleTime: 60000,
  });
}
