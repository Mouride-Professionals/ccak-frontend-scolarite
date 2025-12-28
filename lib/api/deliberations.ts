/**
 * Deliberation Sessions API Service
 * Handles all API calls related to deliberation sessions
 */

import { api } from "@/lib/api-client";
import type { AcademicProgram, AcademicYear, FacultyMember } from "@/types/academic";
import type {
  DeliberationSession,
  DeliberationSessionsResponse,
  DeliberationSessionFilters,
  CreateDeliberationSessionInput,
  UpdateDeliberationSessionInput,
} from "@/types/deliberation";
import { DeliberationStatus } from "@/types/deliberation";
import {
  mockDeliberationSessions,
  mockAcademicPrograms,
  mockAcademicYears,
  mockFacultyMembers,
} from "./mock-data";

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true;

/**
 * Simulate API delay for realistic testing
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all deliberation sessions with optional filters
 */
export async function getDeliberationSessions(
  filters?: DeliberationSessionFilters
): Promise<DeliberationSessionsResponse> {
  if (USE_MOCK_DATA) {
    await delay(500); // Simulate network delay

    let filtered = [...mockDeliberationSessions];

    // Apply filters
    if (filters?.academic_program_id) {
      filtered = filtered.filter((s) => s.academic_program_id === filters.academic_program_id);
    }
    if (filters?.academic_year_id) {
      filtered = filtered.filter((s) => s.academic_year_id === filters.academic_year_id);
    }
    if (filters?.semester) {
      filtered = filtered.filter((s) => s.semester === filters.semester);
    }
    if (filters?.status) {
      filtered = filtered.filter((s) => s.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.session_name.toLowerCase().includes(searchLower) ||
          s.academic_program?.name.toLowerCase().includes(searchLower)
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
  if (filters?.academic_program_id)
    queryParams.set("academic_program_id", filters.academic_program_id);
  if (filters?.academic_year_id) queryParams.set("academic_year_id", filters.academic_year_id);
  if (filters?.semester) queryParams.set("semester", filters.semester.toString());
  if (filters?.status) queryParams.set("status", filters.status);
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  return api.get<DeliberationSessionsResponse>(
    `/deliberations?${queryParams.toString()}`
  );
}

/**
 * Get a single deliberation session by ID
 */
export async function getDeliberationSession(id: string): Promise<DeliberationSession> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const session = mockDeliberationSessions.find((s) => s.id === id);
    if (!session) {
      throw new Error(`Deliberation session not found: ${id}`);
    }
    return session;
  }

  return api.get<DeliberationSession>(`/deliberations/${id}`);
}

/**
 * Create a new deliberation session
 */
export async function createDeliberationSession(
  input: CreateDeliberationSessionInput
): Promise<DeliberationSession> {
  if (USE_MOCK_DATA) {
    await delay(800);

    // Find related data
    const program = mockAcademicPrograms.find((p) => p.id === input.academic_program_id);
    const year = mockAcademicYears.find((y) => y.id === input.academic_year_id);
    const president = mockFacultyMembers.find((f) => f.id === input.presided_by);
    const jury = mockFacultyMembers.filter((f) => input.jury_members.includes(f.id));

    const newSession: DeliberationSession = {
      id: `delib-${Date.now()}`,
      ...input,
      status: DeliberationStatus.SCHEDULED,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      academic_program: program
        ? {
            id: program.id,
            name: program.name,
            level: program.level,
          }
        : undefined,
      academic_year: year
        ? {
            id: year.id,
            name: year.name,
          }
        : undefined,
      president: president
        ? {
            id: president.id,
            full_name: president.full_name,
            rank: president.rank,
          }
        : undefined,
      jury: jury.map((j) => ({
        id: j.id,
        full_name: j.full_name,
        rank: j.rank,
      })),
      stats: {
        total_students: 0,
        results_count: 0,
      },
    };

    // Add to mock data (in-memory only)
    mockDeliberationSessions.unshift(newSession);

    return newSession;
  }

  return api.post<DeliberationSession>("/deliberations", input as unknown as Record<string, unknown>);
}

/**
 * Update an existing deliberation session
 */
export async function updateDeliberationSession(
  id: string,
  input: UpdateDeliberationSessionInput
): Promise<DeliberationSession> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const index = mockDeliberationSessions.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Deliberation session not found: ${id}`);
    }

    const updated: DeliberationSession = {
      ...mockDeliberationSessions[index],
      ...input,
      updated_at: new Date().toISOString(),
    };

    mockDeliberationSessions[index] = updated;
    return updated;
  }

  return api.put<DeliberationSession>(`/deliberations/${id}`, input as unknown as Record<string, unknown>);
}

/**
 * Delete a deliberation session
 */
export async function deleteDeliberationSession(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const index = mockDeliberationSessions.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Deliberation session not found: ${id}`);
    }

    mockDeliberationSessions.splice(index, 1);
    return;
  }

  return api.del<void>(`/deliberations/${id}`);
}

/**
 * Change the status of a deliberation session
 */
export async function updateDeliberationStatus(
  id: string,
  status: DeliberationSession["status"]
): Promise<DeliberationSession> {
  return updateDeliberationSession(id, { status });
}

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Get all academic programs (for form selects)
 */
export async function getAcademicPrograms() {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockAcademicPrograms;
  }
  return api.get<AcademicProgram[]>("/academic-programs");
}

/**
 * Get all academic years (for form selects)
 */
export async function getAcademicYears() {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockAcademicYears;
  }
  return api.get<AcademicYear[]>("/academic-years");
}

/**
 * Get all faculty members (for form selects)
 */
export async function getFacultyMembers() {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockFacultyMembers;
  }
  return api.get<FacultyMember[]>("/faculty-members");
}
