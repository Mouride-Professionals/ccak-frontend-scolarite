"use client";

import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import { useStudents } from "@/hooks/use-students";
import { useStudentEvaluations } from "@/hooks/use-evaluations";

export default function StudentEvaluationsPage() {
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const { data: students } = useStudents({ search: search || undefined, page: 1, limit: 15 });
  const { data: evaluations, isLoading } = useStudentEvaluations(studentId);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Évaluations étudiant">
        <ListHeader
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher un étudiant..."
        />

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
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

          <div className="mt-6">
            {studentId ? (
              isLoading ? (
                <p className="text-sm text-zinc-500">Chargement...</p>
              ) : (evaluations ?? []).length === 0 ? (
                <p className="text-sm text-zinc-500">Aucune évaluation disponible.</p>
              ) : (
                <ul className="space-y-3">
                  {(evaluations ?? []).map((evaluation) => (
                    <li
                      key={evaluation.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#00365F]">
                          {evaluation.course?.name ?? evaluation.course_id}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Enseignant: {evaluation.faculty_member?.full_name ?? evaluation.faculty_member_id}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Date limite:{" "}
                          {evaluation.response_deadline
                            ? new Date(evaluation.response_deadline).toLocaleDateString("fr-FR")
                            : "—"}
                        </div>
                      </div>
                      <Link
                        href={`/evaluations/${evaluation.id}/response`}
                        className="rounded-lg bg-[#00365F] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Répondre
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <p className="text-sm text-zinc-500">Sélectionnez un étudiant.</p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
