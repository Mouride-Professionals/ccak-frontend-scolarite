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
  FinalizeDeliberationSessionInput,
  StudentDeliberationHistoryResponse,
  StudentDeliberationHistoryItem,
} from "@/types/deliberation";

async function tryApiAttempts<T>(attempts: Array<() => Promise<T>>): Promise<T> {
  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("All API attempts failed");
}

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
  const queryParams = new URLSearchParams();
  queryParams.set("filter[deliberation_session_id]", sessionId);
  if (filters?.student_id) queryParams.set("filter[student_id]", filters.student_id);
  if (filters?.decision) queryParams.set("filter[decision]", filters.decision);
  if (filters?.is_with_honors !== undefined)
    queryParams.set("filter[is_with_honors]", String(filters.is_with_honors));
  if (filters?.page) queryParams.set("page", String(filters.page));
  if (filters?.limit) queryParams.set("per_page", String(filters.limit));

  try {
    const response = await tryApiAttempts([
      () => api.get(`/deliberation-results?${queryParams.toString()}`),
      () => api.get(`/deliberation-sessions/${sessionId}/results?${queryParams.toString()}`),
    ]);
    return toPaginated<DeliberationResult>(response);
  } catch {
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

export async function generateDeliberationResults(sessionId: string): Promise<void> {
  await tryApiAttempts([
    () => api.post(`/deliberation-sessions/${sessionId}/generate-results`, {}),
    () => api.post(`/deliberation-sessions/${sessionId}/results/generate`, {}),
    () => api.post(`/deliberations/${sessionId}/generate-results`, {}),
  ]);
}

export async function finalizeDeliberationSession(
  sessionId: string,
  input: FinalizeDeliberationSessionInput
): Promise<DeliberationSession> {
  const payload = {
    completion_notes: input.completion_notes,
    lock_session: input.lock_session ?? true,
  };

  const response = await tryApiAttempts([
    () => api.post(`/deliberation-sessions/${sessionId}/finalize`, payload),
    () => api.post(`/deliberation-sessions/${sessionId}/complete`, payload),
    () => api.patch(`/deliberation-sessions/${sessionId}/status`, { status: "CLOSED" }),
  ]);

  try {
    return unwrapData<DeliberationSession>(response);
  } catch {
    return getDeliberationSession(sessionId);
  }
}

export async function getStudentDeliberationHistory(
  studentId: string
): Promise<StudentDeliberationHistoryResponse> {
  let results: DeliberationResult[] = [];

  try {
    const queryParams = new URLSearchParams();
    queryParams.set("filter[student_id]", studentId);
    queryParams.set("per_page", "200");

    const response = await tryApiAttempts([
      () => api.get(`/students/${studentId}/deliberations`),
      () => api.get(`/students/${studentId}/deliberation-history`),
      () => api.get(`/deliberation-results?${queryParams.toString()}`),
    ]);

    const paginated = toPaginated<DeliberationResult>(response);
    results = paginated.data;
  } catch {
    const response = await api.get("/deliberation-results");
    results = unwrapData<DeliberationResult[]>(response).filter(
      (result) => result.student_id === studentId
    );
  }

  const sessionIds = Array.from(new Set(results.map((result) => result.deliberation_session_id)));
  const sessions = await Promise.all(
    sessionIds.map(async (id) => {
      try {
        return await getDeliberationSession(id);
      } catch {
        return null;
      }
    })
  );

  const sessionMap = new Map(
    sessions.filter((session): session is DeliberationSession => session !== null).map((session) => [
      session.id,
      session,
    ])
  );

  const data: StudentDeliberationHistoryItem[] = results
    .map((result) => {
      const session = result.deliberation_session ?? sessionMap.get(result.deliberation_session_id);
      return {
        id: result.id,
        deliberation_session_id: result.deliberation_session_id,
        session_name: session?.session_name ?? "Session de délibération",
        session_date: session?.session_date ?? result.updated_at,
        semester: session?.semester ?? 0,
        academic_program_name: session?.academic_program?.name,
        academic_year_name: session?.academic_year?.name,
        decision: result.decision,
        jury_remarks: result.jury_remarks,
        is_with_honors: result.is_with_honors,
        honor_level: result.honor_level,
        semester_average: result.semester_result?.semester_average ?? null,
        total_credits_earned: result.semester_result?.total_credits_earned ?? null,
        total_credits_enrolled: result.semester_result?.total_credits_enrolled ?? null,
      };
    })
    .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

  return {
    data,
    total: data.length,
  };
}
