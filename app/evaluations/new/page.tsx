"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Modal from "@/components/ui/modal";
import Toast from "@/components/ui/toast";
import FacultySearch from "@/components/faculty-members/faculty-search";
import { useAcademicYears } from "@/hooks/use-enrollments";
import { useCourses } from "@/hooks/use-courses";
import { useCreateEvaluation } from "@/hooks/use-evaluations";
import { sanitizeText } from "@/lib/sanitize";

const createQuestion = () => "";

const evaluationSchema = z
  .object({
    course_id: z.string().min(1, "Cours requis"),
    faculty_member_id: z.string().min(1, "Enseignant requis"),
    response_deadline: z.string().min(1, "Date limite requise"),
    question_template: z.array(z.string().min(1)).min(1, "Au moins une question"),
    rating_scale_min: z.number().min(1, "La note minimale doit être >= 1"),
    rating_scale_max: z.number().max(10, "La note maximale doit être <= 10"),
    rating_scale_low_label: z.string().max(50).optional(),
    rating_scale_high_label: z.string().max(50).optional(),
  })
  .refine((input) => input.rating_scale_max > input.rating_scale_min, {
    message: "La note maximale doit être supérieure à la note minimale",
    path: ["rating_scale_max"],
  });

export default function EvaluationFormPage() {
  const { data: courses } = useCourses({ page: 1, limit: 100 });
  const { data: years } = useAcademicYears();
  const createEvaluation = useCreateEvaluation();
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [form, setForm] = useState({
    course_id: "",
    faculty_member_id: "",
    faculty_name: "",
    academic_year_id: "",
    start_date: "",
    end_date: "",
    response_deadline: "",
    is_published: false,
    rating_scale_min: 1,
    rating_scale_max: 5,
    rating_scale_low_label: "Très insatisfait",
    rating_scale_high_label: "Très satisfait",
  });

  const [questions, setQuestions] = useState<string[]>([createQuestion()]);

  const selectedCourse = useMemo(
    () => (courses?.data ?? []).find((course) => course.id === form.course_id),
    [courses?.data, form.course_id]
  );

  const sanitizedQuestions = useMemo(
    () => questions.map((question) => sanitizeText(question)).filter(Boolean),
    [questions]
  );

  const hasInvalidQuestions = useMemo(
    () => questions.some((question) => !sanitizeText(question)),
    [questions]
  );

  const updateQuestion = (index: number, value: string) => {
    setQuestions((prev) => prev.map((question, i) => (i === index ? value : question)));
  };

  const handleAddQuestion = () => setQuestions((prev) => [...prev, createQuestion()]);

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.course_id || !form.faculty_member_id || !form.response_deadline) {
      setToast({ isOpen: true, message: "Complétez les champs requis.", type: "error" });
      return;
    }

    if (!sanitizedQuestions.length || hasInvalidQuestions) {
      setToast({
        isOpen: true,
        message: "Toutes les questions doivent être renseignées.",
        type: "error",
      });
      return;
    }

    const validation = evaluationSchema.safeParse({
      course_id: form.course_id,
      faculty_member_id: form.faculty_member_id,
      response_deadline: form.response_deadline,
      question_template: sanitizedQuestions,
      rating_scale_min: form.rating_scale_min,
      rating_scale_max: form.rating_scale_max,
      rating_scale_low_label: sanitizeText(form.rating_scale_low_label),
      rating_scale_high_label: sanitizeText(form.rating_scale_high_label),
    });

    if (!validation.success) {
      setToast({
        isOpen: true,
        message: validation.error.issues[0]?.message ?? "Formulaire invalide.",
        type: "error",
      });
      return;
    }

    try {
      await createEvaluation.mutateAsync({
        course_id: form.course_id,
        faculty_member_id: form.faculty_member_id,
        academic_year_id: form.academic_year_id || undefined,
        start_date: form.start_date ? new Date(`${form.start_date}T00:00:00`).toISOString() : null,
        end_date: form.end_date ? new Date(`${form.end_date}T00:00:00`).toISOString() : null,
        response_deadline: form.response_deadline
          ? new Date(`${form.response_deadline}T00:00:00`).toISOString()
          : undefined,
        is_published: form.is_published,
        question_template: sanitizedQuestions,
        rating_scale_min: form.rating_scale_min,
        rating_scale_max: form.rating_scale_max,
        rating_scale_low_label: sanitizeText(form.rating_scale_low_label) || undefined,
        rating_scale_high_label: sanitizeText(form.rating_scale_high_label) || undefined,
      });

      setToast({ isOpen: true, message: "Évaluation créée.", type: "success" });
      setForm((prev) => ({
        ...prev,
        course_id: "",
        faculty_member_id: "",
        faculty_name: "",
        academic_year_id: "",
        start_date: "",
        end_date: "",
        response_deadline: "",
        is_published: false,
        rating_scale_min: 1,
        rating_scale_max: 5,
        rating_scale_low_label: "Très insatisfait",
        rating_scale_high_label: "Très satisfait",
      }));
      setQuestions([createQuestion()]);
      setShowPreview(false);
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la création.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Créer une évaluation">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-[#00365F]"
          >
            Prévisualiser
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Informations générales</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Cours</label>
                <select
                  value={form.course_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, course_id: event.target.value }))}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner</option>
                  {(courses?.data ?? []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Enseignant</label>
                <FacultySearch
                  value={form.faculty_name}
                  onSelect={(faculty) =>
                    setForm((prev) => ({
                      ...prev,
                      faculty_member_id: faculty.id,
                      faculty_name: faculty.full_name,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Année académique</label>
                <select
                  value={form.academic_year_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, academic_year_id: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner</option>
                  {Array.isArray(years) &&
                    years.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Début</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Fin</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Date limite de réponse</label>
                <input
                  type="date"
                  value={form.response_deadline}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, response_deadline: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, is_published: event.target.checked }))
                  }
                />
                Publier immédiatement
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Échelle de notation</h2>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Note min</label>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={form.rating_scale_min}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        rating_scale_min: Number(event.target.value || 1),
                      }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Note max</label>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={form.rating_scale_max}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        rating_scale_max: Number(event.target.value || 5),
                      }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Libellé bas</label>
                <input
                  type="text"
                  value={form.rating_scale_low_label}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, rating_scale_low_label: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Libellé haut</label>
                <input
                  type="text"
                  value={form.rating_scale_high_label}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, rating_scale_high_label: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
                Échelle configurée: {form.rating_scale_min} à {form.rating_scale_max} · {form.rating_scale_low_label || "-"} / {form.rating_scale_high_label || "-"}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#00365F]">Questions</h2>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-[#00365F]"
              >
                Ajouter
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="rounded-lg border border-zinc-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-3">
                      <input
                        value={question}
                        onChange={(event) => updateQuestion(index, event.target.value)}
                        className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                        placeholder={`Question ${index + 1}`}
                      />
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(index)}
                        className="text-xs font-medium text-red-500"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={createEvaluation.isPending}
              className="mt-6 w-full rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createEvaluation.isPending ? "Création..." : "Créer l'évaluation"}
            </button>
          </div>
        </div>

        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Prévisualisation de l'évaluation"
          subtitle="Vérifiez le rendu étudiant avant publication"
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700">
              <p>
                <span className="font-semibold text-[#00365F]">Cours:</span> {selectedCourse?.name || "-"}
              </p>
              <p>
                <span className="font-semibold text-[#00365F]">Enseignant:</span> {form.faculty_name || "-"}
              </p>
              <p>
                <span className="font-semibold text-[#00365F]">Échelle:</span> {form.rating_scale_min} à {form.rating_scale_max} ({form.rating_scale_low_label || "-"} → {form.rating_scale_high_label || "-"})
              </p>
            </div>

            <ul className="space-y-2">
              {sanitizedQuestions.length > 0 ? (
                sanitizedQuestions.map((question, index) => (
                  <li key={`${question}-${index}`} className="rounded-md border border-zinc-200 p-3 text-sm">
                    <p className="font-medium text-zinc-800">Q{index + 1}. {question}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Notation prévue: {form.rating_scale_min} à {form.rating_scale_max}
                    </p>
                  </li>
                ))
              ) : (
                <li className="text-sm text-zinc-500">Ajoutez au moins une question pour prévisualiser.</li>
              )}
            </ul>
          </div>
        </Modal>

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
