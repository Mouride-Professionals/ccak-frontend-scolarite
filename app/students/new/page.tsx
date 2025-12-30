"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StudentForm from "@/components/students/student-form";
import { useCreateStudent } from "@/hooks/use-students";
import type { CreateStudentInput } from "@/types/student";

export default function NewStudentPage() {
  const router = useRouter();
  const createMutation = useCreateStudent();

  const handleSubmit = async (data: CreateStudentInput) => {
    try {
      const student = await createMutation.mutateAsync(data);
      router.push(`/students/${student.id}`);
    } catch (error) {
      console.error("Error creating student:", error);
      alert("Erreur lors de la création de l'étudiant. Veuillez réessayer.");
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

          {/* Form */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <StudentForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
