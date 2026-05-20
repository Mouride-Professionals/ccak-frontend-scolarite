"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StudentTable from "@/components/students/student-table";
import StudentForm from "@/components/students/student-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import {
  useStudents,
  useStudent,
  useDeleteStudent,
  useCreateStudent,
  useUpdateStudent,
} from "@/hooks/use-students";
import type { StudentFilters, CreateStudentInput } from "@/types/student";
import { StudentStatus, Gender } from "@/types/student";
export default function StudentsPage() {
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; studentId: string | null }>(
    {
      isOpen: false,
      studentId: null,
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

  const { data, isLoading, error } = useStudents(filters);
  const { data: studentToEdit } = useStudent(editStudentId || "", !!editStudentId);
  const deleteMutation = useDeleteStudent();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();

  const handleCreateSubmit = async (data: CreateStudentInput) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      setToast({
        isOpen: true,
        message: "Étudiant créé avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error creating student:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la création de l'étudiant",
        type: "error",
      });
    }
  };

  const handleEditClick = (id: string) => {
    setEditStudentId(id);
  };

  const handleEditSubmit = async (data: CreateStudentInput) => {
    if (!editStudentId) return;

    try {
      await updateMutation.mutateAsync({
        id: editStudentId,
        input: data,
      });
      setEditStudentId(null);
      setToast({
        isOpen: true,
        message: "Étudiant modifié avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error updating student:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la modification de l'étudiant",
        type: "error",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, studentId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.studentId) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirm.studentId);
      setDeleteConfirm({ isOpen: false, studentId: null });
      setToast({
        isOpen: true,
        message: "Étudiant supprimé avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error deleting student:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression de l'étudiant",
        type: "error",
      });
    }
  };

  const handleFilterChange = (key: keyof StudentFilters, value: string) => {
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
      <DashboardLayout title="Étudiants">
        <ListHeader
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          searchPlaceholder="Rechercher un étudiant..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={[filters.status, filters.gender].filter(Boolean).length}
          actionLabel="Nouvel Étudiant"
          onAction={() => setIsCreateModalOpen(true)}
        />

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#00365F]">Filtres avancés</h3>
              <button
                onClick={handleClearFilters}
                className="text-sm text-zinc-500 hover:text-[#008D36] transition-colors"
              >
                Réinitialiser tout
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                  <option value={StudentStatus.ACTIVE}>Actif</option>
                  <option value={StudentStatus.PENDING}>En attente</option>
                  <option value={StudentStatus.SUSPENDED}>Suspendu</option>
                  <option value={StudentStatus.GRADUATED}>Diplômé</option>
                  <option value={StudentStatus.WITHDRAWN}>Désisté</option>
                  <option value={StudentStatus.EXPELLED}>Exclu</option>
                  <option value={StudentStatus.CANCELLED}>Annulé</option>
                  <option value={StudentStatus.INACTIVE}>Inactif</option>
                </select>
              </div>

              {/* Gender Filter */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-zinc-700 mb-2">
                  Genre
                </label>
                <select
                  id="gender"
                  value={filters.gender ?? ""}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les genres</option>
                  <option value={Gender.M}>Masculin</option>
                  <option value={Gender.F}>Féminin</option>
                </select>
              </div>

            </div>
          </div>
        )}

        {/* Content */}
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Erreur lors du chargement des étudiants. Veuillez réessayer.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement des étudiants...</p>
            </div>
          </div>
        ) : (
          <>
            <StudentTable
              students={data?.data ?? []}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />

            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.total_pages ?? 1}
              totalItems={data?.total ?? 0}
              perPage={data?.limit ?? filters.limit ?? 10}
              itemLabel="étudiants"
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
          title="Nouvel Étudiant"
          subtitle="Formulaire de création d'étudiant"
          size="lg"
        >
          <StudentForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={createMutation.isPending}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editStudentId}
          onClose={() => setEditStudentId(null)}
          title="Modifier Étudiant"
          subtitle="Formulaire de modification d'étudiant"
          size="lg"
        >
          {!studentToEdit ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500">Chargement des données...</p>
              </div>
            </div>
          ) : (
            <StudentForm
              onSubmit={handleEditSubmit}
              onCancel={() => setEditStudentId(null)}
              isLoading={updateMutation.isPending}
              initialData={studentToEdit}
            />
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, studentId: null })}
          onConfirm={handleDeleteConfirm}
          title="Supprimer l'étudiant"
          message="Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible."
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
