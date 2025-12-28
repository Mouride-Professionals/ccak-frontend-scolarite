"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import FacultiesTable from "@/components/faculties/faculties-table";
import { FacultyForm } from "@/components/faculties/faculty-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
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
  const { data: facultyToEdit } = useFaculty(
    editFacultyId || "",
    !!editFacultyId
  );
  const deleteMutation = useDeleteFaculty();
  const createMutation = useCreateFaculty();
  const updateMutation = useUpdateFaculty();

  const faculties = data?.data || [];

  const handleCreateSubmit = (input: CreateFacultyInput) => {
    createMutation.mutate(input, {
      onSuccess: () => {
        setToast({
          isOpen: true,
          message: "Faculté créée avec succès",
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
            message: "Faculté mise à jour avec succès",
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
          message: "Faculté supprimée avec succès",
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
      <DashboardLayout title="Facultés">
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
                  placeholder="Rechercher une faculté..."
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
                {statusFilter && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#008D36] text-xs font-semibold text-white">1</span>
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
              Nouvelle Faculté
            </button>
          </div>

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
                <p className="text-sm text-zinc-500">
                  Chargement des facultés...
                </p>
              </div>
            ) : (
              <FacultiesTable
                faculties={faculties}
                onEdit={(id) => {
                  setIsCreateModalOpen(false);
                  setEditFacultyId(id);
                }}
                onDelete={(id) =>
                  setDeleteConfirm({ isOpen: true, facultyId: id })
                }
              />
            )}
          </div>

          {/* Create Modal */}
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Créer une Nouvelle Faculté"
          >
            <FacultyForm
              onSuccess={() => setIsCreateModalOpen(false)}
              faculty={undefined}
            />
          </Modal>

          {/* Edit Modal */}
          <Modal
            isOpen={!!editFacultyId}
            onClose={() => setEditFacultyId(null)}
            title="Modifier la Faculté"
          >
            {facultyToEdit ? (
              <FacultyForm
                onSuccess={() => setEditFacultyId(null)}
                faculty={facultyToEdit}
              />
            ) : (
              <p>Chargement...</p>
            )}
          </Modal>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={deleteConfirm.isOpen}
            onClose={() =>
              setDeleteConfirm({ isOpen: false, facultyId: null })
            }
            onConfirm={handleDeleteConfirm}
            title="Supprimer la Faculté"
            message={`Êtes-vous sûr de vouloir supprimer cette faculté ? Cette action est irréversible.`}
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
