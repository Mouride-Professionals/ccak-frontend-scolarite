"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import GradesTable from "@/components/grades/grades-table";
import GradeForm from "@/components/grades/grade-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import {
  useGrades,
  useGrade,
  useDeleteGrade,
  useCreateGrade,
  useUpdateGrade,
  useStudents,
  useCourses,
  useEvaluationTypes,
} from "@/hooks/use-grades";
import type { GradeFilters, CreateGradeInput, Grade } from "@/types/grade";
import { GradeStatus } from "@/types/grade";

export default function GradesPage() {
  const [filters, setFilters] = useState<GradeFilters>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editGrade, setEditGrade] = useState<Grade | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; grade: Grade | null }>({
    isOpen: false,
    grade: null,
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

  const { data, isLoading, error } = useGrades(filters);
  const deleteMutation = useDeleteGrade();
  const createMutation = useCreateGrade();
  const updateMutation = useUpdateGrade();

  // Load form data
  const { data: students, isLoading: loadingStudents } = useStudents();
  const { data: courses, isLoading: loadingCourses } = useCourses();
  const { data: evaluationTypes, isLoading: loadingTypes } = useEvaluationTypes();

  const handleCreateSubmit = async (data: CreateGradeInput) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      setToast({
        isOpen: true,
        message: "Note créée avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error creating grade:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la création de la note",
        type: "error",
      });
    }
  };

  const handleEditClick = (grade: Grade) => {
    setEditGrade(grade);
  };

  const handleEditSubmit = async (data: CreateGradeInput) => {
    if (!editGrade) return;

    try {
      await updateMutation.mutateAsync({
        id: editGrade.id,
        input: data,
      });
      setEditGrade(null);
      setToast({
        isOpen: true,
        message: "Note modifiée avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error updating grade:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la modification de la note",
        type: "error",
      });
    }
  };

  const handleDeleteClick = (grade: Grade) => {
    setDeleteConfirm({ isOpen: true, grade });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.grade) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirm.grade.id);
      setDeleteConfirm({ isOpen: false, grade: null });
      setToast({
        isOpen: true,
        message: "Note supprimée avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error deleting grade:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression de la note",
        type: "error",
      });
    }
  };

  const handleFilterChange = (key: keyof GradeFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
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
      <DashboardLayout title="Gestion des Notes">
        <ListHeader
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          searchPlaceholder="Rechercher une note..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={
            [filters.status, filters.course_id, filters.student_id].filter(Boolean).length
          }
          actionLabel="Nouvelle Note"
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  <option value={GradeStatus.VALIDATED}>Validée</option>
                  <option value={GradeStatus.SUBMITTED}>Soumise</option>
                  <option value={GradeStatus.PUBLISHED}>Publiée</option>
                  <option value={GradeStatus.DRAFT}>Brouillon</option>
                </select>
              </div>

              {/* Course Filter */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-zinc-700 mb-2">
                  Cours
                </label>
                <select
                  id="course"
                  value={filters.course_id ?? ""}
                  onChange={(e) => handleFilterChange("course_id", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les cours</option>
                  {Array.isArray(courses) &&
                    courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Student Filter */}
              <div>
                <label htmlFor="student" className="block text-sm font-medium text-zinc-700 mb-2">
                  Étudiant
                </label>
                <select
                  id="student"
                  value={filters.student_id ?? ""}
                  onChange={(e) => handleFilterChange("student_id", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les étudiants</option>
                  {Array.isArray(students) &&
                    students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name}
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
              Erreur lors du chargement des notes. Veuillez réessayer.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement des notes...</p>
            </div>
          </div>
        ) : (
          <>
            <GradesTable
              grades={data?.data ?? []}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />

            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.total_pages ?? 1}
              totalItems={data?.total ?? 0}
              perPage={data?.limit ?? filters.limit ?? 10}
              itemLabel="notes"
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
          title="Nouvelle Note"
          subtitle="Formulaire de saisie de note"
          size="lg"
        >
          {loadingStudents || loadingCourses || loadingTypes ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500">Chargement des données...</p>
              </div>
            </div>
          ) : (
            <GradeForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
              students={Array.isArray(students) ? students : []}
              courses={Array.isArray(courses) ? courses : []}
              evaluationTypes={Array.isArray(evaluationTypes) ? evaluationTypes : []}
              isLoading={createMutation.isPending}
            />
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editGrade}
          onClose={() => setEditGrade(null)}
          title="Modifier Note"
          subtitle="Formulaire de modification de note"
          size="lg"
        >
          {loadingStudents || loadingCourses || loadingTypes || !editGrade ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500">Chargement des données...</p>
              </div>
            </div>
          ) : (
            <GradeForm
              onSubmit={handleEditSubmit}
              onCancel={() => setEditGrade(null)}
              students={Array.isArray(students) ? students : []}
              courses={Array.isArray(courses) ? courses : []}
              evaluationTypes={Array.isArray(evaluationTypes) ? evaluationTypes : []}
              isLoading={updateMutation.isPending}
              initialData={{
                student_id: editGrade.student_id,
                course_id: editGrade.course_id,
                type: editGrade.type,
                score: editGrade.score,
                max_score: editGrade.max_score,
                weight: editGrade.weight,
                status: editGrade.status,
              }}
            />
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, grade: null })}
          onConfirm={handleDeleteConfirm}
          title="Supprimer la note"
          message="Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible."
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
