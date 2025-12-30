"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DeliberationStatusBadge from "@/components/deliberations/deliberation-status-badge";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import {
  useDeliberationSession,
  useDeleteDeliberationSession,
  useUpdateDeliberationStatus,
} from "@/hooks/use-deliberations";
import { DeliberationStatus } from "@/types/deliberation";

export default function DeliberationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const statusMenuRef = useRef<HTMLDivElement>(null);

  const { data: session, isLoading, error } = useDeliberationSession(sessionId);
  const deleteMutation = useDeleteDeliberationSession();
  const updateStatusMutation = useUpdateDeliberationStatus();

  // Show 404 if error
  useEffect(() => {
    if (error) {
      notFound();
    }
  }, [error]);

  // Close status menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(sessionId);
      setToast({
        isOpen: true,
        message: "Session supprimée avec succès",
        type: "success",
      });
      setTimeout(() => {
        router.push("/deliberations");
      }, 1500);
    } catch (error) {
      console.error("Error deleting session:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression de la session",
        type: "error",
      });
      setDeleteConfirm(false);
    }
  };

  const handleStatusChange = async (newStatus: DeliberationStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: sessionId,
        status: newStatus,
      });
      setShowStatusMenu(false);
      setToast({
        isOpen: true,
        message: "Statut mis à jour avec succès",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la mise à jour du statut",
        type: "error",
      });
    }
  };

  const getStatusLabel = (status: DeliberationStatus) => {
    const labels = {
      [DeliberationStatus.SCHEDULED]: "Programmée",
      [DeliberationStatus.IN_PROGRESS]: "En cours",
      [DeliberationStatus.COMPLETED]: "Terminée",
      [DeliberationStatus.CLOSED]: "Clôturée",
    };
    return labels[status];
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Détails de la Session">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement de la session...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!session && !isLoading) {
    notFound();
  }

  if (!session) {
    return null;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Détails de la Session">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/deliberations"
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

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">{session.session_name}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Session créée le {new Date(session.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Results Button */}
            <Link
              href={`/deliberations/${sessionId}/results`}
              className="flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Saisir les résultats
            </Link>

            {/* Change Status Button */}
            <div className="relative" ref={statusMenuRef}>
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-2 rounded-lg border border-[#008D36] bg-white px-4 py-2 text-sm font-medium text-[#008D36] transition-colors hover:bg-[#008D36]/5"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Changer le statut
              </button>

              {/* Status Dropdown */}
              {showStatusMenu && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg">
                  <div className="border-b border-zinc-200 px-4 py-3">
                    <p className="text-sm font-medium text-zinc-900">Changer le statut</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Statut actuel : {getStatusLabel(session.status)}
                    </p>
                  </div>
                  <div className="py-2">
                    {Object.values(DeliberationStatus).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={status === session.status || updateStatusMutation.isPending}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          status === session.status
                            ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            status === DeliberationStatus.SCHEDULED
                              ? "bg-blue-500"
                              : status === DeliberationStatus.IN_PROGRESS
                                ? "bg-amber-500"
                                : status === DeliberationStatus.COMPLETED
                                  ? "bg-green-500"
                                  : "bg-zinc-500"
                          }`}
                        ></span>
                        {getStatusLabel(status)}
                        {status === session.status && (
                          <svg
                            className="ml-auto h-4 w-4 text-zinc-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
          {/* Info Card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Informations générales
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500">Statut</p>
                <div className="mt-1">
                  <DeliberationStatusBadge status={session.status} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Date de session</p>
                <p className="mt-1 text-sm text-zinc-900">
                  {new Date(session.session_date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
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
                  {session.academic_program?.name}
                  <span className="ml-2 text-xs text-zinc-500">
                    ({session.academic_program?.level})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Année académique</p>
                <p className="mt-1 text-sm text-zinc-900">
                  {session.academic_year?.name}
                  {session.academic_year?.is_current && (
                    <span className="ml-2 text-xs text-[#008D36]">(Actuelle)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Semestre</p>
                <p className="mt-1">
                  <span className="inline-flex items-center rounded-md bg-[#00365F]/10 px-2.5 py-1 text-xs font-medium text-[#00365F]">
                    Semestre {session.semester}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Jury */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Composition du jury
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-zinc-500">Président du jury</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {session.president?.full_name}
                  <span className="ml-2 text-xs font-normal text-zinc-500">
                    ({session.president?.rank})
                  </span>
                </p>
              </div>
              {session.jury_members && session.jury_members.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-500">
                    Membres du jury ({session.jury_members.length})
                  </p>
                  <div className="space-y-2">
                    {session.jury_members.map((memberId, index) => (
                      <div
                        key={memberId}
                        className="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-2"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00365F] text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        <span className="text-sm text-zinc-900">Membre {memberId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteConfirm}
          onClose={() => setDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Supprimer la session"
          message="Êtes-vous sûr de vouloir supprimer cette session de délibération ? Cette action est irréversible."
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
