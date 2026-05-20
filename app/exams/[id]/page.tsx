"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ExamSessionStatusBadge from "@/components/exams/exam-session-status-badge";
import ExamScheduleForm from "@/components/exams/exam-schedule-form";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import {
  useExamSession,
  useDeleteExamSession,
  usePublishExamSession,
  useCloseExamSession,
  useCreateExamSchedule,
  useUpdateExamSchedule,
  useDeleteExamSchedule,
} from "@/hooks/use-exams";
import { useRooms } from "@/hooks/use-calendar";
import { useFacultyMembers } from "@/hooks/use-faculty-members";
import { useCourses } from "@/hooks/use-courses";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import { ExamSessionStatus, ExamSessionType } from "@/types/exam";
import type { ExamSchedule, CreateExamScheduleInput } from "@/types/exam";

// ---- Mini calendar grid component ----

function SessionCalendar({
  startDate,
  endDate,
  schedules,
  onDayClick,
}: {
  startDate: string;
  endDate: string;
  schedules: ExamSchedule[];
  onDayClick: (date: string) => void;
}) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: Date[] = [];
  const d = new Date(start);
  while (d <= end) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  // group schedules by date string
  const byDate: Record<string, ExamSchedule[]> = {};
  for (const s of schedules) {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 pb-2" style={{ minWidth: `${days.length * 52}px` }}>
        {days.map((day) => {
          const iso = day.toISOString().split("T")[0];
          const daySchedules = byDate[iso] ?? [];
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onDayClick(iso)}
              className={`group flex min-w-[48px] flex-col rounded-lg border px-1 py-2 text-center transition-all hover:border-[#008D36] hover:shadow-sm ${
                isWeekend
                  ? "border-zinc-100 bg-zinc-50"
                  : daySchedules.length > 0
                    ? "border-[#008D36]/30 bg-[#008D36]/5"
                    : "border-zinc-200 bg-white"
              }`}
            >
              <span className="text-[10px] font-medium uppercase text-zinc-400">
                {day.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3)}
              </span>
              <span className={`mt-0.5 text-sm font-bold ${isWeekend ? "text-zinc-300" : "text-zinc-700"}`}>
                {day.getDate()}
              </span>
              {daySchedules.length > 0 ? (
                <div className="mt-1 flex flex-col gap-0.5">
                  {daySchedules.slice(0, 3).map((s) => (
                    <div key={s.id} className="h-1 w-full rounded-full bg-[#008D36]" />
                  ))}
                  {daySchedules.length > 3 && (
                    <span className="text-[9px] text-[#008D36]">+{daySchedules.length - 3}</span>
                  )}
                </div>
              ) : (
                <div className="mt-1 flex justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <svg className="h-3 w-3 text-[#008D36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Course card (in "À planifier" list) ----

interface CourseCardProps {
  courseId: string;
  courseName: string;
  courseCode: string;
  credits: number;
  enrolledCount?: number;
  isExpanded: boolean;
  isReadOnly: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  children: React.ReactNode;
}

function CourseCard({
  courseName,
  courseCode,
  credits,
  enrolledCount,
  isExpanded,
  isReadOnly,
  onExpand,
  onCollapse,
  children,
}: CourseCardProps) {
  return (
    <div className={`rounded-lg border transition-all ${isExpanded ? "border-[#008D36] shadow-sm" : "border-zinc-200 bg-white"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{courseName}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
            <span>{courseCode}</span>
            <span>·</span>
            <span>{credits} cr.</span>
            {enrolledCount != null && (
              <>
                <span>·</span>
                <span>{enrolledCount} inscrits</span>
              </>
            )}
          </div>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={isExpanded ? onCollapse : onExpand}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              isExpanded
                ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                : "bg-[#008D36] text-white hover:bg-[#007A2E]"
            }`}
          >
            {isExpanded ? "Annuler" : "Planifier →"}
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="border-t border-[#008D36]/20 bg-[#008D36]/5 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ---- Main page ----

export default function ExamSessionDetailPage() {
  const router = useRouter();
  const params = useSafeParams<{ id: string }>();
  const sessionId = params.id as string;
  const isReadOnly = useIsReadOnly();

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ExamSchedule | null>(null);
  const [preselectedDate, setPreselectedDate] = useState<string | undefined>();
  const [deleteScheduleConfirm, setDeleteScheduleConfirm] = useState<{ isOpen: boolean; scheduleId: string | null }>(
    { isOpen: false, scheduleId: null }
  );
  const [deleteSessionConfirm, setDeleteSessionConfirm] = useState(false);
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>(
    { isOpen: false, message: "", type: "success" }
  );

  const { data: session, isLoading, error } = useExamSession(sessionId);
  const { data: roomsData } = useRooms({ limit: 100 });
  const { data: facultyData } = useFacultyMembers();
  const { data: coursesData } = useCourses({ limit: 200 });

  const publishMutation = usePublishExamSession();
  const closeMutation = useCloseExamSession();
  const deleteSessionMutation = useDeleteExamSession();
  const createScheduleMutation = useCreateExamSchedule(sessionId);
  const updateScheduleMutation = useUpdateExamSchedule(sessionId);
  const deleteScheduleMutation = useDeleteExamSchedule(sessionId);

  if (error) notFound();

  if (isLoading || !session) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Session d'examen">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]" />
              <p className="mt-3 text-sm text-zinc-500">Chargement...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const schedules = session.schedules ?? [];
  const rooms = roomsData?.data ?? [];
  const invigilators = Array.isArray(facultyData) ? facultyData : [];
  const allCoursesInSession = coursesData?.data ?? [];

  const handleDayClick = (date: string) => {
    if (isReadOnly || session.status === ExamSessionStatus.CLOSED) return;
    setPreselectedDate(date);
    setExpandedCourseId(null);
    setEditingSchedule(null);
  };

  const handleCreateSchedule = async (data: CreateExamScheduleInput) => {
    try {
      await createScheduleMutation.mutateAsync(data);
      setExpandedCourseId(null);
      setPreselectedDate(undefined);
      setToast({ isOpen: true, message: "Examen planifié avec succès", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la planification", type: "error" });
    }
  };

  const handleUpdateSchedule = async (data: CreateExamScheduleInput) => {
    if (!editingSchedule) return;
    try {
      await updateScheduleMutation.mutateAsync({ scheduleId: editingSchedule.id, input: data });
      setEditingSchedule(null);
      setToast({ isOpen: true, message: "Examen mis à jour", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la mise à jour", type: "error" });
    }
  };

  const handleDeleteScheduleConfirm = async () => {
    if (!deleteScheduleConfirm.scheduleId) return;
    try {
      await deleteScheduleMutation.mutateAsync(deleteScheduleConfirm.scheduleId);
      setDeleteScheduleConfirm({ isOpen: false, scheduleId: null });
      setToast({ isOpen: true, message: "Examen supprimé", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la suppression", type: "error" });
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(sessionId);
      setToast({ isOpen: true, message: "Session publiée", type: "success" });
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "Erreur lors de la publication";
      setToast({ isOpen: true, message: msg, type: "error" });
    }
  };

  const handleClose = async () => {
    try {
      await closeMutation.mutateAsync(sessionId);
      setToast({ isOpen: true, message: "Session clôturée", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la clôture", type: "error" });
    }
  };

  const handleDeleteSession = async () => {
    try {
      await deleteSessionMutation.mutateAsync(sessionId);
      router.push("/exams");
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la suppression", type: "error" });
      setDeleteSessionConfirm(false);
    }
  };

  const canEdit = !isReadOnly && session.status !== ExamSessionStatus.CLOSED;
  const canPublish = !isReadOnly && session.status === ExamSessionStatus.DRAFT && schedules.length > 0;
  const canClose = !isReadOnly && session.status === ExamSessionStatus.PUBLISHED;

  // Inline form — shown when a day is clicked OR a course card is expanded
  const showInlineForm = (expandedCourseId !== null || preselectedDate !== null) && canEdit && !editingSchedule;

  return (
    <ProtectedRoute>
      <DashboardLayout title={session.name}>
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/exams"
            className="flex items-center gap-2 text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Sessions d&apos;examen
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-zinc-900">{session.name}</h2>
              <ExamSessionStatusBadge status={session.status} />
              <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                session.type === ExamSessionType.NORMAL
                  ? "bg-[#00365F]/10 text-[#00365F]"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {session.type_label}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              Semestre {session.semester_number} · {" "}
              {new Date(session.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              {" → "}
              {new Date(session.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              {session.academic_year && (
                <> · {session.academic_year.name}</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canPublish && (
              <button
                onClick={handlePublish}
                disabled={publishMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Publier
              </button>
            )}
            {canClose && (
              <button
                onClick={handleClose}
                disabled={closeMutation.isPending}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                Clôturer
              </button>
            )}
            {canEdit && session.status === ExamSessionStatus.DRAFT && (
              <button
                onClick={() => setDeleteSessionConfirm(true)}
                className="rounded-lg border border-red-100 p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {schedules.length > 0 && (
          <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-700">Examens planifiés</span>
              <span className="text-sm font-bold text-zinc-900">{schedules.length} examen{schedules.length > 1 ? "s" : ""}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* LEFT: course cards */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add new exam trigger (when no course card is selected) */}
            {canEdit && !expandedCourseId && !preselectedDate && (
              <button
                type="button"
                onClick={() => { setExpandedCourseId("__new__"); setPreselectedDate(undefined); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#008D36]/40 bg-[#008D36]/5 py-3 text-sm font-medium text-[#008D36] transition-colors hover:border-[#008D36] hover:bg-[#008D36]/10"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Planifier un examen
              </button>
            )}

            {/* Inline form for new exam (no specific course preselected) */}
            {showInlineForm && expandedCourseId === "__new__" && (
              <div className="rounded-lg border border-[#008D36] bg-[#008D36]/5 p-4">
                <p className="mb-3 text-sm font-semibold text-[#008D36]">Nouvel examen</p>
                <ExamScheduleForm
                  session={session}
                  courses={allCoursesInSession}
                  rooms={rooms}
                  invigilators={invigilators}
                  onSubmit={handleCreateSchedule}
                  onCancel={() => { setExpandedCourseId(null); setPreselectedDate(undefined); }}
                  isLoading={createScheduleMutation.isPending}
                  preselectedDate={preselectedDate}
                />
              </div>
            )}

            {/* Scheduled exams list */}
            {schedules.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Planifiés ({schedules.length})
                </h3>
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div key={s.id}>
                      {editingSchedule?.id === s.id ? (
                        <div className="rounded-lg border border-[#008D36] bg-[#008D36]/5 p-4">
                          <p className="mb-3 text-sm font-semibold text-[#008D36]">Modifier l&apos;examen</p>
                          <ExamScheduleForm
                            session={session}
                            courses={allCoursesInSession}
                            rooms={rooms}
                            invigilators={invigilators}
                            onSubmit={handleUpdateSchedule}
                            onCancel={() => setEditingSchedule(null)}
                            isLoading={updateScheduleMutation.isPending}
                            preselectedCourseId={s.course_id}
                            preselectedDate={s.date}
                            excludeScheduleId={s.id}
                          />
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
                          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#008D36]" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 truncate">
                              {s.course?.name ?? s.course_id}
                            </p>
                            <div className="mt-0.5 text-xs text-zinc-500">
                              {new Date(s.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                              {" · "}{s.start_time}–{s.end_time}
                              {s.room && <> · {s.room.name ?? s.room.room_number}</>}
                            </div>
                            {s.invigilators && s.invigilators.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {s.invigilators.map((inv) => (
                                  <span key={inv.id} className="inline-flex items-center rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">
                                    {inv.full_name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {canEdit && (
                            <div className="shrink-0 flex gap-1">
                              <button
                                onClick={() => { setEditingSchedule(s); setExpandedCourseId(null); }}
                                className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteScheduleConfirm({ isOpen: true, scheduleId: s.id })}
                                className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {schedules.length === 0 && !canEdit && (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white">
                <p className="text-sm text-zinc-400">Aucun examen planifié</p>
              </div>
            )}
          </div>

          {/* RIGHT: calendar */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-700">Calendrier de session</h3>
                {canEdit && (
                  <p className="text-xs text-zinc-400">Cliquez sur un jour pour planifier</p>
                )}
              </div>
              <SessionCalendar
                startDate={session.start_date}
                endDate={session.end_date}
                schedules={schedules}
                onDayClick={handleDayClick}
              />

              {/* Inline form triggered by calendar click */}
              {showInlineForm && preselectedDate && expandedCourseId === null && (
                <div className="mt-5 border-t border-zinc-100 pt-5">
                  <p className="mb-3 text-sm font-semibold text-zinc-700">
                    Planifier le{" "}
                    {new Date(preselectedDate).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <ExamScheduleForm
                    session={session}
                    courses={allCoursesInSession}
                    rooms={rooms}
                    invigilators={invigilators}
                    onSubmit={handleCreateSchedule}
                    onCancel={() => setPreselectedDate(undefined)}
                    isLoading={createScheduleMutation.isPending}
                    preselectedDate={preselectedDate}
                  />
                </div>
              )}

              {/* Legend */}
              <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#008D36]" /> Examen planifié
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-200" /> Week-end
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <ConfirmDialog
          isOpen={deleteScheduleConfirm.isOpen}
          onClose={() => setDeleteScheduleConfirm({ isOpen: false, scheduleId: null })}
          onConfirm={handleDeleteScheduleConfirm}
          title="Supprimer l'examen"
          message="Êtes-vous sûr de vouloir supprimer cet examen planifié ?"
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          isLoading={deleteScheduleMutation.isPending}
        />
        <ConfirmDialog
          isOpen={deleteSessionConfirm}
          onClose={() => setDeleteSessionConfirm(false)}
          onConfirm={handleDeleteSession}
          title="Supprimer la session"
          message="Êtes-vous sûr de vouloir supprimer cette session ? Tous les examens planifiés seront supprimés."
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          isLoading={deleteSessionMutation.isPending}
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
