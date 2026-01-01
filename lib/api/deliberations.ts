/**
 * Deliberation Sessions API Service
 * Handles all API calls related to deliberation sessions
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type { AcademicProgram, AcademicYear, FacultyMember } from "@/types/academic";
import type {
  DeliberationSession,
  DeliberationSessionsResponse,
  DeliberationSessionFilters,
  CreateDeliberationSessionInput,
  UpdateDeliberationSessionInput,
  DeliberationResult,
  DeliberationResultsResponse,
  DeliberationResultFilters,
  CreateDeliberationResultInput,
  UpdateDeliberationResultInput,
} from "@/types/deliberation";

export async function getDeliberationSessions(
  filters?: DeliberationSessionFilters
): Promise<DeliberationSessionsResponse> {
  const queryParams = new URLSearchParams();
  if (filters?.academic_program_id)
    queryParams.set("filter[academic_program_id]", filters.academic_program_id);
  if (filters?.academic_year_id)
    queryParams.set("filter[academic_year_id]", filters.academic_year_id);
  if (filters?.semester) queryParams.set("filter[semester]", filters.semester.toString());
  if (filters?.status) queryParams.set("filter[status]", filters.status);
  if (filters?.search) queryParams.set("filter[search]", filters.search);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("per_page", filters.limit.toString());

  const response = await api.get(`/deliberation-sessions?${queryParams.toString()}`);
  return toPaginated<DeliberationSession>(response);
}

export async function getDeliberationSession(id: string): Promise<DeliberationSession> {
  const response = await api.get(`/deliberation-sessions/${id}`);
  return unwrapData<DeliberationSession>(response);
}

export async function createDeliberationSession(
  input: CreateDeliberationSessionInput
): Promise<DeliberationSession> {
  const response = await api.post(
    "/deliberation-sessions",
    input as unknown as Record<string, unknown>
  );
  return unwrapData<DeliberationSession>(response);
}

export async function updateDeliberationSession(
  id: string,
  input: UpdateDeliberationSessionInput
): Promise<DeliberationSession> {
  const response = await api.put(
    `/deliberation-sessions/${id}`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<DeliberationSession>(response);
}

export async function deleteDeliberationSession(id: string): Promise<void> {
  return api.del<void>(`/deliberation-sessions/${id}`);
}

export async function updateDeliberationStatus(
  id: string,
  status: DeliberationSession["status"]
): Promise<DeliberationSession> {
  const response = await api.patch(`/deliberation-sessions/${id}/status`, { status });
  return unwrapData<DeliberationSession>(response);
}

// =====================
// HELPER FUNCTIONS
// =====================

export async function getAcademicPrograms(): Promise<AcademicProgram[]> {
  const response = await api.get("/academic-programs");
  return unwrapData<AcademicProgram[]>(response);
}

export async function getAcademicYears(): Promise<AcademicYear[]> {
  const response = await api.get("/academic-years");
  return unwrapData<AcademicYear[]>(response);
}

export async function getFacultyMembers(): Promise<FacultyMember[]> {
  const response = await api.get("/faculty-members");
  return unwrapData<FacultyMember[]>(response);
}

// =====================
// DELIBERATION RESULTS
// =====================

export async function getDeliberationResults(
  sessionId: string,
  filters?: DeliberationResultFilters
): Promise<DeliberationResultsResponse> {
  const response = await api.get("/deliberation-results");
  let results = unwrapData<DeliberationResult[]>(response);

  results = results.filter((result) => result.deliberation_session_id === sessionId);

  if (filters?.page && filters?.limit) {
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    const paged = results.slice(start, end);
    return {
      data: paged,
      total: results.length,
      page: filters.page,
      limit: filters.limit,
      total_pages: Math.max(1, Math.ceil(results.length / filters.limit)),
    };
  }

  return {
    data: results,
    total: results.length,
    page: 1,
    limit: results.length,
    total_pages: 1,
  };
}

export async function createDeliberationResult(
  input: CreateDeliberationResultInput
): Promise<DeliberationResult> {
  const response = await api.post(
    "/deliberation-results",
    input as unknown as Record<string, unknown>
  );
  return unwrapData<DeliberationResult>(response);
}

export async function updateDeliberationResult(
  id: string,
  input: UpdateDeliberationResultInput
): Promise<DeliberationResult> {
  const response = await api.put(`/deliberation-results/${id}`, input);
  return unwrapData<DeliberationResult>(response);
}

export async function deleteDeliberationResult(id: string): Promise<void> {
  return api.del<void>(`/deliberation-results/${id}`);
}

export async function batchUpdateDeliberationResults(
  results: Array<{ id: string } & UpdateDeliberationResultInput>
): Promise<DeliberationResult[]> {
  const updated = await Promise.all(
    results.map((result) => updateDeliberationResult(result.id, result))
  );
  return updated;
}
