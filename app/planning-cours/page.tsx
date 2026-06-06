"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import {
  usePlanning,
  usePlanningDashboard,
  useUpdateDelivery,
} from "@/hooks/use-teaching-assignments";
import { useSelectedYear } from "@/hooks/use-selected-year";
import { getAcademicPrograms } from "@/lib/api/course-units";
import { useQuery } from "@tanstack/react-query";
import { TeachingDeliveryStatus } from "@/types/teaching-assignment";
import type {
  PlanningFilters,
  TeachingAssignment,
  UpdateDeliveryInput,
} from "@/types/teaching-assignment";

const STATUS_LABELS: Record<TeachingDeliveryStatus, string> = {
  [TeachingDeliveryStatus.NOT_STARTED]: "Non commencé",
  [TeachingDeliveryStatus.IN_PROGRESS]: "En cours",
  [TeachingDeliveryStatus.COMPLETED]: "Achevé",
  [TeachingDeliveryStatus.LATE]: "En retard",
};

const STATUS_CLASSES: Record<TeachingDeliveryStatus, string> = {
  [TeachingDeliveryStatus.NOT_STARTED]: "bg-zinc-100 text-zinc-600",
  [TeachingDeliveryStatus.IN_PROGRESS]: "bg-blue-50 text-blue-700",
  [TeachingDeliveryStatus.COMPLETED]: "bg-green-50 text-green-700",
  [TeachingDeliveryStatus.LATE]: "bg-red-50 text-red-700",
};

function DeliveryStatusBadge({ status }: { status?: TeachingDeliveryStatus | null }) {
  const s = status ?? TeachingDeliveryStatus.NOT_STARTED;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[s]}`}
    >
      {STATUS_LABELS[s]}
    </span>
  );
}

function fmt(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PlanningCoursPage() {
  const { selectedYear } = useSelectedYear();
  const [programId, setProgramId] = useState<string>("");
  const [filters, setFilters] = useState<PlanningFilters>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateDeliveryInput>({});
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const { data: programs } = useQuery({
    queryKey: ["academic-programs-all"],
    queryFn: () => getAcademicPrograms(),
    staleTime: 60_000,
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      academic_year_id: selectedYear?.id,
      program_id: programId || undefined,
    }));
  }, [selectedYear?.id, programId]);

  const { data: planningData = [], isLoading: planningLoading } = usePlanning(filters);
  const { data: dashboard = [], isLoading: dashLoading } = usePlanningDashboard({
    program_id: programId || undefined,
    academic_year_id: selectedYear?.id,
  });

  const updateDelivery = useUpdateDelivery();

  function startEdit(assignment: TeachingAssignment) {
    setEditingId(assignment.id);
    setEditForm({
      status: assignment.status ?? undefined,
      planned_start_date: assignment.planned_start_date ?? undefined,
      effective_start_date: assignment.effective_start_date ?? undefined,
      end_date: assignment.end_date ?? undefined,
      hours_cm: assignment.hours_cm ?? undefined,
      hours_td: assignment.hours_td ?? undefined,
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      await updateDelivery.mutateAsync({ id: editingId, input: editForm });
      setEditingId(null);
      setToast({ isOpen: true, message: "Mis à jour", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la mise à jour", type: "error" });
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Planning des cours">
        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-zinc-700">Programme</label>
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
          >
            <option value="">Tous les programmes</option>
            {(programs ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dashboard widget */}
        {!dashLoading && dashboard.length > 0 && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashboard.map((level) => (
              <div
                key={level.level_id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <h3 className="mb-3 text-sm font-semibold text-zinc-800">{level.level_name}</h3>
                <div className="space-y-2">
                  <ProgressBar
                    label="Taux d'exécution"
                    value={level.taux_execution}
                    color="bg-[#008D36]"
                  />
                  <ProgressBar
                    label="Taux d'achèvement"
                    value={level.taux_achevement}
                    color="bg-[#00365F]"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  {level.completed_courses}/{level.total_courses} cours achevés
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Planning table */}
        {planningLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]" />
          </div>
        ) : planningData.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white">
            <p className="text-sm text-zinc-400">Aucune affectation pour cette période</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Cours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                      Niveau
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                      Enseignant
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">CM</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">TD</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                      Début prévu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                      Début effectif
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Fin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                      Statut
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {planningData.map((assignment) =>
                    editingId === assignment.id ? (
                      <EditRow
                        key={assignment.id}
                        assignment={assignment}
                        form={editForm}
                        onChange={setEditForm}
                        onSave={saveEdit}
                        onCancel={() => setEditingId(null)}
                        isSaving={updateDelivery.isPending}
                      />
                    ) : (
                      <tr key={assignment.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-800">{assignment.course_name}</div>
                          {assignment.course_code && (
                            <div className="text-xs text-zinc-400 font-mono">
                              {assignment.course_code}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">{assignment.level_name ?? "—"}</td>
                        <td className="px-4 py-3 text-zinc-600">{assignment.faculty_name}</td>
                        <td className="px-4 py-3 text-right text-zinc-600">
                          {assignment.hours_cm ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600">
                          {assignment.hours_td ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 text-xs">
                          {fmt(assignment.planned_start_date)}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 text-xs">
                          {fmt(assignment.effective_start_date)}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 text-xs">
                          {fmt(assignment.end_date)}
                        </td>
                        <td className="px-4 py-3">
                          <DeliveryStatusBadge status={assignment.status} />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => startEdit(assignment)}
                            className="rounded border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="font-medium text-zinc-700">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-100">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EditRow({
  assignment,
  form,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: {
  assignment: TeachingAssignment;
  form: UpdateDeliveryInput;
  onChange: (f: UpdateDeliveryInput) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  return (
    <tr className="bg-blue-50/40">
      <td className="px-4 py-3 font-medium text-zinc-800" colSpan={3}>
        {assignment.course_name}
        <div className="text-xs text-zinc-400">{assignment.faculty_name}</div>
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          value={form.hours_cm ?? ""}
          onChange={(e) =>
            onChange({ ...form, hours_cm: e.target.value ? Number(e.target.value) : null })
          }
          placeholder="CM"
          className="w-16 rounded border border-zinc-300 px-2 py-1 text-xs focus:border-[#008D36] focus:outline-none"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          value={form.hours_td ?? ""}
          onChange={(e) =>
            onChange({ ...form, hours_td: e.target.value ? Number(e.target.value) : null })
          }
          placeholder="TD"
          className="w-16 rounded border border-zinc-300 px-2 py-1 text-xs focus:border-[#008D36] focus:outline-none"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="date"
          value={form.planned_start_date ?? ""}
          onChange={(e) => onChange({ ...form, planned_start_date: e.target.value || null })}
          className="rounded border border-zinc-300 px-2 py-1 text-xs focus:border-[#008D36] focus:outline-none"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="date"
          value={form.effective_start_date ?? ""}
          onChange={(e) => onChange({ ...form, effective_start_date: e.target.value || null })}
          className="rounded border border-zinc-300 px-2 py-1 text-xs focus:border-[#008D36] focus:outline-none"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="date"
          value={form.end_date ?? ""}
          onChange={(e) => onChange({ ...form, end_date: e.target.value || null })}
          className="rounded border border-zinc-300 px-2 py-1 text-xs focus:border-[#008D36] focus:outline-none"
        />
      </td>
      <td className="px-4 py-2">
        <select
          value={form.status ?? ""}
          onChange={(e) =>
            onChange({ ...form, status: (e.target.value as TeachingDeliveryStatus) || undefined })
          }
          className="rounded border border-zinc-300 px-2 py-1 text-xs focus:border-[#008D36] focus:outline-none"
        >
          <option value="">Statut</option>
          {Object.values(TeachingDeliveryStatus).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="rounded bg-[#008D36] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#006d2a] disabled:opacity-50 transition-colors"
          >
            {isSaving ? "…" : "OK"}
          </button>
          <button
            onClick={onCancel}
            className="rounded border border-zinc-300 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Annuler
          </button>
        </div>
      </td>
    </tr>
  );
}
