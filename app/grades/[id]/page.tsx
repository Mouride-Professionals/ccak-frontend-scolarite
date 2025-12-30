"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import GradeStatusBadge from "@/components/grades/grades-status-badge";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import GradeForm from "@/components/grades/grade-form";
import {
  useGrade,
  useDeleteGrade,
  useUpdateGrade,
  useStudents,
  useCourses,
  useEvaluationTypes,
} from "@/hooks/use-grades";
import type { CreateGradeInput } from "@/types/grade";

export default function GradeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const gradeId = params.id as string;

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const { data: grade, isLoading, error } = useGrade(gradeId);
  const deleteMutation = useDeleteGrade();
  const updateMutation = useUpdateGrade();

  // Load form data for edit modal
  const { data: students, isLoading: loadingStudents } = useStudents();
  const { data: courses, isLoading: loadingCourses } = useCourses();
  const { data: evaluationTypes, isLoading: loadingTypes } = useEvaluationTypes();

  // Redirect if error
  useEffect(() => {
    if (error) {
      setToast({
        isOpen: true,
        message: "Note introuvable",
        type: "error",
      });
      setTimeout(() => {
        router.push("/grades");
      }, 2000);
    }
  }, [error, router]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(gradeId);
      setToast({
        isOpen: true,
        message: "Note supprimée avec succès",
        type: "success",
      });
      setTimeout(() => {
        router.push("/grades");
      }, 1500);
    } catch (error) {
      console.error("Error deleting grade:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression de la note",
        type: "error",
      });
      setDeleteConfirm(false);
    }
  };

  const handleEditSubmit = async (data: CreateGradeInput) => {
    if (!grade) return;

    try {
      await updateMutation.mutateAsync({
        id: grade.id,
        input: data,
      });
      setIsEditModalOpen(false);
      setToast({
        isOpen: true,
        message: "Note modifiée avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error updating grade:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la modification de la note",
        type: "error",
      });
    }
  };

  const calculatePercentage = (score: number, maxScore: number): number => {
    return (score / maxScore) * 100;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Détails de la Note">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement de la note...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!grade) {
    return null;
  }

  const percentage = calculatePercentage(grade.score, grade.max_score);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Détails de la Note">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">{grade.student?.full_name}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {grade.course?.code} - {grade.course?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
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
            </button>
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
          {/* Score Card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Résultat
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">Note obtenue</p>
                <p className="mt-2 text-4xl font-bold text-zinc-900">
                  {grade.score}
                  <span className="text-2xl text-zinc-400 mx-2">/</span>
                  <span className="text-2xl text-zinc-600">{grade.max_score}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-zinc-500">Pourcentage</p>
                <p
                  className={`mt-2 text-4xl font-bold ${
                    percentage >= 50 ? "text-[#008D36]" : "text-red-600"
                  }`}
                >
                  {percentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    percentage >= 50 ? "bg-[#008D36]" : "bg-red-600"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Informations étudiant
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500">Nom complet</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {grade.student?.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Numéro étudiant</p>
                <p className="mt-1 text-sm text-zinc-900">{grade.student?.student_number}</p>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Informations du cours
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500">Nom du cours</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">{grade.course?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Code du cours</p>
                <p className="mt-1 text-sm text-zinc-900">{grade.course?.code}</p>
              </div>
            </div>
          </div>

          {/* Evaluation Details */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Détails de l'évaluation
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-zinc-500">Type d'évaluation</p>
                <p className="mt-1 text-sm text-zinc-900">{grade.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Coefficient</p>
                <p className="mt-1">
                  <span className="inline-flex items-center rounded-md bg-[#00365F]/10 px-2.5 py-1 text-xs font-medium text-[#00365F]">
                    {grade.weight}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Statut</p>
                <div className="mt-1">
                  <GradeStatusBadge status={grade.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          {grade.comments && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                Commentaires
              </h3>
              <p className="text-sm text-zinc-700 leading-relaxed">{grade.comments}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Informations de saisie
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500">Saisi par</p>
                <p className="mt-1 text-sm text-zinc-900">
                  {grade.entered_by_user?.full_name || grade.entered_by}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Date de saisie</p>
                <p className="mt-1 text-sm text-zinc-900">
                  {new Date(grade.entered_at).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-start">
            <Link
              href="/grades"
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

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Modifier Note"
          subtitle="Formulaire de modification de note"
          size="lg"
        >
          {loadingStudents || loadingCourses || loadingTypes ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500">Chargement des données...</p>
              </div>
            </div>
          ) : (
            <GradeForm
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditModalOpen(false)}
              students={Array.isArray(students) ? students : []}
              courses={Array.isArray(courses) ? courses : []}
              evaluationTypes={Array.isArray(evaluationTypes) ? evaluationTypes : []}
              isLoading={updateMutation.isPending}
              initialData={{
                student_id: grade.student_id,
                course_id: grade.course_id,
                type: grade.type,
                score: grade.score,
                max_score: grade.max_score,
                weight: grade.weight,
                status: grade.status,
                comments: grade.comments ?? undefined,
              }}
            />
          )}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteConfirm}
          onClose={() => setDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Supprimer la note"
          message="Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible."
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
