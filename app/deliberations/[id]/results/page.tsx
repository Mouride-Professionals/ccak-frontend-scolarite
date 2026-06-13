"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSafeParams } from "@/hooks/use-safe-params";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import {
  useDeliberationSession,
  useDeliberationResults,
  useGenerateDeliberationResults,
  useUpdateDeliberationResult,
  useFinalizeDeliberationSession,
} from "@/hooks/use-deliberations";
import {
  DeliberationDecision,
  DeliberationStatus,
  HonorLevel,
  type DeliberationResult,
  type UpdateDeliberationResultInput,
} from "@/types/deliberation";

const formatDecision = (decision: DeliberationDecision | null) => {
  if (!decision) return "En attente";
  const labels: Record<DeliberationDecision, string> = {
    [DeliberationDecision.ADMITTED]: "Admis",
    [DeliberationDecision.ADMITTED_COMPENSATION]: "Admis avec compensation",
    [DeliberationDecision.RESIT]: "Rattrapage",
    [DeliberationDecision.FAILED]: "Ajourné",
    [DeliberationDecision.EXCLUDED]: "Exclu",
  };
  return labels[decision];
};

const formatHonor = (honor: HonorLevel | null) => {
  if (!honor) return "Sans mention";
  const labels: Record<HonorLevel, string> = {
    [HonorLevel.PASSABLE]: "Passable",
    [HonorLevel.ASSEZ_BIEN]: "Assez Bien",
    [HonorLevel.BIEN]: "Bien",
    [HonorLevel.TRES_BIEN]: "Très Bien",
  };
  return labels[honor];
};

const isAdmittedDecision = (decision: DeliberationDecision | null) =>
  decision === DeliberationDecision.ADMITTED ||
  decision === DeliberationDecision.ADMITTED_COMPENSATION;

const csvValue = (value: string | number | null | undefined) => {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

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

  const [isMinutesModalOpen, setIsMinutesModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [selectedResult, setSelectedResult] = useState<DeliberationResult | null>(null);
  const [detailResult, setDetailResult] = useState<DeliberationResult | null>(null);
  const [updatingResultId, setUpdatingResultId] = useState<string | null>(null);

  const { data: session, isLoading: loadingSession } = useDeliberationSession(sessionId);
  const {
    data: resultsData,
    isLoading: loadingResults,
    refetch: refetchResults,
  } = useDeliberationResults(sessionId, {
    page: 1,
    limit: 200,
  });

  const generateMutation = useGenerateDeliberationResults();
  const updateResultMutation = useUpdateDeliberationResult();
  const finalizeMutation = useFinalizeDeliberationSession();

  const results = useMemo(() => resultsData?.data ?? [], [resultsData]);
  const isClosed = session?.status === DeliberationStatus.CLOSED;

  const stats = useMemo(() => {
    const admitted = results.filter((result) => isAdmittedDecision(result.decision)).length;
    const failed = results.filter(
      (result) => result.decision === DeliberationDecision.FAILED
    ).length;
    const pending = results.filter((result) => !result.decision).length;
    return { total: results.length, admitted, failed, pending };
  }, [results]);

  const patchResult = async (
    resultId: string,
    input: UpdateDeliberationResultInput,
    successMessage?: string
  ) => {
    setUpdatingResultId(resultId);
    try {
      await updateResultMutation.mutateAsync({ id: resultId, input });
      if (successMessage) {
        setToast({ isOpen: true, message: successMessage, type: "success" });
      }
    } catch (error) {
      console.error("Error updating deliberation result:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la mise à jour du résultat",
        type: "error",
      });
    } finally {
      setUpdatingResultId(null);
    }
  };

  const handleGenerateResults = async () => {
    try {
      await generateMutation.mutateAsync(sessionId);
      await refetchResults();
      setToast({
        isOpen: true,
        message: "Résultats générés avec succès",
        type: "success",
      });
    } catch (error) {
      console.error("Error generating deliberation results:", error);
      setToast({
        isOpen: true,
        message: "Échec de la génération des résultats",
        type: "error",
      });
    }
  };

  const handleSaveComment = async () => {
    if (!selectedResult) return;
    await patchResult(
      selectedResult.id,
      { jury_remarks: commentDraft.trim() || null },
      "Commentaire enregistré"
    );
    setIsCommentModalOpen(false);
    setSelectedResult(null);
  };

  const handleFinalize = async () => {
    if (stats.pending > 0) {
      setToast({
        isOpen: true,
        message: "Impossible de finaliser: tous les étudiants doivent avoir une décision.",
        type: "error",
      });
      return;
    }

    try {
      await finalizeMutation.mutateAsync({
        sessionId,
        input: {
          completion_notes: completionNotes.trim() || undefined,
          lock_session: true,
        },
      });
      setToast({
        isOpen: true,
        message: "Délibération finalisée et verrouillée",
        type: "success",
      });
      setIsFinalizeModalOpen(false);
    } catch (error) {
      console.error("Error finalizing deliberation:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la finalisation de la délibération",
        type: "error",
      });
    }
  };

  const handleDownloadMinutes = () => {
    if (!session) return;
    const header = [
      "Matricule",
      "Nom",
      "Moyenne",
      "Décision",
      "Mention",
      "Crédits obtenus",
      "Crédits inscrits",
      "Remarques jury",
    ];
    const rows = results.map((result) => [
      csvValue(result.student?.student_number ?? "-"),
      csvValue(result.student?.full_name ?? "-"),
      csvValue(result.semester_result?.semester_average ?? "-"),
      csvValue(formatDecision(result.decision)),
      csvValue(result.is_with_honors ? formatHonor(result.honor_level) : "Sans mention"),
      csvValue(result.semester_result?.total_credits_earned ?? "-"),
      csvValue(result.semester_result?.total_credits_enrolled ?? "-"),
      csvValue(result.jury_remarks ?? ""),
    ]);
    const csv = [header.map(csvValue).join(","), ...rows.map((row) => row.join(","))].join("\n");
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(`pv-${sessionId}-${date}.csv`, csv, "text/csv;charset=utf-8");
    setToast({
      isOpen: true,
      message: "Procès-verbal exporté",
      type: "success",
    });
  };

  const handleDownloadStudentPV = (result: DeliberationResult) => {
    if (!session) return;
    const content = [
      `Session: ${session.session_name}`,
      `Date: ${new Date(session.session_date).toLocaleDateString("fr-FR")}`,
      `Étudiant: ${result.student?.full_name ?? "-"}`,
      `Matricule: ${result.student?.student_number ?? "-"}`,
      `Moyenne: ${result.semester_result?.semester_average?.toFixed(2) ?? "-"}/20`,
      `Décision: ${formatDecision(result.decision)}`,
      `Mention: ${result.is_with_honors ? formatHonor(result.honor_level) : "Sans mention"}`,
      `Remarques jury: ${result.jury_remarks ?? "-"}`,
    ].join("\n");
    const safeName = (result.student?.student_number ?? result.id).replace(/[^a-zA-Z0-9-_]/g, "_");
    downloadFile(`pv-${safeName}.txt`, content, "text/plain;charset=utf-8");
  };

  if (loadingSession || loadingResults) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Résultats de Délibération">
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement des résultats...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!session) return null;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Résultats de Délibération">
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
          <h2 className="mt-4 text-2xl font-semibold text-zinc-900">Espace jury et décisions</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Semestre {session.semester} • Statut:{" "}
            <span className="font-medium text-zinc-900">{session.status}</span>
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-xs uppercase text-zinc-500">Étudiants</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-xs uppercase text-zinc-500">Admis</p>
            <p className="mt-2 text-2xl font-semibold text-[#008D36]">{stats.admitted}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-xs uppercase text-zinc-500">Ajournés</p>
            <p className="mt-2 text-2xl font-semibold text-red-600">{stats.failed}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-xs uppercase text-zinc-500">En attente</p>
            <p className="mt-2 text-2xl font-semibold text-amber-600">{stats.pending}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4">
          <button
            type="button"
            onClick={handleGenerateResults}
            disabled={isClosed || generateMutation.isPending}
            className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generateMutation.isPending ? "Génération..." : "Générer les résultats"}
          </button>
          <button
            type="button"
            onClick={() => setIsMinutesModalOpen(true)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Prévisualiser le PV
          </button>
          <button
            type="button"
            onClick={handleDownloadMinutes}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Télécharger le PV (CSV)
          </button>
          <button
            type="button"
            onClick={() => setIsFinalizeModalOpen(true)}
            disabled={isClosed || finalizeMutation.isPending}
            className="rounded-lg bg-[#00365F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#002F52] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isClosed ? "Session verrouillée" : "Finaliser et verrouiller"}
          </button>
          {stats.pending > 0 && (
            <p className="text-sm text-amber-700">
              {stats.pending} étudiant(s) sans décision: finalisation bloquée.
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-[#00365F]/10">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                    Étudiant
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                    Moyenne
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                    Décision
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                    Mention
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                    Remarques
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {results.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                      Aucun résultat disponible.
                    </td>
                  </tr>
                )}
                {results.map((result) => {
                  const average = result.semester_result?.semester_average;
                  const canEditRow = !isClosed && updatingResultId !== result.id;
                  const canSetHonors = isAdmittedDecision(result.decision);

                  return (
                    <tr key={result.id} className="hover:bg-zinc-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">{result.student?.full_name}</p>
                        <p className="text-xs text-zinc-500">{result.student?.student_number}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-zinc-900">
                          {typeof average === "number" ? `${average.toFixed(2)}/20` : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={result.decision ?? ""}
                          disabled={!canEditRow}
                          onChange={(event) =>
                            patchResult(result.id, {
                              decision: event.target.value
                                ? (event.target.value as DeliberationDecision)
                                : null,
                            })
                          }
                          className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] disabled:cursor-not-allowed disabled:bg-zinc-100"
                        >
                          <option value="">En attente</option>
                          <option value={DeliberationDecision.ADMITTED}>Admis</option>
                          <option value={DeliberationDecision.ADMITTED_COMPENSATION}>
                            Admis avec compensation
                          </option>
                          <option value={DeliberationDecision.RESIT}>Rattrapage</option>
                          <option value={DeliberationDecision.FAILED}>Ajourné</option>
                          <option value={DeliberationDecision.EXCLUDED}>Exclu</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <label className="inline-flex items-center gap-2 text-xs text-zinc-600">
                            <input
                              type="checkbox"
                              checked={Boolean(result.is_with_honors)}
                              disabled={!canSetHonors || !canEditRow}
                              onChange={(event) =>
                                patchResult(result.id, {
                                  is_with_honors: event.target.checked,
                                  honor_level: event.target.checked
                                    ? (result.honor_level ?? HonorLevel.PASSABLE)
                                    : null,
                                })
                              }
                            />
                            Avec mention
                          </label>
                          <select
                            value={result.honor_level ?? ""}
                            disabled={!result.is_with_honors || !canSetHonors || !canEditRow}
                            onChange={(event) =>
                              patchResult(result.id, {
                                honor_level: event.target.value
                                  ? (event.target.value as HonorLevel)
                                  : null,
                              })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-xs focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] disabled:cursor-not-allowed disabled:bg-zinc-100"
                          >
                            <option value="">Sans mention</option>
                            <option value={HonorLevel.PASSABLE}>Passable</option>
                            <option value={HonorLevel.ASSEZ_BIEN}>Assez Bien</option>
                            <option value={HonorLevel.BIEN}>Bien</option>
                            <option value={HonorLevel.TRES_BIEN}>Très Bien</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-700">
                        {result.jury_remarks || "Aucune remarque"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedResult(result);
                              setCommentDraft(result.jury_remarks ?? "");
                              setIsCommentModalOpen(true);
                            }}
                            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                          >
                            Commentaire
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailResult(result)}
                            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                          >
                            Détails
                          </button>
                          <Link
                            href={`/students/${result.student_id}/deliberations`}
                            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                          >
                            Historique
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDownloadStudentPV(result)}
                            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                          >
                            PV
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

        {isMinutesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-zinc-900">Prévisualisation du PV</h3>
                <button
                  type="button"
                  onClick={() => setIsMinutesModalOpen(false)}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                >
                  Fermer
                </button>
              </div>
              <div className="max-h-[75vh] overflow-auto p-6">
                <p className="text-sm text-zinc-600">
                  Session: <span className="font-medium text-zinc-900">{session.session_name}</span>
                </p>
                <p className="mb-4 text-sm text-zinc-600">
                  Date:{" "}
                  <span className="font-medium text-zinc-900">
                    {new Date(session.session_date).toLocaleDateString("fr-FR")}
                  </span>
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200">
                        <th className="px-3 py-2 text-left">Étudiant</th>
                        <th className="px-3 py-2 text-left">Moyenne</th>
                        <th className="px-3 py-2 text-left">Décision</th>
                        <th className="px-3 py-2 text-left">Mention</th>
                        <th className="px-3 py-2 text-left">Remarques jury</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {results.map((result) => (
                        <tr key={result.id}>
                          <td className="px-3 py-2">
                            {result.student?.full_name} ({result.student?.student_number})
                          </td>
                          <td className="px-3 py-2">
                            {result.semester_result?.semester_average?.toFixed(2) ?? "-"}
                          </td>
                          <td className="px-3 py-2">{formatDecision(result.decision)}</td>
                          <td className="px-3 py-2">
                            {result.is_with_honors
                              ? formatHonor(result.honor_level)
                              : "Sans mention"}
                          </td>
                          <td className="px-3 py-2">{result.jury_remarks || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {isCommentModalOpen && selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-zinc-900">Commentaire du jury</h3>
              <p className="mt-1 text-sm text-zinc-600">
                {selectedResult.student?.full_name} ({selectedResult.student?.student_number})
              </p>
              <textarea
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                rows={5}
                className="mt-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                placeholder="Saisir une remarque du jury..."
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCommentModalOpen(false)}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveComment}
                  disabled={updateResultMutation.isPending}
                  className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateResultMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isFinalizeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-zinc-900">Finaliser la délibération</h3>
              <p className="mt-2 text-sm text-zinc-600">
                Cette action verrouille la session et empêche les modifications ultérieures.
              </p>
              {stats.pending > 0 && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  {stats.pending} décision(s) manquante(s). Finalisation impossible tant que tous
                  les résultats ne sont pas complétés.
                </div>
              )}
              <textarea
                value={completionNotes}
                onChange={(event) => setCompletionNotes(event.target.value)}
                rows={4}
                className="mt-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                placeholder="Notes de clôture du jury (optionnel)"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFinalizeModalOpen(false)}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleFinalize}
                  disabled={stats.pending > 0 || finalizeMutation.isPending}
                  className="rounded-lg bg-[#00365F] px-4 py-2 text-sm font-medium text-white hover:bg-[#002F52] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {finalizeMutation.isPending ? "Finalisation..." : "Finaliser"}
                </button>
              </div>
            </div>
          </div>
        )}

        {detailResult && (
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-zinc-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">Détail étudiant</h3>
              <button
                type="button"
                onClick={() => setDetailResult(null)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
              >
                Fermer
              </button>
            </div>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-zinc-500">Étudiant</p>
                <p className="font-medium text-zinc-900">{detailResult.student?.full_name}</p>
                <p className="text-zinc-500">{detailResult.student?.student_number}</p>
              </div>
              <div>
                <p className="text-zinc-500">Moyenne semestrielle</p>
                <p className="font-medium text-zinc-900">
                  {detailResult.semester_result?.semester_average?.toFixed(2) ?? "-"} / 20
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Crédits</p>
                <p className="font-medium text-zinc-900">
                  {detailResult.semester_result?.total_credits_earned ?? "-"} /{" "}
                  {detailResult.semester_result?.total_credits_enrolled ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Décision</p>
                <p className="font-medium text-zinc-900">{formatDecision(detailResult.decision)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Mention</p>
                <p className="font-medium text-zinc-900">
                  {detailResult.is_with_honors
                    ? formatHonor(detailResult.honor_level)
                    : "Sans mention"}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Remarques jury</p>
                <p className="text-zinc-900">{detailResult.jury_remarks || "Aucune remarque"}</p>
              </div>
              <Link
                href={`/students/${detailResult.student_id}/deliberations`}
                className="inline-flex rounded-lg bg-[#00365F] px-3 py-2 text-sm font-medium text-white hover:bg-[#002F52]"
              >
                Voir l&apos;historique complet
              </Link>
            </div>
          </div>
        )}

        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
