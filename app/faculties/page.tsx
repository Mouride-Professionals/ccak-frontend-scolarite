"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import FacultiesTable from "@/components/faculties/faculties-table";
import { FacultyForm } from "@/components/faculties/faculty-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import {
  useFaculties,
  useFaculty,
  useCreateFaculty,
  useUpdateFaculty,
  useDeleteFaculty,
} from "@/hooks/use-faculties";
import type { Faculty, FacultyFilters, CreateFacultyInput } from "@/types/faculty";

export default function FacultiesPage() {
  const [filters, setFilters] = useState<FacultyFilters>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editFacultyId, setEditFacultyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    facultyId: string | null;
  }>({
    isOpen: false,
    facultyId: null,
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

  const { data, isLoading } = useFaculties({
    ...filters,
    search: searchQuery || undefined,
    is_active: statusFilter === "" ? undefined : statusFilter === "true",
  });
  const { data: facultyToEdit } = useFaculty(editFacultyId || "", !!editFacultyId);
  const deleteMutation = useDeleteFaculty();
  const createMutation = useCreateFaculty();
  const updateMutation = useUpdateFaculty();

  const faculties = data?.data || [];

  const handleCreateSubmit = (input: CreateFacultyInput) => {
    createMutation.mutate(input, {
      onSuccess: () => {
        setToast({
          isOpen: true,
          message: "Établissement créé avec succès",
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

  const handleEditSubmit = (input: CreateFacultyInput) => {
    if (!editFacultyId) return;
    updateMutation.mutate(
      { id: editFacultyId, input },
      {
        onSuccess: () => {
          setToast({
            isOpen: true,
            message: "Établissement mis à jour avec succès",
            type: "success",
          });
          setEditFacultyId(null);
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
    if (!deleteConfirm.facultyId) return;
    deleteMutation.mutate(deleteConfirm.facultyId, {
      onSuccess: () => {
        setToast({
          isOpen: true,
          message: "Établissement supprimé avec succès",
          type: "success",
        });
        setDeleteConfirm({ isOpen: false, facultyId: null });
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
      <DashboardLayout title="Établissements">
        <div className="space-y-6">
          <ListHeader
            className="mb-2"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Rechercher un établissement..."
            onToggleFilters={() => setShowFilters(!showFilters)}
            isFiltersOpen={showFilters}
            filtersCount={statusFilter ? 1 : 0}
            actionLabel="Nouvel Établissement"
            onAction={() => setIsCreateModalOpen(true)}
          />

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-4 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#00365F]">Filtres avancés</h3>
                <button
                  onClick={() => {
                    setStatusFilter("");
                  }}
                  className="text-sm text-zinc-500 hover:text-[#008D36] transition-colors"
                >
                  Réinitialiser tout
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
                <p className="text-sm text-zinc-500">Chargement des établissements...</p>
              </div>
            ) : (
              <FacultiesTable
                faculties={faculties}
                onEdit={(id) => {
                  setIsCreateModalOpen(false);
                  setEditFacultyId(id);
                }}
                onDelete={(id) => setDeleteConfirm({ isOpen: true, facultyId: id })}
              />
            )}
          </div>

          <Pagination
            page={data?.page ?? 1}
            totalPages={data?.total_pages ?? 1}
            totalItems={data?.total ?? 0}
            perPage={data?.limit ?? filters.limit ?? 10}
            itemLabel="établissements"
            onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
            onPerPageChange={(nextLimit) =>
              setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
            }
          />

          {/* Create Modal */}
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Créer un Nouvel Établissement"
          >
            <FacultyForm onSuccess={() => setIsCreateModalOpen(false)} faculty={undefined} />
          </Modal>

          {/* Edit Modal */}
          <Modal
            isOpen={!!editFacultyId}
            onClose={() => setEditFacultyId(null)}
            title="Modifier l'Établissement"
          >
            {facultyToEdit ? (
              <FacultyForm onSuccess={() => setEditFacultyId(null)} faculty={facultyToEdit} />
            ) : (
              <p>Chargement...</p>
            )}
          </Modal>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={deleteConfirm.isOpen}
            onClose={() => setDeleteConfirm({ isOpen: false, facultyId: null })}
            onConfirm={handleDeleteConfirm}
            title="Supprimer l'Établissement"
            message={`Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible.`}
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
