/**
 * Course Enrollments API Service
 * Handles all API calls related to student course enrollments
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  CourseEnrollment,
  CourseEnrollmentsResponse,
  CourseEnrollmentFilters,
  CreateCourseEnrollmentInput,
  UpdateCourseEnrollmentInput,
  Course,
  CourseAvailability,
  ProgramAvailableCoursesInput,
  ProgramAvailableCoursesResponse,
  CourseEnrollmentMatrix,
  CourseEnrollmentMatrixFilters,
  SaveCourseEnrollmentMatrixInput,
  SaveCourseEnrollmentMatrixResult,
} from "@/types/course-enrollment";
import type { AcademicYear } from "@/types/enrollment";

/**
 * Get all course enrollments with optional filters
 */
export async function getCourseEnrollments(
  filters?: CourseEnrollmentFilters
): Promise<CourseEnrollmentsResponse> {
  const queryParams = new URLSearchParams();
  if (filters?.enrollment_id) queryParams.set("filter[enrollment_id]", filters.enrollment_id);
  if (filters?.course_id) queryParams.set("filter[course_id]", filters.course_id);
  if (filters?.academic_year_id)
    queryParams.set("filter[academic_year_id]", filters.academic_year_id);
  if (filters?.semester) queryParams.set("filter[semester]", filters.semester.toString());
  if (filters?.status) queryParams.set("filter[status]", filters.status);
  if (filters?.search) queryParams.set("filter[search]", filters.search);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("per_page", filters.limit.toString());

  const response = await api.get(`/course-enrollments?${queryParams.toString()}`);
  return toPaginated<CourseEnrollment>(response);
}

/**
 * Get a single course enrollment by ID
 */
export async function getCourseEnrollment(id: string): Promise<CourseEnrollment> {
  const response = await api.get(`/course-enrollments/${id}`);
  return unwrapData<CourseEnrollment>(response);
}

/**
 * Create a new course enrollment
 */
export async function createCourseEnrollment(
  input: CreateCourseEnrollmentInput
): Promise<CourseEnrollment> {
  const response = await api.post(
    "/course-enrollments",
    input as unknown as Record<string, unknown>
  );
  return unwrapData<CourseEnrollment>(response);
}

/**
 * Enroll one program enrollment in a course through the enrollment-aware API.
 */
export async function enrollCourse(
  enrollmentId: string,
  input: Omit<CreateCourseEnrollmentInput, "enrollment_id" | "academic_year_id" | "status">
): Promise<CourseEnrollment> {
  const response = await api.post(
    `/enrollments/${enrollmentId}/courses`,
    input as unknown as Record<string, unknown>
  );
  const payload = unwrapData<{ course_enrollment: CourseEnrollment }>(response);
  return payload.course_enrollment;
}

/**
 * Update an existing course enrollment
 */
export async function updateCourseEnrollment(
  id: string,
  input: UpdateCourseEnrollmentInput
): Promise<CourseEnrollment> {
  const response = await api.put(
    `/course-enrollments/${id}`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<CourseEnrollment>(response);
}

/**
 * Delete a course enrollment
 */
export async function deleteCourseEnrollment(id: string): Promise<void> {
  return api.del<void>(`/course-enrollments/${id}`);
}

/**
 * Change the status of a course enrollment
 */
export async function updateCourseEnrollmentStatus(
  id: string,
  status: CourseEnrollment["status"]
): Promise<CourseEnrollment> {
  return updateCourseEnrollment(id, { status });
}

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Get all courses (for form selects)
 */
export async function getCourses(): Promise<Course[]> {
  const response = await api.get("/courses");
  return unwrapData<Course[]>(response);
}

export async function getAvailableCoursesByProgram(
  programId: string,
  input: ProgramAvailableCoursesInput
): Promise<ProgramAvailableCoursesResponse> {
  const queryParams = new URLSearchParams();
  if (input.academic_year_id) queryParams.set("academic_year_id", input.academic_year_id);
  queryParams.set("semester", input.semester.toString());
  if (input.student_id) queryParams.set("student_id", input.student_id);
  if (input.search) queryParams.set("search", input.search);

  const response = await api.get(
    `/programs/${programId}/available-courses?${queryParams.toString()}`
  );
  const payload = unwrapData<ProgramAvailableCoursesResponse>(response);
  return {
    ...payload,
    courses: payload.courses.map((course) => {
      const prerequisites = course.prerequisites as unknown;
      const normalizedPrerequisites =
        prerequisites &&
        typeof prerequisites === "object" &&
        "required" in prerequisites &&
        Array.isArray((prerequisites as { required?: unknown }).required)
          ? (prerequisites as { required: string[] }).required
          : course.prerequisites;

      return {
        ...course,
        prerequisites: normalizedPrerequisites,
      };
    }),
  };
}

export async function getCourseEnrollmentMatrix(
  programId: string,
  filters: CourseEnrollmentMatrixFilters
): Promise<CourseEnrollmentMatrix> {
  const queryParams = new URLSearchParams();
  queryParams.set("academic_year_id", filters.academic_year_id);
  queryParams.set("semester", filters.semester.toString());
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.search) queryParams.set("search", filters.search);

  const response = await api.get(
    `/programs/${programId}/course-enrollment-matrix?${queryParams.toString()}`
  );
  return unwrapData<CourseEnrollmentMatrix>(response);
}

export async function saveCourseEnrollmentMatrix(
  programId: string,
  input: SaveCourseEnrollmentMatrixInput
): Promise<SaveCourseEnrollmentMatrixResult> {
  const response = await api.post(
    `/programs/${programId}/course-enrollment-matrix`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<SaveCourseEnrollmentMatrixResult>(response);
}

/**
 * Get all academic years (for form selects)
 */
export async function getAcademicYears(): Promise<AcademicYear[]> {
  const response = await api.get("/academic-years");
  return unwrapData<AcademicYear[]>(response);
}

export async function checkCourseAvailability(
  courseId: string,
  academicYearId: string,
  semester: number
): Promise<CourseAvailability> {
  try {
    const response = await api.get(
      `/courses/${courseId}/availability?academic_year_id=${academicYearId}&semester=${semester}`
    );
    const payload = unwrapData<Record<string, unknown>>(response);
    // Backend returns { course, availability: { available, current, max, remaining } }
    const avail = (payload?.availability as Record<string, unknown>) ?? payload ?? {};

    return {
      course_id: courseId,
      is_available:
        Boolean(avail?.is_available) ||
        Boolean(avail?.available) ||
        Number(avail?.remaining_seats ?? avail?.remaining ?? 0) > 0,
      remaining_seats:
        typeof avail?.remaining_seats === "number"
          ? avail.remaining_seats
          : typeof avail?.remaining === "number"
            ? avail.remaining
            : null,
      total_seats:
        typeof avail?.total_seats === "number"
          ? avail.total_seats
          : typeof avail?.max === "number"
            ? avail.max
            : null,
      enrolled_count:
        typeof avail?.enrolled_count === "number"
          ? avail.enrolled_count
          : typeof avail?.current === "number"
            ? avail.current
            : null,
      message: typeof avail?.message === "string" ? avail.message : undefined,
    };
  } catch {
    return {
      course_id: courseId,
      is_available: true,
      remaining_seats: null,
      total_seats: null,
      enrolled_count: null,
    };
  }
}
