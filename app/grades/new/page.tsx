"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DeliberationForm from "@/components/deliberations/deliberation-form";
import {
  useCreateDeliberationSession,
  useAcademicPrograms,
  useAcademicYears,
  useFacultyMembers,
} from "@/hooks/use-deliberations";
import type { CreateDeliberationSessionInput } from "@/types/deliberation";

export default function NewDeliberationPage() {
  const router = useRouter();
  const createMutation = useCreateDeliberationSession();

  // Load form data
  const { data: programs, isLoading: loadingPrograms } = useAcademicPrograms();
  const { data: years, isLoading: loadingYears } = useAcademicYears();
  const { data: facultyMembers, isLoading: loadingFaculty } = useFacultyMembers();

  const handleSubmit = async (data: CreateDeliberationSessionInput) => {
    try {
      await createMutation.mutateAsync(data);
      router.push("/deliberations");
    } catch (error) {
      console.error("Error creating deliberation session:", error);
      alert("Erreur lors de la création de la session. Veuillez réessayer.");
    }
  };

  const isLoadingData = loadingPrograms || loadingYears || loadingFaculty;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouvelle Session de Délibération">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-sm text-zinc-600">
              Créez une nouvelle session de jury pour un programme académique
            </p>
          </div>

          {/* Form */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            {isLoadingData ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                  <p className="mt-3 text-sm text-zinc-500">
                    Chargement des données...
                  </p>
                </div>
              </div>
            ) : (
              <DeliberationForm
                onSubmit={handleSubmit}
                programs={programs ?? []}
                years={years ?? []}
                facultyMembers={facultyMembers ?? []}
                isLoading={createMutation.isPending}
              />
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
