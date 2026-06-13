"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import * as attendanceApi from "@/lib/api/attendance";
import type { AttendanceFilters, CreateAttendanceInput } from "@/types/attendance";

export const attendanceKeys = {
  student: (studentId: string, filters?: AttendanceFilters) =>
    ["attendance", "student", studentId, filters] as const,
  course: (courseId: string, filters?: AttendanceFilters) =>
    ["attendance", "course", courseId, filters] as const,
  dispensations: (studentId: string) => ["dispensations", studentId] as const,
};

export function useStudentAttendance(studentId: string, filters?: AttendanceFilters) {
  return useQuery({
    queryKey: attendanceKeys.student(studentId, filters),
    queryFn: () => attendanceApi.getStudentAttendance(studentId, filters),
    enabled: !!studentId,
    staleTime: 30000,
  });
}

export function useCourseAttendance(courseId: string, filters?: AttendanceFilters) {
  return useQuery({
    queryKey: attendanceKeys.course(courseId, filters),
    queryFn: () => attendanceApi.getCourseAttendance(courseId, filters),
    enabled: !!courseId,
    staleTime: 30000,
  });
}

export function useStudentDispensations(
  studentId: string,
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  return useQuery({
    queryKey: attendanceKeys.dispensations(studentId),
    queryFn: () => attendanceApi.getStudentDispensations(studentId),
    enabled: (options?.enabled ?? true) && !!studentId,
    refetchInterval: options?.refetchInterval,
  });
}

export function useCreateAttendance() {
  return useMutation({
    mutationFn: (input: CreateAttendanceInput) => attendanceApi.createAttendance(input),
  });
}
