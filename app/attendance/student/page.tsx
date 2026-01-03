"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AttendanceStatusBadge from "@/components/attendance/attendance-status-badge";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import { useCourses } from "@/hooks/use-courses";
import { useStudents } from "@/hooks/use-students";
import { useStudentAttendance } from "@/hooks/use-attendance";

export default function StudentAttendancePage() {
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    course_id: "",
  });

  const { data: students } = useStudents({ search: search || undefined, page: 1, limit: 15 });
  const { data: courses } = useCourses({ page: 1, limit: 100 });
  const { data: attendance, isLoading } = useStudentAttendance(studentId, {
    page: filters.page,
    limit: filters.limit,
    course_id: filters.course_id || undefined,
  });

  return (
    <ProtectedRoute>
      <DashboardLayout title="Présences étudiant">
        <ListHeader
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher un étudiant..."
        />

        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Étudiant</label>
              <select
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">Sélectionner</option>
                {(students?.data ?? []).map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} · {student.student_number}
                  </option>
                ))}
              </select>
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
                        <td className="px-4 py-3">{record.course?.name ?? record.course_id}</td>
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
