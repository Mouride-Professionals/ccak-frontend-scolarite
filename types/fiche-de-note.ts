/**
 * Types for Fiche de Note (Grade Sheet) feature
 */

export interface GradeSheetContext {
  type: "assessment" | "exam_schedule";
  id: string;
}

export interface GradeSheetStudentRow {
  student_id: string;
  course_enrollment_id: string;
  // anonyma mode ON → exam_number; OFF → full_name + student_number
  exam_number?: string | null;
  full_name?: string | null;
  student_number?: string | null;
  grade_id?: string | null;
  score?: number | null;
  max_score: number;
  status?: string | null;
}

export interface ExamScheduleDetail {
  id: string;
  course_id: string;
  course_code: string;
  course_name: string;
  session_id: string;
  session_name: string;
  date: string;
  start_time: string;
  end_time: string;
  room?: string | null;
  semester_number: number;
  use_exam_number: boolean;
}

export interface ExamGradeSheet {
  exam_schedule: ExamScheduleDetail;
  students: GradeSheetStudentRow[];
}

export interface ImportGradesResult {
  imported: number;
  skipped: number;
  errors: string[];
}
