"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StudentSearch from "@/components/students/student-search";
import { useAcademicYears } from "@/hooks/use-enrollments";
import { useSelectedYear } from "@/hooks/use-selected-year";
import { useGrades } from "@/hooks/use-grades";
import { ASSESSMENT_TYPE_LABELS } from "@/types/assessment";
import type { AssessmentType } from "@/types/assessment";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumise",
  VALIDATED: "Validée",
  PUBLISHED: "Publiée",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-500",
  SUBMITTED: "bg-blue-100 text-blue-600",
  VALIDATED: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-green-100 text-green-700",
};

export default function AssessmentStudentPage() {
  const { selectedYear } = useSelectedYear();
  const { data: years } = useAcademicYears();

  const [studentId, setStudentId] = useState("");
  const [studentLabel, setStudentLabel] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");

  useEffect(() => {
    setAcademicYearId(selectedYear?.id ?? "");
  }, [selectedYear?.id]);

  const { data: gradesResponse, isLoading } = useGrades(
    studentId
      ? {
          student_id: studentId,
          type: "CC",
          academic_year_id: academicYearId || undefined,
        }
      : undefined
  );

  const grades = gradesResponse?.data ?? [];

  return (
    <ProtectedRoute>
      <DashboardLayout title="CC par étudiant">
        <div className="space-y-6">
          {/* Filters */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Étudiant</label>
                <StudentSearch
                  value={studentLabel}
                  onSelect={(student) => {
                    setStudentId(student.id);
                    setStudentLabel(`${student.full_name} · ${student.student_number}`);
                  }}
                  onClear={() => {
                    setStudentId("");
                    setStudentLabel("");
                  }}
                  placeholder="Rechercher par nom ou matricule..."
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Année académique
                </label>
                <select
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Toutes</option>
                  {Array.isArray(years) &&
                    years.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name} {year.is_current && "(Actuelle)"}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          {!studentId ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-400">
              Sélectionnez un étudiant pour afficher ses contrôles continus.
            </div>
          ) : isLoading ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
              Chargement...
            </div>
          ) : grades.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
              Aucune note de contrôle continu trouvée pour cet étudiant.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 px-6 py-4">
                <h3 className="font-semibold text-[#00365F]">{studentLabel}</h3>
                <p className="text-sm text-zinc-500">{grades.length} note(s) de CC</p>
              </div>
              <table className="min-w-full divide-y divide-zinc-100">
                <thead className="bg-zinc-50">
                  <tr>
                    {["Contrôle", "Type", "Matière", "Date", "Note", "Statut"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-sm font-medium text-zinc-800">
                        {grade.assessment?.title ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {grade.assessment?.type ? (
                          <span className="text-xs text-zinc-500">
                            {ASSESSMENT_TYPE_LABELS[grade.assessment.type as AssessmentType] ??
                              grade.assessment.type}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">
                        {(grade as any).course?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {grade.assessment?.date
                          ? new Date(grade.assessment.date).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#00365F]">
                        {grade.score != null ? `${grade.score} / ${grade.max_score}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[grade.status ?? ""] ?? "bg-zinc-100 text-zinc-400"}`}
                        >
                          {STATUS_LABELS[grade.status ?? ""] ?? grade.status ?? "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
