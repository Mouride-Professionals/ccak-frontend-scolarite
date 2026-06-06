"use client";

import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { useAcademicProgram, useDeleteAcademicProgram } from "@/hooks/use-academic";
import { AcademicLevel } from "@/types/academic";
import HierarchyBreadcrumb from "@/components/ui/hierarchy-breadcrumb";

export default function ProgrammeDetailPage() {
  const router = useRouter();
  const params = useSafeParams<{ id: string }>();
  const programmeId = params.id as string;

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

  const { data: programme, isLoading, error } = useAcademicProgram(programmeId);
  const deleteMutation = useDeleteAcademicProgram();

  // Redirect if error
  useEffect(() => {
    if (error) {
      setToast({
        isOpen: true,
        message: "Programme académique introuvable",
        type: "error",
      });
      setTimeout(() => {
        router.push("/programmes");
      }, 2000);
    }
  }, [error, router]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(programmeId);
      setToast({
        isOpen: true,
        message: "Programme supprimé avec succès",
        type: "success",
      });
      setTimeout(() => {
        router.push("/programmes");
      }, 1500);
    } catch (error) {
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression",
        type: "error",
      });
    }
  };

  const getLevelLabel = (level: AcademicLevel) => {
    switch (level) {
      case AcademicLevel.LICENCE:
        return "Licence";
      case AcademicLevel.MASTER:
        return "Master";
      case AcademicLevel.DOCTORAT:
        return "Doctorat";
      default:
        return level;
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Programme Académique">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#00365F] border-t-transparent"></div>
              <p className="mt-4 text-sm text-zinc-600">Chargement du programme...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!programme) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Programme Académique">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-zinc-600">Programme introuvable</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Programme Académique">
        <div className="mx-auto max-w-4xl">
          <HierarchyBreadcrumb
            items={[
              { label: "Établissements", href: "/faculties" },
              ...(programme.department?.faculty
                ? [
                    {
                      label: programme.department.faculty.name,
                      href: `/faculties/${programme.department.faculty.id}`,
                    },
                  ]
                : []),
              ...(programme.department
                ? [
                    {
                      label: programme.department.name,
                      href: `/departments/${programme.department_id}`,
                    },
                  ]
                : []),
              { label: programme.name },
            ]}
          />
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">{programme.name}</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Programme créé le {new Date(programme.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/course-units?academicProgramId=${programme.id}`}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Voir les UE
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              <Link
                href={`/programmes?edit=${programme.id}`}
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
                  <dt className="text-sm font-medium text-zinc-500">Nom du programme</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{programme.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Niveau</dt>
                  <dd className="mt-1">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {getLevelLabel(programme.level)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Durée</dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {programme.duration_semesters} semestres
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Crédits requis</dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {programme.total_credits_required} crédits
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Statut</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        programme.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {programme.is_active ? "Actif" : "Inactif"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Département */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                Département
              </h3>
              {programme.department ? (
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-zinc-500">Nom</dt>
                    <dd className="mt-1">
                      <Link
                        href={`/departments/${programme.department_id}`}
                        className="text-sm text-[#00365F] hover:underline"
                      >
                        {programme.department.name}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-zinc-500">Code</dt>
                    <dd className="mt-1 text-sm text-zinc-900">{programme.department.code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-zinc-500">Faculté</dt>
                    <dd className="mt-1">
                      {programme.department.faculty ? (
                        <Link
                          href={`/faculties/${programme.department.faculty.id}`}
                          className="text-sm text-[#00365F] hover:underline"
                        >
                          {programme.department.faculty.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-zinc-900">Aucune faculté</span>
                      )}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-zinc-500">Aucun département associé</p>
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
                    {new Date(programme.created_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">Dernière modification</dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {new Date(programme.updated_at).toLocaleDateString("fr-FR", {
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
                href="/programmes"
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
          title="Supprimer le programme"
          message={`Êtes-vous sûr de vouloir supprimer le programme "${programme.name}" ? Cette action est irréversible.`}
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
