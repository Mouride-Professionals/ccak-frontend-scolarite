"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import Toast from "@/components/ui/toast";
import TeachingAssignmentsTable from "@/components/teaching-assignments/teaching-assignments-table";
import { useCourses } from "@/hooks/use-courses";
import { useAcademicYears } from "@/hooks/use-enrollments";
import {
  useCreateTeachingAssignment,
  useDeleteTeachingAssignment,
  useTeachingAssignments,
} from "@/hooks/use-teaching-assignments";
import { TeachingRole } from "@/types/teaching-assignment";
import { useSelectedYear } from "@/hooks/use-selected-year";

export default function TeachingAssignmentsPage() {
  const router = useRouter();
  const { selectedYear } = useSelectedYear();
  const { data: coursesData } = useCourses({ page: 1, limit: 100 });
  const { data: years } = useAcademicYears();
  const [showFilters, setShowFilters] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    courseId: "",
    academicYearId: "",
    role: "",
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, academicYearId: selectedYear?.id ?? "", page: 1 }));
  }, [selectedYear?.id]);
  const { data, isLoading } = useTeachingAssignments({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    course_id: filters.courseId || undefined,
    academic_year_id: filters.academicYearId || undefined,
    role: (filters.role as TeachingRole) || undefined,
  });
  const deleteMutation = useDeleteTeachingAssignment();
  const createMutation = useCreateTeachingAssignment();

  const assignments = data?.data ?? [];

  const handleExport = () => {
    const header = ["Enseignant", "Cours", "Année académique", "Rôle", "Heures", "Taux horaire"];
    const csvRows = assignments.map((item) =>
      [
        item.faculty_name,
        item.course_name,
        item.academic_year_label,
        item.role,
        String(item.hours_assigned),
        item.hourly_rate != null ? String(item.hourly_rate) : "",
      ]
        .map((value) => `"${value.replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.map((h) => `"${h}"`).join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "affectations-pedagogiques.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  };

  const parseCsvLine = (line: string) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        index += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
        continue;
      }

      current += char;
    }

    values.push(current.trim());
    return values;
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setToast({
          isOpen: true,
          message: "Fichier CSV invalide (aucune ligne de données).",
          type: "error",
        });
        return;
      }

      const header = parseCsvLine(lines[0]).map((column) => column.replace(/^"|"$/g, "").trim());
      const required = [
        "faculty_member_id",
        "course_id",
        "academic_year_id",
        "role",
        "hours_assigned",
      ];
      const missing = required.filter((column) => !header.includes(column));
      if (missing.length > 0) {
        setToast({
          isOpen: true,
          message: `Colonnes manquantes: ${missing.join(", ")}`,
          type: "error",
        });
        return;
      }

      let created = 0;
      let failed = 0;

      for (let index = 1; index < lines.length; index += 1) {
        const values = parseCsvLine(lines[index]).map((value) => value.replace(/^"|"$/g, ""));
        const row: Record<string, string> = {};
        header.forEach((key, keyIndex) => {
          row[key] = values[keyIndex] ?? "";
        });

        const hours = Number(row.hours_assigned);
        if (
          !row.faculty_member_id ||
          !row.course_id ||
          !row.academic_year_id ||
          !row.role ||
          Number.isNaN(hours)
        ) {
          failed += 1;
          continue;
        }

        try {
          await createMutation.mutateAsync({
            faculty_member_id: row.faculty_member_id,
            course_id: row.course_id,
            academic_year_id: row.academic_year_id,
            role: row.role as TeachingRole,
            hours_assigned: hours,
            hourly_rate: row.hourly_rate ? Number(row.hourly_rate) : null,
          });
          created += 1;
        } catch {
          failed += 1;
        }
      }

      setToast({
        isOpen: true,
        message:
          failed > 0
            ? `Import terminé: ${created} création(s), ${failed} échec(s).`
            : `Import terminé: ${created} affectation(s) créée(s).`,
        type: failed > 0 ? "error" : "success",
      });
    } catch (error) {
      console.error("Error importing teaching assignments:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de l'import CSV.",
        type: "error",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Affectations pédagogiques">
        <input
          ref={importInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleImportFile}
          className="hidden"
        />
        <ListHeader
          searchValue={filters.search}
          onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
          searchPlaceholder="Rechercher un enseignant..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={
            [filters.courseId, filters.academicYearId, filters.role].filter(Boolean).length
          }
          rightSlot={
            <>
              <button
                type="button"
                onClick={handleExport}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 sm:w-auto"
              >
                Exporter
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                disabled={isImporting || createMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isImporting ? "Import..." : "Importer CSV"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/teaching-assignments/new")}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] sm:w-auto"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nouvelle affectation
              </button>
            </>
          }
        />

        {showFilters && (
          <div className="mb-6 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Cours</label>
                <select
                  value={filters.courseId}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, courseId: event.target.value, page: 1 }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les cours</option>
                  {coursesData?.data?.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Année académique
                </label>
                <select
                  value={filters.academicYearId}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      academicYearId: event.target.value,
                      page: 1,
                    }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Toutes</option>
                  {Array.isArray(years) &&
                    years.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Rôle</label>
                <select
                  value={filters.role}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, role: event.target.value, page: 1 }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous</option>
                  {Object.values(TeachingRole).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Chargement des affectations...
          </div>
        ) : (
          <TeachingAssignmentsTable
            assignments={assignments}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        )}
        <Pagination
          page={data?.page ?? filters.page}
          totalPages={data?.total_pages ?? 1}
          totalItems={data?.total ?? assignments.length}
          perPage={data?.limit ?? filters.limit}
          itemLabel="affectations"
          onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
          onPerPageChange={(nextLimit) =>
            setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
          }
        />
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
