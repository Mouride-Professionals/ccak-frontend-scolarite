/**
 * React Query hooks for Course Enrollments
 */

import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import * as courseEnrollmentsApi from "@/lib/api/course-enrollments";
import type {
  CourseEnrollmentFilters,
  CreateCourseEnrollmentInput,
  UpdateCourseEnrollmentInput,
  Course,
} from "@/types/course-enrollment";

// Query keys
export const courseEnrollmentKeys = {
  all: ["courseEnrollments"] as const,
  lists: () => [...courseEnrollmentKeys.all, "list"] as const,
  list: (filters?: CourseEnrollmentFilters) => [...courseEnrollmentKeys.lists(), filters] as const,
  details: () => [...courseEnrollmentKeys.all, "detail"] as const,
  detail: (id: string) => [...courseEnrollmentKeys.details(), id] as const,
  courses: ["courses"] as const,
  academicYears: ["academicYears"] as const,
  availability: (courseId: string, academicYearId: string, semester: number) =>
    [...courseEnrollmentKeys.all, "availability", courseId, academicYearId, semester] as const,
};

/**
 * Get all course enrollments with optional filters
 */
export function useCourseEnrollments(filters?: CourseEnrollmentFilters) {
  return useQuery({
    queryKey: courseEnrollmentKeys.list(filters),
    queryFn: () => courseEnrollmentsApi.getCourseEnrollments(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get a single course enrollment by ID
 */
export function useCourseEnrollment(id: string, enabled = true) {
  return useQuery({
    queryKey: courseEnrollmentKeys.detail(id),
    queryFn: () => courseEnrollmentsApi.getCourseEnrollment(id),
    enabled: !!id && enabled,
    staleTime: 30000,
  });
}

/**
 * Create a new course enrollment
 */
export function useCreateCourseEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCourseEnrollmentInput) =>
      courseEnrollmentsApi.createCourseEnrollment(input),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: courseEnrollmentKeys.lists() });
    },
  });
}

/**
 * Update an existing course enrollment
 */
export function useUpdateCourseEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseEnrollmentInput }) =>
      courseEnrollmentsApi.updateCourseEnrollment(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific detail query
      queryClient.invalidateQueries({ queryKey: courseEnrollmentKeys.detail(variables.id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: courseEnrollmentKeys.lists() });
    },
  });
}

/**
 * Delete a course enrollment
 */
export function useDeleteCourseEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseEnrollmentsApi.deleteCourseEnrollment(id),
    onSuccess: () => {
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: courseEnrollmentKeys.lists() });
    },
  });
}

/**
 * Get all courses for form selects
 */
export function useCourses() {
  return useQuery({
    queryKey: courseEnrollmentKeys.courses,
    queryFn: () => courseEnrollmentsApi.getCourses(),
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Get all academic years for form selects
 */
export function useAcademicYears() {
  return useQuery({
    queryKey: courseEnrollmentKeys.academicYears,
    queryFn: () => courseEnrollmentsApi.getAcademicYears(),
    staleTime: 300000, // 5 minutes
  });
}

export function useCourseAvailabilities(
  courses: Course[],
  academicYearId: string,
  semester: number,
  enabled = true
) {
  const results = useQueries({
    queries: courses.map((course) => ({
      queryKey: courseEnrollmentKeys.availability(course.id, academicYearId, semester),
      queryFn: () =>
        courseEnrollmentsApi.checkCourseAvailability(course.id, academicYearId, semester),
      enabled: enabled && !!academicYearId && semester > 0,
      staleTime: 30000,
    })),
  });

  return results.reduce<
    Record<string, Awaited<ReturnType<typeof courseEnrollmentsApi.checkCourseAvailability>>>
  >((acc, result, index) => {
    const course = courses[index];
    if (course && result.data) {
      acc[course.id] = result.data;
    }
    return acc;
  }, {});
}
