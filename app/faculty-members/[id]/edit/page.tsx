"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import { useDepartments } from "@/hooks/use-departments";
import { useFacultyMember } from "@/hooks/use-faculty-members-management";
import { FacultyContractType, FacultyRank } from "@/types/academic";

export default function FacultyMemberEditPage() {
  const params = useParams();
  const router = useRouter();
  const facultyId = params?.id as string;
  const { data: faculty, isLoading } = useFacultyMember(facultyId, !!facultyId);
  const { data: departmentsData } = useDepartments({ page: 1, limit: 50 });

  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    department_id: "",
    rank: FacultyRank.ASSISTANT,
    contract_type: FacultyContractType.PERMANENT,
    hire_date: "",
    staff_number: "",
  });

  useEffect(() => {
    if (!faculty) return;
    setFormData({
      full_name: faculty.full_name ?? "",
      phone: faculty.phone ?? "",
      address: faculty.address ?? "",
      department_id: faculty.department_id ?? "",
      rank: faculty.rank ?? FacultyRank.ASSISTANT,
      contract_type: faculty.contract_type as FacultyContractType,
      hire_date: faculty.hire_date ?? "",
      staff_number: faculty.staff_number ?? "",
    });
  }, [faculty]);

  const handleSubmit = () => {
    setToast({
      isOpen: true,
      message: "Modifications enregistrées (connexion API à venir).",
      type: "success",
    });
    router.push(`/faculty-members/${facultyId}`);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Modifier enseignant">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-zinc-200 bg-white">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]" />
              <p className="mt-3 text-sm text-zinc-500">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Nom complet</label>
                <input
                  value={formData.full_name}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, full_name: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Téléphone</label>
                <input
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Adresse</label>
                <input
                  value={formData.address}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, address: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Matricule</label>
                <input
                  value={formData.staff_number}
                  disabled
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Département</label>
                <select
                  value={formData.department_id}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, department_id: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Sélectionner</option>
                  {departmentsData?.data?.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Rang</label>
                <select
                  value={formData.rank}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      rank: event.target.value as FacultyRank,
                    }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  {Object.values(FacultyRank).map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Type de contrat
                </label>
                <select
                  value={formData.contract_type}
                  onChange={(event) =>
                    setFormData((prev) => ({
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
                  Date d'embauche
                </label>
                <input
                  type="date"
                  value={formData.hire_date}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, hire_date: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push(`/faculty-members/${facultyId}`)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-[#008D36] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#007A2E]"
              >
                Enregistrer
              </button>
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
