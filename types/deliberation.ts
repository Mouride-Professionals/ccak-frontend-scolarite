/**
 * Deliberation Module Types
 * Based on UML diagram for CCAK academic management system
 */

// =====================
// ENUMS
// =====================

export enum DeliberationStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CLOSED = "CLOSED",
}

export enum DeliberationDecision {
  ADMITTED = "ADMITTED",
  ADMITTED_COMPENSATION = "ADMITTED_COMPENSATION",
  RESIT = "RESIT",
  FAILED = "FAILED",
  EXCLUDED = "EXCLUDED",
}

export enum HonorLevel {
  PASSABLE = "PASSABLE",
  ASSEZ_BIEN = "ASSEZ_BIEN",
  BIEN = "BIEN",
  TRES_BIEN = "TRES_BIEN",
}

// =====================
// INTERFACES
// =====================

/**
 * Deliberation Session
 * Represents a jury deliberation session for a specific program, year, and semester
 */
export interface DeliberationSession {
  id: string;
  academic_program_id: string;
  academic_year_id: string;
  semester: number;
  session_name: string;
  session_date: string; // ISO date string
  status: DeliberationStatus;
  presided_by: string; // Faculty member UUID
  jury_members: string[]; // Array of faculty member UUIDs
  created_at: string;
  updated_at: string;

  // Populated relations (optional, for joined queries)
  academic_program?: {
    id: string;
    name: string;
    level: string;
  };
  academic_year?: {
    id: string;
    name: string;
    is_current?: boolean;
  };
  president?: {
    id: string;
    full_name: string;
    rank: string;
  };
  jury?: Array<{
    id: string;
    full_name: string;
    rank: string;
  }>;
  stats?: {
    total_students: number;
    results_count: number;
    passed_students?: number;
    failed_students?: number;
    pending_students?: number;
  };
}

/**
 * Deliberation Result
 * Individual student result from a deliberation session
 */
export interface DeliberationResult {
  id: string;
  deliberation_session_id: string;
  student_id: string;
  decision: DeliberationDecision | null;
  jury_remarks: string | null;
  is_with_honors: boolean;
  honor_level: HonorLevel | null;
  created_at: string;
  updated_at: string;

  // Populated relations (optional)
  student?: {
    id: string;
    student_number: string;
    full_name: string;
    photo_url: string | null;
  };
  deliberation_session?: DeliberationSession;
  semester_result?: {
    semester_average: number;
    semester_gpa: number;
    total_credits_earned: number;
    total_credits_enrolled: number;
  };
}

// =====================
// FORM TYPES
// =====================

export interface CreateDeliberationSessionInput {
  academic_program_id: string;
  academic_year_id: string;
  semester: number;
  session_name: string;
  session_date: string;
  presided_by: string;
  jury_members: string[];
}

export interface UpdateDeliberationSessionInput extends Partial<CreateDeliberationSessionInput> {
  status?: DeliberationStatus;
}

export interface CreateDeliberationResultInput {
  deliberation_session_id: string;
  student_id: string;
  decision: DeliberationDecision;
  jury_remarks?: string;
  is_with_honors: boolean;
  honor_level?: HonorLevel;
}

export interface UpdateDeliberationResultInput extends Partial<CreateDeliberationResultInput> {}

// =====================
// FILTERS & QUERIES
// =====================

export interface DeliberationSessionFilters {
  academic_program_id?: string;
  academic_year_id?: string;
  semester?: number;
  status?: DeliberationStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DeliberationResultFilters {
  deliberation_session_id?: string;
  student_id?: string;
  decision?: DeliberationDecision;
  is_with_honors?: boolean;
  page?: number;
  limit?: number;
}
export interface SemesterResult {
  id: string;
  student_id: string;
  academic_program_id: string;
  academic_year_id: string;
  semester: number;
  semester_average: number;
  semester_gpa: number;
  total_credits_earned: number;
  total_credits_enrolled: number;
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

// =====================
// API RESPONSES
// =====================

export interface DeliberationSessionsResponse {
  data: DeliberationSession[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface DeliberationResultsResponse {
  data: DeliberationResult[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
