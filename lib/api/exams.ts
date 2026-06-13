import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  ExamSession,
  ExamSchedule,
  ExamSessionFilters,
  ExamSessionsPaginatedResponse,
  ExamScheduleFilters,
  ExamSchedulesPaginatedResponse,
  CreateExamSessionInput,
  UpdateExamSessionInput,
  CreateExamScheduleInput,
  UpdateExamScheduleInput,
  CheckConflictsInput,
  ConflictResult,
} from "@/types/exam";

// ---- Exam Sessions ----

export async function getExamSessions(
  filters?: ExamSessionFilters
): Promise<ExamSessionsPaginatedResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.academic_year_id)
    params.append("filter[academic_year_id]", filters.academic_year_id);
  if (filters?.semester_number)
    params.append("filter[semester_number]", filters.semester_number.toString());
  if (filters?.type) params.append("filter[type]", filters.type);
  if (filters?.status) params.append("filter[status]", filters.status);
  if (filters?.name) params.append("filter[name]", filters.name);

  const response = await api.get(`/exam-sessions?${params.toString()}`);
  return toPaginated<ExamSession>(response);
}

export async function getExamSession(id: string): Promise<ExamSession> {
  const response = await api.get(`/exam-sessions/${id}`);
  return unwrapData<ExamSession>(response);
}

export async function createExamSession(input: CreateExamSessionInput): Promise<ExamSession> {
  const response = await api.post("/exam-sessions", input as unknown as Record<string, unknown>);
  return unwrapData<ExamSession>(response);
}

export async function updateExamSession(
  id: string,
  input: UpdateExamSessionInput
): Promise<ExamSession> {
  const response = await api.put(
    `/exam-sessions/${id}`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<ExamSession>(response);
}

export async function deleteExamSession(id: string): Promise<void> {
  await api.del(`/exam-sessions/${id}`);
}

export async function publishExamSession(id: string): Promise<ExamSession> {
  const response = await api.post(`/exam-sessions/${id}/publish`);
  return unwrapData<ExamSession>(response);
}

export async function closeExamSession(id: string): Promise<ExamSession> {
  const response = await api.post(`/exam-sessions/${id}/close`);
  return unwrapData<ExamSession>(response);
}

// ---- Exam Schedules ----

export async function getExamSchedules(sessionId: string): Promise<ExamSchedule[]> {
  const response = await api.get(`/exam-sessions/${sessionId}/schedules`);
  return unwrapData<ExamSchedule[]>(response);
}

export async function createExamSchedule(
  sessionId: string,
  input: CreateExamScheduleInput
): Promise<ExamSchedule> {
  const response = await api.post(
    `/exam-sessions/${sessionId}/schedules`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<ExamSchedule>(response);
}

export async function updateExamSchedule(
  sessionId: string,
  scheduleId: string,
  input: UpdateExamScheduleInput
): Promise<ExamSchedule> {
  const response = await api.put(
    `/exam-sessions/${sessionId}/schedules/${scheduleId}`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<ExamSchedule>(response);
}

export async function deleteExamSchedule(sessionId: string, scheduleId: string): Promise<void> {
  await api.del(`/exam-sessions/${sessionId}/schedules/${scheduleId}`);
}

export async function checkConflicts(input: CheckConflictsInput): Promise<ConflictResult> {
  const response = await api.post(
    "/exam-schedules/check-conflicts",
    input as unknown as Record<string, unknown>
  );
  return unwrapData<ConflictResult>(response);
}

export async function getExamSchedulesList(
  filters?: ExamScheduleFilters
): Promise<ExamSchedulesPaginatedResponse> {
  const params = new URLSearchParams();
  if (filters?.exam_session_id) params.append("exam_session_id", filters.exam_session_id);
  if (filters?.academic_year_id) params.append("academic_year_id", filters.academic_year_id);
  if (filters?.course_id) params.append("course_id", filters.course_id);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));

  const response = await api.get(`/exam-schedules${params.toString() ? `?${params}` : ""}`);
  return toPaginated<ExamSchedule>(response);
}
