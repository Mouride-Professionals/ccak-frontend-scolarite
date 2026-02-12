"use client";

import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useFacultyWorkload } from "@/hooks/use-faculty-members-management";

export default function FacultyWorkloadPage() {
  const params = useSafeParams<{ id: string }>();
  const router = useRouter();
  const facultyId = params?.id as string;
  const { data: workload, isLoading } = useFacultyWorkload(facultyId, !!facultyId);

  const breakdown = workload?.breakdown ?? [];
  const maxValue = Math.max(...breakdown.map((item) => item.value), 1);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Charge de travail">
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => router.push(`/faculty-members/${facultyId}`)}
            className="text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
          >
            ← Retour au profil
          </button>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase text-zinc-400">Total heures</p>
              <p className="mt-2 text-2xl font-semibold text-[#00365F]">
                {isLoading ? "..." : `${workload?.total_hours ?? 0}h`}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase text-zinc-400">Cours assignés</p>
              <p className="mt-2 text-2xl font-semibold text-[#00365F]">
                {isLoading ? "..." : (workload?.assigned_courses ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase text-zinc-400">Surcharge</p>
              <p className="mt-2 text-2xl font-semibold text-[#00365F]">
                {isLoading ? "..." : `${workload?.overload_hours ?? 0}h`}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Répartition des heures</h2>
            {isLoading ? (
              <p className="mt-4 text-sm text-zinc-500">Chargement de la répartition...</p>
            ) : breakdown.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">Aucune charge de travail disponible.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {breakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm text-zinc-600">
                      <span>{item.label}</span>
                      <span>{item.value}h</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-zinc-100">
                      <div
                        className="h-2 rounded-full bg-[#008D36]"
                        style={{ width: `${Math.round((item.value / maxValue) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
