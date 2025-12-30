/**
 * Department API Service
 * Handles all API calls related to departments
 */

import { api } from "@/lib/api-client";
import type {
  Department,
  DepartmentsResponse,
  DepartmentFilters,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "@/types/department";
import { mockDepartments } from "./mock-data";

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true;

/**
 * Simulate API delay for realistic testing
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all departments with optional filters
 */
export async function getDepartments(filters?: DepartmentFilters): Promise<DepartmentsResponse> {
  if (USE_MOCK_DATA) {
    await delay(500);

    let filtered = [...mockDepartments];

    // Apply filters
    if (filters?.faculty_id) {
      filtered = filtered.filter((d) => d.faculty_id === filters.faculty_id);
    }
    if (filters?.is_active !== undefined) {
      filtered = filtered.filter((d) => d.is_active === filters.is_active);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchLower) || d.code.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      data: paginated,
      total: filtered.length,
      page,
      limit,
      total_pages: Math.ceil(filtered.length / limit),
    };
  }

  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.faculty_id) params.append("faculty_id", filters.faculty_id);
  if (filters?.is_active !== undefined) params.append("is_active", filters.is_active.toString());
  if (filters?.search) params.append("search", filters.search);

  return api.get<DepartmentsResponse>(`/departments?${params}`);
}

/**
 * Get a single department by ID
 */
export async function getDepartment(id: string): Promise<Department | null> {
  if (USE_MOCK_DATA) {
    await delay(300);
    return mockDepartments.find((d) => d.id === id) || null;
  }

  try {
    return api.get<Department | null>(`/departments/${id}`);
  } catch {
    return null;
  }
}

/**
 * Create a new department
 */
export async function createDepartment(input: CreateDepartmentInput): Promise<Department> {
  if (USE_MOCK_DATA) {
    await delay(500);
    const newDepartment: Department = {
      id: Math.random().toString(36).substr(2, 9),
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDepartments.push(newDepartment);
    return newDepartment;
  }

  return api.post<Department>("/departments", JSON.stringify(input));
}

/**
 * Update an existing department
 */
export async function updateDepartment({ id, input }: UpdateDepartmentInput): Promise<Department> {
  if (USE_MOCK_DATA) {
    await delay(500);
    const index = mockDepartments.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Department not found");

    const updated: Department = {
      ...mockDepartments[index],
      ...input,
      updated_at: new Date().toISOString(),
    };
    mockDepartments[index] = updated;
    return updated;
  }

  return api.patch<Department>(`/departments/${id}`, JSON.stringify(input));
}

/**
 * Delete a department
 */
export async function deleteDepartment(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(500);
    const index = mockDepartments.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Department not found");
    mockDepartments.splice(index, 1);
    return;
  }

  await api.del(`/departments/${id}`);
}
