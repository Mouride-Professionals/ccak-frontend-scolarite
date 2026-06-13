export interface DashboardFilters {
  academic_year_id?: string;
  semester?: number;
  date_from?: string;
  date_to?: string;
  department_id?: string;
  programme_id?: string;
  faculty_id?: string;
}

export interface DashboardOverviewData {
  total_students: number;
  total_enrollments: number;
  total_deliberations: number;
  pending_items: number;
}

export interface DashboardStudentsByLevelPoint {
  niveau: string;
  licence?: number;
  master?: number;
}

export type DashboardTrendPeriod = "6m" | "12m" | "24m";

export interface DashboardEnrollmentsTrendPoint {
  month: string;
  value: number;
}

export interface DashboardValidationRateData {
  validated_percent: number;
  failed_percent: number;
  validated_count?: number;
  failed_count?: number;
}

export type DashboardActivityStatus = "VALIDATED" | "PROCESSED" | "PENDING" | string;

export interface DashboardRecentActivity {
  id: string;
  name: string;
  action: string;
  context: string;
  occurred_at: string;
  status: DashboardActivityStatus;
}
