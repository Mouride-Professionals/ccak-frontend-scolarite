"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import FacultySearch from "@/components/faculty-members/faculty-search";
import { useAcademicYears } from "@/hooks/use-enrollments";
import { useCourses } from "@/hooks/use-courses";
import { useCreateEvaluation } from "@/hooks/use-evaluations";
const createQuestion = () => "";

export default function EvaluationFormPage() {
  const { data: courses } = useCourses({ page: 1, limit: 100 });
  const { data: years } = useAcademicYears();
  const createEvaluation = useCreateEvaluation();
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
  });

  const [questions, setQuestions] = useState<string[]>([createQuestion()]);

  const updateQuestion = (index: number, value: string) => {
    setQuestions((prev) => prev.map((question, i) => (i === index ? value : question)));
  };

  const handleAddQuestion = () => setQuestions((prev) => [...prev, createQuestion()]);

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !form.course_id ||
      !form.faculty_member_id ||
      !form.response_deadline ||
      questions.some((q) => !q.trim())
    ) {
      setToast({ isOpen: true, message: "Complétez les champs requis.", type: "error" });
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
        question_template: questions.filter((q) => q.trim()),
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
      }));
      setQuestions([createQuestion()]);
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la création.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Créer une évaluation">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Informations générales</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Cours</label>
                <select
                  value={form.course_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, course_id: event.target.value }))
                  }
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
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Année académique
                </label>
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
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, start_date: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Fin</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, end_date: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Date limite de réponse
                </label>
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
            <div className="flex items-center justify-between">
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
              className="mt-6 w-full rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
            >
              Créer l'évaluation
            </button>
          </div>
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
