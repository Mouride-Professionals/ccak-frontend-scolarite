export enum TeachingRole {
  TITULAR = "TITULAR",
  TD = "TD",
  TP = "TP",
}

export enum TeachingDeliveryStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  LATE = "LATE",
}

export interface TeachingAssignment {
  id: string;
  faculty_member_id: string;
  faculty_name: string;
  course_id: string;
  course_name: string;
  course_code?: string;
  level_name?: string;
  academic_year_id: string;
  academic_year_label: string;
  role: TeachingRole;
  hours_assigned: number;
  hourly_rate?: number | null;
  // delivery fields (maquette planning)
  planned_start_date?: string | null;
  effective_start_date?: string | null;
  end_date?: string | null;
  status?: TeachingDeliveryStatus | null;
  hours_cm?: number | null;
  hours_td?: number | null;
  created_at: string;
}

export interface CreateTeachingAssignmentInput {
  faculty_member_id: string;
  course_id: string;
  academic_year_id: string;
  role: TeachingRole;
  hours_assigned: number;
  hourly_rate?: number | null;
}

export interface TeachingAssignmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  faculty_member_id?: string;
  course_id?: string;
  academic_year_id?: string;
  role?: TeachingRole;
}

export interface TeachingAssignmentsResponse {
  data: TeachingAssignment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface TeachingAssignmentConflict {
  has_conflict: boolean;
  message?: string;
  conflicting_assignments?: TeachingAssignment[];
}

export interface PlanningFilters {
  program_id?: string;
  academic_year_id?: string;
  level_id?: string;
}

export interface UpdateDeliveryInput {
  planned_start_date?: string | null;
  effective_start_date?: string | null;
  end_date?: string | null;
  status?: TeachingDeliveryStatus;
  hours_cm?: number | null;
  hours_td?: number | null;
}

export interface PlanningDashboardLevel {
  level_id: string;
  level_name: string;
  taux_execution: number;
  taux_achevement: number;
  total_courses: number;
  completed_courses: number;
}

export type PlanningDashboard = PlanningDashboardLevel[];
