"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AssessmentForm from "@/components/assessments/assessment-form";
import { useAssessment, useUpdateAssessment } from "@/hooks/use-assessments";
import type { CreateAssessmentInput } from "@/types/assessment";
import type { AssessmentType } from "@/types/assessment";

export default function AssessmentEditPage() {
  const params = useSafeParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const { data: assessment, isLoading } = useAssessment(id);
  const updateMutation = useUpdateAssessment(id);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const handleSubmit = async (input: CreateAssessmentInput) => {
    try {
      await updateMutation.mutateAsync(input);
      setToast({ isOpen: true, message: "Contrôle continu mis à jour.", type: "success" });
      setTimeout(() => router.push(`/assessments/${id}`), 1000);
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la mise à jour.", type: "error" });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Modifier le contrôle">
          <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Chargement...
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Modifier le contrôle continu">
        <AssessmentForm
          initialValues={{
            courseId: assessment?.course_id ?? "",
            facultyMemberId: assessment?.faculty_member_id ?? "",
            academicYearId: assessment?.academic_year_id ?? "",
            title: assessment?.title ?? "",
            type: (assessment?.type as AssessmentType) ?? undefined,
            date: assessment?.date ?? "",
            startTime: assessment?.start_time ?? "",
            durationMinutes: assessment?.duration_minutes
              ? String(assessment.duration_minutes)
              : "",
            room: assessment?.room ?? "",
            coefficient: assessment?.coefficient ? String(assessment.coefficient) : "",
            notes: assessment?.notes ?? "",
          }}
          yearLabel={assessment?.academic_year?.name}
          onSubmit={handleSubmit}
          isPending={updateMutation.isPending}
          submitLabel="Mettre à jour"
          backHref={`/assessments/${id}`}
          toast={toast}
          onCloseToast={() => setToast({ ...toast, isOpen: false })}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
