"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AttendanceStatusBadge from "@/components/attendance/attendance-status-badge";
import StudentSearch from "@/components/students/student-search";
import Pagination from "@/components/ui/pagination";
import { useCourses } from "@/hooks/use-courses";
import { useStudentAttendance } from "@/hooks/use-attendance";

const statusColor: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-amber-100 text-amber-700",
  EXCUSED: "bg-blue-100 text-blue-700",
};

export default function StudentAttendancePage() {
  const [studentId, setStudentId] = useState("");
  const [selectedStudentLabel, setSelectedStudentLabel] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    course_id: "",
  });

  const { data: courses } = useCourses({ page: 1, limit: 100 });
  const { data: attendance, isLoading } = useStudentAttendance(studentId, {
    page: filters.page,
    limit: filters.limit,
    course_id: filters.course_id || undefined,
  });

  const summary = useMemo(() => {
    const records = attendance?.data ?? [];
    const present = records.filter((item) => item.status === "PRESENT").length;
    const absent = records.filter((item) => item.status === "ABSENT").length;
    const late = records.filter((item) => item.status === "LATE").length;
    const excused = records.filter((item) => item.status === "EXCUSED").length;
    const total = records.length;
    const rate = total > 0 ? Math.round(((present + excused) / total) * 100) : 0;

    return { present, absent, late, excused, total, rate };
  }, [attendance?.data]);

  const dispensationWarnings = useMemo(() => {
    const grouped = new Map<string, { course: string; absences: number }>();
    (attendance?.data ?? []).forEach((record) => {
      const key = record.course?.id || record.course_id || "unknown";
      if (!grouped.has(key)) {
        grouped.set(key, {
          course: record.course?.name || key,
          absences: 0,
        });
      }
      if (record.status === "ABSENT" || record.status === "LATE") {
        const current = grouped.get(key);
        if (current) {
          current.absences += 1;
          grouped.set(key, current);
        }
      }
    });

    return Array.from(grouped.values()).filter((item) => item.absences >= 3);
  }, [attendance?.data]);

  const calendarItems = useMemo(() => {
    return (attendance?.data ?? [])
      .filter((record) => Boolean(record.marked_at))
      .map((record) => ({
        id: record.id,
        date: new Date(record.marked_at as string),
        status: record.status,
        course: record.course?.name || record.course?.id || "Cours",
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 30);
  }, [attendance?.data]);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Présences étudiant">
        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Étudiant</label>
              <StudentSearch
                value={selectedStudentLabel}
                onSelect={(student) => {
                  setStudentId(student.id);
                  setSelectedStudentLabel(`${student.full_name} · ${student.student_number}`);
                  setFilters((prev) => ({ ...prev, page: 1 }));
                }}
                onClear={() => {
                  setStudentId("");
                  setSelectedStudentLabel("");
                  setFilters((prev) => ({ ...prev, page: 1 }));
                }}
                placeholder="Rechercher par nom ou matricule..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Cours</label>
              <select
                value={filters.course_id}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, course_id: event.target.value, page: 1 }))
                }
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">Tous les cours</option>
                {(courses?.data ?? []).map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {studentId && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
                Présence: <span className="font-semibold text-[#008D36]">{summary.present}</span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
                Absence: <span className="font-semibold text-[#E11D48]">{summary.absent}</span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
                Retard: <span className="font-semibold text-amber-600">{summary.late}</span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
                Excusé: <span className="font-semibold text-[#083B66]">{summary.excused}</span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
                Taux: <span className="font-semibold text-[#00365F]">{summary.rate}%</span>
              </div>
            </div>

            {dispensationWarnings.length > 0 && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">Alertes dispensation</p>
                <ul className="mt-2 space-y-1 text-sm text-amber-700">
                  {dispensationWarnings.map((warning) => (
                    <li key={warning.course}>
                      {warning.course}: {warning.absences} absence(s)/retard(s)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            {studentId ? (
              isLoading ? (
                <p className="text-sm text-zinc-500">Chargement...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-[#00365F]/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Cours
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
                          <td className="px-4 py-3">{record.course?.name ?? record.course?.id}</td>
                          <td className="px-4 py-3">
                            {record.marked_at ? new Date(record.marked_at).toLocaleDateString("fr-FR") : "—"}
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
              <p className="text-sm text-zinc-500">Sélectionnez un étudiant.</p>
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

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Vue calendrier (30 derniers pointages)</h2>
            {!studentId ? (
              <p className="mt-4 text-sm text-zinc-500">Sélectionnez un étudiant.</p>
            ) : calendarItems.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">Aucun pointage disponible.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {calendarItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-md px-2 py-2 text-xs ${statusColor[item.status] || "bg-zinc-100 text-zinc-700"}`}
                  >
                    <div className="font-semibold">{item.date.toLocaleDateString("fr-FR")}</div>
                    <div className="truncate">{item.course}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
