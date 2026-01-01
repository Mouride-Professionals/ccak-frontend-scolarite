"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DeliberationTable from "@/components/deliberations/deliberation-table";
import DeliberationForm from "@/components/deliberations/deliberation-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import {
  useDeliberationSessions,
  useDeliberationSession,
  useDeleteDeliberationSession,
  useCreateDeliberationSession,
  useUpdateDeliberationSession,
  useAcademicPrograms,
  useAcademicYears,
  useFacultyMembers,
} from "@/hooks/use-deliberations";
import type {
  DeliberationSessionFilters,
  CreateDeliberationSessionInput,
} from "@/types/deliberation";
import { DeliberationStatus } from "@/types/deliberation";

export default function DeliberationsPage() {
  const [filters, setFilters] = useState<DeliberationSessionFilters>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; sessionId: string | null }>(
    {
      isOpen: false,
      sessionId: null,
    }
  );
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const { data, isLoading, error } = useDeliberationSessions(filters);
  const { data: sessionToEdit } = useDeliberationSession(editSessionId || "", !!editSessionId);
  const deleteMutation = useDeleteDeliberationSession();
  const createMutation = useCreateDeliberationSession();
  const updateMutation = useUpdateDeliberationSession();

  // Load form data
  const { data: programs, isLoading: loadingPrograms } = useAcademicPrograms();
  const { data: years, isLoading: loadingYears } = useAcademicYears();
  const { data: facultyMembers, isLoading: loadingFaculty } = useFacultyMembers();

  const handleCreateSubmit = async (data: CreateDeliberationSessionInput) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      setToast({
        isOpen: true,
        message: "Session de délibération créée avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error creating deliberation session:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la création de la session",
        type: "error",
      });
    }
  };

  const handleEditClick = (id: string) => {
    setEditSessionId(id);
  };

  const handleEditSubmit = async (data: CreateDeliberationSessionInput) => {
    if (!editSessionId) return;

    try {
      await updateMutation.mutateAsync({
        id: editSessionId,
        input: data,
      });
      setEditSessionId(null);
      setToast({
        isOpen: true,
        message: "Session modifiée avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error updating deliberation session:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la modification de la session",
        type: "error",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, sessionId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.sessionId) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirm.sessionId);
      setDeleteConfirm({ isOpen: false, sessionId: null });
      setToast({
        isOpen: true,
        message: "Session supprimée avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error deleting session:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression de la session",
        type: "error",
      });
    }
  };

  const handleFilterChange = (key: keyof DeliberationSessionFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({ page: 1, limit: 10 });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Délibérations">
        <ListHeader
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          searchPlaceholder="Rechercher une session..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={[
            filters.status,
            filters.semester,
            filters.academic_year_id,
            filters.academic_program_id,
          ].filter(Boolean).length}
          actionLabel="Nouvelle Session"
          onAction={() => setIsCreateModalOpen(true)}
        />

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#00365F]">Filtres avancés</h3>
              <button
                onClick={handleClearFilters}
                className="text-sm text-zinc-500 hover:text-[#008D36] transition-colors"
              >
                Réinitialiser tout
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-zinc-700 mb-2">
                  Statut
                </label>
                <select
                  id="status"
                  value={filters.status ?? ""}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les statuts</option>
                  <option value={DeliberationStatus.SCHEDULED}>Programmée</option>
                  <option value={DeliberationStatus.IN_PROGRESS}>En cours</option>
                  <option value={DeliberationStatus.COMPLETED}>Terminée</option>
                  <option value={DeliberationStatus.CLOSED}>Clôturée</option>
                </select>
              </div>

              {/* Semester Filter */}
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-zinc-700 mb-2">
                  Semestre
                </label>
                <select
                  id="semester"
                  value={filters.semester?.toString() ?? ""}
                  onChange={(e) => handleFilterChange("semester", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les semestres</option>
                  {[1, 2, 3, 4, 5, 6].map((sem) => (
                    <option key={sem} value={sem}>
                      Semestre {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year Filter */}
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-zinc-700 mb-2">
                  Année académique
                </label>
                <select
                  id="year"
                  value={filters.academic_year_id ?? ""}
                  onChange={(e) => handleFilterChange("academic_year_id", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Toutes les années</option>
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

        {/* Content */}
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Erreur lors du chargement des sessions. Veuillez réessayer.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement des sessions...</p>
            </div>
          </div>
        ) : (
          <>
            <DeliberationTable
              sessions={data?.data ?? []}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />

            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.total_pages ?? 1}
              totalItems={data?.total ?? 0}
              perPage={data?.limit ?? filters.limit ?? 10}
              perPageOptions={[5, 10, 20, 50, 100]}
              itemLabel="sessions"
              onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
              onPerPageChange={(nextLimit) =>
                setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
              }
            />
          </>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nouvelle Session de Délibération"
          subtitle="Formulaire de création de session de jury"
          size="lg"
        >
          {loadingPrograms || loadingYears || loadingFaculty ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : (
            <DeliberationForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
              programs={Array.isArray(programs) ? programs : []}
              years={Array.isArray(years) ? years : []}
              facultyMembers={Array.isArray(facultyMembers) ? facultyMembers : []}
              isLoading={createMutation.isPending}
            />
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editSessionId}
          onClose={() => setEditSessionId(null)}
          title="Modifier Session de Délibération"
          subtitle="Formulaire de modification de session de jury"
          size="lg"
        >
          {loadingPrograms || loadingYears || loadingFaculty || !sessionToEdit ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : (
            <DeliberationForm
              onSubmit={handleEditSubmit}
              onCancel={() => setEditSessionId(null)}
              programs={Array.isArray(programs) ? programs : []}
              years={Array.isArray(years) ? years : []}
              facultyMembers={Array.isArray(facultyMembers) ? facultyMembers : []}
              isLoading={updateMutation.isPending}
              initialData={{
                academic_program_id: sessionToEdit.academic_program_id,
                academic_year_id: sessionToEdit.academic_year_id,
                semester: sessionToEdit.semester,
                session_name: sessionToEdit.session_name,
                session_date: sessionToEdit.session_date,
                presided_by: sessionToEdit.presided_by,
                jury_members: sessionToEdit.jury_members || [],
              }}
            />
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, sessionId: null })}
          onConfirm={handleDeleteConfirm}
          title="Supprimer la session"
          message="Êtes-vous sûr de vouloir supprimer cette session de délibération ? Cette action est irréversible."
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        {/* Toast Notifications */}
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
