"use client";

import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import Toast from "@/components/ui/toast";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useCourses } from "@/hooks/use-courses";
import { useDeleteEvaluation, useEvaluations, useShareEvaluation } from "@/hooks/use-evaluations";

export default function EvaluationsManagementPage() {
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
  const deleteEvaluation = useDeleteEvaluation();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleShare = async (id: string) => {
    try {
      await shareEvaluation.mutateAsync(id);
      setToast({ isOpen: true, message: "Évaluation partagée.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors du partage.", type: "error" });
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

  return (
    <ProtectedRoute>
      <DashboardLayout title="Gestion des évaluations">
        <ListHeader
          searchValue={filters.search}
          onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
          searchPlaceholder="Rechercher une évaluation..."
          rightSlot={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filters.course_id}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, course_id: event.target.value, page: 1 }))
                }
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Tous les cours</option>
                {(courses?.data ?? []).map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <Link
                href="/evaluations/new"
                className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
              >
                Nouvelle évaluation
              </Link>
            </div>
          }
        />

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <div className="text-center text-sm text-zinc-500">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-[#00365F]/10">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Cours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Enseignant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(evaluations?.data ?? []).map((evaluation) => (
                    <tr key={evaluation.id}>
                      <td className="px-4 py-3">
                        {evaluation.course?.name ?? evaluation.course_id}
                      </td>
                      <td className="px-4 py-3">
                        {evaluation.faculty_member?.full_name ?? evaluation.faculty_member_id}
                      </td>
                      <td className="px-4 py-3">
                        {evaluation.is_published ? "Publié" : "Brouillon"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            href={`/evaluations/${evaluation.id}/results`}
                            className="text-sm font-medium text-[#00365F]"
                          >
                            Résultats
                          </Link>
                          <Link
                            href={`/evaluations/${evaluation.id}/response`}
                            className="text-sm font-medium text-[#008D36]"
                          >
                            Répondre
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleShare(evaluation.id)}
                            className="text-sm font-medium text-[#00365F]"
                          >
                            Partager
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(evaluation.id)}
                            className="text-sm font-medium text-red-500"
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
        </div>

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
