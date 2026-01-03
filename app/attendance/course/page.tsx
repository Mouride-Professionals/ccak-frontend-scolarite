"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AttendanceStatusBadge from "@/components/attendance/attendance-status-badge";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import { useCourses } from "@/hooks/use-courses";
import { useCourseAttendance } from "@/hooks/use-attendance";

export default function CourseAttendanceReportPage() {
  const { data: courses } = useCourses({ page: 1, limit: 100 });
  const [courseId, setCourseId] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    session_date: "",
  });

  const { data: attendance, isLoading } = useCourseAttendance(courseId, {
    page: filters.page,
    limit: filters.limit,
    session_date: filters.session_date || undefined,
  });

  const handleExport = () => {
    const records = attendance?.data ?? [];
    if (records.length === 0) return;
    const rows = [
      ["student_number", "student_name", "status", "date"],
      ...records.map((record) => [
        record.student?.student_number ?? "",
        record.student?.full_name ?? record.student_id,
        record.status,
        record.marked_at ?? "",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Rapport de présence par cours">
        <ListHeader
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Recherche désactivée"
          rightSlot={
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={filters.session_date}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, session_date: event.target.value, page: 1 }))
                }
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleExport}
                disabled={(attendance?.data ?? []).length === 0}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-[#00365F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Exporter CSV
              </button>
            </div>
          }
        />

        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-zinc-700">Cours</label>
          <select
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">Sélectionner</option>
            {(courses?.data ?? []).map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          {courseId ? (
            isLoading ? (
              <p className="text-sm text-zinc-500">Chargement...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-[#00365F]/10">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Étudiant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {(attendance?.data ?? []).map((record) => (
                      <tr key={record.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-800">
                            {record.student?.full_name ?? record.student_id}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {record.student?.student_number ?? ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {record.marked_at
                            ? new Date(record.marked_at).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <AttendanceStatusBadge status={record.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <p className="text-sm text-zinc-500">Sélectionnez un cours.</p>
          )}

          <Pagination
            page={attendance?.page ?? filters.page}
            totalPages={attendance?.total_pages ?? 1}
            totalItems={attendance?.total ?? 0}
            perPage={attendance?.limit ?? filters.limit}
            itemLabel="présences"
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            onPerPageChange={(limit) => setFilters((prev) => ({ ...prev, limit, page: 1 }))}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
