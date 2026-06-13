import type { Enrollment } from "@/types/enrollment";

export interface EnrollmentKpis {
  total_enrollments: number;
  active_enrollments: number;
  pending_enrollments: number;
  completed_enrollments: number;
  withdrawn_enrollments: number;
}

export interface EnrollmentTrendPoint {
  month: string;
  count: number;
}

export interface EnrollmentProgramPoint {
  name: string;
  count: number;
}

export interface EnrollmentDashboardData {
  kpis: EnrollmentKpis;
  trend: EnrollmentTrendPoint[];
  program_distribution: EnrollmentProgramPoint[];
  recent_enrollments: Enrollment[];
}
