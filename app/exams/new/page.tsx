"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ExamSessionForm from "@/components/exams/exam-session-form";
import Toast from "@/components/ui/toast";
import { useCreateExamSession } from "@/hooks/use-exams";
import { useSelectedYear } from "@/hooks/use-selected-year";
import type { CreateExamSessionInput } from "@/types/exam";

export default function NewExamSessionPage() {
  const router = useRouter();
  const { selectedYear } = useSelectedYear();
  const createMutation = useCreateExamSession();

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({ isOpen: false, message: "", type: "success" });

  const handleSubmit = async (data: CreateExamSessionInput) => {
    try {
      const session = await createMutation.mutateAsync(data);
      setToast({ isOpen: true, message: "Session créée avec succès", type: "success" });
      setTimeout(() => {
        router.push(`/exams/${session.id}`);
      }, 800);
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la création", type: "error" });
    }
  };

  if (!selectedYear) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Nouvelle session d'examen">
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-sm text-zinc-500">
              Sélectionnez une année académique pour continuer.
            </p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouvelle session d'examen">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/exams"
            className="flex items-center gap-2 text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour aux sessions
          </Link>
        </div>

        <div className="mx-auto max-w-xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-900">Nouvelle session d&apos;examen</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Après la création, vous pourrez planifier les examens individuellement.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <ExamSessionForm
              onSubmit={handleSubmit}
              onCancel={() => router.push("/exams")}
              academicYear={selectedYear}
              isLoading={createMutation.isPending}
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
