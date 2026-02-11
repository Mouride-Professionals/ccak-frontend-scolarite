import { format, subMonths } from "date-fns";
import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import { getEnrollments } from "@/lib/api/enrollments";
import { EnrollmentStatus, type Enrollment } from "@/types/enrollment";
import type { EnrollmentDashboardData, EnrollmentTrendPoint } from "@/types/enrollment-dashboard";

function buildTrend(enrollments: Enrollment[]): EnrollmentTrendPoint[] {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = subMonths(new Date(), 5 - index);
    return {
      key: format(date, "yyyy-MM"),
      label: format(date, "MMM"),
    };
  });

  return months.map((month) => ({
    month: month.label,
    count: enrollments.filter(
      (enrollment) => format(new Date(enrollment.enrollment_date), "yyyy-MM") === month.key
    ).length,
  }));
}

function buildProgramDistribution(enrollments: Enrollment[]) {
  const counts = new Map<string, number>();
  enrollments.forEach((enrollment) => {
    const key = enrollment.academic_program?.name || "Programme non renseigné";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

async function tryDashboardEndpoint(): Promise<EnrollmentDashboardData | null> {
  try {
    const response = await api.get("/enrollments/dashboard");
    return unwrapData<EnrollmentDashboardData>(response);
  } catch {
    return null;
  }
}

export async function getEnrollmentDashboard(): Promise<EnrollmentDashboardData> {
  const serverDashboard = await tryDashboardEndpoint();
  if (serverDashboard) return serverDashboard;

  const [all, active, pending, completed, withdrawn] = await Promise.all([
    getEnrollments({ page: 1, limit: 200 }),
    getEnrollments({ page: 1, limit: 1, status: EnrollmentStatus.ACTIVE }),
    getEnrollments({ page: 1, limit: 1, status: EnrollmentStatus.PENDING }),
    getEnrollments({ page: 1, limit: 1, status: EnrollmentStatus.COMPLETED }),
    getEnrollments({ page: 1, limit: 1, status: EnrollmentStatus.WITHDRAWN }),
  ]);

  const enrollments = all.data;
  const recentEnrollments = [...enrollments]
    .sort(
      (a, b) =>
        new Date(b.enrollment_date).getTime() -
        new Date(a.enrollment_date).getTime()
    )
    .slice(0, 8);

  return {
    kpis: {
      total_enrollments: all.total,
      active_enrollments: active.total,
      pending_enrollments: pending.total,
      completed_enrollments: completed.total,
      withdrawn_enrollments: withdrawn.total,
    },
    trend: buildTrend(enrollments),
    program_distribution: buildProgramDistribution(enrollments),
    recent_enrollments: recentEnrollments,
  };
}
