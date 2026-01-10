"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import { useDepartments } from "@/hooks/use-departments";
import { FacultyContractType, FacultyRank } from "@/types/academic";

const steps = [
  { id: 1, label: "Informations personnelles" },
  { id: 2, label: "Informations académiques" },
  { id: 3, label: "Contrat" },
  { id: 4, label: "Documents" },
];

export default function FacultyRegistrationPage() {
  const router = useRouter();
  const { data: departmentsData } = useDepartments({ page: 1, limit: 50 });
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    department_id: "",
    rank: FacultyRank.ASSISTANT,
    hire_date: "",
    contract_type: FacultyContractType.PERMANENT,
    contract_start: "",
    contract_end: "",
    salary: "",
    contract_terms: "",
    documents: {
      cv: null as File | null,
      diploma: null as File | null,
      cni: null as File | null,
      other: null as File | null,
    },
  });

  const canGoNext = useMemo(() => {
    if (step === 1) {
      return formData.full_name && formData.email && formData.phone;
    }
    if (step === 2) {
      return formData.department_id && formData.rank && formData.hire_date;
    }
    if (step === 3) {
      return formData.contract_type && formData.contract_start;
    }
    return true;
  }, [formData, step]);

  const handleNext = () => {
    if (!canGoNext) {
      setToast({
        isOpen: true,
        message: "Veuillez compléter les champs obligatoires.",
        type: "error",
      });
      return;
    }
    setStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    setToast({
      isOpen: true,
      message: "Formulaire envoyé (connexion API à venir).",
      type: "success",
    });
    router.push("/faculty-members");
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouvel enseignant">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {steps.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    item.id <= step ? "bg-[#008D36] text-white" : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {item.id}
                </div>
                <span className="text-sm text-zinc-600">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Nom complet *
                  </label>
                  <input
                    value={formData.full_name}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, full_name: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Téléphone *
                  </label>
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
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Département *
                  </label>
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
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Rang *</label>
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
                    Date d'embauche *
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
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Matricule</label>
                  <input
                    value="Auto-généré"
                    disabled
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-500"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Type de contrat *
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
                    Salaire mensuel
                  </label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, salary: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Début de contrat *
                  </label>
                  <input
                    type="date"
                    value={formData.contract_start}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, contract_start: event.target.value }))
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
                    value={formData.contract_end}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, contract_end: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Termes du contrat
                  </label>
                  <textarea
                    value={formData.contract_terms}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, contract_terms: event.target.value }))
                    }
                    rows={4}
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {(["cv", "diploma", "cni", "other"] as const).map((key) => (
                  <div key={key}>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      {key === "cv"
                        ? "CV"
                        : key === "diploma"
                          ? "Diplôme"
                          : key === "cni"
                            ? "CNI"
                            : "Autre"}
                    </label>
                    <input
                      type="file"
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          documents: {
                            ...prev.documents,
                            [key]: event.target.files?.[0] ?? null,
                          },
                        }))
                      }
                      className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>
            {step < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-lg bg-[#008D36] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#007A2E]"
              >
                Continuer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-[#008D36] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#007A2E]"
              >
                Enregistrer
              </button>
            )}
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
