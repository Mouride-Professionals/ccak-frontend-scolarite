"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import ScheduleGrid from "@/components/calendar/schedule-grid";
import { useAcademicPrograms } from "@/hooks/use-academic";
import { useProgramSchedule } from "@/hooks/use-calendar";

export default function ProgramSchedulePage() {
  const [search, setSearch] = useState("");
  const [programId, setProgramId] = useState("");
  const [semester, setSemester] = useState("");
  const [week, setWeek] = useState("");

  const { data: programs, isLoading: loadingPrograms } = useAcademicPrograms({
    search: search || undefined,
    page: 1,
    limit: 15,
  });

  const { data: schedule, isLoading } = useProgramSchedule(programId, {
    semester: semester ? Number(semester) : undefined,
    week: week || undefined,
  });

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
          <p className="mt-2 text-xs text-zinc-500">
            Utilisez la recherche pour filtrer la liste des programmes.
          </p>
        </div>

        {!programId ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
            Sélectionnez un programme pour afficher l'emploi du temps.
          </div>
        ) : (
          <ScheduleGrid
            schedules={schedule ?? []}
            isLoading={isLoading}
            emptyMessage="Aucune séance pour ce programme."
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
