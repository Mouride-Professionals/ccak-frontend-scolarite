"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import Pagination from "@/components/ui/pagination";
import AcademicYearForm from "@/components/academic-years/academic-year-form";
import AcademicYearsTable from "@/components/academic-years/academic-years-table";
import {
  useAcademicYears,
  useAcademicYear,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
  useCurrentAcademicYear,
  useSetAcademicYearCurrent,
} from "@/hooks/use-academic-years";
import type { AcademicYearFilters, CreateAcademicYearInput } from "@/types/academic-year";

export default function AcademicYearsPage() {
  const [filters, setFilters] = useState<AcademicYearFilters>({
    page: 1,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editAcademicYearId, setEditAcademicYearId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    academicYearId: string | null;
  }>({
    isOpen: false,
    academicYearId: null,
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

  const { data, isLoading } = useAcademicYears(filters);
  const { data: currentAcademicYear } = useCurrentAcademicYear();
  const { data: academicYearToEdit, isLoading: isLoadingAcademicYear } = useAcademicYear(
    editAcademicYearId || "",
    !!editAcademicYearId
  );

  const createMutation = useCreateAcademicYear();
  const updateMutation = useUpdateAcademicYear();
  const deleteMutation = useDeleteAcademicYear();
  const setCurrentMutation = useSetAcademicYearCurrent();

  const academicYears = data?.data ?? [];

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  };

  const handleCreateSubmit = async (input: CreateAcademicYearInput) => {
    try {
      await createMutation.mutateAsync(input);
      setToast({
        isOpen: true,
        message: "Annee academique creee avec succes.",
        type: "success",
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      setToast({
        isOpen: true,
        message: error instanceof Error ? error.message : "Erreur lors de la creation.",
        type: "error",
      });
    }
  };

  const handleEditSubmit = async (input: CreateAcademicYearInput) => {
    if (!editAcademicYearId) return;

    try {
      await updateMutation.mutateAsync({
        id: editAcademicYearId,
        input,
      });
      setToast({
        isOpen: true,
        message: "Annee academique mise a jour avec succes.",
        type: "success",
      });
      setEditAcademicYearId(null);
    } catch (error) {
      setToast({
        isOpen: true,
        message: error instanceof Error ? error.message : "Erreur lors de la mise a jour.",
        type: "error",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.academicYearId) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirm.academicYearId);
      setToast({
        isOpen: true,
        message: "Annee academique supprimee avec succes.",
        type: "success",
      });
      setDeleteConfirm({ isOpen: false, academicYearId: null });
    } catch (error) {
      setToast({
        isOpen: true,
        message: error instanceof Error ? error.message : "Erreur lors de la suppression.",
        type: "error",
      });
    }
  };

  const handleSetCurrent = async (id: string) => {
    try {
      setActionLoadingId(id);
      await setCurrentMutation.mutateAsync(id);
      setToast({
        isOpen: true,
        message: "Annee academique definie comme actuelle.",
        type: "success",
      });
    } catch (error) {
      setToast({
        isOpen: true,
        message:
          error instanceof Error ? error.message : "Erreur lors de la mise a jour du statut.",
        type: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Annees Academiques">
        <div className="space-y-6">
          <ListHeader
            searchValue={searchQuery}
            onSearchChange={handleSearch}
            searchPlaceholder="Rechercher une annee academique..."
            actionLabel="Nouvelle Annee"
            onAction={() => setIsCreateModalOpen(true)}
          />

          {currentAcademicYear ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Annee academique actuelle: <strong>{currentAcademicYear.name}</strong>
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
              <p className="text-sm text-zinc-500">Chargement des annees academiques...</p>
            </div>
          ) : (
            <AcademicYearsTable
              academicYears={academicYears}
              onEdit={(id) => {
                setIsCreateModalOpen(false);
                setEditAcademicYearId(id);
              }}
              onDelete={(id) => setDeleteConfirm({ isOpen: true, academicYearId: id })}
              onSetCurrent={handleSetCurrent}
              actionLoadingId={actionLoadingId}
            />
          )}

          <Pagination
            page={data?.page ?? 1}
            totalPages={data?.total_pages ?? 1}
            totalItems={data?.total ?? 0}
            perPage={data?.limit ?? filters.limit ?? 10}
            itemLabel="annees academiques"
            onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
            onPerPageChange={(nextLimit) =>
              setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
            }
          />

          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Creer une Nouvelle Annee Academique"
          >
            <AcademicYearForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
              isLoading={createMutation.isPending}
            />
          </Modal>

          <Modal
            isOpen={!!editAcademicYearId}
            onClose={() => setEditAcademicYearId(null)}
            title="Modifier l'Annee Academique"
          >
            {isLoadingAcademicYear ? (
              <p className="text-sm text-zinc-500">Chargement...</p>
            ) : (
              <AcademicYearForm
                key={editAcademicYearId ?? "edit"}
                academicYear={academicYearToEdit}
                onSubmit={handleEditSubmit}
                onCancel={() => setEditAcademicYearId(null)}
                isLoading={updateMutation.isPending}
              />
            )}
          </Modal>

          <ConfirmDialog
            isOpen={deleteConfirm.isOpen}
            onClose={() => setDeleteConfirm({ isOpen: false, academicYearId: null })}
            onConfirm={handleDeleteConfirm}
            title="Supprimer l'Annee Academique"
            message="Etes-vous sur de vouloir supprimer cette annee academique ? Cette action est irreversible."
            confirmText="Supprimer"
            cancelText="Annuler"
            variant="danger"
            isLoading={deleteMutation.isPending}
          />

          <Toast
            isOpen={toast.isOpen}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
