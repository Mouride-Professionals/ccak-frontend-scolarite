import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import type {
  Assessment,
  AssessmentFilters,
  AssessmentGradeSheet,
  CreateAssessmentInput,
  UpdateAssessmentInput,
} from "@/types/assessment";

export async function getAssessments(filters?: AssessmentFilters): Promise<Assessment[]> {
  const params = new URLSearchParams();
  if (filters?.academic_year_id) params.append("academic_year_id", filters.academic_year_id);
  if (filters?.faculty_member_id) params.append("faculty_member_id", filters.faculty_member_id);
  if (filters?.course_id) params.append("course_id", filters.course_id);

  const response = await api.get(`/assessments${params.toString() ? `?${params}` : ""}`);
  return unwrapData<Assessment[]>(response);
}

export async function getAssessment(id: string): Promise<Assessment> {
  const response = await api.get(`/assessments/${id}`);
  return unwrapData<Assessment>(response);
}

export async function getAssessmentsByCourse(courseId: string): Promise<Assessment[]> {
  const response = await api.get(`/courses/${courseId}/assessments`);
  return unwrapData<Assessment[]>(response);
}

export async function createAssessment(input: CreateAssessmentInput): Promise<Assessment> {
  const response = await api.post("/assessments", input as unknown as Record<string, unknown>);
  return unwrapData<Assessment>(response);
}

export async function updateAssessment(
  id: string,
  input: UpdateAssessmentInput
): Promise<Assessment> {
  const response = await api.put(
    `/assessments/${id}`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<Assessment>(response);
}

export async function deleteAssessment(id: string): Promise<void> {
  await api.del(`/assessments/${id}`);
}

export async function publishAssessmentGrades(id: string): Promise<Assessment> {
  const response = await api.post(`/assessments/${id}/publish-grades`, {});
  return unwrapData<Assessment>(response);
}

export async function getAssessmentGradeSheet(id: string): Promise<AssessmentGradeSheet> {
  const response = await api.get(`/assessments/${id}/grade-sheet`);
  return unwrapData<AssessmentGradeSheet>(response);
}
