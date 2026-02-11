export enum TeachingRole {
  TITULAR = "TITULAR",
  TD = "TD",
  TP = "TP",
}

export interface TeachingAssignment {
  id: string;
  faculty_member_id: string;
  faculty_name: string;
  course_id: string;
  course_name: string;
  academic_year_id: string;
  academic_year_label: string;
  role: TeachingRole;
  hours_assigned: number;
  hourly_rate?: number | null;
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
