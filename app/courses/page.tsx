'use client';

import { useState, Suspense } from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';
import CourseTable from '@/components/courses/course-table';
import CourseForm from '@/components/courses/course-form';
import Modal from '@/components/ui/modal';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Toast from '@/components/ui/toast';
import {
  useCourses,
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useCourseUnits,
} from '@/hooks/use-courses';
import type { CreateCourseInput, CourseFilters } from '@/types/course';

function CoursesPageContent() {
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Data queries
  const { data, isLoading, error } = useCourses(filters);
  const { data: courseToEdit } = useCourse(editCourseId || '');
  const deleteMutation = useDeleteCourse();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

  // Load form data
  const { data: courseUnits, isLoading: loadingCourseUnits } =
    useCourseUnits();

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
        message: 'Cours créé avec succès',
        type: 'success',
      });
    } catch (err) {
      console.error('Error creating course:', err);
      setToast({
        isOpen: true,
        message: 'Erreur lors de la création du cours',
        type: 'error',
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
        message: 'Cours modifié avec succès',
        type: 'success',
      });
    } catch (err) {
      console.error('Error updating course:', err);
      setToast({
        isOpen: true,
        message: 'Erreur lors de la modification du cours',
        type: 'error',
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
        message: 'Cours supprimé avec succès',
        type: 'success',
      });
    } catch (err) {
      console.error('Error deleting course:', err);
      setToast({
        isOpen: true,
        message: 'Erreur lors de la suppression du cours',
        type: 'error',
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
    setSearchQuery('');
    setFilters({ page: 1, limit: 10 });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Gestion des Cours">
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
                placeholder="Rechercher un cours..."
                className="block w-80 rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                showFilters
                  ? 'border-[#008D36] bg-[#008D36]/10 text-[#008D36]'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtres
              {filters.course_unit_id || filters.is_active !== undefined ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#008D36] text-xs font-semibold text-white">
                  {[filters.course_unit_id, filters.is_active].filter(Boolean)
                    .length}
                </span>
              ) : null}
            </button>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouveau Cours
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#00365F]">
                Filtres avancés
              </h3>
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
                  Unité d'Enseignement
                </label>
                <select
                  id="courseUnit"
                  value={filters.course_unit_id ?? ''}
                  onChange={(e) =>
                    handleFilterChange('course_unit_id', e.target.value)
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Toutes les unités</option>
                  {Array.isArray(courseUnits) &&
                    courseUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
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
                  value={filters.is_active?.toString() ?? ''}
                  onChange={(e) =>
                    handleFilterChange('is_active', e.target.value === 'true')
                  }
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
              <p className="mt-3 text-sm text-zinc-500">
                Chargement des cours...
              </p>
            </div>
          </div>
        ) : (
          <>
            <CourseTable
              courses={data?.data ?? []}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4">
              <p className="text-sm text-zinc-500">
                Affichage de{' '}
                {data
                  ? (data.page - 1) * data.limit + 1
                  : 0}{' '}
                sur {data?.total ?? 0} cours
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page ?? 1) - 1,
                    }))
                  }
                  disabled={!data || data.page === 1}
                  className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Précédent
                </button>
                <button className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                  {data?.page ?? 1}
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page ?? 1) + 1,
                    }))
                  }
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
              courseUnits={Array.isArray(courseUnits) ? courseUnits : []}
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
              courseUnits={Array.isArray(courseUnits) ? courseUnits : []}
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
