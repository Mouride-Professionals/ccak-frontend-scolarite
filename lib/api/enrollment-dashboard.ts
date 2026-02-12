import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import type { EnrollmentDashboardData } from "@/types/enrollment-dashboard";

export async function getEnrollmentDashboard(): Promise<EnrollmentDashboardData> {
  const response = await api.get("/enrollments/dashboard");
  return unwrapData<EnrollmentDashboardData>(response);
}
