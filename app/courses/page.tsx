"use client";

import { useState, Suspense } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CourseTable from "@/components/courses/course-table";
import CourseForm from "@/components/courses/course-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import {
  useCourses,
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useCourseUnits,
} from "@/hooks/use-courses";
import type { CreateCourseInput, CourseFilters } from "@/types/course";

function CoursesPageContent() {
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 10,
  });
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    courseId: string | null;
  }>({
    isOpen: false,
    courseId: null,
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

  // Data queries
  const { data, isLoading, error } = useCourses(filters);
  const { data: allCoursesData } = useCourses({ page: 1, limit: 200 });
  const { data: courseToEdit } = useCourse(editCourseId || "");
  const deleteMutation = useDeleteCourse();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

  // Load form data
  const { data: courseUnits, isLoading: loadingCourseUnits } = useCourseUnits();
  const courseUnitOptions = courseUnits?.data ?? [];

  // Handlers
  const handleEditClick = (id: string) => {
    setEditCourseId(id);
  };

  const handleCreateSubmit = async (data: CreateCourseInput) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      setToast({
        isOpen: true,
        message: "Cours créé avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error creating course:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la création du cours",
        type: "error",
      });
    }
  };

  const handleEditSubmit = async (data: CreateCourseInput) => {
    if (!editCourseId) return;

    try {
      await updateMutation.mutateAsync({
        ...data,
        id: editCourseId,
      });
      setEditCourseId(null);
      setToast({
        isOpen: true,
        message: "Cours modifié avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error updating course:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la modification du cours",
        type: "error",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, courseId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.courseId) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirm.courseId);
      setDeleteConfirm({ isOpen: false, courseId: null });
      setToast({
        isOpen: true,
        message: "Cours supprimé avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error deleting course:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression du cours",
        type: "error",
      });
    }
  };

  const handleFilterChange = (key: keyof CourseFilters, value: string | boolean) => {
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
      <DashboardLayout title="Gestion des Cours">
        <ListHeader
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          searchPlaceholder="Rechercher un cours..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={
            [filters.course_unit_id, filters.is_active !== undefined ? "active" : ""].filter(
              Boolean
            ).length
          }
          actionLabel="Nouveau Cours"
          onAction={() => setIsCreateModalOpen(true)}
        />

        <div className="mb-4 flex justify-end">
          <div className="inline-flex rounded-lg border border-zinc-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                viewMode === "table" ? "bg-[#00365F] text-white" : "text-zinc-600"
              }`}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                viewMode === "grid" ? "bg-[#00365F] text-white" : "text-zinc-600"
              }`}
            >
              Grille
            </button>
          </div>
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Course Unit Filter */}
              <div>
                <label
                  htmlFor="courseUnit"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Unité d&apos;Enseignement
                </label>
                <select
                  id="courseUnit"
                  value={filters.course_unit_id ?? ""}
                  onChange={(e) => handleFilterChange("course_unit_id", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Toutes les unités</option>
                  {courseUnitOptions.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
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
              Erreur lors du chargement des cours. Veuillez réessayer.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement des cours...</p>
            </div>
          </div>
        ) : (
          <>
            <CourseTable
              courses={data?.data ?? []}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              viewMode={viewMode}
            />

            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.total_pages ?? 1}
              totalItems={data?.total ?? 0}
              perPage={data?.limit ?? filters.limit ?? 10}
              itemLabel="cours"
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
          title="Nouveau Cours"
          subtitle="Formulaire de création de cours"
          size="lg"
        >
          {loadingCourseUnits ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : (
            <CourseForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
              courseUnits={courseUnitOptions}
              availableCourses={allCoursesData?.data ?? []}
              isLoading={createMutation.isPending}
            />
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editCourseId}
          onClose={() => setEditCourseId(null)}
          title="Modifier Cours"
          subtitle="Formulaire de modification de cours"
          size="lg"
        >
          {loadingCourseUnits || !courseToEdit ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : (
            <CourseForm
              onSubmit={handleEditSubmit}
              onCancel={() => setEditCourseId(null)}
              courseUnits={courseUnitOptions}
              availableCourses={allCoursesData?.data ?? []}
              isLoading={updateMutation.isPending}
              initialData={courseToEdit}
            />
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, courseId: null })}
          onConfirm={handleDeleteConfirm}
          title="Supprimer le cours"
          message="Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible."
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

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute>
          <DashboardLayout title="Gestion des Cours">
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
      <CoursesPageContent />
    </Suspense>
  );
}
