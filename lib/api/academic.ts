/**
 * Academic API Service
 * Handles all API calls related to academic data (programs, departments, etc.)
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type { AcademicProgram } from "@/types/academic";
import type { Department } from "@/types/department";
import type {
  AcademicProgramFilters,
  CreateProgrammeInput,
  UpdateProgrammeInput,
  ProgrammesResponse,
} from "@/types/programme";

// Re-export types for convenience
export type {
  AcademicProgramFilters,
  CreateProgrammeInput,
  UpdateProgrammeInput,
  ProgrammesResponse,
};
/**
 * Get all academic programs with optional filters
 */
export async function getAcademicPrograms(
  filters?: AcademicProgramFilters
): Promise<ProgrammesResponse> {
  const queryParams = new URLSearchParams();
  if (filters?.department_id) queryParams.set("department_id", filters.department_id);
  if (filters?.level) queryParams.set("level", filters.level);
  if (filters?.is_active !== undefined) queryParams.set("is_active", filters.is_active.toString());
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  const response = await api.get(`/academic-programs?${queryParams.toString()}`);
  return toPaginated<AcademicProgram>(response);
}

/**
 * Get a single academic program by ID
 */
export async function getAcademicProgram(id: string): Promise<AcademicProgram> {
  const response = await api.get(`/academic-programs/${id}`);
  return unwrapData<AcademicProgram>(response);
}

/**
 * Create a new academic program
 */
export async function createAcademicProgram(input: CreateProgrammeInput): Promise<AcademicProgram> {
  const response = await api.post(
    "/academic-programs",
    input as unknown as Record<string, unknown>
  );
  return unwrapData<AcademicProgram>(response);
}

/**
 * Update an academic program
 */
export async function updateAcademicProgram(input: UpdateProgrammeInput): Promise<AcademicProgram> {
  const response = await api.put(
    `/academic-programs/${input.id}`,
    input.input as unknown as Record<string, unknown>
  );
  return unwrapData<AcademicProgram>(response);
}

/**
 * Delete an academic program
 */
export async function deleteAcademicProgram(id: string): Promise<void> {
  return api.del(`/academic-programs/${id}`);
}

/**
 * Get all departments
 */
export async function getDepartments(): Promise<Department[]> {
  const response = await api.get("/departments");
  return unwrapData<Department[]>(response);
}
