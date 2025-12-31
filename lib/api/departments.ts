/**
 * Department API Service
 * Handles all API calls related to departments
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  Department,
  DepartmentsResponse,
  DepartmentFilters,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "@/types/department";
/**
 * Get all departments with optional filters
 */
export async function getDepartments(filters?: DepartmentFilters): Promise<DepartmentsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.faculty_id) params.append("faculty_id", filters.faculty_id);
  if (filters?.is_active !== undefined) params.append("is_active", filters.is_active.toString());
  if (filters?.search) params.append("search", filters.search);

  const response = await api.get(`/departments?${params}`);
  return toPaginated<Department>(response);
}

/**
 * Get a single department by ID
 */
export async function getDepartment(id: string): Promise<Department | null> {
  try {
    const response = await api.get(`/departments/${id}`);
    return unwrapData<Department>(response);
  } catch {
    return null;
  }
}

/**
 * Create a new department
 */
export async function createDepartment(input: CreateDepartmentInput): Promise<Department> {
  const response = await api.post("/departments", input as unknown as Record<string, unknown>);
  return unwrapData<Department>(response);
}

/**
 * Update an existing department
 */
export async function updateDepartment({ id, input }: UpdateDepartmentInput): Promise<Department> {
  const response = await api.patch(
    `/departments/${id}`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<Department>(response);
}

/**
 * Delete a department
 */
export async function deleteDepartment(id: string): Promise<void> {
  await api.del(`/departments/${id}`);
}
