"use client";

import { useState, useEffect, useCallback } from "react";
import type { CreateExamScheduleInput, ConflictResult, ExamSession } from "@/types/exam";
import { useCheckConflicts } from "@/hooks/use-exams";

interface CourseOption {
  id: string;
  code: string;
  name: string;
  credits: number;
  enrolled_count?: number;
}

interface RoomOption {
  id: string;
  name: string | null;
  room_number: string;
  capacity: number;
  type: string;
}

interface InvigilatorOption {
  id: string;
  full_name: string;
  rank?: string;
}

interface ExamScheduleFormProps {
  session: ExamSession;
  courses: CourseOption[];
  rooms: RoomOption[];
  invigilators: InvigilatorOption[];
  onSubmit: (data: CreateExamScheduleInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  preselectedCourseId?: string;
  preselectedDate?: string;
  excludeScheduleId?: string;
}

interface FormErrors {
  course_id?: string;
  room_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  invigilator_ids?: string;
}

export default function ExamScheduleForm({
  session,
  courses,
  rooms,
  invigilators,
  onSubmit,
  onCancel,
  isLoading,
  preselectedCourseId,
  preselectedDate,
  excludeScheduleId,
}: ExamScheduleFormProps) {
  const [formData, setFormData] = useState<CreateExamScheduleInput>({
    course_id: preselectedCourseId ?? "",
    room_id: "",
    date: preselectedDate ?? "",
    start_time: "08:00",
    end_time: "10:00",
    invigilator_ids: [],
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [conflicts, setConflicts] = useState<ConflictResult | null>(null);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  const checkConflictsMutation = useCheckConflicts();

  const selectedCourse = courses.find((c) => c.id === formData.course_id);
  // Filter rooms: show all but visually flag under-capacity
  const sortedRooms = [...rooms].sort((a, b) => {
    const aFits = !selectedCourse || a.capacity >= (selectedCourse.enrolled_count ?? 0);
    const bFits = !selectedCourse || b.capacity >= (selectedCourse.enrolled_count ?? 0);
    if (aFits && !bFits) return -1;
    if (!aFits && bFits) return 1;
    return a.capacity - b.capacity;
  });

  const runConflictCheck = useCallback(async () => {
    if (!formData.room_id || !formData.date || !formData.start_time || !formData.end_time) return;
    if (formData.end_time <= formData.start_time) return;

    setIsCheckingConflicts(true);
    try {
      const result = await checkConflictsMutation.mutateAsync({
        room_id: formData.room_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        invigilator_ids: formData.invigilator_ids,
        exclude_schedule_id: excludeScheduleId,
      });
      setConflicts(result);
    } catch {
      // silent — conflicts are informational
    } finally {
      setIsCheckingConflicts(false);
    }
  }, [formData.room_id, formData.date, formData.start_time, formData.end_time, formData.invigilator_ids, excludeScheduleId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(runConflictCheck, 400);
    return () => clearTimeout(timer);
  }, [runConflictCheck]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.course_id) newErrors.course_id = "La matière est requise.";
    if (!formData.room_id) newErrors.room_id = "La salle est requise.";
    if (!formData.date) newErrors.date = "La date est requise.";
    if (formData.date < session.start_date || formData.date > session.end_date) {
      newErrors.date = `La date doit être entre le ${session.start_date} et le ${session.end_date}.`;
    }
    if (!formData.start_time) newErrors.start_time = "L'heure de début est requise.";
    if (!formData.end_time) newErrors.end_time = "L'heure de fin est requise.";
    if (formData.start_time && formData.end_time && formData.end_time <= formData.start_time) {
      newErrors.end_time = "L'heure de fin doit être après l'heure de début.";
    }
    if (formData.invigilator_ids.length === 0) {
      newErrors.invigilator_ids = "Au moins un surveillant est requis.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const toggleInvigilator = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      invigilator_ids: prev.invigilator_ids.includes(id)
        ? prev.invigilator_ids.filter((x) => x !== id)
        : [...prev.invigilator_ids, id],
    }));
  };

  const field = (key: keyof CreateExamScheduleInput, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const inputClass = (err?: string) =>
    `block w-full rounded-lg border px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-1 ${
      err
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "border-zinc-300 focus:border-[#008D36] focus:ring-[#008D36]"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Conflict alerts */}
      {isCheckingConflicts && (
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Vérification des conflits...
        </div>
      )}
      {!isCheckingConflicts && conflicts?.has_conflicts && (
        <div className="space-y-1.5">
          {conflicts.conflicts.map((c, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
            >
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {c.message}
            </div>
          ))}
        </div>
      )}
      {!isCheckingConflicts && conflicts && !conflicts.has_conflicts && formData.room_id && formData.date && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
          <svg className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Aucun conflit détecté
        </div>
      )}

      {/* Matière */}
      <div>
        <label htmlFor="course_id" className="block text-sm font-medium text-zinc-700 mb-1.5">
          Matière <span className="text-red-500">*</span>
        </label>
        <select
          id="course_id"
          value={formData.course_id}
          onChange={(e) => field("course_id", e.target.value)}
          className={inputClass(errors.course_id)}
        >
          <option value="">Sélectionner une matière</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.name} ({c.credits} cr.)
              {c.enrolled_count ? ` · ${c.enrolled_count} inscrits` : ""}
            </option>
          ))}
        </select>
        {errors.course_id && <p className="mt-1.5 text-xs text-red-600">{errors.course_id}</p>}
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-zinc-700 mb-1.5">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={formData.date}
          min={session.start_date}
          max={session.end_date}
          onChange={(e) => field("date", e.target.value)}
          className={inputClass(errors.date)}
        />
        {errors.date && <p className="mt-1.5 text-xs text-red-600">{errors.date}</p>}
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Heure début <span className="text-red-500">*</span>
          </label>
          <input
            id="start_time"
            type="time"
            value={formData.start_time}
            onChange={(e) => field("start_time", e.target.value)}
            className={inputClass(errors.start_time)}
          />
          {errors.start_time && <p className="mt-1.5 text-xs text-red-600">{errors.start_time}</p>}
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Heure fin <span className="text-red-500">*</span>
          </label>
          <input
            id="end_time"
            type="time"
            value={formData.end_time}
            onChange={(e) => field("end_time", e.target.value)}
            className={inputClass(errors.end_time)}
          />
          {errors.end_time && <p className="mt-1.5 text-xs text-red-600">{errors.end_time}</p>}
        </div>
      </div>

      {/* Salle */}
      <div>
        <label htmlFor="room_id" className="block text-sm font-medium text-zinc-700 mb-1.5">
          Salle <span className="text-red-500">*</span>
          {selectedCourse?.enrolled_count && (
            <span className="ml-2 text-xs font-normal text-zinc-500">
              (besoin: {selectedCourse.enrolled_count} places)
            </span>
          )}
        </label>
        <select
          id="room_id"
          value={formData.room_id}
          onChange={(e) => field("room_id", e.target.value)}
          className={inputClass(errors.room_id)}
        >
          <option value="">Sélectionner une salle</option>
          {sortedRooms.map((r) => {
            const tooSmall =
              selectedCourse?.enrolled_count &&
              r.capacity < selectedCourse.enrolled_count;
            return (
              <option key={r.id} value={r.id}>
                {r.name ?? r.room_number} — {r.capacity} places
                {tooSmall ? " ⚠ capacité insuffisante" : ""}
              </option>
            );
          })}
        </select>
        {errors.room_id && <p className="mt-1.5 text-xs text-red-600">{errors.room_id}</p>}
      </div>

      {/* Surveillants */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Surveillants <span className="text-red-500">*</span>
          <span className="ml-2 text-xs font-normal text-zinc-500">
            ({formData.invigilator_ids.length} sélectionné
            {formData.invigilator_ids.length !== 1 ? "s" : ""})
          </span>
        </label>
        <div
          className={`max-h-40 overflow-y-auto rounded-lg border ${
            errors.invigilator_ids ? "border-red-300" : "border-zinc-300"
          }`}
        >
          {invigilators.map((m) => (
            <label
              key={m.id}
              className="flex cursor-pointer items-center gap-3 border-b border-zinc-100 px-3 py-2.5 last:border-0 hover:bg-zinc-50"
            >
              <input
                type="checkbox"
                checked={formData.invigilator_ids.includes(m.id)}
                onChange={() => toggleInvigilator(m.id)}
                className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
              />
              <span className="flex-1 text-sm text-zinc-900">{m.full_name}</span>
              {m.rank && <span className="text-xs text-zinc-400">{m.rank}</span>}
            </label>
          ))}
          {invigilators.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-zinc-400">
              Aucun enseignant disponible
            </div>
          )}
        </div>
        {errors.invigilator_ids && (
          <p className="mt-1.5 text-xs text-red-600">{errors.invigilator_ids}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 mb-1.5">
          Notes <span className="text-xs font-normal text-zinc-400">(optionnel)</span>
        </label>
        <textarea
          id="notes"
          value={formData.notes ?? ""}
          onChange={(e) => field("notes", e.target.value)}
          rows={2}
          placeholder="Instructions spéciales, matériel autorisé..."
          className="block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:opacity-50"
        >
          {isLoading && (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          Confirmer
        </button>
      </div>
    </form>
  );
}
