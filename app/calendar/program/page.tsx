"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import ScheduleGrid from "@/components/calendar/schedule-grid";
import Toast from "@/components/ui/toast";
import { useAcademicPrograms } from "@/hooks/use-academic";
import { useProgramSchedule, useUpdateSchedule } from "@/hooks/use-calendar";
import { exportSchedulesToPdf } from "@/lib/pdf/schedule-export";
import type { DayOfWeek, Schedule } from "@/types/calendar";

const dayOptions: Array<{ value: DayOfWeek; label: string }> = [
  { value: "MON", label: "Lundi" },
  { value: "TUE", label: "Mardi" },
  { value: "WED", label: "Mercredi" },
  { value: "THU", label: "Jeudi" },
  { value: "FRI", label: "Vendredi" },
  { value: "SAT", label: "Samedi" },
  { value: "SUN", label: "Dimanche" },
];

export default function ProgramSchedulePage() {
  const [search, setSearch] = useState("");
  const [programId, setProgramId] = useState("");
  const [semester, setSemester] = useState("");
  const [week, setWeek] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    day_of_week: "MON" as DayOfWeek,
    start_time: "08:00",
    end_time: "10:00",
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const { data: programs, isLoading: loadingPrograms } = useAcademicPrograms({
    search: search || undefined,
    page: 1,
    limit: 15,
  });

  const { data: schedule, isLoading } = useProgramSchedule(programId, {
    semester: semester ? Number(semester) : undefined,
    week: week || undefined,
  });
  const updateSchedule = useUpdateSchedule();

  const selectedProgram = useMemo(
    () => (programs?.data ?? []).find((program) => program.id === programId),
    [programId, programs?.data]
  );

  const handleExportPdf = async () => {
    if (!schedule || schedule.length === 0) return;

    try {
      await exportSchedulesToPdf(schedule, {
        title: "Emploi du temps programme",
        subtitle: `${selectedProgram?.name || "Programme"} ${semester ? `- Semestre ${semester}` : ""}`,
        fileName: `edt-programme-${programId || "selection"}.pdf`,
      });
      setToast({ isOpen: true, message: "PDF exporté.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'export PDF.", type: "error" });
    }
  };

  const handlePrepareEdit = (item: Schedule) => {
    setEditingScheduleId(item.id);
    setEditForm({
      day_of_week: item.day_of_week,
      start_time: item.start_time.slice(0, 5),
      end_time: item.end_time.slice(0, 5),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingScheduleId) return;

    try {
      await updateSchedule.mutateAsync({
        id: editingScheduleId,
        input: {
          day_of_week: editForm.day_of_week,
          start_time: editForm.start_time,
          end_time: editForm.end_time,
        },
      });
      setToast({ isOpen: true, message: "Séance mise à jour.", type: "success" });
      setEditingScheduleId(null);
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la mise à jour.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Emploi du temps programme">
        <ListHeader
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher un programme..."
          rightSlot={
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="week"
                value={week}
                onChange={(event) => setWeek(event.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={1}
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                placeholder="Semestre"
                className="w-28 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={!programId || (schedule?.length ?? 0) === 0}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-[#00365F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export PDF
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                disabled={!programId || (schedule?.length ?? 0) === 0}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-[#00365F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Imprimer
              </button>
            </div>
          }
        />

        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Sélectionner un programme
          </label>
          <select
            value={programId}
            onChange={(event) => setProgramId(event.target.value)}
            className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">{loadingPrograms ? "Chargement..." : "Choisir"}</option>
            {(programs?.data ?? []).map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
            <input
              id="admin-mode"
              type="checkbox"
              checked={adminMode}
              onChange={(event) => setAdminMode(event.target.checked)}
            />
            <label htmlFor="admin-mode">Activer les contrôles admin (édition rapide)</label>
          </div>
        </div>

        {!programId ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
            Sélectionnez un programme pour afficher l&apos;emploi du temps.
          </div>
        ) : (
          <>
            <ScheduleGrid
              schedules={schedule ?? []}
              isLoading={isLoading}
              emptyMessage="Aucune séance pour ce programme."
              showLegend
              renderActions={
                adminMode
                  ? (item) => (
                      <button
                        type="button"
                        onClick={() => handlePrepareEdit(item)}
                        className="text-[11px] font-medium text-[#00365F]"
                      >
                        Modifier ce créneau
                      </button>
                    )
                  : undefined
              }
            />

            {adminMode && editingScheduleId && (
              <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-[#00365F]">Édition rapide du créneau</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <select
                    value={editForm.day_of_week}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        day_of_week: event.target.value as DayOfWeek,
                      }))
                    }
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  >
                    {dayOptions.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={editForm.start_time}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, start_time: event.target.value }))
                    }
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="time"
                    value={editForm.end_time}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, end_time: event.target.value }))
                    }
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingScheduleId(null)}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </>
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
