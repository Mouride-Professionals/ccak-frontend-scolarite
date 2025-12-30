/**
 * Faculty API Service
 * Handles all API calls related to faculties
 */

import { api } from "@/lib/api-client";
import type {
  Faculty,
  FacultiesResponse,
  FacultyFilters,
  CreateFacultyInput,
  UpdateFacultyInput,
} from "@/types/faculty";
import { mockFaculties } from "./mock-data";

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true;

/**
 * Simulate API delay for realistic testing
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all faculties with optional filters
 */
export async function getFaculties(filters?: FacultyFilters): Promise<FacultiesResponse> {
  if (USE_MOCK_DATA) {
    await delay(500);

    let filtered = [...mockFaculties];

    // Apply filters
    if (filters?.is_active !== undefined) {
      filtered = filtered.filter((f) => f.is_active === filters.is_active);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(searchLower) || f.code.toLowerCase().includes(searchLower)
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
  if (filters?.is_active !== undefined) params.append("is_active", filters.is_active.toString());
  if (filters?.search) params.append("search", filters.search);

  return api.get<FacultiesResponse>(`/faculties?${params}`);
}

/**
 * Get a single faculty by ID
 */
export async function getFaculty(id: string): Promise<Faculty | null> {
  if (USE_MOCK_DATA) {
    await delay(300);
    return mockFaculties.find((f) => f.id === id) || null;
  }

  try {
    return api.get<Faculty | null>(`/faculties/${id}`);
  } catch {
    return null;
  }
}

/**
 * Create a new faculty
 */
export async function createFaculty(input: CreateFacultyInput): Promise<Faculty> {
  if (USE_MOCK_DATA) {
    await delay(500);
    const newFaculty: Faculty = {
      id: Math.random().toString(36).substr(2, 9),
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockFaculties.push(newFaculty);
    return newFaculty;
  }

  return api.post<Faculty>("/faculties", JSON.stringify(input));
}

/**
 * Update an existing faculty
 */
export async function updateFaculty({ id, input }: UpdateFacultyInput): Promise<Faculty> {
  if (USE_MOCK_DATA) {
    await delay(500);
    const index = mockFaculties.findIndex((f) => f.id === id);
    if (index === -1) throw new Error("Faculty not found");

    const updated: Faculty = {
      ...mockFaculties[index],
      ...input,
      updated_at: new Date().toISOString(),
    };
    mockFaculties[index] = updated;
    return updated;
  }

  return api.patch<Faculty>(`/faculties/${id}`, JSON.stringify(input));
}

/**
 * Delete a faculty
 */
export async function deleteFaculty(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(500);
    const index = mockFaculties.findIndex((f) => f.id === id);
    if (index === -1) throw new Error("Faculty not found");
    mockFaculties.splice(index, 1);
    return;
  }

  await api.del(`/faculties/${id}`);
}
