"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import FacultySearch from "@/components/faculty-members/faculty-search";
import ScheduleGrid from "@/components/calendar/schedule-grid";
import Toast from "@/components/ui/toast";
import { useFacultySchedule } from "@/hooks/use-calendar";
import { exportSchedulesToPdf } from "@/lib/pdf/schedule-export";

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function FacultySchedulePage() {
  const [facultyId, setFacultyId] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [week, setWeek] = useState("");
  const [month, setMonth] = useState("");
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const { data: schedule, isLoading } = useFacultySchedule(facultyId, {
    week: week || undefined,
    month: month || undefined,
  });

  const summary = useMemo(() => {
    const source = schedule || [];
    const totalHours = source.reduce((sum, item) => {
      const minutes = Math.max(0, toMinutes(item.end_time) - toMinutes(item.start_time));
      return sum + minutes / 60;
    }, 0);

    const byDay = source.reduce<Record<string, number>>((acc, item) => {
      const minutes = Math.max(0, toMinutes(item.end_time) - toMinutes(item.start_time));
      acc[item.day_of_week] = (acc[item.day_of_week] || 0) + minutes / 60;
      return acc;
    }, {});

    return { totalHours, byDay };
  }, [schedule]);

  const handleExportPdf = async () => {
    if (!schedule || schedule.length === 0) return;

    try {
      await exportSchedulesToPdf(schedule, {
        title: "Emploi du temps enseignant",
        subtitle: `${facultyName || "Enseignant"} ${week ? `- Semaine ${week}` : month ? `- Mois ${month}` : ""}`,
        fileName: `edt-enseignant-${facultyId || "selection"}.pdf`,
      });
      setToast({ isOpen: true, message: "PDF exporté.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'export PDF.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Emploi du temps enseignant">
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Rechercher un enseignant
            </label>
            <FacultySearch
              value={facultyName}
              onSelect={(faculty) => {
                setFacultyId(faculty.id);
                setFacultyName(faculty.full_name);
              }}
            />
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Semaine</label>
                <input
                  type="week"
                  value={week}
                  onChange={(event) => setWeek(event.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Mois</label>
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={!facultyId || (schedule?.length ?? 0) === 0}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-[#00365F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {facultyId && (
          <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[#00365F]">Résumé des heures</h3>
            <p className="mt-2 text-sm text-zinc-700">
              Charge totale: <span className="font-semibold">{summary.totalHours.toFixed(1)}h</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(summary.byDay).map(([day, hours]) => (
                <span
                  key={day}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700"
                >
                  {day}: {hours.toFixed(1)}h
                </span>
              ))}
              {Object.keys(summary.byDay).length === 0 && (
                <span className="text-xs text-zinc-500">
                  Aucune donnée horaire pour le filtre courant.
                </span>
              )}
            </div>
          </div>
        )}

        {!facultyId ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
            Sélectionnez un enseignant pour afficher son emploi du temps.
          </div>
        ) : (
          <ScheduleGrid
            schedules={schedule ?? []}
            isLoading={isLoading}
            emptyMessage="Aucune séance pour cet enseignant."
            showLegend
          />
        )}

        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
