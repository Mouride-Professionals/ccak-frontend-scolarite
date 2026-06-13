"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DepartmentsTable from "@/components/departments/departments-table";
import { DepartmentForm } from "@/components/departments/department-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import { useDepartments, useDepartment, useDeleteDepartment } from "@/hooks/use-departments";
import { useFaculties } from "@/hooks/use-faculties";
import type { DepartmentFilters } from "@/types/department";

function DepartmentsPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<DepartmentFilters>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editDepartmentId, setEditDepartmentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState<string>(searchParams.get("faculty_id") ?? "");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(!!searchParams.get("faculty_id"));
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    departmentId: string | null;
  }>({
    isOpen: false,
    departmentId: null,
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

  const { data, isLoading } = useDepartments({
    ...filters,
    search: searchQuery || undefined,
    faculty_id: facultyFilter || undefined,
    is_active: statusFilter === "" ? undefined : statusFilter === "true",
  });
  const { data: departmentToEdit } = useDepartment(editDepartmentId || "", !!editDepartmentId);
  const { data: facultiesData } = useFaculties();
  const deleteMutation = useDeleteDepartment();

  const departments = data?.data || [];
  const faculties = facultiesData?.data || [];

  const handleDeleteConfirm = () => {
    if (!deleteConfirm.departmentId) return;
    deleteMutation.mutate(deleteConfirm.departmentId, {
      onSuccess: () => {
        setToast({
          isOpen: true,
          message: "Département supprimé avec succès",
          type: "success",
        });
        setDeleteConfirm({ isOpen: false, departmentId: null });
      },
      onError: (error) => {
        setToast({
          isOpen: true,
          message: `Erreur : ${error.message}`,
          type: "error",
        });
      },
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Départements">
        <div className="space-y-6">
          <ListHeader
            className="mb-2"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Rechercher un département..."
            onToggleFilters={() => setShowFilters(!showFilters)}
            isFiltersOpen={showFilters}
            filtersCount={[facultyFilter, statusFilter].filter(Boolean).length}
            actionLabel="Nouveau Département"
            onAction={() => setIsCreateModalOpen(true)}
          />

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-4 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#00365F]">Filtres avancés</h3>
                <button
                  onClick={() => {
                    setFacultyFilter("");
                    setStatusFilter("");
                  }}
                  className="text-sm text-zinc-500 hover:text-[#008D36] transition-colors"
                >
                  Réinitialiser tout
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Faculty Filter */}
                <div>
                  <label htmlFor="faculty" className="mb-2 block text-sm font-medium text-zinc-700">
                    Établissement
                  </label>
                  <select
                    id="faculty"
                    value={facultyFilter}
                    onChange={(e) => setFacultyFilter(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  >
                    <option value="">Tous les établissements</option>
                    {faculties.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Status Filter */}
                <div>
                  <label htmlFor="status" className="mb-2 block text-sm font-medium text-zinc-700">
                    Statut
                  </label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  >
                    <option value="">Tous</option>
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
                <p className="text-sm text-zinc-500">Chargement des départements...</p>
              </div>
            ) : (
              <DepartmentsTable
                departments={departments}
                onEdit={(id) => {
                  setIsCreateModalOpen(false);
                  setEditDepartmentId(id);
                }}
                onDelete={(id) => setDeleteConfirm({ isOpen: true, departmentId: id })}
              />
            )}
          </div>

          <Pagination
            page={data?.page ?? 1}
            totalPages={data?.total_pages ?? 1}
            totalItems={data?.total ?? 0}
            perPage={data?.limit ?? filters.limit ?? 10}
            itemLabel="départements"
            onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
            onPerPageChange={(nextLimit) =>
              setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
            }
          />

          {/* Create Modal */}
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Créer un Nouveau Département"
          >
            <DepartmentForm onSuccess={() => setIsCreateModalOpen(false)} department={undefined} />
          </Modal>

          {/* Edit Modal */}
          <Modal
            isOpen={!!editDepartmentId}
            onClose={() => setEditDepartmentId(null)}
            title="Modifier le Département"
          >
            {departmentToEdit ? (
              <DepartmentForm
                onSuccess={() => setEditDepartmentId(null)}
                department={departmentToEdit}
              />
            ) : (
              <p>Chargement...</p>
            )}
          </Modal>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={deleteConfirm.isOpen}
            onClose={() => setDeleteConfirm({ isOpen: false, departmentId: null })}
            onConfirm={handleDeleteConfirm}
            title="Supprimer le Département"
            message={`Êtes-vous sûr de vouloir supprimer ce département ? Cette action est irréversible.`}
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function DepartmentsPage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute>
          <DashboardLayout title="Départements">
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
      <DepartmentsPageContent />
    </Suspense>
  );
}
