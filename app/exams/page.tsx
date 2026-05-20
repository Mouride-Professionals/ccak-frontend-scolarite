"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import ExamSessionStatusBadge from "@/components/exams/exam-session-status-badge";
import { useExamSessions, useDeleteExamSession } from "@/hooks/use-exams";
import { useSelectedYear } from "@/hooks/use-selected-year";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import type { ExamSessionFilters } from "@/types/exam";
import { ExamSessionStatus, ExamSessionType } from "@/types/exam";

export default function ExamsPage() {
  const router = useRouter();
  const { selectedYear } = useSelectedYear();
  const isReadOnly = useIsReadOnly();

  const [filters, setFilters] = useState<ExamSessionFilters>({ page: 1, limit: 15 });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; sessionId: string | null }>(
    { isOpen: false, sessionId: null }
  );
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>(
    { isOpen: false, message: "", type: "success" }
  );

  useEffect(() => {
    setFilters((prev) => ({ ...prev, academic_year_id: selectedYear?.id, page: 1 }));
  }, [selectedYear?.id]);

  const { data, isLoading, error } = useExamSessions(filters);
  const deleteMutation = useDeleteExamSession();

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.sessionId) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirm.sessionId);
      setDeleteConfirm({ isOpen: false, sessionId: null });
      setToast({ isOpen: true, message: "Session supprimée", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la suppression", type: "error" });
    }
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 15, academic_year_id: selectedYear?.id });
  };

  const activeFilterCount = [filters.status, filters.type, filters.semester_number].filter(Boolean).length;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Sessions d'examen">
        <ListHeader
          searchValue={filters.name ?? ""}
          searchPlaceholder="Rechercher une session..."
          onSearchChange={(v) => setFilters((prev) => ({ ...prev, name: v || undefined, page: 1 }))}
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={activeFilterCount}
          actionLabel="Nouvelle session"
          onAction={isReadOnly ? undefined : () => router.push("/exams/new")}
        />

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#00365F]">Filtres avancés</h3>
              <button onClick={handleClearFilters} className="text-sm text-zinc-500 hover:text-[#008D36] transition-colors">
                Réinitialiser
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Statut</label>
                <select
                  value={filters.status ?? ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: (e.target.value as ExamSessionStatus) || undefined, page: 1 }))}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les statuts</option>
                  <option value={ExamSessionStatus.DRAFT}>Brouillon</option>
                  <option value={ExamSessionStatus.PUBLISHED}>Publié</option>
                  <option value={ExamSessionStatus.CLOSED}>Clôturé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Type</label>
                <select
                  value={filters.type ?? ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, type: (e.target.value as ExamSessionType) || undefined, page: 1 }))}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les types</option>
                  <option value={ExamSessionType.NORMAL}>Session Normale</option>
                  <option value={ExamSessionType.RATTRAPAGE}>Session de Rattrapage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Semestre</label>
                <select
                  value={filters.semester_number?.toString() ?? ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, semester_number: e.target.value ? parseInt(e.target.value) : undefined, page: 1 }))}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les semestres</option>
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <option key={s} value={s}>Semestre {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">Erreur lors du chargement. Veuillez réessayer.</p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]" />
              <p className="mt-3 text-sm text-zinc-500">Chargement des sessions...</p>
            </div>
          </div>
        ) : (data?.data ?? []).length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white">
            <svg className="h-10 w-10 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-3 text-sm font-medium text-zinc-500">Aucune session d&apos;examen</p>
            {!isReadOnly && (
              <Link href="/exams/new" className="mt-3 text-sm font-medium text-[#008D36] hover:underline">
                Créer une session →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {(data?.data ?? []).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Type dot */}
                  <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    session.type === ExamSessionType.NORMAL ? "bg-[#008D36]" : "bg-amber-400"
                  }`} />

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/exams/${session.id}`}
                      className="text-sm font-semibold text-zinc-900 hover:text-[#008D36] transition-colors"
                    >
                      {session.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span>{session.type_label}</span>
                      <span>·</span>
                      <span>Semestre {session.semester_number}</span>
                      <span>·</span>
                      <span>
                        {new Date(session.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        {" → "}
                        {new Date(session.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Schedules count */}
                  <div className="shrink-0 text-center">
                    <span className="text-lg font-bold text-zinc-900">{session.schedules_count ?? 0}</span>
                    <p className="text-xs text-zinc-400">examens</p>
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    <ExamSessionStatusBadge status={session.status} />
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/exams/${session.id}`}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      Voir
                    </Link>
                    {!isReadOnly && session.status === ExamSessionStatus.DRAFT && (
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, sessionId: session.id })}
                        className="rounded-lg border border-red-100 p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.total_pages ?? 1}
              totalItems={data?.total ?? 0}
              perPage={data?.limit ?? 15}
              perPageOptions={[10, 15, 25, 50]}
              itemLabel="sessions"
              onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
              onPerPageChange={(l) => setFilters((prev) => ({ ...prev, limit: l, page: 1 }))}
            />
          </>
        )}

        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, sessionId: null })}
          onConfirm={handleDeleteConfirm}
          title="Supprimer la session"
          message="Êtes-vous sûr de vouloir supprimer cette session ? Tous les examens planifiés seront supprimés. Cette action est irréversible."
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          isLoading={deleteMutation.isPending}
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
