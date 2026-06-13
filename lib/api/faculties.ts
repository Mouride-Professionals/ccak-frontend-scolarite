/**
 * Faculty API Service
 * Handles all API calls related to faculties
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  Faculty,
  FacultiesResponse,
  FacultyFilters,
  CreateFacultyInput,
  UpdateFacultyInput,
} from "@/types/faculty";
/**
 * Get all faculties with optional filters
 */
export async function getFaculties(filters?: FacultyFilters): Promise<FacultiesResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.is_active !== undefined)
    params.append("filter[is_active]", filters.is_active.toString());
  if (filters?.search) params.append("filter[search]", filters.search);

  const response = await api.get(`/faculties?${params}`);
  return toPaginated<Faculty>(response);
}

/**
 * Get a single faculty by ID
 */
export async function getFaculty(id: string): Promise<Faculty | null> {
  try {
    const response = await api.get(`/faculties/${id}`);
    return unwrapData<Faculty>(response);
  } catch {
    return null;
  }
}

/**
 * Create a new faculty
 */
export async function createFaculty(input: CreateFacultyInput): Promise<Faculty> {
  const response = await api.post("/faculties", input as unknown as Record<string, unknown>);
  return unwrapData<Faculty>(response);
}

/**
 * Update an existing faculty
 */
export async function updateFaculty({ id, input }: UpdateFacultyInput): Promise<Faculty> {
  const response = await api.patch(`/faculties/${id}`, input as unknown as Record<string, unknown>);
  return unwrapData<Faculty>(response);
}

/**
 * Delete a faculty
 */
export async function deleteFaculty(id: string): Promise<void> {
  await api.del(`/faculties/${id}`);
}
