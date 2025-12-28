/**
 * Deliberation Sessions API Service
 * Handles all API calls related to deliberation sessions
 */

import { api } from "@/lib/api-client";
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
import {
  mockDeliberationSessions,
  mockAcademicPrograms,
  mockAcademicYears,
  mockFacultyMembers,
  mockStudents,
  mockSemesterResults,
} from "./mock-data";
import { DeliberationDecision, DeliberationStatus, HonorLevel } from "@/types/deliberation";

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true;

/**
 * Simulate API delay for realistic testing
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate deliberation decision and honor based on average
 */
function calculateDeliberationDecision(average: number): {
  decision: DeliberationDecision;
  isWithHonors: boolean;
  honorLevel: HonorLevel | null;
} {
  let decision: DeliberationDecision;
  let isWithHonors = false;
  let honorLevel: HonorLevel | null = null;

  if (average >= 10) {
    decision = DeliberationDecision.ADMITTED;
    isWithHonors = true;

    if (average >= 16) {
      honorLevel = HonorLevel.TRES_BIEN;
    } else if (average >= 14) {
      honorLevel = HonorLevel.BIEN;
    } else if (average >= 12) {
      honorLevel = HonorLevel.ASSEZ_BIEN;
    } else {
      honorLevel = HonorLevel.PASSABLE;
    }
  } else if (average >= 8) {
    decision = DeliberationDecision.RESIT;
  } else {
    decision = DeliberationDecision.FAILED;
  }

  return { decision, isWithHonors, honorLevel };
}

/**
 * Generate mock jury remarks based on decision
 */
function generateJuryRemarks(average: number, decision: DeliberationDecision): string | null {
  const remarks = [
    average >= 16 ? "Excellent travail, résultats remarquables." : null,
    average >= 14 && average < 16 ? "Très bon niveau, continuez ainsi." : null,
    average >= 12 && average < 14 ? "Bon travail dans l'ensemble." : null,
    average >= 10 && average < 12 ? "Résultats satisfaisants." : null,
    decision === DeliberationDecision.RESIT ? "Doit repasser les examens non validés." : null,
    decision === DeliberationDecision.FAILED ? "Travail insuffisant, redoublement recommandé." : null,
  ].filter(Boolean);

  // Randomly return a remark or null (60% chance of having a remark)
  return Math.random() > 0.4 && remarks.length > 0 ? remarks[0] as string : null;
}

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
        passed_students: 0,
        failed_students: 0,
        pending_students: 0,
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
  return api.get("/academic-programs");
}

/**
 * Get all academic years (for form selects)
 */
export async function getAcademicYears() {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockAcademicYears;
  }
  return api.get("/academic-years");
}

/**
 * Get all faculty members (for form selects)
 */
export async function getFacultyMembers() {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockFacultyMembers;
  }
  return api.get("/faculty-members");
}

// =====================
// DELIBERATION RESULTS
// =====================

/**
 * Get deliberation results for a session
 */
export async function getDeliberationResults(
  sessionId: string,
  filters?: DeliberationResultFilters
): Promise<DeliberationResultsResponse> {
  if (USE_MOCK_DATA) {
    await delay(500);

    // Get session to determine which semester and academic year
    const session = mockDeliberationSessions.find((s) => s.id === sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Get semester results for this session's semester and academic year
    const semesterResults = mockSemesterResults.filter(
      (sr) =>
        sr.academic_year_id === session.academic_year_id && sr.semester === session.semester
    );

    // Check if session is completed (has results)
    const isCompleted = session.status === DeliberationStatus.COMPLETED || session.status === DeliberationStatus.CLOSED;

    // Map semester results to deliberation results with student info
    const mockResults: DeliberationResult[] = semesterResults.map((sr) => {
      const student = mockStudents.find((s) => s.id === sr.student_id);

      // Calculate decision and honors for completed sessions
      let decision: DeliberationDecision | null = null;
      let isWithHonors = false;
      let honorLevel: HonorLevel | null = null;
      let juryRemarks: string | null = null;

      if (isCompleted) {
        const calculated = calculateDeliberationDecision(sr.semester_average);
        decision = calculated.decision;
        isWithHonors = calculated.isWithHonors;
        honorLevel = calculated.honorLevel;
        juryRemarks = generateJuryRemarks(sr.semester_average, decision);
      }

      return {
        id: `dr-${sr.id}`,
        deliberation_session_id: sessionId,
        student_id: sr.student_id,
        decision,
        jury_remarks: juryRemarks,
        is_with_honors: isWithHonors,
        honor_level: honorLevel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Include student info for display
        student: student ? {
          id: student.id,
          student_number: student.student_number,
          full_name: student.full_name,
          photo_url: student.photo_url,
        } : undefined,
        // Include semester average for reference
        semester_result: {
          semester_average: sr.semester_average,
          semester_gpa: sr.semester_gpa,
          total_credits_earned: sr.total_credits_earned,
          total_credits_enrolled: sr.total_credits_enrolled,
        },
      };
    });

    return {
      data: mockResults,
      total: mockResults.length,
      page: filters?.page || 1,
      limit: filters?.limit || 50,
      total_pages: Math.ceil(mockResults.length / (filters?.limit || 50)),
    };
  }

  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  const queryString = queryParams.toString();
  return api.get(`/deliberations/${sessionId}/results${queryString ? `?${queryString}` : ""}`);
}

/**
 * Create a deliberation result
 */
export async function createDeliberationResult(
  input: CreateDeliberationResultInput
): Promise<DeliberationResult> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const newResult: DeliberationResult = {
      id: crypto.randomUUID(),
      ...input,
      jury_remarks: input.jury_remarks ?? null,
      honor_level: input.honor_level ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newResult;
  }

  return api.post<DeliberationResult>("/deliberation-results", input as unknown as Record<string, unknown>);
}

/**
 * Update a deliberation result
 */
export async function updateDeliberationResult(
  id: string,
  input: UpdateDeliberationResultInput
): Promise<DeliberationResult> {
  if (USE_MOCK_DATA) {
    await delay(500);

    // Mock update
    const updated: DeliberationResult = {
      id,
      deliberation_session_id: input.deliberation_session_id || "",
      student_id: input.student_id || "",
      decision: input.decision!,
      jury_remarks: input.jury_remarks || null,
      is_with_honors: input.is_with_honors || false,
      honor_level: input.honor_level || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return updated;
  }

  return api.put<DeliberationResult>(`/deliberation-results/${id}`, input);
}

/**
 * Delete a deliberation result
 */
export async function deleteDeliberationResult(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(500);
    return;
  }

  return api.del<void>(`/deliberation-results/${id}`);
}

/**
 * Batch update deliberation results
 */
export async function batchUpdateDeliberationResults(
  results: Array<{ id: string } & UpdateDeliberationResultInput>
): Promise<DeliberationResult[]> {
  if (USE_MOCK_DATA) {
    await delay(1000);

    return results.map((r) => ({
      id: r.id,
      deliberation_session_id: r.deliberation_session_id || "",
      student_id: r.student_id || "",
      decision: r.decision!,
      jury_remarks: r.jury_remarks || null,
      is_with_honors: r.is_with_honors || false,
      honor_level: r.honor_level || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  return api.post<DeliberationResult[]>("/deliberation-results/batch", { results });
}
