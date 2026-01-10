"use client";

import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useEvaluation, useEvaluationResults } from "@/hooks/use-evaluations";

export default function EvaluationResultsPage() {
  const params = useParams();
  const evaluationId = typeof params.id === "string" ? params.id : "";
  const { data: evaluation } = useEvaluation(evaluationId, !!evaluationId);
  const { data: results, isLoading } = useEvaluationResults(evaluationId);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Résultats d'évaluation">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Résumé</h2>
            {isLoading ? (
              <p className="mt-4 text-sm text-zinc-500">Chargement...</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-200 p-4">
                  <div className="text-xs text-zinc-500">Taux de réponse</div>
                  <div className="mt-2 text-2xl font-semibold text-[#00365F]">
                    {results?.response_rate ?? 0}%
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-200 p-4">
                  <div className="text-xs text-zinc-500">Note moyenne</div>
                  <div className="mt-2 text-2xl font-semibold text-[#00365F]">
                    {results?.average_rating ?? 0}/5
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6 text-sm text-zinc-500">
              Cours: {evaluation?.course?.name ?? evaluation?.course_id ?? "—"}
            </div>
            <div className="text-sm text-zinc-500">
              Enseignant:{" "}
              {evaluation?.faculty_member?.full_name ?? evaluation?.faculty_member_id ?? "—"}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Détail des notes</h2>
            {results?.ratings && results.ratings.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {results.ratings.map((rating, index) => (
                  <li
                    key={`${rating.question}-${index}`}
                    className="rounded-lg border border-zinc-200 p-4"
                  >
                    <div className="text-sm font-medium text-zinc-800">{rating.question}</div>
                    <div className="mt-2 text-sm text-zinc-500">
                      Moyenne:{" "}
                      <span className="font-semibold text-[#00365F]">{rating.average}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">Aucune note disponible.</p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#00365F]">Commentaires</h2>
          {results?.comments && results.comments.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {results.comments.map((comment, index) => (
                <li
                  key={`${comment}-${index}`}
                  className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600"
                >
                  {comment}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Aucun commentaire.</p>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
