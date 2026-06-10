"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Toast from "@/components/ui/toast";
import { useCourses } from "@/hooks/use-courses";
import { useAcademicYears } from "@/hooks/use-enrollments";
import { useSelectedYear } from "@/hooks/use-selected-year";
import { useAssessments, useDeleteAssessment } from "@/hooks/use-assessments";
import { ASSESSMENT_TYPE_LABELS } from "@/types/assessment";
import type { AssessmentType } from "@/types/assessment";
import { useEffect } from "react";

const TYPE_COLORS: Record<string, string> = {
  WRITTEN:      "bg-blue-100 text-blue-700",
  ORAL:         "bg-purple-100 text-purple-700",
  LAB:          "bg-yellow-100 text-yellow-700",
  QCM:          "bg-orange-100 text-orange-700",
  PRESENTATION: "bg-pink-100 text-pink-700",
};

export default function AssessmentsPage() {
  const router = useRouter();
  const { selectedYear } = useSelectedYear();
  const { data: coursesData } = useCourses({ page: 1, limit: 200 });
  const { data: years } = useAcademicYears();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    academicYearId: "",
    courseId: "",
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, academicYearId: selectedYear?.id ?? "" }));
  }, [selectedYear?.id]);

  const { data: assessments, isLoading } = useAssessments({
    academic_year_id: filters.academicYearId || undefined,
    course_id: filters.courseId || undefined,
  });

  const deleteMutation = useDeleteAssessment();

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ce contrôle continu ?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () =>
        setToast({ isOpen: true, message: "Contrôle supprimé.", type: "success" }),
      onError: () =>
        setToast({ isOpen: true, message: "Erreur lors de la suppression.", type: "error" }),
    });
  };

  const activeFilters = [filters.courseId, filters.academicYearId].filter(Boolean).length;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Contrôles continus">
        <ListHeader
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Rechercher..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={activeFilters}
          rightSlot={
            <button
              type="button"
              onClick={() => router.push("/assessments/new")}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] sm:w-auto"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau contrôle
            </button>
          }
        />

        {showFilters && (
          <div className="mb-6 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Matière</label>
                <select
                  value={filters.courseId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, courseId: e.target.value }))}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Toutes les matières</option>
                  {coursesData?.data?.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} — {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Année académique</label>
                <select
                  value={filters.academicYearId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, academicYearId: e.target.value }))}
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
        )}

        {isLoading ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Chargement des contrôles...
          </div>
        ) : !assessments?.length ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Aucun contrôle continu trouvé.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50">
                <tr>
                  {["Intitulé", "Matière", "Type", "Date", "Salle", "Notes", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#00365F]">{a.title}</td>
                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {a.course ? (
                        <span>
                          <span className="font-mono text-xs text-zinc-400">{a.course.code}</span>{" "}
                          {a.course.name}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[a.type] ?? "bg-zinc-100 text-zinc-600"}`}>
                        {ASSESSMENT_TYPE_LABELS[a.type as AssessmentType] ?? a.type_label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {a.date ? new Date(a.date).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">{a.room ?? "—"}</td>
                    <td className="px-4 py-3">
                      {a.is_grades_published ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Publiées
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                          Non publiées
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => router.push(`/assessments/${a.id}`)}
                          className="text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
                        >
                          Voir
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/assessments/${a.id}/edit`)}
                          className="text-sm font-medium text-zinc-500 transition-colors hover:text-[#00365F]"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          className="text-sm font-medium text-red-500 transition-colors hover:text-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
