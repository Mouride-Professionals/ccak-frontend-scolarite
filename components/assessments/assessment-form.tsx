"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FacultySearch from "@/components/faculty-members/faculty-search";
import Toast from "@/components/ui/toast";
import { useCourses } from "@/hooks/use-courses";
import { useSelectedYear } from "@/hooks/use-selected-year";
import { AssessmentType, ASSESSMENT_TYPE_LABELS } from "@/types/assessment";
import type { CreateAssessmentInput } from "@/types/assessment";

interface AssessmentFormState {
  courseId: string;
  facultyMemberId: string;
  academicYearId: string;
  title: string;
  type: AssessmentType;
  date: string;
  startTime: string;
  durationMinutes: string;
  room: string;
  coefficient: string;
  notes: string;
}

interface AssessmentFormProps {
  initialValues?: Partial<AssessmentFormState>;
  yearLabel?: string;
  onSubmit: (input: CreateAssessmentInput) => Promise<void>;
  isPending: boolean;
  submitLabel: string;
  backHref: string;
  toast: { isOpen: boolean; message: string; type: "success" | "error" };
  onCloseToast: () => void;
}

export const defaultFormState: AssessmentFormState = {
  courseId: "",
  facultyMemberId: "",
  academicYearId: "",
  title: "",
  type: AssessmentType.WRITTEN,
  date: "",
  startTime: "",
  durationMinutes: "",
  room: "",
  coefficient: "",
  notes: "",
};

export function buildAssessmentPayload(form: AssessmentFormState): CreateAssessmentInput {
  return {
    course_id: form.courseId,
    faculty_member_id: form.facultyMemberId,
    academic_year_id: form.academicYearId,
    title: form.title,
    type: form.type,
    date: form.date,
    start_time: form.startTime || null,
    duration_minutes: form.durationMinutes ? Number(form.durationMinutes) : null,
    room: form.room || null,
    coefficient: form.coefficient ? Number(form.coefficient) : null,
    notes: form.notes || null,
  };
}

export default function AssessmentForm({
  initialValues,
  yearLabel,
  onSubmit,
  isPending,
  submitLabel,
  backHref,
  toast,
  onCloseToast,
}: AssessmentFormProps) {
  const router = useRouter();
  const { data: coursesData } = useCourses({ page: 1, limit: 200 });
  const { selectedYear } = useSelectedYear();

  const [form, setForm] = useState<AssessmentFormState>({
    ...defaultFormState,
    ...initialValues,
  });

  useEffect(() => {
    if (!initialValues?.academicYearId && selectedYear?.id) {
      setForm((prev) => ({ ...prev, academicYearId: selectedYear.id }));
    }
  }, [selectedYear?.id, initialValues?.academicYearId]);

  const field = (key: keyof AssessmentFormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async () => {
    if (!form.courseId || !form.facultyMemberId || !form.academicYearId || !form.title || !form.date) {
      return;
    }
    await onSubmit(buildAssessmentPayload(form));
  };

  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

          {/* Enseignant */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700">Enseignant *</label>
            <FacultySearch
              onSelect={(faculty) =>
                setForm((prev) => ({ ...prev, facultyMemberId: faculty.id }))
              }
            />
          </div>

          {/* Matière */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">Matière (ECUE) *</label>
            <select
              value={form.courseId}
              onChange={field("courseId")}
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            >
              <option value="">Sélectionner une matière</option>
              {coursesData?.data?.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Année académique — auto-filled from selected year */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">Année académique</label>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              {yearLabel ?? selectedYear?.name ?? "—"}
            </div>
          </div>

          {/* Intitulé */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700">Intitulé *</label>
            <input
              type="text"
              value={form.title}
              onChange={field("title")}
              placeholder="ex: CC1 — Analyse Mathématique"
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            />
          </div>

          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">Type *</label>
            <select
              value={form.type}
              onChange={field("type")}
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            >
              {Object.values(AssessmentType).map((t) => (
                <option key={t} value={t}>
                  {ASSESSMENT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={field("date")}
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            />
          </div>

          {/* Heure de début */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">Heure de début</label>
            <input
              type="time"
              value={form.startTime}
              onChange={field("startTime")}
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            />
          </div>

          {/* Durée */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">Durée (minutes)</label>
            <input
              type="number"
              value={form.durationMinutes}
              onChange={field("durationMinutes")}
              min={1}
              max={480}
              placeholder="ex: 90"
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            />
          </div>

          {/* Salle */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">Salle</label>
            <input
              type="text"
              value={form.room}
              onChange={field("room")}
              placeholder="ex: Amphi A"
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            />
          </div>

          {/* Coefficient */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Coefficient dans le CC
              <span className="ml-1 font-normal text-zinc-400">(0 à 1)</span>
            </label>
            <input
              type="number"
              value={form.coefficient}
              onChange={field("coefficient")}
              min={0}
              max={1}
              step={0.1}
              placeholder="ex: 0.5"
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            />
          </div>

          {/* Observations */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700">Observations</label>
            <textarea
              value={form.notes}
              onChange={field("notes")}
              rows={3}
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !form.courseId || !form.facultyMemberId || !form.academicYearId || !form.title || !form.date}
            className="rounded-lg bg-[#008D36] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Enregistrement..." : submitLabel}
          </button>
        </div>
      </div>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={onCloseToast}
      />
    </>
  );
}
