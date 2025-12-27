"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { useAcademicProgram, useDeleteAcademicProgram } from "@/hooks/use-academic";
import { AcademicLevel } from "@/types/academic";

export default function ProgrammeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const programmeId = params.id as string;

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">{programme.name}</h1>
                <p className="mt-1 text-sm text-zinc-600">
                  Détails du programme académique
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/programmes"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Retour à la liste
                </Link>
                <Link
                  href={`/programmes?edit=${programme.id}`}
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
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">
                Département
              </h2>
              {programme.department ? (
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-zinc-500">Nom</dt>
                    <dd className="mt-1 text-sm text-zinc-900">{programme.department.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-zinc-500">Code</dt>
                    <dd className="mt-1 text-sm text-zinc-900">{programme.department.code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-zinc-500">Description</dt>
                    <dd className="mt-1 text-sm text-zinc-900">
                      {programme.department?.faculty?.description || "Aucune description"}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-zinc-500">Aucun département associé</p>
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