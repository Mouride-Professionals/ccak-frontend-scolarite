/**
 * API functions for Grades Management
 */

import type {
  Grade,
  GradeFilters,
  CreateGradeInput,
  UpdateGradeInput,
  GradesPaginatedResponse,
  Student,
  Course,
  EvaluationTypeOption,
  StudentGradeStats,
  CourseGradeStats,
} from "@/types/grade";

// Import mock data from your existing file
import { mockGrades, mockStudents, mockCourses, mockEvaluationTypes } from "@/lib/api/grade-data";

// Base API URL - adjust based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Simulate API delay for development
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if we're in development mode (using mock data)
 */
const isDevelopment = process.env.NODE_ENV === "development";

// Make a mutable copy of mock data for development
let gradesData = [...mockGrades];

// =====================
// GRADES CRUD
// =====================

/**
 * Get all grades with optional filters
 */
export async function getGrades(filters?: GradeFilters): Promise<GradesPaginatedResponse> {
  if (isDevelopment) {
    await delay(500);

    let filteredGrades = [...gradesData];

    // Apply filters
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredGrades = filteredGrades.filter(
        (grade) =>
          grade.student?.full_name.toLowerCase().includes(search) ||
          grade.student?.student_number.toLowerCase().includes(search) ||
          grade.course?.name.toLowerCase().includes(search) ||
          grade.course?.code.toLowerCase().includes(search)
      );
    }

    if (filters?.student_id) {
      filteredGrades = filteredGrades.filter((grade) => grade.student_id === filters.student_id);
    }

    if (filters?.course_id) {
      filteredGrades = filteredGrades.filter((grade) => grade.course_id === filters.course_id);
    }

    if (filters?.status) {
      filteredGrades = filteredGrades.filter((grade) => grade.status === filters.status);
    }

    if (filters?.type) {
      filteredGrades = filteredGrades.filter((grade) => grade.type === filters.type);
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedGrades = filteredGrades.slice(startIndex, endIndex);

    return {
      data: paginatedGrades,
      total: filteredGrades.length,
      page,
      limit,
      total_pages: Math.ceil(filteredGrades.length / limit),
    };
  }

  // Production API call
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.search) params.append("search", filters.search);
  if (filters?.student_id) params.append("student_id", filters.student_id);
  if (filters?.course_id) params.append("course_id", filters.course_id);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.type) params.append("type", filters.type);

  const response = await fetch(`${API_BASE_URL}/grades?${params}`);
  if (!response.ok) throw new Error("Failed to fetch grades");
  return response.json();
}

/**
 * Get a single grade by ID
 */
export async function getGrade(id: string): Promise<Grade> {
  if (isDevelopment) {
    await delay(300);
    const grade = gradesData.find((g) => g.id === id);
    if (!grade) throw new Error("Grade not found");
    return grade;
  }

  const response = await fetch(`${API_BASE_URL}/grades/${id}`);
  if (!response.ok) throw new Error("Failed to fetch grade");
  return response.json();
}

/**
 * Create a new grade
 */
export async function createGrade(input: CreateGradeInput): Promise<Grade> {
  if (isDevelopment) {
    await delay(500);

    const student = mockStudents.find((s) => s.id === input.student_id);
    const course = mockCourses.find((c) => c.id === input.course_id);

    const newGrade: Grade = {
      id: `grade-${Date.now()}`,
      student_id: input.student_id,
      course_id: input.course_id,
      type: input.type,
      score: input.score,
      max_score: input.max_score,
      weight: input.weight,
      entered_by: "current-user",
      status: input.status || "draft",
      entered_at: new Date().toISOString(),
      validated_at: null,
      comments: input.comments || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      student: student
        ? {
            id: student.id,
            student_number: student.student_number,
            full_name: student.full_name,
          }
        : undefined,
      course: course
        ? {
            id: course.id,
            code: course.code,
            name: course.name,
          }
        : undefined,
      entered_by_user: {
        id: "current-user",
        full_name: "Utilisateur Actuel",
      },
    };

    gradesData.unshift(newGrade);
    return newGrade;
  }

  const response = await fetch(`${API_BASE_URL}/grades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Failed to create grade");
  return response.json();
}

/**
 * Update an existing grade
 */
export async function updateGrade(id: string, input: UpdateGradeInput): Promise<Grade> {
  if (isDevelopment) {
    await delay(500);

    const index = gradesData.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Grade not found");

    const updatedGrade = {
      ...gradesData[index],
      ...input,
      updated_at: new Date().toISOString(),
    };

    gradesData[index] = updatedGrade;
    return updatedGrade;
  }

  const response = await fetch(`${API_BASE_URL}/grades/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Failed to update grade");
  return response.json();
}

/**
 * Delete a grade
 */
export async function deleteGrade(id: string): Promise<void> {
  if (isDevelopment) {
    await delay(500);
    const index = gradesData.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Grade not found");
    gradesData.splice(index, 1);
    return;
  }

  const response = await fetch(`${API_BASE_URL}/grades/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete grade");
}

/**
 * Update grade status
 */
export async function updateGradeStatus(id: string, status: string): Promise<Grade> {
  if (isDevelopment) {
    await delay(300);
    const index = gradesData.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Grade not found");

    const updatedGrade = {
      ...gradesData[index],
      status,
      validated_at: status === "validated" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    gradesData[index] = updatedGrade;
    return updatedGrade;
  }

  const response = await fetch(`${API_BASE_URL}/grades/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update grade status");
  return response.json();
}

/**
 * Validate multiple grades at once
 */
export async function validateGrades(ids: string[]): Promise<void> {
  if (isDevelopment) {
    await delay(500);
    ids.forEach((id) => {
      const index = gradesData.findIndex((g) => g.id === id);
      if (index !== -1) {
        gradesData[index] = {
          ...gradesData[index],
          status: "validated",
          validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    });
    return;
  }

  const response = await fetch(`${API_BASE_URL}/grades/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error("Failed to validate grades");
}

// =====================
// HELPER DATA
// =====================

/**
 * Get all students
 */
export async function getStudents(): Promise<Student[]> {
  if (isDevelopment) {
    await delay(300);
    return mockStudents;
  }

  const response = await fetch(`${API_BASE_URL}/students`);
  if (!response.ok) throw new Error("Failed to fetch students");
  return response.json();
}

/**
 * Get all courses
 */
export async function getCourses(): Promise<Course[]> {
  if (isDevelopment) {
    await delay(300);
    return mockCourses;
  }

  const response = await fetch(`${API_BASE_URL}/courses`);
  if (!response.ok) throw new Error("Failed to fetch courses");
  return response.json();
}

/**
 * Get all evaluation types
 */
export async function getEvaluationTypes(): Promise<EvaluationTypeOption[]> {
  if (isDevelopment) {
    await delay(300);
    return mockEvaluationTypes;
  }

  const response = await fetch(`${API_BASE_URL}/evaluation-types`);
  if (!response.ok) throw new Error("Failed to fetch evaluation types");
  return response.json();
}

// =====================
// STATISTICS
// =====================

/**
 * Get grade statistics for a student
 */
export async function getStudentGradeStats(studentId: string): Promise<StudentGradeStats> {
  if (isDevelopment) {
    await delay(400);
    const studentGrades = gradesData.filter((g) => g.student_id === studentId);

    const totalGrades = studentGrades.length;
    const averageScore =
      studentGrades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / totalGrades;

    const gradesByCourse = Object.values(
      studentGrades.reduce(
        (acc, grade) => {
          const courseId = grade.course_id;
          if (!acc[courseId]) {
            acc[courseId] = {
              course_id: courseId,
              course_name: grade.course?.name || "",
              grades: [],
            };
          }
          acc[courseId].grades.push(grade);
          return acc;
        },
        {} as Record<string, any>
      )
    ).map((item) => ({
      course_id: item.course_id,
      course_name: item.course_name,
      average:
        item.grades.reduce((sum: number, g: Grade) => sum + (g.score / g.max_score) * 20, 0) /
        item.grades.length,
      count: item.grades.length,
    }));

    return {
      student_id: studentId,
      total_grades: totalGrades,
      average_score: averageScore,
      validated_count: studentGrades.filter((g) => g.status === "validated").length,
      pending_count: studentGrades.filter((g) => g.status === "pending").length,
      draft_count: studentGrades.filter((g) => g.status === "draft").length,
      grades_by_course: gradesByCourse,
    };
  }

  const response = await fetch(`${API_BASE_URL}/students/${studentId}/grade-stats`);
  if (!response.ok) throw new Error("Failed to fetch student grade stats");
  return response.json();
}

/**
 * Get grade statistics for a course
 */
export async function getCourseGradeStats(courseId: string): Promise<CourseGradeStats> {
  if (isDevelopment) {
    await delay(400);
    const courseGrades = gradesData.filter((g) => g.course_id === courseId);

    const scores = courseGrades.map((g) => (g.score / g.max_score) * 20);
    const totalGrades = courseGrades.length;
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalGrades;
    const sortedScores = [...scores].sort((a, b) => a - b);

    return {
      course_id: courseId,
      total_grades: totalGrades,
      average_score: averageScore,
      highest_score: Math.max(...scores),
      lowest_score: Math.min(...scores),
      median_score: sortedScores[Math.floor(sortedScores.length / 2)] || 0,
      validated_count: courseGrades.filter((g) => g.status === "validated").length,
      pending_count: courseGrades.filter((g) => g.status === "pending").length,
      grades_distribution: [
        {
          range: "0-10",
          count: scores.filter((s) => s < 10).length,
          percentage: (scores.filter((s) => s < 10).length / totalGrades) * 100,
        },
        {
          range: "10-12",
          count: scores.filter((s) => s >= 10 && s < 12).length,
          percentage: (scores.filter((s) => s >= 10 && s < 12).length / totalGrades) * 100,
        },
        {
          range: "12-14",
          count: scores.filter((s) => s >= 12 && s < 14).length,
          percentage: (scores.filter((s) => s >= 12 && s < 14).length / totalGrades) * 100,
        },
        {
          range: "14-16",
          count: scores.filter((s) => s >= 14 && s < 16).length,
          percentage: (scores.filter((s) => s >= 14 && s < 16).length / totalGrades) * 100,
        },
        {
          range: "16-20",
          count: scores.filter((s) => s >= 16).length,
          percentage: (scores.filter((s) => s >= 16).length / totalGrades) * 100,
        },
      ],
    };
  }

  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/grade-stats`);
  if (!response.ok) throw new Error("Failed to fetch course grade stats");
  return response.json();
}
