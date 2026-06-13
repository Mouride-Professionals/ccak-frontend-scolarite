"use client";

import { useMemo, useState } from "react";
import { useSafeParams } from "@/hooks/use-safe-params";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import { useCreateEvaluationResponse, useEvaluation } from "@/hooks/use-evaluations";

export default function EvaluationResponsePage() {
  const params = useSafeParams<{ id: string }>();
  const evaluationId = typeof params.id === "string" ? params.id : "";
  const { data: evaluation, isLoading } = useEvaluation(evaluationId, !!evaluationId);
  const createResponse = useCreateEvaluationResponse();

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const questions = useMemo(() => evaluation?.question_template ?? [], [evaluation]);
  const ratingMin = evaluation?.rating_scale_min ?? 1;
  const ratingMax = evaluation?.rating_scale_max ?? 5;
  const ratingOptions = useMemo(
    () => Array.from({ length: Math.max(1, ratingMax - ratingMin + 1) }, (_, i) => ratingMin + i),
    [ratingMax, ratingMin]
  );

  const completionCount = useMemo(
    () =>
      questions.filter((_, index) => {
        const hasRating = ratings[index] !== undefined;
        const hasText = (answers[index] ?? "").trim().length > 0;
        return hasRating || hasText;
      }).length,
    [answers, questions, ratings]
  );

  const completionRate = questions.length
    ? Math.round((completionCount / questions.length) * 100)
    : 0;

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    if (!evaluationId) {
      setToast({ isOpen: true, message: "Évaluation introuvable.", type: "error" });
      return;
    }

    if (questions.length === 0) {
      setToast({ isOpen: true, message: "Aucune question à traiter.", type: "error" });
      return;
    }

    const missingRatings = questions.some((_, index) => ratings[index] === undefined);
    if (missingRatings) {
      setToast({ isOpen: true, message: "Veuillez noter toutes les questions.", type: "error" });
      return;
    }

    try {
      const ratingValues = questions.map((_, index) => String(ratings[index]));
      await createResponse.mutateAsync({
        evaluation_id: evaluationId,
        is_anonymous: isAnonymous,
        responses: questions.map((_, index) => answers[index] ?? ""),
        rating_scores: ratingValues,
        comments: comments || undefined,
      });

      setIsSubmitted(true);
      setToast({ isOpen: true, message: "Réponse enregistrée.", type: "success" });
      setAnswers({});
      setRatings({});
      setComments("");
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'envoi.", type: "error" });
    }
  };

  const renderQuestion = (question: string, index: number) => {
    return (
      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          {ratingOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRatings((prev) => ({ ...prev, [index]: value }))}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                ratings[index] === value
                  ? "border-[#00365F] bg-[#00365F] text-white"
                  : "border-zinc-300 text-zinc-600 hover:border-[#00365F]"
              }`}
              aria-label={`Noter ${value}`}
            >
              {value}
            </button>
          ))}
        </div>
        <textarea
          value={answers[index] ?? ""}
          onChange={(event) => handleAnswerChange(index, event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Réponse ouverte (optionnel)"
        />
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Répondre à l'évaluation">
        {isSubmitted ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-7 w-7 text-emerald-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-emerald-900">
              Merci pour votre réponse
            </h2>
            <p className="mt-2 text-sm text-emerald-800">
              Votre évaluation a bien été prise en compte.
            </p>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="mt-5 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800"
            >
              Répondre à nouveau
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(event) => setIsAnonymous(event.target.checked)}
                />
                Réponse anonyme
              </label>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                  <span>Progression</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-[#008D36] transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  {completionCount}/{questions.length || 0} questions complétées
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              {isLoading ? (
                <p className="text-sm text-zinc-500">Chargement...</p>
              ) : !evaluation ? (
                <p className="text-sm text-zinc-500">Évaluation introuvable.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#00365F]">
                      {evaluation.course?.name ?? evaluation.course_id}
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Enseignant:{" "}
                      {evaluation.faculty_member?.full_name ?? evaluation.faculty_member_id}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Échelle: {ratingMin} à {ratingMax}
                      {(evaluation.rating_scale_low_label ||
                        evaluation.rating_scale_high_label) && (
                        <>
                          {" "}
                          ({evaluation.rating_scale_low_label || "-"} →{" "}
                          {evaluation.rating_scale_high_label || "-"})
                        </>
                      )}
                    </p>
                  </div>

                  {questions.map((question, index) => (
                    <div
                      key={`${question}-${index}`}
                      className="rounded-lg border border-zinc-200 p-4"
                    >
                      <div className="text-sm font-medium text-zinc-800">{question}</div>
                      {renderQuestion(question, index)}
                    </div>
                  ))}

                  <div className="rounded-lg border border-zinc-200 p-4">
                    <div className="text-sm font-medium text-zinc-800">Commentaire global</div>
                    <textarea
                      value={comments}
                      onChange={(event) => setComments(event.target.value)}
                      rows={3}
                      className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={createResponse.isPending}
                    className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {createResponse.isPending ? "Envoi..." : "Soumettre"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

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
