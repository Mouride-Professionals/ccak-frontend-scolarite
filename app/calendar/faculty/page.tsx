"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import FacultySearch from "@/components/faculty-members/faculty-search";
import ScheduleGrid from "@/components/calendar/schedule-grid";
import { useFacultySchedule } from "@/hooks/use-calendar";

export default function FacultySchedulePage() {
  const [facultyId, setFacultyId] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [week, setWeek] = useState("");
  const [month, setMonth] = useState("");

  const { data: schedule, isLoading } = useFacultySchedule(facultyId, {
    week: week || undefined,
    month: month || undefined,
  });

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
            <p className="mt-3 text-xs text-zinc-500">
              Renseignez une semaine ou un mois pour filtrer l'emploi du temps.
            </p>
          </div>
        </div>

        {!facultyId ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
            Sélectionnez un enseignant pour afficher son emploi du temps.
          </div>
        ) : (
          <ScheduleGrid
            schedules={schedule ?? []}
            isLoading={isLoading}
            emptyMessage="Aucune séance pour cet enseignant."
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
