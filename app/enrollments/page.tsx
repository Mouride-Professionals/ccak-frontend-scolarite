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
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import { useEnrollmentDashboard } from "@/hooks/use-enrollment-dashboard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
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
import type {
  EnrollmentFilters,
  CreateEnrollmentInput,
  UpdateEnrollmentInput,
} from "@/types/enrollment";
import { RegistrationStatus } from "@/types/enrollment";

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
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    enrollmentId: string | null;
  }>({
    isOpen: false,
    enrollmentId: null,
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

  const { data, isLoading, error } = useEnrollments(filters);
  const { data: dashboardData, isLoading: loadingDashboard } = useEnrollmentDashboard();
  const deleteMutation = useDeleteEnrollment();
  const createMutation = useCreateEnrollment();
  const updateMutation = useUpdateEnrollment();

  // Load academic years for filters
  const { data: years } = useAcademicYears();

  // Load form data
  const { data: programs, isLoading: loadingPrograms } = useAcademicPrograms();
  const { data: students, isLoading: loadingStudents } = useStudents();

  // Load enrollment being edited
  const { data: editingEnrollment, isLoading: loadingEditEnrollment } = useEnrollment(
    editingEnrollmentId || "",
    !!editingEnrollmentId
  );

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

  const handleEditSubmit = async (data: UpdateEnrollmentInput) => {
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
        <ListHeader
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          searchPlaceholder="Rechercher un enrollement..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={
            [
              filters.status,
              filters.current_semester,
              filters.academic_year_id,
              filters.academic_program_id,
            ].filter(Boolean).length
          }
          actionLabel="Nouvel Enrollement"
          onAction={() => setIsCreateModalOpen(true)}
        />

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Total inscriptions</p>
            <p className="mt-2 text-2xl font-semibold text-[#00365F]">
              {loadingDashboard ? "..." : (dashboardData?.kpis.total_enrollments ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Actives</p>
            <p className="mt-2 text-2xl font-semibold text-[#0A8F3D]">
              {loadingDashboard ? "..." : (dashboardData?.kpis.active_enrollments ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-zinc-500">En attente</p>
            <p className="mt-2 text-2xl font-semibold text-amber-600">
              {loadingDashboard ? "..." : (dashboardData?.kpis.pending_enrollments ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Terminées</p>
            <p className="mt-2 text-2xl font-semibold text-[#083B66]">
              {loadingDashboard ? "..." : (dashboardData?.kpis.completed_enrollments ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Retirées</p>
            <p className="mt-2 text-2xl font-semibold text-[#E11D48]">
              {loadingDashboard ? "..." : (dashboardData?.kpis.withdrawn_enrollments ?? 0)}
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm xl:col-span-2">
            <h3 className="text-sm font-semibold text-[#00365F]">Évolution des inscriptions</h3>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData?.trend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#083B66"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#083B66" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#00365F]">Répartition programmes</h3>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData?.program_distribution ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0A8F3D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#00365F]">Activités récentes</h3>
          {loadingDashboard ? (
            <p className="mt-3 text-sm text-zinc-500">Chargement des activités...</p>
          ) : !dashboardData || dashboardData.recent_enrollments.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Aucune activité récente.</p>
          ) : (
            <div className="mt-3 divide-y divide-zinc-100">
              {dashboardData.recent_enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {enrollment.student?.full_name ?? "Étudiant"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {enrollment.academic_program?.name ?? "Programme"} - semestre{" "}
                      {enrollment.current_semester}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {new Date(enrollment.enrollment_date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          )}
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
                  <option value={RegistrationStatus.DRAFT}>Brouillon</option>
                  <option value={RegistrationStatus.PENDING_VALIDATION}>En attente de validation</option>
                  <option value={RegistrationStatus.VALIDATED}>Validée</option>
                  <option value={RegistrationStatus.SUSPENDED}>Suspendue</option>
                  <option value={RegistrationStatus.CANCELLED}>Annulée</option>
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
              Erreur lors du chargement des enrollements. Veuillez réessayer.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement des enrollements...</p>
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

            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.total_pages ?? 1}
              totalItems={data?.total ?? 0}
              perPage={data?.limit ?? filters.limit ?? 10}
              itemLabel="enrollements"
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
          title="Nouvel Enrollement"
          subtitle="Formulaire de création d'enrollement"
          size="lg"
        >
          {loadingPrograms || loadingStudents ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500">Chargement des données...</p>
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
                <p className="mt-3 text-sm text-zinc-500">Chargement des données...</p>
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
