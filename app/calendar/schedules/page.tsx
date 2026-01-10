"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import Toast from "@/components/ui/toast";
import FacultySearch from "@/components/faculty-members/faculty-search";
import { useAcademicYears } from "@/hooks/use-enrollments";
import { useCourses } from "@/hooks/use-courses";
import {
  useActivityTypes,
  useCheckAvailability,
  useCreateSchedule,
  useRooms,
  useSchedules,
} from "@/hooks/use-calendar";
import type { DayOfWeek } from "@/types/calendar";

const dayOptions: Array<{ value: DayOfWeek; label: string }> = [
  { value: "MON", label: "Lundi" },
  { value: "TUE", label: "Mardi" },
  { value: "WED", label: "Mercredi" },
  { value: "THU", label: "Jeudi" },
  { value: "FRI", label: "Vendredi" },
  { value: "SAT", label: "Samedi" },
];

export default function ScheduleCreationPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    academic_year_id: "",
    semester: "",
  });
  const { data: schedules, isLoading } = useSchedules({
    page: filters.page,
    limit: filters.limit,
    academic_year_id: filters.academic_year_id || undefined,
    semester: filters.semester ? Number(filters.semester) : undefined,
  });
  const { data: coursesData } = useCourses({ page: 1, limit: 100 });
  const { data: roomsData } = useRooms({ page: 1, limit: 50 });
  const { data: activityTypes } = useActivityTypes({ page: 1, limit: 50 });
  const { data: years } = useAcademicYears();
  const createSchedule = useCreateSchedule();
  const checkAvailability = useCheckAvailability();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [form, setForm] = useState({
    faculty_member_id: "",
    course_id: "",
    room_id: "",
    activity_type_id: "",
    academic_year_id: "",
    day_of_week: "MON" as DayOfWeek,
    start_time: "",
    end_time: "",
    semester: "",
  });

  const handleCheck = async () => {
    if (!form.start_time || !form.end_time) return;
    const response = await checkAvailability.mutateAsync({
      room_id: form.room_id || undefined,
      faculty_member_id: form.faculty_member_id || undefined,
      date: new Date().toISOString().split("T")[0],
      start_time: form.start_time,
      end_time: form.end_time,
    });
    if (!response.available) {
      setToast({ isOpen: true, message: "Conflit détecté.", type: "error" });
    } else {
      setToast({ isOpen: true, message: "Créneau disponible.", type: "success" });
    }
  };

  const handleCreate = async () => {
    try {
      await createSchedule.mutateAsync({
        faculty_member_id: form.faculty_member_id,
        course_id: form.course_id,
        room_id: form.room_id,
        activity_type_id: form.activity_type_id,
        academic_year_id: form.academic_year_id,
        day_of_week: form.day_of_week,
        start_time: form.start_time,
        end_time: form.end_time,
        semester: form.semester ? Number(form.semester) : undefined,
      });
      setToast({ isOpen: true, message: "Séance créée.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la création.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Création d'emplois du temps">
        <ListHeader
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Recherche désactivée"
          onToggleFilters={() => {}}
          isFiltersOpen={false}
          filtersCount={0}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Nouvelle séance</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700">Enseignant</label>
                <FacultySearch
                  onSelect={(faculty) =>
                    setForm((prev) => ({ ...prev, faculty_member_id: faculty.id }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Cours</label>
                <select
                  value={form.course_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, course_id: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner</option>
                  {coursesData?.data?.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Salle</label>
                <select
                  value={form.room_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, room_id: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner</option>
                  {roomsData?.data?.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Type d'activité
                </label>
                <select
                  value={form.activity_type_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, activity_type_id: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner</option>
                  {activityTypes?.data?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Année académique
                </label>
                <select
                  value={form.academic_year_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, academic_year_id: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner</option>
                  {Array.isArray(years) &&
                    years.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Jour</label>
                <select
                  value={form.day_of_week}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, day_of_week: event.target.value as DayOfWeek }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  {dayOptions.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Début</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, start_time: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Fin</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, end_time: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Semestre</label>
                <input
                  type="number"
                  value={form.semester}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, semester: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCheck}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F]"
              >
                Vérifier disponibilité
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
              >
                Planifier la séance
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#00365F]">Séances planifiées</h2>
              <div className="flex items-center gap-2">
                <select
                  value={filters.academic_year_id}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      academic_year_id: event.target.value,
                      page: 1,
                    }))
                  }
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Toutes les années</option>
                  {Array.isArray(years) &&
                    years.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            {isLoading ? (
              <div className="mt-4 text-center text-sm text-zinc-500">Chargement...</div>
            ) : (
              <ul className="mt-4 space-y-3">
                {(schedules?.data ?? []).map((item) => (
                  <li key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm">
                    <div className="font-medium text-[#00365F]">
                      {item.course_name || item.course_id}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {item.day_of_week} · {item.start_time} - {item.end_time}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Pagination
              page={schedules?.page ?? filters.page}
              totalPages={schedules?.total_pages ?? 1}
              totalItems={schedules?.total ?? 0}
              perPage={schedules?.limit ?? filters.limit}
              itemLabel="séances"
              onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
              onPerPageChange={(nextLimit) =>
                setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
              }
            />
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
