"use client";

import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import EnrollmentStatusBadge from "@/components/enrollments/enrollment-status-badge";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { useEnrollment, useDeleteEnrollment } from "@/hooks/use-enrollments";

export default function EnrollmentDetailPage() {
  const router = useRouter();
  const params = useSafeParams<{ id: string }>();
  const enrollmentId = params.id as string;

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

  const { data: enrollment, isLoading, error } = useEnrollment(enrollmentId);
  const deleteMutation = useDeleteEnrollment();

  // Redirect if error
  useEffect(() => {
    if (error) {
      setToast({
        isOpen: true,
        message: "Inscription introuvable",
        type: "error",
      });
      setTimeout(() => {
        router.push("/enrollments");
      }, 2000);
    }
  }, [error, router]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(enrollmentId);
      setToast({
        isOpen: true,
        message: "Inscription supprimée avec succès",
        type: "success",
      });
      setTimeout(() => {
        router.push("/enrollments");
      }, 1500);
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression de l'inscription",
        type: "error",
      });
      setDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Détails de l'Inscription">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement de l'inscription...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!enrollment) {
    return null;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Détails de l'Inscription">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">
              Inscription - {enrollment.student?.full_name}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              N° Étudiant: {enrollment.student?.student_number}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/enrollments/${enrollmentId}/edit`}
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
          {/* Enrollment Info */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Informations générales
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500">Statut</p>
                <div className="mt-1">
                  <EnrollmentStatusBadge status={enrollment.status} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Date d'inscription</p>
                <p className="mt-1 text-sm text-zinc-900">
                  {new Date(enrollment.enrollment_date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Semestre actuel</p>
                <p className="mt-1">
                  <span className="inline-flex items-center rounded-md bg-[#00365F]/10 px-2.5 py-1 text-xs font-medium text-[#00365F]">
                    Semestre {enrollment.current_semester}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Type d'inscription</p>
                <p className="mt-1 text-sm text-zinc-900">
                  {enrollment.is_scholarship ? (
                    <span className="inline-flex items-center gap-1">
                      <span>Étudiant boursier</span>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Bourse
                      </span>
                    </span>
                  ) : (
                    "Étudiant non boursier"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Informations financières
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500">Frais d'inscription payés</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">
                  {enrollment.registration_fee_paid.toLocaleString("fr-FR")}{" "}
                  <span className="text-base font-normal">FCFA</span>
                </p>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Programme académique
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-zinc-500">Programme</p>
                <p className="mt-1 text-sm text-zinc-900">
                  {enrollment.academic_program?.name}
                  <span className="ml-2 text-xs text-zinc-500">
                    ({enrollment.academic_program?.level})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Année académique</p>
                <p className="mt-1 text-sm text-zinc-900">
                  {enrollment.academic_year?.name}
                  {enrollment.academic_year?.is_current && (
                    <span className="ml-2 text-xs text-[#008D36]">(Actuelle)</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Informations de l'étudiant
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500">Numéro étudiant</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {enrollment.student?.student_number}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Nom complet</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {enrollment.student?.full_name}
                </p>
              </div>
              {enrollment.student?.gender && (
                <div>
                  <p className="text-sm font-medium text-zinc-500">Genre</p>
                  <p className="mt-1 text-sm text-zinc-900">
                    {enrollment.student.gender === "M" ? "Masculin" : "Féminin"}
                  </p>
                </div>
              )}
              {enrollment.student?.date_of_birth && (
                <div>
                  <p className="text-sm font-medium text-zinc-500">Date de naissance</p>
                  <p className="mt-1 text-sm text-zinc-900">
                    {new Date(enrollment.student.date_of_birth).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {enrollment.student?.place_of_birth && (
                <div>
                  <p className="text-sm font-medium text-zinc-500">Lieu de naissance</p>
                  <p className="mt-1 text-sm text-zinc-900">{enrollment.student.place_of_birth}</p>
                </div>
              )}
              {enrollment.student?.nationality && (
                <div>
                  <p className="text-sm font-medium text-zinc-500">Nationalité</p>
                  <p className="mt-1 text-sm text-zinc-900">{enrollment.student.nationality}</p>
                </div>
              )}
              {enrollment.student?.phone && (
                <div>
                  <p className="text-sm font-medium text-zinc-500">Téléphone</p>
                  <p className="mt-1 text-sm text-zinc-900">{enrollment.student.phone}</p>
                </div>
              )}
              {enrollment.student?.address && (
                <div>
                  <p className="text-sm font-medium text-zinc-500">Adresse</p>
                  <p className="mt-1 text-sm text-zinc-900">{enrollment.student.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {(enrollment.student?.emergency_contact_name ||
            enrollment.student?.emergency_contact_phone) && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                Contact d'urgence
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {enrollment.student.emergency_contact_name && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Nom du contact</p>
                    <p className="mt-1 text-sm text-zinc-900">
                      {enrollment.student.emergency_contact_name}
                    </p>
                  </div>
                )}
                {enrollment.student.emergency_contact_phone && (
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Téléphone du contact</p>
                    <p className="mt-1 text-sm text-zinc-900">
                      {enrollment.student.emergency_contact_phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-start">
            <Link
              href="/enrollments"
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
          title="Supprimer l'inscription"
          message="Êtes-vous sûr de vouloir supprimer cette inscription ? Cette action est irréversible."
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
