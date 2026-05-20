"use client";

import { useEffect } from "react";
import { useSelectedYearStore } from "@/stores/selected-year-store";
import { useCurrentAcademicYear } from "@/hooks/use-academic-years";

/**
 * Initializes the store from the current academic year and exposes
 * the selected year + read-only flag for consumers.
 */
export function useSelectedYear() {
  const { data: currentYear } = useCurrentAcademicYear();
  const { selectedYear, isReadOnly, setSelectedYear, initFromCurrentYear } =
    useSelectedYearStore();

  useEffect(() => {
    if (currentYear) {
      initFromCurrentYear(currentYear);
    }
  }, [currentYear, initFromCurrentYear]);

  return {
    selectedYear,
    isReadOnly,
    setSelectedYear,
    currentYearId: useSelectedYearStore.getState().currentYearId,
  };
}

/**
 * Returns true when the user is viewing a closed (non-current) year.
 * Safe to call in any client component.
 */
export function useIsReadOnly(): boolean {
  return useSelectedYearStore((s) => s.isReadOnly);
}
