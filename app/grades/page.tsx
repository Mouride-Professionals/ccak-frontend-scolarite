"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import GradesTable from "@/components/grades/grades-table";
import GradeForm from "@/components/grades/grade-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
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
                placeholder="Rechercher une note..."
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
              {(filters.status || filters.course_id || filters.student_id) && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#008D36] text-xs font-semibold text-white">
                  {[filters.status, filters.course_id, filters.student_id].filter(Boolean).length}
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
            Nouvelle Note
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
                  <option value="validated">Validée</option>
                  <option value="pending">En attente</option>
                  <option value="draft">Brouillon</option>
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

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4">
              <p className="text-sm text-zinc-500">
                Affichage de {data ? (data.page - 1) * data.limit + 1 : 0} sur {data?.total ?? 0}{" "}
                notes
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
