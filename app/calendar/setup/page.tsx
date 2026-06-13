"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import { useCurrentAcademicYear } from "@/hooks/use-academic-years";
import { useAcademicCalendar, useSaveAcademicCalendar } from "@/hooks/use-calendar";
import type { AcademicCalendar, DayOfWeek } from "@/types/calendar";

const dayOptions: Array<{ value: DayOfWeek; label: string }> = [
  { value: "MON", label: "Lundi" },
  { value: "TUE", label: "Mardi" },
  { value: "WED", label: "Mercredi" },
  { value: "THU", label: "Jeudi" },
  { value: "FRI", label: "Vendredi" },
  { value: "SAT", label: "Samedi" },
  { value: "SUN", label: "Dimanche" },
];

const overlapsBreak = (
  slot: { start: string; end: string },
  breaks: Array<{ start: string; end: string; label?: string }>
) => breaks.some((breakItem) => breakItem.start < slot.end && breakItem.end > slot.start);

export default function CalendarSetupPage() {
  const { data: currentYear } = useCurrentAcademicYear();
  const [yearId, setYearId] = useState("");
  const { data: calendar } = useAcademicCalendar(yearId || undefined);
  const saveMutation = useSaveAcademicCalendar();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [form, setForm] = useState<AcademicCalendar>({
    id: "",
    academic_year_id: "",
    start_date: "",
    end_date: "",
    working_days: ["MON", "TUE", "WED", "THU", "FRI"],
    hour_slots: [{ start: "08:00", end: "10:00" }],
    breaks: [{ start: "12:00", end: "13:00", label: "Pause déjeuner" }],
  });

  useEffect(() => {
    if (currentYear && !yearId) setYearId(currentYear.id);
  }, [currentYear, yearId]);

  useEffect(() => {
    if (!calendar) return;
    const timer = window.setTimeout(() => {
      setForm({
        ...calendar,
        working_days: calendar.working_days || [],
        hour_slots: calendar.hour_slots || [],
        breaks: calendar.breaks || [],
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [calendar]);

  const handleToggleDay = (day: DayOfWeek) => {
    setForm((prev) => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter((d) => d !== day)
        : [...prev.working_days, day],
    }));
  };

  const handleAddSlot = () => {
    setForm((prev) => ({
      ...prev,
      hour_slots: [...prev.hour_slots, { start: "10:00", end: "12:00" }],
    }));
  };

  const handleRemoveSlot = (index: number) => {
    setForm((prev) => ({
      ...prev,
      hour_slots: prev.hour_slots.filter((_, idx) => idx !== index),
    }));
  };

  const handleAddBreak = () => {
    setForm((prev) => ({
      ...prev,
      breaks: [...(prev.breaks || []), { start: "12:00", end: "13:00", label: "Pause" }],
    }));
  };

  const handleRemoveBreak = (index: number) => {
    setForm((prev) => ({
      ...prev,
      breaks: (prev.breaks || []).filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async () => {
    if (!yearId) {
      setToast({
        isOpen: true,
        message: "Sélectionnez une année académique.",
        type: "error",
      });
      return;
    }

    const payload = { ...form, academic_year_id: yearId };
    try {
      await saveMutation.mutateAsync({ id: calendar?.id, payload });
      setToast({
        isOpen: true,
        message: "Calendrier enregistré.",
        type: "success",
      });
    } catch {
      setToast({
        isOpen: true,
        message: "Erreur lors de l'enregistrement.",
        type: "error",
      });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Configuration du calendrier">
        <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Année académique
              </label>
              <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                {currentYear?.name ?? "Chargement..."}
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Période</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, start_date: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                />
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, end_date: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">Jours ouvrés</label>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => (
                <button
                  type="button"
                  key={day.value}
                  onClick={() => handleToggleDay(day.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    form.working_days.includes(day.value)
                      ? "bg-[#008D36] text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700">Créneaux horaires</label>
              <button
                type="button"
                onClick={handleAddSlot}
                className="text-sm font-medium text-[#008D36] hover:text-[#007A2E]"
              >
                Ajouter un créneau
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {form.hour_slots.map((slot, index) => (
                <div key={`${slot.start}-${index}`} className="flex flex-wrap items-center gap-3">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        hour_slots: prev.hour_slots.map((item, idx) =>
                          idx === index ? { ...item, start: event.target.value } : item
                        ),
                      }))
                    }
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  />
                  <span className="text-sm text-zinc-500">→</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        hour_slots: prev.hour_slots.map((item, idx) =>
                          idx === index ? { ...item, end: event.target.value } : item
                        ),
                      }))
                    }
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700">Temps de pause</label>
              <button
                type="button"
                onClick={handleAddBreak}
                className="text-sm font-medium text-[#00365F] hover:text-[#002849]"
              >
                Ajouter une pause
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {(form.breaks || []).map((breakItem, index) => (
                <div
                  key={`${breakItem.start}-${breakItem.end}-${index}`}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 p-3 sm:grid-cols-[120px_120px_1fr_auto]"
                >
                  <input
                    type="time"
                    value={breakItem.start}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        breaks: (prev.breaks || []).map((item, idx) =>
                          idx === index ? { ...item, start: event.target.value } : item
                        ),
                      }))
                    }
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="time"
                    value={breakItem.end}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        breaks: (prev.breaks || []).map((item, idx) =>
                          idx === index ? { ...item, end: event.target.value } : item
                        ),
                      }))
                    }
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={breakItem.label || ""}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        breaks: (prev.breaks || []).map((item, idx) =>
                          idx === index ? { ...item, label: event.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Libellé de pause"
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBreak(index)}
                    className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-sm font-semibold text-[#00365F]">Aperçu hebdomadaire</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Prévisualisation des créneaux de cours et pauses par jour ouvré.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="px-2 py-2 text-left font-semibold text-zinc-600">Créneau</th>
                    {form.working_days.map((day) => (
                      <th key={day} className="px-2 py-2 text-left font-semibold text-zinc-600">
                        {dayOptions.find((item) => item.value === day)?.label || day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.hour_slots.map((slot, index) => {
                    const isBreak = overlapsBreak(slot, form.breaks || []);
                    return (
                      <tr
                        key={`${slot.start}-${slot.end}-${index}`}
                        className="border-b border-zinc-100"
                      >
                        <td className="px-2 py-2 font-medium text-zinc-700">
                          {slot.start} - {slot.end}
                        </td>
                        {form.working_days.map((day) => (
                          <td key={`${day}-${index}`} className="px-2 py-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 ${
                                isBreak
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {isBreak ? "Pause" : "Cours"}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-[#008D36] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#007A2E]"
            >
              Enregistrer
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
