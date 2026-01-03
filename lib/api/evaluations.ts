import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  Evaluation,
  EvaluationFilters,
  EvaluationsResponse,
  EvaluationResult,
  EvaluationResponse,
  EvaluationResponseInput,
} from "@/types/evaluation";

export async function getEvaluations(filters?: EvaluationFilters): Promise<EvaluationsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.search) params.append("filter[search]", filters.search);
  if (filters?.course_id) params.append("filter[course_id]", filters.course_id);
  if (filters?.faculty_member_id)
    params.append("filter[faculty_member_id]", filters.faculty_member_id);

  const response = await api.get(`/evaluations${params.toString() ? `?${params}` : ""}`);
  return toPaginated<Evaluation>(response);
}

export async function getEvaluation(id: string): Promise<Evaluation> {
  const response = await api.get(`/evaluations/${id}`);
  return unwrapData<Evaluation>(response);
}

export async function createEvaluation(
  input: Omit<Evaluation, "id" | "created_at" | "updated_at">
): Promise<Evaluation> {
  const response = await api.post("/evaluations", input as unknown as Record<string, unknown>);
  return unwrapData<Evaluation>(response);
}

export async function updateEvaluation(
  id: string,
  input: Partial<Evaluation>
): Promise<Evaluation> {
  const response = await api.put(`/evaluations/${id}`, input as unknown as Record<string, unknown>);
  return unwrapData<Evaluation>(response);
}

export async function deleteEvaluation(id: string): Promise<void> {
  await api.del(`/evaluations/${id}`);
}

export async function shareEvaluation(id: string): Promise<Evaluation> {
  const response = await api.post(`/evaluations/${id}/share`);
  return unwrapData<Evaluation>(response);
}

export async function createEvaluationResponse(
  input: EvaluationResponseInput
): Promise<EvaluationResponse> {
  const response = await api.post(
    "/evaluation-responses",
    input as unknown as Record<string, unknown>
  );
  return unwrapData<EvaluationResponse>(response);
}

export async function getEvaluationResults(id: string): Promise<EvaluationResult> {
  const response = await api.get(`/evaluations/${id}/results`);
  return unwrapData<EvaluationResult>(response);
}

export async function getStudentEvaluations(studentId: string) {
  const response = await api.get(`/students/${studentId}/evaluations`);
  return unwrapData<Evaluation[]>(response);
}
