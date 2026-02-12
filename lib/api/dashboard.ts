import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import type {
  DashboardEnrollmentsTrendPoint,
  DashboardFilters,
  DashboardOverviewData,
  DashboardRecentActivity,
  DashboardStudentsByLevelPoint,
  DashboardTrendPeriod,
  DashboardValidationRateData,
} from "@/types/dashboard";

function toQuery(filters?: DashboardFilters) {
  const params = new URLSearchParams();
  if (!filters) return params;

  if (filters.academic_year_id) params.append("academic_year_id", filters.academic_year_id);
  if (filters.semester !== undefined) params.append("semester", String(filters.semester));
  if (filters.date_from) params.append("date_from", filters.date_from);
  if (filters.date_to) params.append("date_to", filters.date_to);
  if (filters.department_id) params.append("department_id", filters.department_id);
  if (filters.programme_id) params.append("programme_id", filters.programme_id);
  if (filters.faculty_id) params.append("faculty_id", filters.faculty_id);

  return params;
}

export async function getDashboardOverview(filters?: DashboardFilters): Promise<DashboardOverviewData> {
  const params = toQuery(filters);
  const response = await api.get(`/dashboard/overview${params.toString() ? `?${params}` : ""}`);
  return unwrapData<DashboardOverviewData>(response);
}

export async function getStudentsByLevel(
  filters?: DashboardFilters
): Promise<DashboardStudentsByLevelPoint[]> {
  const params = toQuery(filters);
  const response = await api.get(
    `/dashboard/students-by-level${params.toString() ? `?${params}` : ""}`
  );
  return unwrapData<DashboardStudentsByLevelPoint[]>(response);
}

export async function getEnrollmentsTrend(
  period: DashboardTrendPeriod,
  filters?: DashboardFilters
): Promise<DashboardEnrollmentsTrendPoint[]> {
  const params = toQuery(filters);
  params.append("period", period);
  const response = await api.get(`/dashboard/enrollments-trend?${params}`);
  return unwrapData<DashboardEnrollmentsTrendPoint[]>(response);
}

export async function getValidationRate(
  filters?: DashboardFilters
): Promise<DashboardValidationRateData> {
  const params = toQuery(filters);
  const response = await api.get(
    `/dashboard/validation-rate${params.toString() ? `?${params}` : ""}`
  );
  return unwrapData<DashboardValidationRateData>(response);
}

export async function getRecentActivities(
  limit = 10,
  filters?: DashboardFilters
): Promise<DashboardRecentActivity[]> {
  const params = toQuery(filters);
  params.append("limit", String(limit));
  const response = await api.get(`/dashboard/recent-activities?${params}`);
  return unwrapData<DashboardRecentActivity[]>(response);
}

