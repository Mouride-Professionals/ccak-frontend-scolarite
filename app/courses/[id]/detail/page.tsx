"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { useCourse, useDeleteCourse } from "@/hooks/use-courses";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

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

  const { data: course, isLoading, error } = useCourse(courseId);
  const deleteMutation = useDeleteCourse();

  // Redirect if error
  useEffect(() => {
    if (error) {
      setToast({
        isOpen: true,
        message: "Cours introuvable",
        type: "error",
      });
      setTimeout(() => {
        router.push("/courses");
      }, 2000);
    }
  }, [error, router]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(courseId);
      setToast({
        isOpen: true,
        message: "Cours supprimé avec succès",
        type: "success",
      });
      setTimeout(() => {
        router.push("/courses");
      }, 1500);
    } catch (error) {
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Détails du Cours">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement du cours...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Détails du Cours">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">{course.name}</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {course.created_at
                  ? `Cours créé le ${new Date(course.created_at).toLocaleDateString("fr-FR")}`
                  : "Cours"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/courses/${course.id}`}
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Code du cours</p>
                  <p className="mt-1 text-sm text-zinc-900">{course.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Nom du cours</p>
                  <p className="mt-1 text-sm text-zinc-900">{course.name}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-zinc-500">Description</p>
                  <p className="mt-1 text-sm text-zinc-900">
                    {course.description || "Aucune description"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Crédits</p>
                  <p className="mt-1 text-sm text-zinc-900">{course.credits} crédits</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Coefficient</p>
                  <p className="mt-1 text-sm text-zinc-900">{course.coefficient}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Statut</p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        course.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {course.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Heures d'enseignement */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                Heures d'enseignement
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Cours magistral (CM)</p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900">{course.hours_lecture}h</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Travaux dirigés (TD)</p>
                  <p className="mt-1 text-2xl font-bold text-[#00365F]">{course.hours_td}h</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Travaux pratiques (TP)</p>
                  <p className="mt-1 text-2xl font-bold text-[#008D36]">{course.hours_tp}h</p>
                </div>
              </div>
            </div>

            {/* Prérequis */}
            {course.prerequisites && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6">
                <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                  Prérequis
                </h3>
                <p className="text-sm text-zinc-900">{course.prerequisites}</p>
              </div>
            )}

            {/* Informations temporelles */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                Informations temporelles
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Date de création</p>
                  <p className="mt-1 text-sm text-zinc-900">
                    {course.created_at
                      ? new Date(course.created_at).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Non disponible"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Dernière modification</p>
                  <p className="mt-1 text-sm text-zinc-900">
                    {course.updated_at
                      ? new Date(course.updated_at).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Non disponible"}
                  </p>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-start">
              <Link
                href="/courses"
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

          {/* Delete Confirmation */}
          <ConfirmDialog
            isOpen={deleteConfirm}
            onClose={() => setDeleteConfirm(false)}
            onConfirm={handleDelete}
            title="Supprimer le cours"
            message={`Êtes-vous sûr de vouloir supprimer le cours "${course.name}" ? Cette action est irréversible.`}
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
