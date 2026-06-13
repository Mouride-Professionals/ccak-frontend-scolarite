"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AttendanceStatusBadge from "@/components/attendance/attendance-status-badge";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import { useCourses } from "@/hooks/use-courses";
import { useCourseAttendance } from "@/hooks/use-attendance";

const COLORS = ["#0A8F3D", "#E11D48", "#D97706", "#083B66"];

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

  const stats = useMemo(() => {
    const records = attendance?.data ?? [];
    const present = records.filter((record) => record.status === "PRESENT").length;
    const absent = records.filter((record) => record.status === "ABSENT").length;
    const late = records.filter((record) => record.status === "LATE").length;
    const excused = records.filter((record) => record.status === "EXCUSED").length;
    const total = records.length;
    const attendanceRate = total > 0 ? Math.round(((present + excused) / total) * 100) : 0;

    return {
      present,
      absent,
      late,
      excused,
      total,
      attendanceRate,
    };
  }, [attendance?.data]);

  const chartData = useMemo(
    () => [
      { name: "Présent", value: stats.present },
      { name: "Absent", value: stats.absent },
      { name: "Retard", value: stats.late },
      { name: "Excusé", value: stats.excused },
    ],
    [stats]
  );

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

        {courseId && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
                Présents: <span className="font-semibold text-[#0A8F3D]">{stats.present}</span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
                Absents: <span className="font-semibold text-[#E11D48]">{stats.absent}</span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
                Retards: <span className="font-semibold text-amber-600">{stats.late}</span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
                Dispensés: <span className="font-semibold text-[#083B66]">{stats.excused}</span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
                Taux: <span className="font-semibold text-[#00365F]">{stats.attendanceRate}%</span>
              </div>
            </div>

            <div className="mb-6 grid gap-6 xl:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-[#00365F]">Distribution des statuts</h3>
                <div className="mt-3 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-[#00365F]">Comparatif des statuts</h3>
                <div className="mt-3 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#083B66" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

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
