"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import TeachingAssignmentsTable from "@/components/teaching-assignments/teaching-assignments-table";
import { useCourses } from "@/hooks/use-courses";
import { useAcademicYears } from "@/hooks/use-enrollments";
import { TeachingRole, type TeachingAssignment } from "@/types/teaching-assignment";

export default function TeachingAssignmentsPage() {
  const router = useRouter();
  const { data: coursesData } = useCourses({ page: 1, limit: 100 });
  const { data: years } = useAcademicYears();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    courseId: "",
    academicYearId: "",
    role: "",
  });

  const assignments: TeachingAssignment[] = [];
  const filteredAssignments = useMemo(() => assignments, [assignments]);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Affectations pédagogiques">
        <ListHeader
          searchValue={filters.search}
          onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
          searchPlaceholder="Rechercher un enseignant..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={[filters.courseId, filters.academicYearId, filters.role].filter(Boolean).length}
          rightSlot={
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

        <TeachingAssignmentsTable assignments={filteredAssignments} />
        <Pagination
          page={filters.page}
          totalPages={1}
          totalItems={filteredAssignments.length}
          perPage={filters.limit}
          itemLabel="affectations"
          onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
          onPerPageChange={(nextLimit) =>
            setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
          }
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
