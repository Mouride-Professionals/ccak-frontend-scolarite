/**
 * Enrollments API Service
 * Handles all API calls related to student enrollments
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  Enrollment,
  EnrollmentsResponse,
  EnrollmentFilters,
  CreateEnrollmentInput,
  UpdateEnrollmentInput,
  Student,
  AcademicProgram,
  AcademicYear,
} from "@/types/enrollment";

/**
 * Get all enrollments with optional filters
 * NOTE: In production, backend will return simplified EnrollmentListItem[] for list view
 * and full Enrollment for detail view
 */
export async function getEnrollments(filters?: EnrollmentFilters): Promise<EnrollmentsResponse> {
  const queryParams = new URLSearchParams();
  if (filters?.student_id) queryParams.set("student_id", filters.student_id);
  if (filters?.academic_program_id)
    queryParams.set("academic_program_id", filters.academic_program_id);
  if (filters?.academic_year_id) queryParams.set("academic_year_id", filters.academic_year_id);
  if (filters?.current_semester)
    queryParams.set("current_semester", filters.current_semester.toString());
  if (filters?.status) queryParams.set("status", filters.status);
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  const response = await api.get(`/enrollments?${queryParams.toString()}`);
  return toPaginated<Enrollment>(response);
}

/**
 * Get a single enrollment by ID
 */
export async function getEnrollment(id: string): Promise<Enrollment> {
  const response = await api.get(`/enrollments/${id}`);
  return unwrapData<Enrollment>(response);
}

/**
 * Create a new enrollment
 */
export async function createEnrollment(input: CreateEnrollmentInput): Promise<Enrollment> {
  const response = await api.post("/enrollments", input as unknown as Record<string, unknown>);
  return unwrapData<Enrollment>(response);
}

/**
 * Update an existing enrollment
 */
export async function updateEnrollment(
  id: string,
  input: UpdateEnrollmentInput
): Promise<Enrollment> {
  const response = await api.put(`/enrollments/${id}`, input as unknown as Record<string, unknown>);
  return unwrapData<Enrollment>(response);
}

/**
 * Delete an enrollment
 */
export async function deleteEnrollment(id: string): Promise<void> {
  return api.del<void>(`/enrollments/${id}`);
}

/**
 * Change the status of an enrollment
 */
export async function updateEnrollmentStatus(
  id: string,
  status: Enrollment["status"]
): Promise<Enrollment> {
  return updateEnrollment(id, { status });
}

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Get all students (for form selects)
 */
export async function getStudents(): Promise<Student[]> {
  const response = await api.get("/students");
  return toPaginated<Student>(response).data;
}

/**
 * Get all academic programs (for form selects)
 */
export async function getAcademicPrograms(): Promise<AcademicProgram[]> {
  const response = await api.get("/academic-programs");
  return unwrapData<AcademicProgram[]>(response);
}

/**
 * Get all academic years (for form selects)
 */
export async function getAcademicYears(): Promise<AcademicYear[]> {
  const response = await api.get("/academic-years");
  return unwrapData<AcademicYear[]>(response);
}
