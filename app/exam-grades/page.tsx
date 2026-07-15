"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import { useExamSchedulesList, useExamSessions } from "@/hooks/use-exams";
import { useAcademicYears } from "@/hooks/use-enrollments";
import { useSelectedYear } from "@/hooks/use-selected-year";
import type { ExamSession } from "@/types/exam";

export default function ExamGradesPage() {
  const router = useRouter();
  const { selectedYear } = useSelectedYear();
  const { data: years } = useAcademicYears();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    academicYearId: "",
    examSessionId: "",
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, academicYearId: selectedYear?.id ?? "" }));
  }, [selectedYear?.id]);

  const { data: sessionsData } = useExamSessions(
    filters.academicYearId ? { academic_year_id: filters.academicYearId } : undefined
  );
  const sessions: ExamSession[] = sessionsData?.data ?? [];

  const sessionMap = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);

  const { data: schedulesData, isLoading } = useExamSchedulesList({
    academic_year_id: filters.academicYearId || undefined,
    exam_session_id: filters.examSessionId || undefined,
  });
  const schedules = schedulesData?.data ?? [];

  const activeFilters = [filters.academicYearId, filters.examSessionId].filter(Boolean).length;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Fiches de notes">
        <ListHeader
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Rechercher..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={activeFilters}
        />

        {showFilters && (
          <div className="mb-6 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Année académique
                </label>
                <select
                  value={filters.academicYearId}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      academicYearId: e.target.value,
                      examSessionId: "",
                    }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Toutes les années</option>
                  {Array.isArray(years) &&
                    years.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name} {year.is_current && "(Actuelle)"}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Session d&apos;examen
                </label>
                <select
                  value={filters.examSessionId}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, examSessionId: e.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Toutes les sessions</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Chargement...
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Aucune épreuve trouvée. Sélectionnez une session pour afficher les fiches de notes.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50">
                <tr>
                  {["Matière", "Session", "Date", "Horaire", "Salle", "Anonymat", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {schedules.map((schedule) => {
                  const session = sessionMap.get(schedule.exam_session_id);
                  return (
                    <tr key={schedule.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        {schedule.course ? (
                          <span>
                            <span className="font-mono text-xs text-zinc-400">
                              {schedule.course.code}
                            </span>{" "}
                            <span className="text-sm font-medium text-[#00365F]">
                              {schedule.course.name}
                            </span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{session?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">
                        {schedule.date ? new Date(schedule.date).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">
                        {schedule.start_time} – {schedule.end_time}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">
                        {schedule.room?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {session ? (
                          session.use_exam_number ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              Anonymat
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                              Normal
                            </span>
                          )
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => router.push(`/exam-grades/${schedule.id}`)}
                          className="text-sm font-medium text-[#008D36] transition-colors hover:text-[#007A2E]"
                        >
                          Saisir notes →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
