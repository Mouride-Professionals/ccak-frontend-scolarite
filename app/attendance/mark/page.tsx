"use client";

import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AttendanceStatusBadge from "@/components/attendance/attendance-status-badge";
import Toast from "@/components/ui/toast";
import { useCourses } from "@/hooks/use-courses";
import { useCourseLogsForCourse } from "@/hooks/use-course-logs";
import { useCourseEnrollments } from "@/hooks/use-course-enrollments";
import { useCourseAttendance, useCreateAttendance } from "@/hooks/use-attendance";
import type { AttendanceStatus } from "@/types/attendance";

const statusOptions: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "PRESENT", label: "Présent" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "En retard" },
  { value: "EXCUSED", label: "Excusé" },
];

type AttendanceStudent = {
  id: string;
  full_name: string;
  student_number?: string;
};

export default function AttendanceMarkingPage() {
  const { data: courses } = useCourses({ page: 1, limit: 100 });
  const [courseId, setCourseId] = useState("");
  const [courseLogId, setCourseLogId] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: logs } = useCourseLogsForCourse(courseId, { page: 1, limit: 20 });
  const { data: enrollments, isLoading: loadingEnrollments } = useCourseEnrollments(
    courseId ? { course_id: courseId, page: 1, limit: 200 } : undefined
  );
  const { data: historicalAttendance } = useCourseAttendance(courseId, {
    page: 1,
    limit: 500,
  });

  const students = useMemo<AttendanceStudent[]>(() => {
    return (enrollments?.data ?? []).flatMap((enrollment) => {
      const student = enrollment.enrollment?.student;
      if (!student) return [];
      return [
        {
          id: student.id,
          full_name: student.full_name,
          student_number: student.student_number,
        },
      ];
    });
  }, [enrollments?.data]);

  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const createAttendance = useCreateAttendance();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const onDrop = (acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"));
    setEvidenceFiles((prev) => [...prev, ...imageFiles].slice(0, 5));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 5 * 1024 * 1024,
  });

  const absenceCountMap = useMemo(() => {
    const map = new Map<string, number>();
    (historicalAttendance?.data ?? []).forEach((record) => {
      if (record.status === "ABSENT" || record.status === "LATE") {
        map.set(record.student_id, (map.get(record.student_id) || 0) + 1);
      }
    });
    return map;
  }, [historicalAttendance?.data]);

  const statusSummary = useMemo(() => {
    const values = Object.values(records);
    return {
      present: values.filter((item) => item === "PRESENT").length,
      absent: values.filter((item) => item === "ABSENT").length,
      late: values.filter((item) => item === "LATE").length,
      excused: values.filter((item) => item === "EXCUSED").length,
    };
  }, [records]);

  const handleSubmit = async () => {
    if (!courseLogId) {
      setToast({ isOpen: true, message: "Sélectionnez une séance.", type: "error" });
      return;
    }

    const evidenceNote = evidenceFiles.length
      ? `Photos de présence jointes (${evidenceFiles.length}).`
      : "";

    const payload = students.map((student) => ({
      student_id: student.id,
      status: records[student.id] ?? "PRESENT",
      notes: [notes[student.id], evidenceNote].filter(Boolean).join(" ") || undefined,
    }));

    try {
      await createAttendance.mutateAsync({ course_log_id: courseLogId, records: payload });
      setToast({ isOpen: true, message: "Présences enregistrées.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'enregistrement.", type: "error" });
    }
  };

  const markAll = (status: AttendanceStatus) => {
    setRecords(() => {
      const next: Record<string, AttendanceStatus> = {};
      students.forEach((student) => {
        next[student.id] = status;
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

          <div className="mt-4" {...getRootProps()}>
            <input {...getInputProps()} />
            <div
              className={`rounded-lg border border-dashed p-4 text-sm ${
                isDragActive ? "border-[#008D36] bg-[#008D36]/5" : "border-zinc-300"
              }`}
            >
              Glissez-déposez des photos de présence (max 5) ou cliquez pour sélectionner.
            </div>
          </div>

          {evidenceFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {evidenceFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="rounded-md border border-zinc-200 px-3 py-1 text-xs text-zinc-600"
                >
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            Présents: <span className="font-semibold text-[#008D36]">{statusSummary.present}</span>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            Absents: <span className="font-semibold text-[#E11D48]">{statusSummary.absent}</span>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            Retards: <span className="font-semibold text-amber-600">{statusSummary.late}</span>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            Excusés: <span className="font-semibold text-[#083B66]">{statusSummary.excused}</span>
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
            <p className="mt-4 text-sm text-zinc-500">Aucun étudiant inscrit pour ce cours.</p>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Absences cumulées
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Action rapide
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {students.map((student) => {
                    const absenceCount = absenceCountMap.get(student.id) || 0;
                    return (
                      <tr key={student.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-800">{student.full_name}</div>
                          <div className="text-xs text-zinc-500">{student.student_number}</div>
                        </td>
                        <td className="px-4 py-3">
                          <AttendanceStatusBadge status={records[student.id] ?? "PRESENT"} />
                          <input
                            value={notes[student.id] ?? ""}
                            onChange={(event) =>
                              setNotes((prev) => ({
                                ...prev,
                                [student.id]: event.target.value,
                              }))
                            }
                            placeholder="Note (optionnelle)"
                            className="mt-2 w-full rounded-md border border-zinc-300 px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-zinc-700">{absenceCount}</div>
                          {absenceCount >= 3 && (
                            <div className="mt-1 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                              Risque de dispensation
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <select
                            value={records[student.id] ?? "PRESENT"}
                            onChange={(event) =>
                              setRecords((prev) => ({
                                ...prev,
                                [student.id]: event.target.value as AttendanceStatus,
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
                    );
                  })}
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
