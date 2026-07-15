"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import EnrollmentForm from "@/components/enrollments/enrollment-form";
import Toast from "@/components/ui/toast";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useCreateEnrollment, useAcademicPrograms, useStudents } from "@/hooks/use-enrollments";
import type { CreateEnrollmentInput } from "@/types/enrollment";

export default function NewEnrollmentPage() {
  const router = useRouter();
  const createMutation = useCreateEnrollment();
  const { data: programs, isLoading: isProgramsLoading } = useAcademicPrograms();
  const { data: students, isLoading: isStudentsLoading } = useStudents();
  const isFormLoading = isProgramsLoading || isStudentsLoading;

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [pendingEnrollment, setPendingEnrollment] = useState<CreateEnrollmentInput | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSubmit = async (data: CreateEnrollmentInput) => {
    setPendingEnrollment(data);
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingEnrollment) return;

    try {
      await createMutation.mutateAsync(pendingEnrollment);
      setToast({
        isOpen: true,
        message: "Enrollement créé avec succès",
        type: "success",
      });
      setIsConfirmOpen(false);
      setPendingEnrollment(null);
      setTimeout(() => {
        router.push("/enrollments");
      }, 1500);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la création de l'enrollement",
        type: "error",
      });
    }
  };

  const handleCancel = () => {
    router.push("/enrollments");
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouvel Enrollement">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-zinc-900">Nouvel Enrollement</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Enregistrer un nouvel enrollement d&apos;étudiant
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            {isFormLoading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                  <p className="mt-3 text-sm text-zinc-500">Chargement des données...</p>
                </div>
              </div>
            ) : (
              <EnrollmentForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                students={students ?? []}
                programs={programs ?? []}
                isLoading={createMutation.isPending}
              />
            )}
          </div>
        </div>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => {
            if (createMutation.isPending) return;
            setIsConfirmOpen(false);
            setPendingEnrollment(null);
          }}
          onConfirm={handleConfirmSubmit}
          title="Confirmer l'enrollement"
          message="Voulez-vous confirmer cet enrollement ? Vérifiez les informations avant validation."
          confirmText="Confirmer"
          cancelText="Modifier"
          variant="warning"
          isLoading={createMutation.isPending}
        />

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
