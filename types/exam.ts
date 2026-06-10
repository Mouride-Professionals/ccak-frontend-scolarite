/**
 * Types for Exam Session Management
 */

// =====================
// ENUMS
// =====================

export enum ExamSessionType {
  NORMAL = "NORMAL",
  RATTRAPAGE = "RATTRAPAGE",
}

export enum ExamSessionStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CLOSED = "CLOSED",
}

// =====================
// BASE INTERFACES
// =====================

export interface ExamSession {
  id: string;
  academic_year_id: string;
  academic_year?: {
    id: string;
    name: string;
    is_current: boolean;
  };
  semester_number: number;
  name: string;
  type: ExamSessionType;
  type_label: string;
  start_date: string;
  end_date: string;
  status: ExamSessionStatus;
  status_label: string;
  use_exam_number: boolean;
  schedules_count?: number;
  schedules?: ExamSchedule[];
  created_at: string;
  updated_at: string;
}

export interface ExamSchedule {
  id: string;
  exam_session_id: string;
  course_id: string;
  course?: {
    id: string;
    code: string;
    name: string;
    credits: number;
  };
  room_id: string;
  room?: {
    id: string;
    name: string;
    room_number: string;
    capacity: number;
  };
  date: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
  invigilators?: Array<{
    id: string;
    full_name: string;
    rank?: string;
  }>;
  created_at: string;
  updated_at: string;
}

// =====================
// CONFLICT TYPES
// =====================

export interface ConflictResult {
  has_conflicts: boolean;
  conflicts: Array<{
    type: "room" | "invigilator";
    message: string;
  }>;
}

// =====================
// INPUT TYPES
// =====================

export interface CreateExamSessionInput {
  academic_year_id: string;
  semester_number: number;
  name: string;
  type: ExamSessionType;
  start_date: string;
  end_date: string;
}

export interface UpdateExamSessionInput extends Partial<CreateExamSessionInput> {
  status?: ExamSessionStatus;
}

export interface CreateExamScheduleInput {
  course_id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  invigilator_ids: string[];
  notes?: string;
}

export interface UpdateExamScheduleInput extends Partial<CreateExamScheduleInput> {}

export interface CheckConflictsInput {
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  invigilator_ids?: string[];
  exclude_schedule_id?: string;
}

// =====================
// FILTER / PAGINATION
// =====================

export interface ExamSessionFilters {
  page?: number;
  limit?: number;
  academic_year_id?: string;
  semester_number?: number;
  type?: ExamSessionType;
  status?: ExamSessionStatus;
  name?: string;
}

export interface ExamSessionsPaginatedResponse {
  data: ExamSession[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ExamScheduleFilters {
  page?: number;
  limit?: number;
  exam_session_id?: string;
  academic_year_id?: string;
  course_id?: string;
}

export interface ExamSchedulesPaginatedResponse {
  data: ExamSchedule[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
