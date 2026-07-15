"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import Toast from "@/components/ui/toast";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useCourses } from "@/hooks/use-courses";
import {
  useDeleteEvaluation,
  useDuplicateEvaluation,
  useEvaluations,
  useShareEvaluation,
} from "@/hooks/use-evaluations";
import * as evaluationApi from "@/lib/api/evaluations";

export default function EvaluationsManagementPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    course_id: "",
  });
  const { data: evaluations, isLoading } = useEvaluations({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    course_id: filters.course_id || undefined,
  });
  const { data: courses } = useCourses({ page: 1, limit: 100 });
  const shareEvaluation = useShareEvaluation();
  const duplicateEvaluation = useDuplicateEvaluation();
  const deleteEvaluation = useDeleteEvaluation();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const evaluationsList = useMemo(() => evaluations?.data ?? [], [evaluations?.data]);

  const responseRateQueries = useQueries({
    queries: evaluationsList.map((evaluation) => ({
      queryKey: ["evaluations", "results", evaluation.id],
      queryFn: () => evaluationApi.getEvaluationResults(evaluation.id),
      enabled: !!evaluation.id,
      staleTime: 30000,
    })),
  });

  const responseRateById = useMemo(() => {
    const map: Record<string, number> = {};
    responseRateQueries.forEach((query, index) => {
      const evaluation = evaluationsList[index];
      if (!evaluation) return;
      map[evaluation.id] = Number(query.data?.response_rate ?? 0);
    });
    return map;
  }, [evaluationsList, responseRateQueries]);

  const handleShare = async (id: string) => {
    try {
      await shareEvaluation.mutateAsync(id);
      setToast({ isOpen: true, message: "Évaluation partagée.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors du partage.", type: "error" });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateEvaluation.mutateAsync(id);
      setToast({ isOpen: true, message: "Évaluation dupliquée.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Duplication impossible.", type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEvaluation.mutateAsync(deleteId);
      setToast({ isOpen: true, message: "Évaluation supprimée.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Suppression impossible.", type: "error" });
    } finally {
      setDeleteId(null);
    }
  };

  const activeFilters = [filters.course_id].filter(Boolean).length;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Gestion des évaluations">
        <ListHeader
          searchValue={filters.search}
          onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
          searchPlaceholder="Rechercher une évaluation..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={activeFilters}
          rightSlot={
            <Link
              href="/evaluations/new"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] sm:w-auto"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nouvelle évaluation
            </Link>
          }
        />

        {showFilters && (
          <div className="mb-6 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Cours</label>
                <select
                  value={filters.course_id}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, course_id: e.target.value, page: 1 }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
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
        )}

        {isLoading ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Chargement des évaluations...
          </div>
        ) : !evaluationsList.length ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Aucune évaluation trouvée.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50">
                <tr>
                  {["Cours", "Enseignant", "Taux de réponse", "Statut", ""].map((h) => (
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
                {evaluationsList.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#00365F]">
                      {evaluation.course?.name ?? evaluation.course_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {evaluation.faculty_member?.full_name ?? evaluation.faculty_member_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {(responseRateById[evaluation.id] ?? 0).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      {evaluation.is_published ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Publié
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                          Brouillon
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/evaluations/${evaluation.id}/results`}
                          className="text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
                        >
                          Résultats
                        </Link>
                        <Link
                          href={`/evaluations/${evaluation.id}/response`}
                          className="text-sm font-medium text-zinc-500 transition-colors hover:text-[#00365F]"
                        >
                          Répondre
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleShare(evaluation.id)}
                          className="text-sm font-medium text-zinc-500 transition-colors hover:text-[#00365F]"
                        >
                          Partager
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(evaluation.id)}
                          className="text-sm font-medium text-zinc-500 transition-colors hover:text-[#00365F]"
                        >
                          Dupliquer
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(evaluation.id)}
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

        <Pagination
          page={evaluations?.page ?? filters.page}
          totalPages={evaluations?.total_pages ?? 1}
          totalItems={evaluations?.total ?? 0}
          perPage={evaluations?.limit ?? filters.limit}
          itemLabel="évaluations"
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onPerPageChange={(limit) => setFilters((prev) => ({ ...prev, limit, page: 1 }))}
        />

        <ConfirmDialog
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Supprimer l'évaluation"
          message="Cette action est définitive. Continuer ?"
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
        />

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
