"use client";

import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StudentSearch from "@/components/students/student-search";
import { useStudentEvaluations } from "@/hooks/use-evaluations";

export default function StudentEvaluationsPage() {
  const [studentId, setStudentId] = useState("");
  const [selectedStudentLabel, setSelectedStudentLabel] = useState("");
  const { data: evaluations, isLoading } = useStudentEvaluations(studentId);
  const evaluationList = Array.isArray(evaluations)
    ? evaluations
    : ((evaluations as unknown as { data?: typeof evaluations })?.data ?? []);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Évaluations étudiant">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-zinc-700">Étudiant</label>
          <StudentSearch
            value={selectedStudentLabel}
            onSelect={(student) => {
              setStudentId(student.id);
              setSelectedStudentLabel(`${student.full_name} · ${student.student_number}`);
            }}
            onClear={() => {
              setStudentId("");
              setSelectedStudentLabel("");
            }}
            placeholder="Rechercher par nom ou matricule..."
          />

          <div className="mt-6">
            {studentId ? (
              isLoading ? (
                <p className="text-sm text-zinc-500">Chargement...</p>
              ) : evaluationList.length === 0 ? (
                <p className="text-sm text-zinc-500">Aucune évaluation disponible.</p>
              ) : (
                <ul className="space-y-3">
                  {evaluationList.map((evaluation) => (
                    <li
                      key={evaluation.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#00365F]">
                          {evaluation.course?.name ?? evaluation.course_id}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Enseignant:{" "}
                          {evaluation.faculty_member?.full_name ?? evaluation.faculty_member_id}
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
