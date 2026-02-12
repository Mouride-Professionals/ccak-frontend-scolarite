"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import RichTextEditor from "@/components/shared/rich-text-editor";
import { useCourses } from "@/hooks/use-courses";
import { useSchedules } from "@/hooks/use-calendar";
import { useCreateCourseLog } from "@/hooks/use-course-logs";
import { useAutosave } from "@/hooks/use-autosave";
import { sanitizeHtml } from "@/lib/sanitize";

const DRAFT_KEY = "course-log-draft:v1";

const dayLabels: Record<string, string> = {
  MON: "Lundi",
  TUE: "Mardi",
  WED: "Mercredi",
  THU: "Jeudi",
  FRI: "Vendredi",
  SAT: "Samedi",
  SUN: "Dimanche",
};

const formatTime = (value?: string) => (value ? value.slice(0, 5) : "");

const parseList = (value: string) =>
  value
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const toIsoDateTime = (value: string) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toISOString();
};

export default function CourseLogEntryPage() {
  const { data: courses } = useCourses({ page: 1, limit: 100 });
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState(() => {
    if (typeof window === "undefined") {
      return {
        course_id: "",
        schedule_id: "",
        session_date: "",
        topics: "",
        chapters: "",
        objectives: "",
        notes: "",
        signed_off: false,
      };
    }

    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        return {
          course_id: "",
          schedule_id: "",
          session_date: "",
          topics: "",
          chapters: "",
          objectives: "",
          notes: "",
          signed_off: false,
        };
      }

      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return {
        course_id: String(parsed.course_id || ""),
        schedule_id: String(parsed.schedule_id || ""),
        session_date: String(parsed.session_date || ""),
        topics: String(parsed.topics || ""),
        chapters: String(parsed.chapters || ""),
        objectives: String(parsed.objectives || ""),
        notes: String(parsed.notes || ""),
        signed_off: Boolean(parsed.signed_off),
      };
    } catch {
      return {
        course_id: "",
        schedule_id: "",
        session_date: "",
        topics: "",
        chapters: "",
        objectives: "",
        notes: "",
        signed_off: false,
      };
    }
  });

  const schedulesQuery = useSchedules({
    page: 1,
    limit: 50,
    course_id: form.course_id || undefined,
  });

  const createLog = useCreateCourseLog();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const scheduleOptions = useMemo(() => schedulesQuery.data?.data ?? [], [schedulesQuery.data]);

  const { isSaving, lastSaved, triggerSave } = useAutosave({
    data: form,
    delay: 3000,
    enabled: true,
    onSave: async (draft) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    },
  });

  const handleSubmit = async () => {
    if (!form.schedule_id || !form.session_date || !form.topics.trim()) {
      setToast({ isOpen: true, message: "Veuillez remplir les champs requis.", type: "error" });
      return;
    }

    try {
      await triggerSave();
      await createLog.mutateAsync({
        schedule_id: form.schedule_id,
        session_date: toIsoDateTime(form.session_date),
        topics: parseList(form.topics),
        chapters: form.chapters ? parseList(form.chapters) : undefined,
        objectives: form.objectives ? parseList(form.objectives) : undefined,
        notes: form.notes || undefined,
      });

      localStorage.removeItem(DRAFT_KEY);
      setToast({ isOpen: true, message: "Cahier de texte enregistré.", type: "success" });
      setForm({
        course_id: "",
        schedule_id: "",
        session_date: "",
        topics: "",
        chapters: "",
        objectives: "",
        notes: "",
        signed_off: false,
      });
      setShowPreview(false);
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'enregistrement.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouveau cahier de texte">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-600">
          <div>
            {isSaving ? "Auto-sauvegarde en cours..." : "Auto-sauvegarde active"}
            {lastSaved && ` · Dernière sauvegarde: ${lastSaved.toLocaleTimeString("fr-FR")}`}
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(DRAFT_KEY);
              setForm({
                course_id: "",
                schedule_id: "",
                session_date: "",
                topics: "",
                chapters: "",
                objectives: "",
                notes: "",
                signed_off: false,
              });
            }}
            className="rounded-md border border-zinc-300 px-2 py-1 font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Vider le brouillon
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Séance</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Cours</label>
                <select
                  value={form.course_id}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      course_id: event.target.value,
                      schedule_id: "",
                    }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner un cours</option>
                  {(courses?.data ?? []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Séance planifiée
                </label>
                <select
                  value={form.schedule_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, schedule_id: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner</option>
                  {scheduleOptions.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {dayLabels[schedule.day_of_week] ?? schedule.day_of_week} ·{" "}
                      {formatTime(schedule.start_time)}-{formatTime(schedule.end_time)} ·{" "}
                      {schedule.course_name ?? schedule.course_id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Date</label>
                <input
                  type="date"
                  value={form.session_date}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, session_date: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Contenu pédagogique</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Sujets abordés
                </label>
                <textarea
                  value={form.topics}
                  onChange={(event) => setForm((prev) => ({ ...prev, topics: event.target.value }))}
                  rows={4}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  placeholder="Un sujet par ligne"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Chapitres</label>
                <textarea
                  value={form.chapters}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, chapters: event.target.value }))
                  }
                  rows={2}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Objectifs pédagogiques
                </label>
                <textarea
                  value={form.objectives}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, objectives: event.target.value }))
                  }
                  rows={3}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-zinc-700">Notes de séance</label>
                  <button
                    type="button"
                    onClick={() => setShowPreview((prev) => !prev)}
                    className="text-xs font-medium text-[#00365F] hover:text-[#008D36]"
                  >
                    {showPreview ? "Modifier" : "Prévisualiser"}
                  </button>
                </div>
                {showPreview ? (
                  <div
                    className="min-h-[160px] rounded-lg border border-zinc-300 bg-white p-3 text-sm"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(form.notes || "") }}
                  />
                ) : (
                  <RichTextEditor
                    value={form.notes}
                    onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))}
                    placeholder="Ajoutez des notes riches (gras, listes, titres)..."
                    minHeightClassName="min-h-[160px]"
                  />
                )}
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={form.signed_off}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      signed_off: event.target.checked,
                    }))
                  }
                  className="rounded border-zinc-300"
                />
                Séance relue et validée
              </label>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!form.signed_off || createLog.isPending}
                className="w-full rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createLog.isPending ? "Enregistrement..." : "Enregistrer le cahier de texte"}
              </button>
            </div>
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
