"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CourseUnitForm from "@/components/course-units/course-unit-form";
import Toast from "@/components/ui/toast";
import { useCreateCourseUnit, useAcademicPrograms } from "@/hooks/use-course-units";
import type { CreateCourseUnitInput } from "@/types/course-unit";

export const dynamic = "force-dynamic";

export default function NewCourseUnitPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const createMutation = useCreateCourseUnit();
  const { data: academicPrograms, isLoading: loadingPrograms } = useAcademicPrograms();

  const handleSubmit = async (data: CreateCourseUnitInput) => {
    try {
      await createMutation.mutateAsync(data);
      setToast({
        isOpen: true,
        message: "Unité d'enseignement créée avec succès",
        type: "success",
      });
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/course-units");
      }, 1500);
    } catch (err) {
      console.error("Error creating course unit:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la création de l'unité d'enseignement",
        type: "error",
      });
    }
  };

  const handleCancel = () => {
    router.push("/course-units");
  };

  if (loadingPrograms) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Créer une Unité d'Enseignement">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Créer une Unité d'Enseignement">
        <div className="max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#00365F]">Créer une Unité d'Enseignement</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Remplissez le formulaire ci-dessous pour créer une nouvelle unité d'enseignement.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <CourseUnitForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              academicPrograms={Array.isArray(academicPrograms) ? academicPrograms : []}
              isLoading={createMutation.isPending}
            />
          </div>
        </div>

        {/* Toast Notifications */}
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
