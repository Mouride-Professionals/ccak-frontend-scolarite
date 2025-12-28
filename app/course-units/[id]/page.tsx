"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { useCourseUnit, useDeleteCourseUnit } from "@/hooks/use-course-units";

export const dynamic = 'force-dynamic';

export default function CourseUnitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseUnitId = params.id as string;

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
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
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">{courseUnit.name}</h1>
                <p className="mt-1 text-sm text-zinc-600">
                  Détails de l'unité d'enseignement
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/course-units"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Retour à la liste
                </Link>
                <Link
                  href={`/course-units?edit=${courseUnit.id}`}
                  className="rounded-lg bg-[#00365F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#002244]"
                >
                  Modifier
                </Link>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Informations générales */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">
                Informations générales
              </h2>
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
                  <dd className="mt-1 text-sm text-zinc-900">
                    {courseUnit.credits} crédits
                  </dd>
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
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">
                Programme Académique
              </h2>
              {courseUnit.academicProgram ? (
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-zinc-500">Nom du programme</dt>
                    <dd className="mt-1 text-sm text-zinc-900">{courseUnit.academicProgram.name}</dd>
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
          </div>

          {/* Dates */}
          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">
              Informations temporelles
            </h2>
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