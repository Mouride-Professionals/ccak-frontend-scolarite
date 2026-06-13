export enum AssessmentType {
  WRITTEN      = "WRITTEN",
  ORAL         = "ORAL",
  LAB          = "LAB",
  QCM          = "QCM",
  PRESENTATION = "PRESENTATION",
}

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  [AssessmentType.WRITTEN]:      "Écrit",
  [AssessmentType.ORAL]:         "Oral",
  [AssessmentType.LAB]:          "Travaux Pratiques",
  [AssessmentType.QCM]:          "QCM",
  [AssessmentType.PRESENTATION]: "Exposé / Soutenance",
};

export interface Assessment {
  id: string;
  course_id: string;
  course?: {
    id: string;
    code: string;
    name: string;
    credits: number;
  };
  faculty_member_id: string;
  faculty_member?: {
    id: string;
    full_name: string;
    rank?: string;
  };
  academic_year_id: string;
  academic_year?: {
    id: string;
    name: string;
  };
  title: string;
  type: AssessmentType;
  type_label: string;
  date: string;
  start_time?: string | null;
  duration_minutes?: number | null;
  room?: string | null;
  coefficient?: number | null;
  is_grades_published: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentFilters {
  academic_year_id?: string;
  faculty_member_id?: string;
  course_id?: string;
}

export interface CreateAssessmentInput {
  course_id: string;
  faculty_member_id: string;
  academic_year_id: string;
  title: string;
  type: AssessmentType;
  date: string;
  start_time?: string | null;
  duration_minutes?: number | null;
  room?: string | null;
  coefficient?: number | null;
  notes?: string | null;
}

export type UpdateAssessmentInput = Partial<CreateAssessmentInput>;

export interface AssessmentGradeSheetRow {
  student_id: string;
  student_number?: string;
  full_name: string;
  grade_id?: string | null;
  score?: number | null;
  max_score: number;
  status?: string | null;
  course_enrollment_id: string;
}

export interface AssessmentGradeSheet {
  assessment: Assessment;
  students: AssessmentGradeSheetRow[];
}
