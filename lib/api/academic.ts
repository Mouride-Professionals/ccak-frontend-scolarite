/**
 * Academic API Service
 * Handles all API calls related to academic data (programs, departments, etc.)
 */

import { api } from "@/lib/api-client";
import type {
  AcademicProgram,
  Department,
} from "@/types/academic";
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
import {
  mockAcademicPrograms,
  mockDepartments,
} from "./mock-data";

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true;

console.log("USE_MOCK_DATA:", USE_MOCK_DATA);

// Utility function for simulating delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all academic programs with optional filters
 */
export async function getAcademicPrograms(
  filters?: AcademicProgramFilters
): Promise<ProgrammesResponse> {
  if (USE_MOCK_DATA) {
    console.log("Using mock data for academic programs");
    await delay(500); // Simulate network delay

    let filtered = [...mockAcademicPrograms];

    // Apply filters
    if (filters?.department_id) {
      filtered = filtered.filter((p) => p.department_id === filters.department_id);
    }
    if (filters?.level) {
      filtered = filtered.filter((p) => p.level === filters.level);
    }
    if (filters?.is_active !== undefined) {
      filtered = filtered.filter((p) => p.is_active === filters.is_active);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.department?.name.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const total = filtered.length;
    const total_pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = filtered.slice(start, end);

    return { data, total, page, limit, total_pages };
  }

  // Real API call (when backend is ready)
  const queryParams = new URLSearchParams();
  if (filters?.department_id) queryParams.set("department_id", filters.department_id);
  if (filters?.level) queryParams.set("level", filters.level);
  if (filters?.is_active !== undefined) queryParams.set("is_active", filters.is_active.toString());
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  return api.get<ProgrammesResponse>(`/academic/programs?${queryParams.toString()}`);
}

/**
 * Get a single academic program by ID
 */
export async function getAcademicProgram(id: string): Promise<AcademicProgram> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const program = mockAcademicPrograms.find((p) => p.id === id);
    if (!program) {
      throw new Error(`Academic program not found: ${id}`);
    }
    return program;
  }

  return api.get<AcademicProgram>(`/academic/programs/${id}`);
}

/**
 * Create a new academic program
 */
export async function createAcademicProgram(
  input: CreateProgrammeInput
): Promise<AcademicProgram> {
  if (USE_MOCK_DATA) {
    await delay(800);

    const newProgram: AcademicProgram = {
      id: `prog_${Date.now()}`,
      department_id: input.department_id,
      name: input.name,
      level: input.level as any,
      duration_semesters: input.duration_semesters,
      total_credits_required: input.total_credits_required,
      is_active: input.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      department: mockDepartments.find((d) => d.id === input.department_id),
    };

    mockAcademicPrograms.push(newProgram);
    return newProgram;
  }

  return api.post<AcademicProgram>("/academic/programs", input as unknown as Record<string, unknown>);
}

/**
 * Update an academic program
 */
export async function updateAcademicProgram(
  input: UpdateProgrammeInput
): Promise<AcademicProgram> {
  if (USE_MOCK_DATA) {
    await delay(800);

    const index = mockAcademicPrograms.findIndex((p) => p.id === input.id);
    if (index === -1) {
      throw new Error(`Academic program not found: ${input.id}`);
    }

    const updatedProgram: AcademicProgram = {
      ...mockAcademicPrograms[index],
      ...input.input,
      level: input.input.level as any,
      updated_at: new Date().toISOString(),
      department: mockDepartments.find((d) => d.id === input.input.department_id),
    };

    mockAcademicPrograms[index] = updatedProgram;
    return updatedProgram;
  }

  return api.put<AcademicProgram>(`/academic/programs/${input.id}`, input.input as unknown as Record<string, unknown>);
}

/**
 * Delete an academic program
 */
export async function deleteAcademicProgram(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const index = mockAcademicPrograms.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Academic program not found: ${id}`);
    }

    mockAcademicPrograms.splice(index, 1);
    return;
  }

  return api.del(`/academic/programs/${id}`);
}

/**
 * Get all departments
 */
export async function getDepartments(): Promise<Department[]> {
  if (USE_MOCK_DATA) {
    await delay(300);
    return [...mockDepartments];
  }

  return api.get<Department[]>("/academic/departments");
}