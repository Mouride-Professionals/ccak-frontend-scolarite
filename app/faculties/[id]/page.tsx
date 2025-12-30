"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { useFaculty, useDeleteFaculty } from "@/hooks/use-faculties";

export default function FacultyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const facultyId = params.id as string;

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const { data: faculty, isLoading, error } = useFaculty(facultyId);
  const deleteMutation = useDeleteFaculty();

  useEffect(() => {
    if (error) {
      setToast({
        isOpen: true,
        message: "Faculté introuvable",
        type: "error",
      });
      const timeout = setTimeout(() => {
        router.push("/faculties");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [error, router]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(facultyId);
      setToast({
        isOpen: true,
        message: "Faculté supprimée avec succès",
        type: "success",
      });
      setTimeout(() => {
        router.push("/faculties");
      }, 1500);
    } catch (err) {
      console.error("Error deleting faculty:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression",
        type: "error",
      });
      setDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Détails de la Faculté">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement de la faculté...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!faculty) return null;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Détails de la Faculté">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">{faculty.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Créée le {new Date(faculty.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/faculties"
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Retour
            </Link>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Supprimer
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Informations générales
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500">Code</p>
                <p className="mt-1 text-sm text-zinc-900">{faculty.code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Statut</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${faculty.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {faculty.is_active ? "Actif" : "Inactif"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Doyen</p>
                <p className="mt-1 text-sm text-zinc-900">{faculty.dean?.name || "Non assigné"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Identifiant</p>
                <p className="mt-1 text-sm text-zinc-900">{faculty.id}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Métadonnées
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500">Créée le</p>
                <p className="mt-1 text-sm text-zinc-900">
                  {new Date(faculty.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Mise à jour le</p>
                <p className="mt-1 text-sm text-zinc-900">
                  {new Date(faculty.updated_at).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={deleteConfirm}
          onClose={() => setDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Supprimer la Faculté"
          message="Êtes-vous sûr de vouloir supprimer cette faculté ? Cette action est irréversible."
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

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
