"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import { useCourses } from "@/hooks/use-courses";
import { useSchedules } from "@/hooks/use-calendar";
import { useCreateCourseLog } from "@/hooks/use-course-logs";

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

const parseTopics = (value: string) =>
  value
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);

export default function CourseLogEntryPage() {
  const { data: courses } = useCourses({ page: 1, limit: 100 });
  const [form, setForm] = useState({
    course_id: "",
    schedule_id: "",
    date: "",
    topics: "",
    chapters: "",
    objectives: "",
    notes: "",
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

  const handleSubmit = async () => {
    if (!form.schedule_id || !form.date || !form.topics.trim()) {
      setToast({ isOpen: true, message: "Veuillez remplir les champs requis.", type: "error" });
      return;
    }
    try {
      await createLog.mutateAsync({
        schedule_id: form.schedule_id,
        date: form.date,
        topics: parseTopics(form.topics),
        chapters: form.chapters || undefined,
        objectives: form.objectives || undefined,
        notes: form.notes || undefined,
      });
      setToast({ isOpen: true, message: "Cahier de texte enregistré.", type: "success" });
      setForm((prev) => ({
        ...prev,
        schedule_id: "",
        date: "",
        topics: "",
        chapters: "",
        objectives: "",
        notes: "",
      }));
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'enregistrement.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouveau cahier de texte">
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
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Contenu</h2>
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
                <input
                  value={form.chapters}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, chapters: event.target.value }))
                  }
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
                <label className="mb-2 block text-sm font-medium text-zinc-700">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
              >
                Enregistrer le cahier de texte
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
