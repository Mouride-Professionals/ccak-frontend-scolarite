"use client";

import { useSafeParams } from "@/hooks/use-safe-params";
import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import { useDeliberationSession, useDeliberationResults } from "@/hooks/use-deliberations";
import { DeliberationDecision, DeliberationStatus, HonorLevel } from "@/types/deliberation";

export default function DeliberationResultsPage() {
  const params = useSafeParams<{ id: string }>();
  const sessionId = params.id as string;

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Modal states
  const [isPVModalOpen, setIsPVModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: session, isLoading: loadingSession } = useDeliberationSession(sessionId);
  const { data: resultsData, isLoading: loadingResults } = useDeliberationResults(sessionId);

  // Generate results from backend
  const handleGenerateResults = async () => {
    setIsGenerating(true);
    try {
      // TODO: Appeler l'API backend pour générer les résultats
      // await generateDeliberationResults(sessionId);

      // Pour l'instant, on simule juste
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setToast({
        isOpen: true,
        message: "Résultats générés avec succès",
        type: "success",
      });
    } catch (error) {
      console.error("Error generating results:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la génération des résultats",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Add jury comment
  const handleAddComment = (result: any) => {
    setSelectedResult(result);
    setIsCommentModalOpen(true);
  };

  // View PV
  const handleViewPV = (result: any) => {
    setSelectedResult(result);
    setIsPVModalOpen(true);
  };

  // Download PV
  const handleDownloadPV = (result: any) => {
    // TODO: Implémenter le téléchargement du PV
    setToast({
      isOpen: true,
      message: "Téléchargement du procès-verbal en cours...",
      type: "success",
    });
  };

  const getDecisionLabel = (decision: DeliberationDecision) => {
    const labels = {
      [DeliberationDecision.ADMITTED]: "Admis",
      [DeliberationDecision.ADMITTED_COMPENSATION]: "Admis avec compensation",
      [DeliberationDecision.RESIT]: "Rattrapage",
      [DeliberationDecision.FAILED]: "Ajourné",
      [DeliberationDecision.EXCLUDED]: "Exclu",
    };
    return labels[decision];
  };

  const getHonorLabel = (honor: HonorLevel) => {
    const labels = {
      [HonorLevel.PASSABLE]: "Passable",
      [HonorLevel.ASSEZ_BIEN]: "Assez Bien",
      [HonorLevel.BIEN]: "Bien",
      [HonorLevel.TRES_BIEN]: "Très Bien",
    };
    return labels[honor];
  };

  if (loadingSession || loadingResults) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Résultats de Délibération">
          <div className="flex min-h-100 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement des résultats...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!session) {
    return null;
  }

  // Check if deliberation is completed
  const isCompleted =
    session.status === DeliberationStatus.COMPLETED || session.status === DeliberationStatus.CLOSED;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Résultats de Délibération">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/deliberations" className="hover:text-[#008D36]">
              Délibérations
            </Link>
            <span>/</span>
            <Link href={`/deliberations/${sessionId}`} className="hover:text-[#008D36]">
              {session.session_name}
            </Link>
            <span>/</span>
            <span className="text-zinc-900">Résultats</span>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-semibold text-zinc-900">Saisie des Résultats</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Semestre {session.semester} - {session.academic_program?.name}
            </p>
          </div>
        </div>

        {/* Status Warning - Show if not completed */}
        {!isCompleted && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <svg
                  className="h-5 w-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-amber-900">
                  Délibération non complétée
                </h3>
                <p className="mt-1 text-sm text-amber-800">
                  Les résultats des étudiants ne sont disponibles que pour les délibérations avec le
                  statut <strong>COMPLETED</strong> ou <strong>CLOSED</strong>.
                </p>
                <p className="mt-2 text-sm text-amber-700">
                  Statut actuel : <span className="font-medium">{session.status}</span>
                </p>
                <div className="mt-4">
                  <Link
                    href={`/deliberations/${sessionId}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Retour à la délibération
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {isCompleted && resultsData && resultsData.data.length > 0 && (
          <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
              Statistiques
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-zinc-500">Étudiants inscrits</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{resultsData.data.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Admis</p>
                <p className="mt-1 text-2xl font-bold text-[#008D36]">
                  {
                    resultsData.data.filter(
                      (r) =>
                        r.decision === DeliberationDecision.ADMITTED ||
                        r.decision === DeliberationDecision.ADMITTED_COMPENSATION
                    ).length
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Ajournés</p>
                <p className="mt-1 text-2xl font-bold text-red-600">
                  {
                    resultsData.data.filter((r) => r.decision === DeliberationDecision.FAILED)
                      .length
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">En attente</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">
                  {
                    resultsData.data.filter(
                      (r) => r.decision === null || r.decision === DeliberationDecision.RESIT
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        {isCompleted && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateResults}
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Générer les résultats
                  </>
                )}
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Validation en masse
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export les procès-verbaux PDF
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export Excel
              </button>
            </div>
          </div>
        )}

        {/* Results Table */}
        {isCompleted && (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-[#00365F]/10">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Étudiant
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Note
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Décision
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Mention
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Remarques
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(!resultsData || resultsData.data.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg
                            className="mb-3 h-12 w-12 text-zinc-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-sm text-zinc-600">Aucun résultat à afficher</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Importez les résultats depuis Semester Results pour commencer
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {resultsData?.data.map((result) => {
                    const hasResult = result.decision !== null;

                    return (
                      <tr key={result.id} className="hover:bg-zinc-50/50 transition-colors">
                        {/* Student Info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00365F] text-sm font-semibold text-white">
                              {result.student?.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900">
                                {result.student?.full_name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {result.student?.student_number}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Note */}
                        <td className="px-4 py-3 text-center">
                          {hasResult ? (
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                                  (result.semester_result?.semester_average || 0) >= 16
                                    ? "bg-green-100 text-green-800"
                                    : (result.semester_result?.semester_average || 0) >= 14
                                      ? "bg-blue-100 text-blue-800"
                                      : (result.semester_result?.semester_average || 0) >= 12
                                        ? "bg-amber-100 text-amber-800"
                                        : (result.semester_result?.semester_average || 0) >= 10
                                          ? "bg-orange-100 text-orange-800"
                                          : "bg-red-100 text-red-800"
                                }`}
                              >
                                {result.semester_result?.semester_average.toFixed(2)}/20
                              </span>
                              <span className="text-xs text-zinc-500">
                                {(result.semester_result?.semester_average || 0) >= 16
                                  ? "Excellent"
                                  : (result.semester_result?.semester_average || 0) >= 14
                                    ? "Très bien"
                                    : (result.semester_result?.semester_average || 0) >= 12
                                      ? "Bien"
                                      : (result.semester_result?.semester_average || 0) >= 10
                                        ? "Passable"
                                        : "Insuffisant"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-zinc-400">En attente</span>
                          )}
                        </td>

                        {/* Decision */}
                        <td className="px-4 py-3">
                          {hasResult && result.decision ? (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                                result.decision === DeliberationDecision.ADMITTED
                                  ? "bg-green-100 text-green-800"
                                  : result.decision === DeliberationDecision.ADMITTED_COMPENSATION
                                    ? "bg-blue-100 text-blue-800"
                                    : result.decision === DeliberationDecision.RESIT
                                      ? "bg-amber-100 text-amber-800"
                                      : result.decision === DeliberationDecision.FAILED
                                        ? "bg-red-100 text-red-800"
                                        : "bg-zinc-100 text-zinc-800"
                              }`}
                            >
                              {result.decision === DeliberationDecision.ADMITTED ? (
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : result.decision === DeliberationDecision.ADMITTED_COMPENSATION ? (
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : result.decision === DeliberationDecision.RESIT ? (
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : result.decision === DeliberationDecision.FAILED ? (
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : null}
                              {getDecisionLabel(result.decision)}
                            </span>
                          ) : (
                            <span className="text-sm text-zinc-400">En attente</span>
                          )}
                        </td>

                        {/* Mention */}
                        <td className="px-4 py-3 text-center">
                          {hasResult && result.is_with_honors && result.honor_level ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800">
                              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {getHonorLabel(result.honor_level)}
                            </span>
                          ) : (
                            <span className="text-sm text-zinc-400">Sans mention</span>
                          )}
                        </td>

                        {/* Remarques */}
                        <td className="px-4 py-3">
                          {hasResult && result.jury_remarks ? (
                            <div className="flex items-start gap-2">
                              <svg
                                className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                />
                              </svg>
                              <p
                                className="text-sm text-zinc-700 line-clamp-2"
                                title={result.jury_remarks}
                              >
                                {result.jury_remarks}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-zinc-400">Aucune remarque</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewPV(result)}
                              className="rounded-lg p-2 text-[#00365F] transition-colors hover:bg-[#00365F]/10"
                              title="Voir le procès-verbal"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleAddComment(result)}
                              className="rounded-lg p-2 text-[#008D36] transition-colors hover:bg-[#008D36]/10"
                              title="Ajouter un commentaire jury"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDownloadPV(result)}
                              className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100"
                              title="Télécharger le procès-verbal"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View PV Modal */}
        {isPVModalOpen && selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              {/* Modal Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900">
                  Procès-verbal de délibération
                </h3>
                <button
                  onClick={() => setIsPVModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Student Info */}
              <div className="mb-4 rounded-lg border border-zinc-200 bg-[#00365F]/5 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">Étudiant</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {selectedResult.student?.full_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Numéro étudiant</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {selectedResult.student?.student_number}
                    </p>
                  </div>
                </div>
              </div>

              {/* PV Content */}
              <div className="mb-4 space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-zinc-500">Moyenne</p>
                    <p className="text-lg font-semibold text-zinc-900">
                      {selectedResult.semester_result?.semester_average?.toFixed(2) || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500">Décision</p>
                    {selectedResult.decision ? (
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                          selectedResult.decision === DeliberationDecision.ADMITTED
                            ? "bg-green-100 text-green-800"
                            : selectedResult.decision === DeliberationDecision.ADMITTED_COMPENSATION
                              ? "bg-blue-100 text-blue-800"
                              : selectedResult.decision === DeliberationDecision.RESIT
                                ? "bg-amber-100 text-amber-800"
                                : selectedResult.decision === DeliberationDecision.FAILED
                                  ? "bg-red-100 text-red-800"
                                  : "bg-zinc-100 text-zinc-800"
                        }`}
                      >
                        {getDecisionLabel(selectedResult.decision)}
                      </span>
                    ) : (
                      <p className="text-sm text-zinc-400">-</p>
                    )}
                  </div>
                </div>

                {selectedResult.is_with_honors && selectedResult.honor_level && (
                  <div>
                    <p className="text-xs font-medium text-zinc-500">Mention</p>
                    <span className="inline-flex items-center rounded-md bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800">
                      {getHonorLabel(selectedResult.honor_level)}
                    </span>
                  </div>
                )}

                {selectedResult.jury_remarks && (
                  <div>
                    <p className="text-xs font-medium text-zinc-500">Remarques du jury</p>
                    <p className="mt-1 text-sm text-zinc-700">{selectedResult.jury_remarks}</p>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsPVModalOpen(false)}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Fermer
                </button>
                <button
                  onClick={() => handleDownloadPV(selectedResult)}
                  className="flex items-center gap-2 rounded-lg bg-[#00365F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00365F]/90"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Comment Modal */}
        {isCommentModalOpen && selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              {/* Modal Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900">Ajouter un commentaire jury</h3>
                <button
                  onClick={() => setIsCommentModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Student Info */}
              <div className="mb-4 rounded-lg bg-[#00365F]/5 p-3">
                <p className="text-sm font-medium text-zinc-900">
                  {selectedResult.student?.full_name}
                </p>
                <p className="text-xs text-zinc-500">{selectedResult.student?.student_number}</p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Commentaire <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Saisir le commentaire du jury..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm transition-colors focus:border-[#008D36] focus:outline-none focus:ring-2 focus:ring-[#008D36]/20"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsCommentModalOpen(false)}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    // TODO: Implémenter l'ajout de commentaire
                    setToast({
                      isOpen: true,
                      message: "Commentaire ajouté avec succès",
                      type: "success",
                    });
                    setIsCommentModalOpen(false);
                  }}
                  className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

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
