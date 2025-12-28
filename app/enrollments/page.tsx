"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import EnrollmentTable from "@/components/enrollments/enrollment-table";
import EnrollmentForm from "@/components/enrollments/enrollment-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import {
  useEnrollments,
  useDeleteEnrollment,
  useCreateEnrollment,
  useUpdateEnrollment,
  useEnrollment,
  useAcademicYears,
  useAcademicPrograms,
  useStudents,
} from "@/hooks/use-enrollments";
import type { EnrollmentFilters, CreateEnrollmentInput } from "@/types/enrollment";
import { EnrollmentStatus } from "@/types/enrollment";

export default function EnrollmentsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<EnrollmentFilters>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; enrollmentId: string | null }>({
    isOpen: false,
    enrollmentId: null,
  });
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const { data, isLoading, error } = useEnrollments(filters);
  const deleteMutation = useDeleteEnrollment();
  const createMutation = useCreateEnrollment();
  const updateMutation = useUpdateEnrollment();

  // Load academic years for filters
  const { data: years } = useAcademicYears();

  // Load form data
  const { data: programs, isLoading: loadingPrograms } = useAcademicPrograms();
  const { data: students, isLoading: loadingStudents } = useStudents();

  // Load enrollment being edited
  const { data: editingEnrollment, isLoading: loadingEditEnrollment } = useEnrollment(editingEnrollmentId || "", {
    enabled: !!editingEnrollmentId,
  });

  const handleViewClick = (id: string) => {
    router.push(`/enrollments/${id}`);
  };

  const handleEditClick = (id: string) => {
    setEditingEnrollmentId(id);
  };

  const handleCoursesClick = (id: string) => {
    router.push(`/enrollments/courses?enrollment_id=${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, enrollmentId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.enrollmentId) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirm.enrollmentId);
      setDeleteConfirm({ isOpen: false, enrollmentId: null });
      setToast({
        isOpen: true,
        message: "Enrollement supprimé avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error deleting enrollment:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression de l'enrollement",
        type: "error",
      });
    }
  };

  const handleCreateSubmit = async (data: CreateEnrollmentInput) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      setToast({
        isOpen: true,
        message: "Enrollement créé avec succès",
        type: "success",
      });
    } catch (error) {
      console.error("Error creating enrollment:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la création de l'enrollement",
        type: "error",
      });
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (!editingEnrollmentId) return;

    try {
      await updateMutation.mutateAsync({ id: editingEnrollmentId, input: data });
      setEditingEnrollmentId(null);
      setToast({
        isOpen: true,
        message: "Enrollement modifié avec succès",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating enrollment:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la modification de l'enrollement",
        type: "error",
      });
    }
  };

  const handleFilterChange = (key: keyof EnrollmentFilters, value: string) => {
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
      <DashboardLayout title="Enrollements">
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
                placeholder="Rechercher un enrollement..."
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
              {(filters.status || filters.current_semester || filters.academic_year_id || filters.academic_program_id) && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#008D36] text-xs font-semibold text-white">
                  {[filters.status, filters.current_semester, filters.academic_year_id, filters.academic_program_id].filter(Boolean).length}
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
            Nouvel Enrollement
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
              {/* Status Filter */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Statut
                </label>
                <select
                  id="status"
                  value={filters.status ?? ""}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les statuts</option>
                  <option value={EnrollmentStatus.PENDING}>En attente</option>
                  <option value={EnrollmentStatus.REGISTERED}>Enregistrée</option>
                  <option value={EnrollmentStatus.ACTIVE}>Active</option>
                  <option value={EnrollmentStatus.COMPLETED}>Terminée</option>
                  <option value={EnrollmentStatus.WITHDRAWN}>Retirée</option>
                </select>
              </div>

              {/* Semester Filter */}
              <div>
                <label
                  htmlFor="current_semester"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Semestre
                </label>
                <select
                  id="current_semester"
                  value={filters.current_semester?.toString() ?? ""}
                  onChange={(e) => handleFilterChange("current_semester", e.target.value)}
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
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Année académique
                </label>
                <select
                  id="year"
                  value={filters.academic_year_id ?? ""}
                  onChange={(e) => handleFilterChange("academic_year_id", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Toutes les années</option>
                  {Array.isArray(years) && years.map((year) => (
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
              Erreur lors du chargement des enrollements. Veuillez réessayer.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">
                Chargement des enrollements...
              </p>
            </div>
          </div>
        ) : (
          <>
            <EnrollmentTable
              enrollments={data?.data ?? []}
              onView={handleViewClick}
              onEdit={handleEditClick}
              onCourses={handleCoursesClick}
              onDelete={handleDeleteClick}
            />

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4">
              <p className="text-sm text-zinc-500">
                Affichage de {data ? ((data.page - 1) * data.limit) + 1 : 0} sur {data?.total ?? 0} enrollements
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
          title="Nouvel Enrollement"
          subtitle="Formulaire de création d'enrollement"
          size="lg"
        >
          {loadingPrograms || loadingStudents ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : (
            <EnrollmentForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
              programs={programs ?? []}
              years={years ?? []}
              students={students ?? []}
              isLoading={createMutation.isPending}
            />
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editingEnrollmentId}
          onClose={() => setEditingEnrollmentId(null)}
          title="Modifier l'Enrollement"
          subtitle="Formulaire de modification d'enrollement"
          size="lg"
        >
          {loadingPrograms || loadingStudents || loadingEditEnrollment ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : editingEnrollment ? (
            <EnrollmentForm
              initialData={editingEnrollment}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingEnrollmentId(null)}
              programs={programs ?? []}
              years={years ?? []}
              students={students ?? []}
              isLoading={updateMutation.isPending}
            />
          ) : null}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, enrollmentId: null })}
          onConfirm={handleDeleteConfirm}
          title="Supprimer l'enrollement"
          message="Êtes-vous sûr de vouloir supprimer cet enrollement ? Cette action est irréversible."
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
