"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as courseLogApi from "@/lib/api/course-logs";
import type { CourseLogFilters, CreateCourseLogInput, UpdateCourseLogInput } from "@/types/course-log";

export const courseLogKeys = {
  all: ["course-logs"] as const,
  lists: () => [...courseLogKeys.all, "list"] as const,
  list: (filters?: CourseLogFilters) => [...courseLogKeys.lists(), filters] as const,
  detail: (id: string) => [...courseLogKeys.all, "detail", id] as const,
  course: (courseId: string, filters?: CourseLogFilters) => [
    ...courseLogKeys.all,
    "course",
    courseId,
    filters,
  ] as const,
};

export function useCourseLogs(filters?: CourseLogFilters) {
  return useQuery({
    queryKey: courseLogKeys.list(filters),
    queryFn: () => courseLogApi.getCourseLogs(filters),
    staleTime: 30000,
  });
}

export function useCourseLogsForCourse(courseId: string, filters?: CourseLogFilters) {
  return useQuery({
    queryKey: courseLogKeys.course(courseId, filters),
    queryFn: () => courseLogApi.getCourseLogsForCourse(courseId, filters),
    enabled: !!courseId,
    staleTime: 30000,
  });
}

export function useCourseLog(id: string, enabled = true) {
  return useQuery({
    queryKey: courseLogKeys.detail(id),
    queryFn: () => courseLogApi.getCourseLog(id),
    enabled: !!id && enabled,
  });
}

export function useCreateCourseLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCourseLogInput) => courseLogApi.createCourseLog(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseLogKeys.lists() });
    },
  });
}

export function useUpdateCourseLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCourseLogInput }) =>
      courseLogApi.updateCourseLog(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseLogKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: courseLogKeys.lists() });
    },
  });
}
