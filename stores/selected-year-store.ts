"use client";

import { create } from "zustand";
import type { AcademicYear } from "@/types/academic-year";

interface SelectedYearState {
  selectedYear: AcademicYear | null;
  currentYearId: string | null;
  isReadOnly: boolean;
  setSelectedYear: (year: AcademicYear) => void;
  initFromCurrentYear: (year: AcademicYear) => void;
  reset: () => void;
}

export const useSelectedYearStore = create<SelectedYearState>((set, get) => ({
  selectedYear: null,
  currentYearId: null,
  isReadOnly: false,

  initFromCurrentYear: (year) => {
    // Only init if nothing is selected yet (don't override user's choice on re-render)
    if (get().selectedYear === null) {
      set({ selectedYear: year, currentYearId: year.id, isReadOnly: false });
    } else {
      // Always keep currentYearId up to date
      set((state) => ({
        currentYearId: year.id,
        isReadOnly: state.selectedYear?.id !== year.id,
      }));
    }
  },

  setSelectedYear: (year) => {
    const { currentYearId } = get();
    set({ selectedYear: year, isReadOnly: year.id !== currentYearId });
  },

  reset: () => set({ selectedYear: null, currentYearId: null, isReadOnly: false }),
}));
