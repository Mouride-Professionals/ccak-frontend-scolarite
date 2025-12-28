"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CourseUnitTable from "@/components/course-units/course-unit-table";
import CourseUnitForm from "@/components/course-units/course-unit-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import {
  useCourseUnits,
  useCourseUnit,
  useDeleteCourseUnit,
  useUpdateCourseUnit,
  useCreateCourseUnit,
  useAcademicPrograms,
} from "@/hooks/use-course-units";
import type { CourseUnit } from "@/types/course-unit";
import type { CreateCourseUnitInput, CourseUnitFilters } from "@/types/course-unit";

export const dynamic = 'force-dynamic';

function CourseUnitsPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CourseUnitFilters>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editCourseUnitId, setEditCourseUnitId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; courseUnitId: string | null }>({
    isOpen: false,
    courseUnitId: null,
  });
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // TODO: Implement hooks
  const { data, isLoading, error } = useCourseUnits();
  const { data: courseUnitToEdit } = useCourseUnit(editCourseUnitId || "");
  const deleteMutation = useDeleteCourseUnit();
  const updateMutation = useUpdateCourseUnit();
  const createMutation = useCreateCourseUnit();

  // Load form data
  const { data: academicPrograms, isLoading: loadingPrograms } = useAcademicPrograms();

  // Check for edit parameter in URL
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      setEditCourseUnitId(editId);
    }
  }, [searchParams]);

  const handleEditClick = (id: string) => {
    setEditCourseUnitId(id);
  };

  const handleCreateSubmit = async (data: CreateCourseUnitInput) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      setToast({
        isOpen: true,
        message: "Unité d'enseignement créée avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error creating course unit:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la création de l'unité d'enseignement",
        type: "error",
      });
    }
  };

  const handleEditSubmit = async (data: CreateCourseUnitInput) => {
    if (!editCourseUnitId) return;

    try {
      await updateMutation.mutateAsync({
        ...data,
        id: editCourseUnitId,
      });
      setEditCourseUnitId(null);
      setToast({
        isOpen: true,
        message: "Unité d'enseignement modifiée avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error updating course unit:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la modification de l'unité d'enseignement",
        type: "error",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, courseUnitId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.courseUnitId) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirm.courseUnitId);
      setDeleteConfirm({ isOpen: false, courseUnitId: null });
      setToast({
        isOpen: true,
        message: "Unité d'enseignement supprimée avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error deleting course unit:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression de l'unité d'enseignement",
        type: "error",
      });
    }
  };

  const handleFilterChange = (key: keyof CourseUnitFilters, value: string | boolean) => {
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
      <DashboardLayout title="Unités d'Enseignement">
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
                placeholder="Rechercher une unité d'enseignement..."
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
              {(filters.academicProgramId || filters.type || filters.isActive !== undefined) && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#008D36] text-xs font-semibold text-white">
                  {[filters.academicProgramId, filters.type, filters.isActive].filter((v) => v !== undefined && v !== "").length}
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
            Nouvelle Unité
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
              {/* Academic Program Filter */}
              <div>
                <label
                  htmlFor="academicProgram"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Programme Académique
                </label>
                <select
                  id="academicProgram"
                  value={filters.academicProgramId ?? ""}
                  onChange={(e) => handleFilterChange("academicProgramId", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les programmes</option>
                  {academicPrograms?.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Type
                </label>
                <select
                  id="type"
                  value={filters.type ?? ""}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les types</option>
                  <option value="OBLIGATOIRE">Obligatoire</option>
                  <option value="OPTIONNEL">Optionnel</option>
                </select>
              </div>

              {/* Active Status Filter */}
              <div>
                <label
                  htmlFor="active"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Statut
                </label>
                <select
                  id="active"
                  value={filters.isActive?.toString() ?? ""}
                  onChange={(e) => handleFilterChange("isActive", e.target.value === "true")}
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
              Erreur lors du chargement des unités d'enseignement. Veuillez réessayer.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">
                Chargement des unités d'enseignement...
              </p>
            </div>
          </div>
        ) : (
          <>
            <CourseUnitTable
              courseUnits={data ?? []}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4">
              <p className="text-sm text-zinc-500">
                Affichage de 1 sur {data?.length ?? 0} unités d'enseignement
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Précédent
                </button>
                <button className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                  1
                </button>
                <button
                  disabled
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
          title="Nouvelle Unité d'Enseignement"
          subtitle="Formulaire de création d'unité d'enseignement"
          size="lg"
        >
          {loadingPrograms ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : (
            <CourseUnitForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
              academicPrograms={Array.isArray(academicPrograms) ? academicPrograms : []}
              isLoading={createMutation.isPending}
            />
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editCourseUnitId}
          onClose={() => setEditCourseUnitId(null)}
          title="Modifier Unité d'Enseignement"
          subtitle="Formulaire de modification d'unité d'enseignement"
          size="lg"
        >
          {loadingPrograms || !courseUnitToEdit ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : (
            <CourseUnitForm
              onSubmit={handleEditSubmit}
              onCancel={() => setEditCourseUnitId(null)}
              academicPrograms={Array.isArray(academicPrograms) ? academicPrograms : []}
              isLoading={updateMutation.isPending}
              initialData={{
                academicProgramId: courseUnitToEdit.academicProgramId,
                code: courseUnitToEdit.code,
                name: courseUnitToEdit.name,
                semesterNumber: courseUnitToEdit.semesterNumber,
                credits: courseUnitToEdit.credits,
                type: courseUnitToEdit.type,
                isActive: courseUnitToEdit.isActive,
              }}
            />
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, courseUnitId: null })}
          onConfirm={handleDeleteConfirm}
          title="Supprimer l'unité d'enseignement"
          message="Êtes-vous sûr de vouloir supprimer cette unité d'enseignement ? Cette action est irréversible."
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

export default function CourseUnitsPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <DashboardLayout title="Unités d'Enseignement">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">
                Chargement...
              </p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    }>
      <CourseUnitsPageContent />
    </Suspense>
  );
}