"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ProgrammeForm from "@/components/programmes/programme-form";
import { useCreateAcademicProgram, useDepartments } from "@/hooks/use-academic";
import { toUserError } from "@/lib/error-handler";
import type { CreateProgrammeInput } from "@/types/programme";

export default function NewProgrammePage() {
  const router = useRouter();
  const createMutation = useCreateAcademicProgram();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load form data
  const { data: departments, isLoading: loadingDepartments } = useDepartments();

  const handleSubmit = async (data: CreateProgrammeInput) => {
    setSubmitError(null);
    try {
      await createMutation.mutateAsync(data);
      router.push("/programmes");
    } catch (error) {
      console.error("Error creating academic programme:", error);
      setSubmitError(
        toUserError(error, "Erreur lors de la création du programme. Veuillez réessayer.").message
      );
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouveau Programme Académique">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-sm text-zinc-600">Créez un nouveau programme académique</p>
          </div>
          {submitError && (
            <div
              className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {submitError}
            </div>
          )}

          {/* Form */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            {loadingDepartments ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                  <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                    Chargement des données...
                  </p>
                </div>
              </div>
            ) : (
              <ProgrammeForm
                onSubmit={handleSubmit}
                onCancel={() => router.push("/programmes")}
                departments={Array.isArray(departments) ? departments : []}
                isLoading={createMutation.isPending}
              />
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
