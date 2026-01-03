"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AttendanceStatusBadge from "@/components/attendance/attendance-status-badge";
import Toast from "@/components/ui/toast";
import { useCourses } from "@/hooks/use-courses";
import { useCourseLogsForCourse } from "@/hooks/use-course-logs";
import { useCourseEnrollments } from "@/hooks/use-course-enrollments";
import { useCreateAttendance } from "@/hooks/use-attendance";
import type { AttendanceStatus } from "@/types/attendance";

const statusOptions: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "PRESENT", label: "Présent" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "En retard" },
  { value: "EXCUSED", label: "Excusé" },
];

export default function AttendanceMarkingPage() {
  const { data: courses } = useCourses({ page: 1, limit: 100 });
  const [courseId, setCourseId] = useState("");
  const [courseLogId, setCourseLogId] = useState("");
  const { data: logs } = useCourseLogsForCourse(courseId, { page: 1, limit: 20 });
  const { data: enrollments, isLoading: loadingEnrollments } = useCourseEnrollments(
    courseId ? { course_id: courseId, page: 1, limit: 200 } : undefined
  );

  const students = useMemo(() => {
    return (enrollments?.data ?? [])
      .map((enrollment) => enrollment.enrollment?.student)
      .filter(Boolean);
  }, [enrollments?.data]);

  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const createAttendance = useCreateAttendance();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    if (!students.length) return;
    setRecords((prev) => {
      const next = { ...prev };
      students.forEach((student) => {
        if (!next[student!.id]) next[student!.id] = "PRESENT";
      });
      return next;
    });
  }, [students]);

  const handleSubmit = async () => {
    if (!courseLogId) {
      setToast({ isOpen: true, message: "Sélectionnez une séance.", type: "error" });
      return;
    }
    const payload = students.map((student) => ({
      student_id: student!.id,
      status: records[student!.id] ?? "PRESENT",
    }));
    try {
      await createAttendance.mutateAsync({ course_log_id: courseLogId, records: payload });
      setToast({ isOpen: true, message: "Présences enregistrées.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'enregistrement.", type: "error" });
    }
  };

  const markAll = (status: AttendanceStatus) => {
    setRecords((prev) => {
      const next = { ...prev };
      students.forEach((student) => {
        next[student!.id] = status;
      });
      return next;
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Pointage des présences">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Cours</label>
              <select
                value={courseId}
                onChange={(event) => {
                  setCourseId(event.target.value);
                  setCourseLogId("");
                }}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">Sélectionner un cours</option>
                {(courses?.data ?? []).map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Séance</label>
              <select
                value={courseLogId}
                onChange={(event) => setCourseLogId(event.target.value)}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">Sélectionner</option>
                {(logs?.data ?? []).map((log) => (
                  <option key={log.id} value={log.id}>
                    {new Date(log.session_date).toLocaleDateString("fr-FR")} ·{" "}
                    {log.course?.name ?? log.course_id}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#00365F]">Étudiants</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => markAll("PRESENT")}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
            >
              Tout présent
            </button>
            <button
              type="button"
              onClick={() => markAll("ABSENT")}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
            >
              Tout absent
            </button>
          </div>
          {loadingEnrollments ? (
            <p className="mt-4 text-sm text-zinc-500">Chargement...</p>
          ) : students.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              Aucun étudiant inscrit pour ce cours.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-[#00365F]/10">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Étudiant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Action rapide
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {students.map((student) => (
                    <tr key={student!.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-800">{student!.full_name}</div>
                        <div className="text-xs text-zinc-500">{student!.student_number}</div>
                      </td>
                      <td className="px-4 py-3">
                        <AttendanceStatusBadge status={records[student!.id] ?? "PRESENT"} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={records[student!.id] ?? "PRESENT"}
                          onChange={(event) =>
                            setRecords((prev) => ({
                              ...prev,
                              [student!.id]: event.target.value as AttendanceStatus,
                            }))
                          }
                          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                        >
                          {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isOpen: false })}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
