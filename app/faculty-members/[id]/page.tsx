"use client";

import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useFacultyMember } from "@/hooks/use-faculty-members-management";
import { FacultyContractType, FacultyRank } from "@/types/academic";

const rankLabels: Record<string, string> = {
  [FacultyRank.PROFESSEUR]: "Professeur",
  [FacultyRank.MAITRE_CONF]: "Maître Conf.",
  [FacultyRank.MAITRE_ASS]: "Maître Ass.",
  [FacultyRank.ASSISTANT]: "Assistant",
  [FacultyRank.VACATAIRE]: "Vacataire",
};

const contractLabels: Record<string, string> = {
  [FacultyContractType.PERMANENT]: "Permanent",
  [FacultyContractType.TEMPORARY]: "Temporaire",
  [FacultyContractType.VACATAIRE]: "Vacataire",
};

export default function FacultyMemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const facultyId = params?.id as string;

  const { data: faculty, isLoading } = useFacultyMember(facultyId, !!facultyId);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Profil enseignant">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-zinc-200 bg-white">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]" />
              <p className="mt-3 text-sm text-zinc-500">Chargement du profil...</p>
            </div>
          </div>
        ) : !faculty ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            Enseignant introuvable.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm text-zinc-500">Matricule {faculty.staff_number}</div>
                  <h1 className="mt-1 text-2xl font-semibold text-[#00365F]">
                    {faculty.full_name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#00365F]/10 px-3 py-1 text-xs font-medium text-[#00365F]">
                      {rankLabels[faculty.rank] || faculty.rank}
                    </span>
                    <span className="rounded-full bg-[#008D36]/10 px-3 py-1 text-xs font-medium text-[#008D36]">
                      {contractLabels[faculty.contract_type] || faculty.contract_type}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        faculty.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {faculty.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/faculty-members/${faculty.id}/edit`)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 md:w-auto"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Modifier
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
                <h2 className="text-sm font-semibold text-[#00365F]">Informations personnelles</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-zinc-400">Département</p>
                    <p className="text-sm text-zinc-700">{faculty.department?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-zinc-400">Téléphone</p>
                    <p className="text-sm text-zinc-700">{faculty.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-zinc-400">Adresse</p>
                    <p className="text-sm text-zinc-700">{faculty.address || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-zinc-400">Date d'embauche</p>
                    <p className="text-sm text-zinc-700">
                      {faculty.hire_date
                        ? new Date(faculty.hire_date).toLocaleDateString("fr-FR")
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#00365F]">Charge horaire</h2>
                  <button
                    type="button"
                    onClick={() => router.push(`/faculty-members/${faculty.id}/workload`)}
                    className="text-sm font-medium text-[#008D36] transition-colors hover:text-[#007A2E]"
                  >
                    Voir
                  </button>
                </div>
                <p className="mt-3 text-sm text-zinc-500">
                  Les indicateurs de charge seront disponibles après activation des affectations.
                </p>
                <div className="mt-4 space-y-3 text-sm text-zinc-600">
                  <div className="flex items-center justify-between">
                    <span>Total heures</span>
                    <span className="font-medium text-zinc-900">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Nombre de cours</span>
                    <span className="font-medium text-zinc-900">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Étudiants suivis</span>
                    <span className="font-medium text-zinc-900">—</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#00365F]">Affectations pédagogiques</h2>
                  <button
                    type="button"
                    onClick={() => router.push(`/faculty-members/${faculty.id}/assignments`)}
                    className="text-sm font-medium text-[#008D36] transition-colors hover:text-[#007A2E]"
                  >
                    Gérer
                  </button>
                </div>
                <div className="mt-4 rounded-lg border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
                  Aucune affectation enregistrée.
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#00365F]">Documents</h2>
                  <button
                    type="button"
                    onClick={() => router.push(`/faculty-members/${faculty.id}/documents`)}
                    className="text-sm font-medium text-[#008D36] transition-colors hover:text-[#007A2E]"
                  >
                    Gérer
                  </button>
                </div>
                <div className="mt-4 rounded-lg border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
                  Aucun document disponible.
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#00365F]">Contrats</h2>
                <button
                  type="button"
                  onClick={() => router.push(`/faculty-members/${faculty.id}/contracts`)}
                  className="text-sm font-medium text-[#008D36] transition-colors hover:text-[#007A2E]"
                >
                  Gérer
                </button>
              </div>
              <div className="mt-4 rounded-lg border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
                Aucun contrat enregistré.
              </div>
            </div>

          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
