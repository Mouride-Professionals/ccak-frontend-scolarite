/**
 * API functions for Grades Management
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  Grade,
  GradeFilters,
  CreateGradeInput,
  UpdateGradeInput,
  GradesPaginatedResponse,
  Student,
  Course,
  EvaluationTypeOption,
} from "@/types/grade";
import { GradeStatus, EvaluationType } from "@/types/grade";

const evaluationTypes: EvaluationTypeOption[] = [
  { id: "cc", name: "Contrôle Continu", code: EvaluationType.CC, default_weight: 0.3 },
  { id: "tp", name: "Travaux Pratiques", code: EvaluationType.TP, default_weight: 0.2 },
  { id: "oral", name: "Oral", code: EvaluationType.ORAL, default_weight: 0.2 },
  { id: "exam", name: "Examen", code: EvaluationType.EXAM, default_weight: 0.5 },
];

export async function getGrades(filters?: GradeFilters): Promise<GradesPaginatedResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.search) params.append("search", filters.search);
  if (filters?.student_id) params.append("student_id", filters.student_id);
  if (filters?.course_id) params.append("course_id", filters.course_id);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.type) params.append("type", filters.type);
  if (filters?.semester) params.append("semester", filters.semester.toString());
  if (filters?.academic_year_id) params.append("academic_year_id", filters.academic_year_id);
  if (filters?.entered_by) params.append("entered_by", filters.entered_by);
  if (filters?.date_from) params.append("date_from", filters.date_from);
  if (filters?.date_to) params.append("date_to", filters.date_to);

  const response = await api.get(`/grades?${params.toString()}`);
  return toPaginated<Grade>(response);
}

export async function getGrade(id: string): Promise<Grade> {
  const response = await api.get(`/grades/${id}`);
  return unwrapData<Grade>(response);
}

export async function createGrade(input: CreateGradeInput): Promise<Grade> {
  const response = await api.post("/grades", input as unknown as Record<string, unknown>);
  return unwrapData<Grade>(response);
}

export async function updateGrade(id: string, input: UpdateGradeInput): Promise<Grade> {
  const response = await api.put(`/grades/${id}`, input as unknown as Record<string, unknown>);
  return unwrapData<Grade>(response);
}

export async function deleteGrade(id: string): Promise<void> {
  await api.del(`/grades/${id}`);
}

export async function updateGradeStatus(id: string, status: string): Promise<Grade> {
  if (status === GradeStatus.SUBMITTED) {
    const response = await api.post(`/grades/${id}/submit`);
    return unwrapData<Grade>(response);
  }

  if (status === GradeStatus.VALIDATED) {
    const response = await api.post(`/grades/${id}/validate`);
    return unwrapData<Grade>(response);
  }

  if (status === GradeStatus.PUBLISHED) {
    await api.post("/grades/publish");
    return getGrade(id);
  }

  return updateGrade(id, { status });
}

export async function getStudents(): Promise<Student[]> {
  const response = await api.get("/students");
  return toPaginated<Student>(response).data;
}

export async function getCourses(): Promise<Course[]> {
  const response = await api.get("/courses");
  return unwrapData<Course[]>(response);
}

export async function getEvaluationTypes(): Promise<EvaluationTypeOption[]> {
  return evaluationTypes;
}

export async function validateGrades(ids: string[]): Promise<Grade[]> {
  const results = await Promise.all(ids.map((id) => updateGradeStatus(id, GradeStatus.VALIDATED)));
  return results;
}

export async function getStudentGradeStats(studentId: string) {
  const response = await api.get(`/students/${studentId}/grades`);
  const grades = unwrapData<Grade[]>(response);

  const totalGrades = grades.length;
  const averageScore =
    totalGrades === 0 ? 0 : grades.reduce((sum, grade) => sum + grade.score, 0) / totalGrades;
  const validatedCount = grades.filter((grade) => grade.status === GradeStatus.VALIDATED).length;
  const pendingCount = grades.filter((grade) => grade.status === GradeStatus.SUBMITTED).length;
  const draftCount = grades.filter((grade) => grade.status === GradeStatus.DRAFT).length;

  const gradesByCourse = Object.values(
    grades.reduce(
      (acc, grade) => {
        const key = grade.course_id;
        if (!acc[key]) {
          acc[key] = {
            course_id: grade.course_id,
            course_name: grade.course?.name || "Cours",
            average: 0,
            count: 0,
          };
        }
        acc[key].count += 1;
        acc[key].average += grade.score;
        return acc;
      },
      {} as Record<
        string,
        { course_id: string; course_name: string; average: number; count: number }
      >
    )
  ).map((entry) => ({
    ...entry,
    average: entry.count ? entry.average / entry.count : 0,
  }));

  return {
    student_id: studentId,
    total_grades: totalGrades,
    average_score: averageScore,
    validated_count: validatedCount,
    pending_count: pendingCount,
    draft_count: draftCount,
    grades_by_course: gradesByCourse,
  };
}

export async function getCourseGradeStats(courseId: string) {
  const response = await api.get(`/courses/${courseId}/grades`);
  const grades = unwrapData<Grade[]>(response);

  const totalGrades = grades.length;
  const scores = grades.map((grade) => grade.score).sort((a, b) => a - b);
  const averageScore =
    totalGrades === 0 ? 0 : scores.reduce((sum, score) => sum + score, 0) / totalGrades;
  const highestScore = totalGrades === 0 ? 0 : scores[scores.length - 1];
  const lowestScore = totalGrades === 0 ? 0 : scores[0];
  const medianScore =
    totalGrades === 0
      ? 0
      : totalGrades % 2 === 0
        ? (scores[totalGrades / 2 - 1] + scores[totalGrades / 2]) / 2
        : scores[Math.floor(totalGrades / 2)];

  const validatedCount = grades.filter((grade) => grade.status === GradeStatus.VALIDATED).length;
  const pendingCount = grades.filter((grade) => grade.status === GradeStatus.SUBMITTED).length;

  const gradesDistribution = [
    { range: "0-5", count: 0 },
    { range: "5-10", count: 0 },
    { range: "10-15", count: 0 },
    { range: "15-20", count: 0 },
  ].map((bucket) => ({ ...bucket, percentage: 0 }));

  grades.forEach((grade) => {
    if (grade.score < 5) gradesDistribution[0].count += 1;
    else if (grade.score < 10) gradesDistribution[1].count += 1;
    else if (grade.score < 15) gradesDistribution[2].count += 1;
    else gradesDistribution[3].count += 1;
  });

  gradesDistribution.forEach((bucket) => {
    bucket.percentage = totalGrades === 0 ? 0 : Math.round((bucket.count / totalGrades) * 100);
  });

  return {
    course_id: courseId,
    total_grades: totalGrades,
    average_score: averageScore,
    highest_score: highestScore,
    lowest_score: lowestScore,
    median_score: medianScore,
    validated_count: validatedCount,
    pending_count: pendingCount,
    grades_distribution: gradesDistribution,
  };
}
