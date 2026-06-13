"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ProgrammeTable from "@/components/programmes/programme-table";
import ProgrammeForm from "@/components/programmes/programme-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import {
  useAcademicPrograms,
  useAcademicProgram,
  useDeleteAcademicProgram,
  useUpdateAcademicProgram,
  useCreateAcademicProgram,
  useDepartments,
} from "@/hooks/use-academic";
import { AcademicLevel } from "@/types/academic";
import type { CreateProgrammeInput, AcademicProgramFilters } from "@/types/programme";

function ProgrammesPageContent() {
  const searchParams = useSearchParams();
  const queryEditId = searchParams.get("edit");
  const queryDeptId = searchParams.get("department_id");
  const [filters, setFilters] = useState<AcademicProgramFilters>({
    page: 1,
    limit: 10,
    department_id: queryDeptId || undefined,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editProgrammeId, setEditProgrammeId] = useState<string | null>(queryEditId);
  const [showFilters, setShowFilters] = useState(!!searchParams.get("department_id"));
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

  const { data, isLoading, error } = useAcademicPrograms(filters);
  const { data: programmeToEdit } = useAcademicProgram(editProgrammeId || "", !!editProgrammeId);
  const deleteMutation = useDeleteAcademicProgram();
  const updateMutation = useUpdateAcademicProgram();
  const createMutation = useCreateAcademicProgram();

  // Load form data
  const { data: departments, isLoading: loadingDepartments } = useDepartments();

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
        <ListHeader
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          searchPlaceholder="Rechercher un programme..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={
            [
              filters.department_id,
              filters.level,
              filters.is_active !== undefined ? "active" : "",
            ].filter(Boolean).length
          }
          actionLabel="Nouveau Programme"
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
                  {Array.isArray(departments) &&
                    departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
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

            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.total_pages ?? 1}
              totalItems={data?.total ?? 0}
              perPage={data?.limit ?? filters.limit ?? 10}
              itemLabel="programmes"
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
