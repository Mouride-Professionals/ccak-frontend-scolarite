"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DepartmentsTable from "@/components/departments/departments-table";
import { DepartmentForm } from "@/components/departments/department-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import {
  useDepartments,
  useDepartment,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/hooks/use-departments";
import { useFaculties } from "@/hooks/use-faculties";
import type {
  Department,
  DepartmentFilters,
  CreateDepartmentInput,
} from "@/types/department";

export default function DepartmentsPage() {
  const [filters, setFilters] = useState<DepartmentFilters>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editDepartmentId, setEditDepartmentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
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
  const { data: departmentToEdit } = useDepartment(
    editDepartmentId || "",
    !!editDepartmentId
  );
  const { data: facultiesData } = useFaculties();
  const deleteMutation = useDeleteDepartment();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const departments = data?.data || [];
  const faculties = facultiesData?.data || [];

  const handleCreateSubmit = (input: CreateDepartmentInput) => {
    createMutation.mutate(input, {
      onSuccess: () => {
        setToast({
          isOpen: true,
          message: "Département créé avec succès",
          type: "success",
        });
        setIsCreateModalOpen(false);
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

  const handleEditSubmit = (input: CreateDepartmentInput) => {
    if (!editDepartmentId) return;
    updateMutation.mutate(
      { id: editDepartmentId, input },
      {
        onSuccess: () => {
          setToast({
            isOpen: true,
            message: "Département mis à jour avec succès",
            type: "success",
          });
          setEditDepartmentId(null);
        },
        onError: (error) => {
          setToast({
            isOpen: true,
            message: `Erreur : ${error.message}`,
            type: "error",
          });
        },
      }
    );
  };

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
          {/* Header aligned with other pages */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un département..."
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtres
                {(facultyFilter || statusFilter) && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#008D36] text-xs font-semibold text-white">
                    {[facultyFilter, statusFilter].filter((v) => v !== undefined && v !== "").length}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau Département
            </button>
          </div>

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
                    Faculté
                  </label>
                  <select
                    id="faculty"
                    value={facultyFilter}
                    onChange={(e) => setFacultyFilter(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  >
                    <option value="">Toutes les facultés</option>
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
                <p className="text-sm text-zinc-500">
                  Chargement des départements...
                </p>
              </div>
            ) : (
              <DepartmentsTable
                departments={departments}
                onEdit={(id) => {
                  setIsCreateModalOpen(false);
                  setEditDepartmentId(id);
                }}
                onDelete={(id) =>
                  setDeleteConfirm({ isOpen: true, departmentId: id })
                }
              />
            )}
          </div>

          {/* Create Modal */}
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Créer un Nouveau Département"
          >
            <DepartmentForm
              onSuccess={() => setIsCreateModalOpen(false)}
              department={undefined}
            />
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
            onClose={() =>
              setDeleteConfirm({ isOpen: false, departmentId: null })
            }
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
