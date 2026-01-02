"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import {
  FacultyContractStatus,
  FacultyContractType,
  type FacultyContract,
} from "@/types/academic";

const statusStyles: Record<FacultyContractStatus, string> = {
  [FacultyContractStatus.DRAFT]: "bg-zinc-100 text-zinc-800",
  [FacultyContractStatus.ACTIVE]: "bg-green-100 text-green-800",
  [FacultyContractStatus.EXPIRED]: "bg-red-100 text-red-800",
};

export default function FacultyContractsPage() {
  const params = useParams();
  const router = useRouter();
  const facultyId = params?.id as string;

  const [contracts, setContracts] = useState<FacultyContract[]>([]);
  const [form, setForm] = useState({
    contract_type: FacultyContractType.PERMANENT,
    start_date: "",
    end_date: "",
    salary: "",
    is_current: true,
    file: null as File | null,
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const canSave = useMemo(() => form.start_date.length > 0, [form.start_date]);

  const handleAdd = () => {
    if (!canSave) {
      setToast({
        isOpen: true,
        message: "Veuillez renseigner la date de début.",
        type: "error",
      });
      return;
    }

    const newContract: FacultyContract = {
      id: crypto.randomUUID(),
      faculty_member_id: facultyId,
      contract_type: form.contract_type,
      start_date: form.start_date,
      end_date: form.end_date || null,
      salary: form.salary ? Number(form.salary) : null,
      status: FacultyContractStatus.ACTIVE,
      is_current: form.is_current,
      file_path: form.file?.name ?? null,
      created_at: new Date().toISOString(),
    };

    setContracts((prev) => [newContract, ...prev]);
    setToast({
      isOpen: true,
      message: "Contrat ajouté (connexion API à venir).",
      type: "success",
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Contrats enseignant">
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => router.push(`/faculty-members/${facultyId}`)}
            className="text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
          >
            ← Retour au profil
          </button>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#00365F]">Contrats enregistrés</h2>
              {contracts.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
                  Aucun contrat enregistré.
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-[#00365F]/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Période
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Statut
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {contracts.map((contract) => (
                        <tr key={contract.id}>
                          <td className="px-4 py-3 text-sm text-zinc-700">
                            {contract.contract_type}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-600">
                            {contract.start_date} → {contract.end_date || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[contract.status]}`}
                            >
                              {contract.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-zinc-500">
                            <button className="text-[#00365F] hover:text-[#008D36]">
                              Télécharger
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#00365F]">Ajouter un contrat</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Type</label>
                  <select
                    value={form.contract_type}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        contract_type: event.target.value as FacultyContractType,
                      }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  >
                    {Object.values(FacultyContractType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Début de contrat *
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, start_date: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Fin de contrat
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, end_date: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Salaire</label>
                  <input
                    type="number"
                    value={form.salary}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, salary: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Fichier</label>
                  <input
                    type="file"
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!canSave}
                  className="w-full rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </div>
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
