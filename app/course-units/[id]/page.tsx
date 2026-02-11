"use client";

import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { useCourseUnit, useDeleteCourseUnit } from "@/hooks/use-course-units";

export const dynamic = "force-dynamic";

export default function CourseUnitDetailPage() {
  const router = useRouter();
  const params = useSafeParams<{ id: string }>();
  const courseUnitId = params.id as string;

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const { data: courseUnit, isLoading, error } = useCourseUnit(courseUnitId);
  const deleteMutation = useDeleteCourseUnit();

  // Redirect if error
  useEffect(() => {
    if (error) {
      setToast({
        isOpen: true,
        message: "Unité d'enseignement introuvable",
        type: "error",
      });
      setTimeout(() => {
        router.push("/course-units");
      }, 2000);
    }
  }, [error, router]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(courseUnitId);
      setToast({
        isOpen: true,
        message: "Unité d'enseignement supprimée avec succès",
        type: "success",
      });
      setTimeout(() => {
        router.push("/course-units");
      }, 1500);
    } catch (error) {
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression",
        type: "error",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "OBLIGATOIRE":
        return "Obligatoire";
      case "OPTIONNEL":
        return "Optionnel";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Unité d'Enseignement">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#00365F] border-t-transparent"></div>
              <p className="mt-4 text-sm text-zinc-600">Chargement de l'unité d'enseignement...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!courseUnit) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Unité d'Enseignement">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-zinc-600">Unité d'enseignement introuvable</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Unité d'Enseignement">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">{courseUnit.name}</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Unité créée le {new Date(courseUnit.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/course-units?edit=${courseUnit.id}`}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Modifier
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

          {/* Content */}
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                Informations générales
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Code</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{courseUnit.code}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Nom</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{courseUnit.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Semestre</dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    Semestre {courseUnit.semesterNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Crédits</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{courseUnit.credits} crédits</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Type</dt>
                  <dd className="mt-1">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {getTypeLabel(courseUnit.type)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Statut</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        courseUnit.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {courseUnit.isActive ? "Actif" : "Inactif"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Programme académique */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                Programme Académique
              </h3>
              {courseUnit.academicProgram ? (
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-zinc-500">Nom du programme</dt>
                    <dd className="mt-1 text-sm text-zinc-900">
                      {courseUnit.academicProgram.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-zinc-500">ID</dt>
                    <dd className="mt-1 text-sm text-zinc-900">{courseUnit.academicProgram.id}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-zinc-500">Aucun programme associé</p>
              )}
            </div>

            {/* Dates */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                Informations temporelles
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Date de création</dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {new Date(courseUnit.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Dernière modification</dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {new Date(courseUnit.updatedAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-start">
              <Link
                href="/course-units"
                className="flex items-center gap-2 text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Retour à la liste
              </Link>
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={deleteConfirm}
          title="Supprimer l'unité d'enseignement"
          message={`Êtes-vous sûr de vouloir supprimer l'unité d'enseignement "${courseUnit.name}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          onConfirm={handleDelete}
          onClose={() => setDeleteConfirm(false)}
          variant="danger"
        />

        {/* Toast */}
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
