"use client";

import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";

const mockBreakdown = [
  { label: "CM", value: 0 },
  { label: "TD", value: 0 },
  { label: "TP", value: 0 },
];

export default function FacultyWorkloadPage() {
  const params = useParams();
  const router = useRouter();
  const facultyId = params?.id as string;

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
              <p className="mt-2 text-2xl font-semibold text-[#00365F]">—</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase text-zinc-400">Cours assignés</p>
              <p className="mt-2 text-2xl font-semibold text-[#00365F]">—</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase text-zinc-400">Surcharge</p>
              <p className="mt-2 text-2xl font-semibold text-[#00365F]">—</p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Répartition des heures</h2>
            <div className="mt-6 space-y-4">
              {mockBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm text-zinc-600">
                    <span>{item.label}</span>
                    <span>{item.value}h</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-zinc-100">
                    <div
                      className="h-2 rounded-full bg-[#008D36]"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Les données de charge seront disponibles dès la connexion à l'API.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
