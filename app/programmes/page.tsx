"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ProgrammeTable from "@/components/programmes/programme-table";
import ProgrammeForm from "@/components/programmes/programme-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import {
  useAcademicPrograms,
  useAcademicProgram,
  useDeleteAcademicProgram,
  useUpdateAcademicProgram,
  useCreateAcademicProgram,
  useDepartments,
} from "@/hooks/use-academic";
import type { AcademicProgram } from "@/types/academic";
import { AcademicLevel } from "@/types/academic";
import type { CreateProgrammeInput, AcademicProgramFilters } from "@/types/programme";

function ProgrammesPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<AcademicProgramFilters>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editProgrammeId, setEditProgrammeId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    programmeId: string | null;
  }>({
    isOpen: false,
    programmeId: null,
  });
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // TODO: Implement hooks
  const { data, isLoading, error } = useAcademicPrograms(filters);
  const { data: programmeToEdit } = useAcademicProgram(editProgrammeId || "", !!editProgrammeId);
  const deleteMutation = useDeleteAcademicProgram();
  const updateMutation = useUpdateAcademicProgram();
  const createMutation = useCreateAcademicProgram();

  // Load form data
  const { data: departments, isLoading: loadingDepartments } = useDepartments();

  // Check for edit parameter in URL
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      setEditProgrammeId(editId);
    }
  }, [searchParams]);

  const handleEditClick = (id: string) => {
    setEditProgrammeId(id);
  };

  const handleCreateSubmit = async (data: CreateProgrammeInput) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      setToast({
        isOpen: true,
        message: "Programme créé avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error creating academic programme:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la création du programme",
        type: "error",
      });
    }
  };

  const handleEditSubmit = async (data: CreateProgrammeInput) => {
    if (!editProgrammeId) return;

    try {
      await updateMutation.mutateAsync({
        id: editProgrammeId,
        input: data,
      });
      setEditProgrammeId(null);
      setToast({
        isOpen: true,
        message: "Programme modifié avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error updating academic programme:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la modification du programme",
        type: "error",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, programmeId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.programmeId) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirm.programmeId);
      setDeleteConfirm({ isOpen: false, programmeId: null });
      setToast({
        isOpen: true,
        message: "Programme supprimé avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error deleting programme:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression du programme",
        type: "error",
      });
    }
  };

  const handleFilterChange = (key: keyof AcademicProgramFilters, value: string | boolean) => {
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
      <DashboardLayout title="Programmes Académiques">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher un programme..."
                className="block w-80 rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                showFilters
                  ? "border-[#008D36] bg-[#008D36]/10 text-[#008D36]"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtres
              {(filters.department_id || filters.level || filters.is_active !== undefined) && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#008D36] text-xs font-semibold text-white">
                  {
                    [filters.department_id, filters.level, filters.is_active].filter(
                      (v) => v !== undefined && v !== ""
                    ).length
                  }
                </span>
              )}
            </button>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouveau Programme
          </button>
        </div>

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
              {/* Department Filter */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Département
                </label>
                <select
                  id="department"
                  value={filters.department_id ?? ""}
                  onChange={(e) => handleFilterChange("department_id", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les départements</option>
                  {/* TODO: Map departments */}
                  {/* {departments?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))} */}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-zinc-700 mb-2">
                  Niveau
                </label>
                <select
                  id="level"
                  value={filters.level ?? ""}
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les niveaux</option>
                  <option value={AcademicLevel.LICENCE}>Licence</option>
                  <option value={AcademicLevel.MASTER}>Master</option>
                  <option value={AcademicLevel.DOCTORAT}>Doctorat</option>
                </select>
              </div>

              {/* Active Status Filter */}
              <div>
                <label htmlFor="active" className="block text-sm font-medium text-zinc-700 mb-2">
                  Statut
                </label>
                <select
                  id="active"
                  value={filters.is_active?.toString() ?? ""}
                  onChange={(e) => handleFilterChange("is_active", e.target.value === "true")}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les statuts</option>
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Erreur lors du chargement des programmes. Veuillez réessayer.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement des programmes...</p>
            </div>
          </div>
        ) : (
          <>
            <ProgrammeTable
              programmes={data?.data ?? []}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4">
              <p className="text-sm text-zinc-500">
                Affichage de {data ? (data.page - 1) * data.limit + 1 : 0} sur {data?.total ?? 0}{" "}
                sessions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
                  disabled={!data || data.page === 1}
                  className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Précédent
                </button>
                <button className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                  {data?.page ?? 1}
                </button>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                  disabled={!data || data.page >= data.total_pages}
                  className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nouveau Programme Académique"
          subtitle="Formulaire de création de programme"
          size="lg"
        >
          {loadingDepartments ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : (
            <ProgrammeForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
              departments={Array.isArray(departments) ? departments : []}
              isLoading={createMutation.isPending}
            />
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editProgrammeId}
          onClose={() => setEditProgrammeId(null)}
          title="Modifier Programme Académique"
          subtitle="Formulaire de modification de programme"
          size="lg"
        >
          {loadingDepartments || !programmeToEdit ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : (
            <ProgrammeForm
              onSubmit={handleEditSubmit}
              onCancel={() => setEditProgrammeId(null)}
              departments={Array.isArray(departments) ? departments : []}
              isLoading={updateMutation.isPending}
              initialData={{
                department_id: programmeToEdit.department_id,
                name: programmeToEdit.name,
                level: programmeToEdit.level,
                duration_semesters: programmeToEdit.duration_semesters,
                total_credits_required: programmeToEdit.total_credits_required,
                is_active: programmeToEdit.is_active,
              }}
            />
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, programmeId: null })}
          onConfirm={handleDeleteConfirm}
          title="Supprimer le programme"
          message="Êtes-vous sûr de vouloir supprimer ce programme académique ? Cette action est irréversible."
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

export default function ProgrammesPage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute>
          <DashboardLayout title="Programmes Académiques">
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500">Chargement...</p>
              </div>
            </div>
          </DashboardLayout>
        </ProtectedRoute>
      }
    >
      <ProgrammesPageContent />
    </Suspense>
  );
}
