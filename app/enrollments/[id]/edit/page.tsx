"use client";

import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import EnrollmentForm from "@/components/enrollments/enrollment-form";
import Toast from "@/components/ui/toast";
import {
  useEnrollment,
  useUpdateEnrollment,
  useAcademicPrograms,
  useAcademicYears,
  useStudents,
} from "@/hooks/use-enrollments";
import type { UpdateEnrollmentInput } from "@/types/enrollment";

export default function EditEnrollmentPage() {
  const router = useRouter();
  const params = useSafeParams<{ id: string }>();
  const enrollmentId = params.id as string;

  const {
    data: enrollment,
    isLoading: isEnrollmentLoading,
    error: enrollmentError,
  } = useEnrollment(enrollmentId);
  const { data: students, isLoading: isStudentsLoading } = useStudents();
  const { data: programs, isLoading: isProgramsLoading } = useAcademicPrograms();
  const { data: years, isLoading: isYearsLoading } = useAcademicYears();
  const updateMutation = useUpdateEnrollment();

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Redirect if error
  useEffect(() => {
    if (enrollmentError) {
      setToast({
        isOpen: true,
        message: "Inscription introuvable",
        type: "error",
      });
      setTimeout(() => {
        router.push("/enrollments");
      }, 2000);
    }
  }, [enrollmentError, router]);

  const handleSubmit = async (data: UpdateEnrollmentInput) => {
    try {
      await updateMutation.mutateAsync({ id: enrollmentId, input: data });
      setToast({
        isOpen: true,
        message: "Inscription modifiée avec succès",
        type: "success",
      });
      setTimeout(() => {
        router.push(`/enrollments/${enrollmentId}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating enrollment:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la modification de l'inscription",
        type: "error",
      });
    }
  };

  const handleCancel = () => {
    router.push(`/enrollments/${enrollmentId}`);
  };

  if (isEnrollmentLoading || isStudentsLoading || isProgramsLoading || isYearsLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Modifier l'Inscription">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement de l'inscription...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!enrollment) {
    return null;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Modifier l'Inscription">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-zinc-900">Modifier l'Inscription</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {enrollment.student?.full_name} - {enrollment.student?.student_number}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <EnrollmentForm
              initialData={enrollment}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              students={students ?? []}
              programs={programs ?? []}
              years={years ?? []}
              isLoading={updateMutation.isPending}
            />
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
