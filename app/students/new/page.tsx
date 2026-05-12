"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StudentForm from "@/components/students/student-form";
import { useCreateStudent } from "@/hooks/use-students";
import { useCreateStudentBacInfo } from "@/hooks/use-student-bac-info";
import { toUserError } from "@/lib/error-handler";
import type { CreateStudentInput, CreateStudentBacInfoInput } from "@/types/student";

export default function NewStudentPage() {
  const router = useRouter();
  const createMutation = useCreateStudent();
  const createBacInfoMutation = useCreateStudentBacInfo();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (
    data: CreateStudentInput,
    bacInfo?: Omit<CreateStudentBacInfoInput, "student_id">
  ) => {
    setSubmitError(null);
    try {
      const student = await createMutation.mutateAsync(data);
      if (bacInfo) {
        await createBacInfoMutation.mutateAsync({ ...bacInfo, student_id: student.id });
      }
      router.push(`/students/${student.id}`);
    } catch (error) {
      console.error("Error creating student:", error);
      setSubmitError(
        toUserError(error, "Erreur lors de la création de l'étudiant. Veuillez réessayer.").message
      );
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouvel Étudiant">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-sm text-zinc-600">
              Ajoutez un nouvel étudiant au système avec ses documents requis
            </p>
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
            <StudentForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
