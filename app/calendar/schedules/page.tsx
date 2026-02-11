"use client";

import { Fragment, useMemo, useState } from "react";
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
  useUpdateSchedule,
} from "@/hooks/use-calendar";
import type { DayOfWeek, Schedule } from "@/types/calendar";

const dayOptions: Array<{ value: DayOfWeek; label: string }> = [
  { value: "MON", label: "Lundi" },
  { value: "TUE", label: "Mardi" },
  { value: "WED", label: "Mercredi" },
  { value: "THU", label: "Jeudi" },
  { value: "FRI", label: "Vendredi" },
  { value: "SAT", label: "Samedi" },
];

const plannerSlots = [
  { start: "08:00", end: "10:00" },
  { start: "10:00", end: "12:00" },
  { start: "14:00", end: "16:00" },
  { start: "16:00", end: "18:00" },
];

type PlannerDraft = {
  id: string;
  course_id: string;
  course_name: string;
  start_time?: string;
  end_time?: string;
};

type DragPayload =
  | { type: "course"; course_id: string }
  | { type: "draft"; draft_id: string }
  | { type: "schedule"; schedule_id: string };

const payloadToString = (payload: DragPayload) => JSON.stringify(payload);

const parsePayload = (value: string): DragPayload | null => {
  try {
    const parsed = JSON.parse(value) as DragPayload;
    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
};

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
  const updateSchedule = useUpdateSchedule();
  const checkAvailability = useCheckAvailability();

  const [plannerDrafts, setPlannerDrafts] = useState<PlannerDraft[]>([]);
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

  const schedulesByCell = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    (schedules?.data ?? []).forEach((item) => {
      const key = `${item.day_of_week}-${item.start_time.slice(0, 5)}-${item.end_time.slice(0, 5)}`;
      const existing = map.get(key) || [];
      existing.push(item);
      map.set(key, existing);
    });
    return map;
  }, [schedules?.data]);

  const canPlanByDrag =
    !!form.faculty_member_id &&
    !!form.room_id &&
    !!form.activity_type_id &&
    !!form.academic_year_id &&
    !!form.semester;

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

  const handleAddDraft = () => {
    const selectedCourse = (coursesData?.data ?? []).find((course) => course.id === form.course_id);
    if (!selectedCourse) {
      setToast({ isOpen: true, message: "Sélectionnez un cours pour le brouillon.", type: "error" });
      return;
    }

    const draft: PlannerDraft = {
      id: `draft-${Date.now()}`,
      course_id: selectedCourse.id,
      course_name: selectedCourse.name,
      start_time: form.start_time || undefined,
      end_time: form.end_time || undefined,
    };

    setPlannerDrafts((prev) => [draft, ...prev]);
    setToast({ isOpen: true, message: "Cours ajouté au panier de planification.", type: "success" });
  };

  const handleDropOnCell = async (
    event: React.DragEvent<HTMLDivElement>,
    day: DayOfWeek,
    slot: { start: string; end: string }
  ) => {
    event.preventDefault();

    if (!canPlanByDrag) {
      setToast({
        isOpen: true,
        message: "Configurez enseignant, salle, type, année et semestre avant le glisser-déposer.",
        type: "error",
      });
      return;
    }

    const payload = parsePayload(event.dataTransfer.getData("application/ccak-schedule"));
    if (!payload) return;

    try {
      if (payload.type === "schedule") {
        await updateSchedule.mutateAsync({
          id: payload.schedule_id,
          input: {
            day_of_week: day,
            start_time: slot.start,
            end_time: slot.end,
          },
        });
        setToast({ isOpen: true, message: "Séance déplacée.", type: "success" });
        return;
      }

      const draft =
        payload.type === "draft"
          ? plannerDrafts.find((item) => item.id === payload.draft_id)
          : undefined;

      const courseId = payload.type === "course" ? payload.course_id : draft?.course_id;
      if (!courseId) {
        setToast({ isOpen: true, message: "Cours introuvable pour la planification.", type: "error" });
        return;
      }

      await createSchedule.mutateAsync({
        faculty_member_id: form.faculty_member_id,
        room_id: form.room_id,
        activity_type_id: form.activity_type_id,
        academic_year_id: form.academic_year_id,
        semester: Number(form.semester),
        course_id: courseId,
        day_of_week: day,
        start_time: draft?.start_time || slot.start,
        end_time: draft?.end_time || slot.end,
      });

      if (payload.type === "draft") {
        setPlannerDrafts((prev) => prev.filter((item) => item.id !== payload.draft_id));
      }

      setToast({ isOpen: true, message: "Séance planifiée par glisser-déposer.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur pendant la planification drag/drop.", type: "error" });
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
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
                    onChange={(event) => setForm((prev) => ({ ...prev, course_id: event.target.value }))}
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
                    onChange={(event) => setForm((prev) => ({ ...prev, room_id: event.target.value }))}
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
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Type d&apos;activité</label>
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
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Année académique</label>
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
                      onChange={(event) => setForm((prev) => ({ ...prev, end_time: event.target.value }))}
                      className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Semestre</label>
                  <input
                    type="number"
                    value={form.semester}
                    onChange={(event) => setForm((prev) => ({ ...prev, semester: event.target.value }))}
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
                  onClick={handleAddDraft}
                  className="rounded-lg border border-[#0A8F3D] bg-white px-4 py-2 text-sm font-medium text-[#0A8F3D]"
                >
                  Ajouter au panier
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
              <h3 className="text-sm font-semibold text-[#00365F]">Planification drag & drop</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Glissez un cours (ou brouillon) sur un créneau hebdomadaire.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Cours</h4>
                    <div className="mt-2 space-y-2 rounded-lg border border-zinc-200 p-2">
                      {(coursesData?.data ?? []).slice(0, 12).map((course) => (
                        <button
                          key={course.id}
                          type="button"
                          draggable
                          onDragStart={(event) =>
                            event.dataTransfer.setData(
                              "application/ccak-schedule",
                              payloadToString({ type: "course", course_id: course.id })
                            )
                          }
                          className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-50"
                        >
                          {course.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Panier</h4>
                    <div className="mt-2 space-y-2 rounded-lg border border-zinc-200 p-2">
                      {plannerDrafts.length === 0 ? (
                        <p className="text-xs text-zinc-400">Aucun brouillon.</p>
                      ) : (
                        plannerDrafts.map((draft) => (
                          <div
                            key={draft.id}
                            draggable
                            onDragStart={(event) =>
                              event.dataTransfer.setData(
                                "application/ccak-schedule",
                                payloadToString({ type: "draft", draft_id: draft.id })
                              )
                            }
                            className="rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs"
                          >
                            <div className="font-medium text-zinc-800">{draft.course_name}</div>
                            {draft.start_time && draft.end_time ? (
                              <div className="text-zinc-500">
                                {draft.start_time} - {draft.end_time}
                              </div>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-7 gap-2 text-xs">
                      <div className="rounded bg-zinc-100 p-2 font-semibold text-zinc-600">Créneau</div>
                      {dayOptions.map((day) => (
                        <div key={day.value} className="rounded bg-zinc-100 p-2 font-semibold text-zinc-600">
                          {day.label}
                        </div>
                      ))}

                      {plannerSlots.map((slot) => (
                        <Fragment key={`slot-row-${slot.start}-${slot.end}`}>
                          <div
                            className="rounded border border-zinc-200 p-2 text-xs font-medium text-zinc-700"
                          >
                            {slot.start} - {slot.end}
                          </div>
                          {dayOptions.map((day) => {
                            const key = `${day.value}-${slot.start}-${slot.end}`;
                            const items = schedulesByCell.get(key) || [];

                            return (
                              <div
                                key={key}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => handleDropOnCell(event, day.value, slot)}
                                className="min-h-20 rounded border border-dashed border-zinc-300 bg-white p-1"
                              >
                                <div className="space-y-1">
                                  {items.map((item) => (
                                    <div
                                      key={item.id}
                                      draggable
                                      onDragStart={(event) =>
                                        event.dataTransfer.setData(
                                          "application/ccak-schedule",
                                          payloadToString({ type: "schedule", schedule_id: item.id })
                                        )
                                      }
                                      className="rounded border border-zinc-200 bg-[#00365F]/5 p-1 text-[10px] text-zinc-700"
                                    >
                                      <div className="font-medium text-[#00365F]">
                                        {item.course_name || item.course_id}
                                      </div>
                                      <div>{item.room_name || item.room_id}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
                    <div className="font-medium text-[#00365F]">{item.course_name || item.course_id}</div>
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
