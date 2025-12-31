/**
 * Types for Grade Management
 */

// =====================
// ENUMS
// =====================

export enum GradeStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  VALIDATED = "VALIDATED",
  PUBLISHED = "PUBLISHED",
}

export enum EvaluationType {
  CC = "CC",
  EXAM = "EXAM",
  TP = "TP",
  ORAL = "ORAL",
}

// =====================
// BASE INTERFACES
// =====================

export interface Grade {
  id: string;
  student_id: string;
  course_id: string;
  type: string;
  score: number;
  max_score: number;
  weight: number;
  entered_by:
    | string
    | {
        id: string;
        email: string;
        full_name?: string | null;
        is_active?: boolean;
        email_verified_at?: string | null;
        last_login_at?: string | null;
        created_at?: string;
        updated_at?: string;
        keycloak_id?: string | null;
        notification_preferences?: Record<string, unknown> | null;
        email_frequency?: string | null;
        enable_digest?: boolean;
      };
  status: string;
  entered_at: string;
  validated_at: string | null;
  validated_by?: string | null;
  comments?: string | null;
  created_at: string;
  updated_at: string;

  // Populated fields
  student?: {
    id: string;
    student_number: string;
    full_name: string;
  };
  course?: {
    id: string;
    code: string;
    name: string;
  };
  entered_by_user?: {
    id: string;
    full_name: string;
  };
}

export interface Student {
  id: string;
  student_number: string;
  full_name: string;
  email: string;
  phone?: string;
  program_id: string;
  current_semester: number;
  enrollment_date: string;
  is_active: boolean;

  program?: {
    id: string;
    name: string;
    level: string;
  };
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  program_id: string;
  is_active: boolean;

  program?: {
    id: string;
    name: string;
  };
}

export interface EvaluationTypeOption {
  id: string;
  name: string;
  code: string;
  description?: string;
  default_weight?: number;
}

// =====================
// INPUT/OUTPUT TYPES
// =====================

export interface CreateGradeInput {
  student_id: string;
  course_id: string;
  type: string;
  score: number;
  max_score: number;
  weight: number;
  status?: string;
  comments?: string;
}

export interface UpdateGradeInput {
  student_id?: string;
  course_id?: string;
  type?: string;
  score?: number;
  max_score?: number;
  weight?: number;
  status?: string;
  comments?: string;
}

export interface GradeFilters {
  page?: number;
  limit?: number;
  search?: string;
  student_id?: string;
  course_id?: string;
  type?: string;
  status?: string;
  semester?: number;
  academic_year_id?: string;
  entered_by?: string;
  date_from?: string;
  date_to?: string;
}

export interface GradesPaginatedResponse {
  data: Grade[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// =====================
// STATISTICS
// =====================

export interface StudentGradeStats {
  student_id: string;
  total_grades: number;
  average_score: number;
  validated_count: number;
  pending_count: number;
  draft_count: number;
  grades_by_course: {
    course_id: string;
    course_name: string;
    average: number;
    count: number;
  }[];
}

export interface CourseGradeStats {
  course_id: string;
  total_grades: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  median_score: number;
  validated_count: number;
  pending_count: number;
  grades_distribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

// =====================
// FORM TYPES
// =====================

export interface GradeFormData {
  student_id: string;
  course_id: string;
  type: string;
  score: number;
  max_score: number;
  weight: number;
  status: string;
  comments?: string;
}

export interface GradeValidationErrors {
  student_id?: string;
  course_id?: string;
  type?: string;
  score?: string;
  max_score?: string;
  weight?: string;
  status?: string;
}
