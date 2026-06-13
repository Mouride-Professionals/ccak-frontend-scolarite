"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ScheduleGrid from "@/components/calendar/schedule-grid";
import ListHeader from "@/components/ui/list-header";
import Toast from "@/components/ui/toast";
import { useStudents } from "@/hooks/use-students";
import { useStudentSchedule } from "@/hooks/use-calendar";
import { exportSchedulesToPdf } from "@/lib/pdf/schedule-export";

export default function StudentSchedulePage() {
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [week, setWeek] = useState("");
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const { data: students, isLoading: isLoadingStudents } = useStudents({
    search: search || undefined,
    page: 1,
    limit: 10,
  });
  const { data: schedule, isLoading: isLoadingSchedule } = useStudentSchedule(selectedStudentId, {
    week: week || undefined,
  });

  const selectedStudent = (students?.data ?? []).find(
    (student) => student.id === selectedStudentId
  );

  const handleExportPdf = async () => {
    if (!schedule || schedule.length === 0) return;

    try {
      await exportSchedulesToPdf(schedule, {
        title: "Emploi du temps étudiant",
        subtitle: `${selectedStudent?.full_name || "Étudiant"} ${week ? `- Semaine ${week}` : ""}`,
        fileName: `edt-etudiant-${selectedStudent?.student_number || selectedStudentId}.pdf`,
      });
      setToast({ isOpen: true, message: "PDF exporté.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'export PDF.", type: "error" });
    }
  };

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
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={!selectedStudentId || (schedule?.length ?? 0) === 0}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-[#00365F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export PDF
              </button>
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
