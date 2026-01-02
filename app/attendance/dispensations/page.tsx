"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import { useStudents } from "@/hooks/use-students";
import { useStudentDispensations } from "@/hooks/use-attendance";

export default function DispensationsPage() {
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const { data: students } = useStudents({ search: search || undefined, page: 1, limit: 15 });
  const { data: dispensations, isLoading } = useStudentDispensations(studentId);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Dispensations d'examen">
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
              ) : (dispensations ?? []).length === 0 ? (
                <p className="text-sm text-zinc-500">Aucune dispensation détectée.</p>
              ) : (
                <ul className="space-y-3">
                  {(dispensations ?? []).map((dispensation) => (
                    <li key={dispensation.course_id} className="rounded-lg border border-zinc-200 p-4">
                      <div className="text-sm font-semibold text-[#00365F]">
                        {dispensation.course_name ?? dispensation.course_id}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        Absences: {dispensation.absence_count ?? 0}
                      </div>
                      <div className="mt-2">
                        {dispensation.dispensed ? (
                          <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                            Dispensé de l'examen
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            Pas de dispensation
                          </span>
                        )}
                      </div>
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
