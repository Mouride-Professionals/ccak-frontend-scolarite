import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import type { ExamGradeSheet } from "@/types/fiche-de-note";
import type { Grade } from "@/types/grade";

export async function getExamGradeSheet(examScheduleId: string): Promise<ExamGradeSheet> {
  const response = await api.get(`/exam-schedules/${examScheduleId}/grade-sheet`);
  return unwrapData<ExamGradeSheet>(response);
}

export async function createExamGrade(
  examScheduleId: string,
  payload: {
    course_enrollment_id: string;
    score: number;
    max_score?: number;
    weight?: number;
  }
): Promise<Grade> {
  const response = await api.post(
    `/exam-schedules/${examScheduleId}/grade-sheet`,
    payload as unknown as Record<string, unknown>
  );
  return unwrapData<Grade>(response);
}

export async function updateExamGrade(
  examScheduleId: string,
  payload: {
    course_enrollment_id: string;
    score: number;
    max_score?: number;
    weight?: number;
  }
): Promise<Grade> {
  const response = await api.post(
    `/exam-schedules/${examScheduleId}/grade-sheet`,
    payload as unknown as Record<string, unknown>
  );
  return unwrapData<Grade>(response);
}
