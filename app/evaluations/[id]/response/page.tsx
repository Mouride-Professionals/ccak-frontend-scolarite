"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import { useCreateEvaluationResponse, useEvaluation } from "@/hooks/use-evaluations";

export default function EvaluationResponsePage() {
  const params = useParams();
  const evaluationId = typeof params.id === "string" ? params.id : "";
  const { data: evaluation, isLoading } = useEvaluation(evaluationId, !!evaluationId);
  const createResponse = useCreateEvaluationResponse();

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState("");
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const questions = useMemo(() => evaluation?.question_template ?? [], [evaluation]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    if (!evaluationId) {
      setToast({ isOpen: true, message: "Évaluation introuvable.", type: "error" });
      return;
    }
    try {
      const ratingValues = questions
        .map((_, index) => ratings[index])
        .filter((value) => value !== undefined)
        .map((value) => String(value));
      await createResponse.mutateAsync({
        evaluation_id: evaluationId,
        is_anonymous: isAnonymous,
        responses: questions.map((_, index) => answers[index] ?? ""),
        rating_scores: ratingValues.length ? ratingValues : undefined,
        comments: comments || undefined,
      });
      setToast({ isOpen: true, message: "Réponse enregistrée.", type: "success" });
      setAnswers({});
      setRatings({});
      setComments("");
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'envoi.", type: "error" });
    }
  };

  const renderQuestion = (question: string, index: number) => {
    const options = [1, 2, 3, 4, 5];
    return (
      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          {options.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRatings((prev) => ({ ...prev, [index]: value }))}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                ratings[index] === value
                  ? "border-[#00365F] bg-[#00365F] text-white"
                  : "border-zinc-300 text-zinc-600 hover:border-[#00365F]"
              }`}
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
        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(event) => setIsAnonymous(event.target.checked)}
            />
            Réponse anonyme
          </label>
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
                  Enseignant: {evaluation.faculty_member?.full_name ?? evaluation.faculty_member_id}
                </p>
              </div>
              {questions.map((question, index) => (
                <div key={`${question}-${index}`} className="rounded-lg border border-zinc-200 p-4">
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
                className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
              >
                Soumettre
              </button>
            </div>
          )}
        </div>

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
