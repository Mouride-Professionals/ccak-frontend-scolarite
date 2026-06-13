"use client";

import { create } from "zustand";
import type { Course } from "@/types/course-enrollment";

export interface BasketCourse extends Course {
  selected_at: string;
}

interface CourseBasketState {
  items: BasketCourse[];
  addCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
  clear: () => void;
  hasCourse: (courseId: string) => boolean;
  totalCredits: () => number;
}

export const useCourseBasketStore = create<CourseBasketState>((set, get) => ({
  items: [],
  addCourse: (course) =>
    set((state) => {
      if (state.items.some((item) => item.id === course.id)) {
        return state;
      }
      return {
        items: [...state.items, { ...course, selected_at: new Date().toISOString() }],
      };
    }),
  removeCourse: (courseId) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== courseId) })),
  clear: () => set({ items: [] }),
  hasCourse: (courseId) => get().items.some((item) => item.id === courseId),
  totalCredits: () => get().items.reduce((sum, item) => sum + (item.credits || 0), 0),
}));
