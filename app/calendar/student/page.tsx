"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ScheduleGrid from "@/components/calendar/schedule-grid";
import ListHeader from "@/components/ui/list-header";
import { useStudents } from "@/hooks/use-students";
import { useStudentSchedule } from "@/hooks/use-calendar";

export default function StudentSchedulePage() {
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [week, setWeek] = useState("");

  const { data: students, isLoading: isLoadingStudents } = useStudents({
    search: search || undefined,
    page: 1,
    limit: 10,
  });
  const { data: schedule, isLoading: isLoadingSchedule } = useStudentSchedule(selectedStudentId, {
    week: week || undefined,
  });

  return (
    <ProtectedRoute>
      <DashboardLayout title="Emploi du temps étudiant">
        <ListHeader
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher un étudiant..."
          rightSlot={
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="week"
                value={week}
                onChange={(event) => setWeek(event.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          }
        />

        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Sélectionner un étudiant
          </label>
          <select
            value={selectedStudentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">{isLoadingStudents ? "Chargement..." : "Choisir"}</option>
            {(students?.data ?? []).map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name} · {student.student_number}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-zinc-500">
            Utilisez la recherche pour filtrer rapidement les étudiants.
          </p>
        </div>

        {!selectedStudentId ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
            Sélectionnez un étudiant pour afficher son emploi du temps.
          </div>
        ) : (
          <ScheduleGrid
            schedules={schedule ?? []}
            isLoading={isLoadingSchedule}
            emptyMessage="Aucune séance pour cet étudiant."
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
