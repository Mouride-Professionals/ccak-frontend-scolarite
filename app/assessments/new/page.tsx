"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AssessmentForm, {
  defaultFormState,
  buildAssessmentPayload,
} from "@/components/assessments/assessment-form";
import { useCreateAssessment } from "@/hooks/use-assessments";
import type { CreateAssessmentInput } from "@/types/assessment";

export default function AssessmentNewPage() {
  const router = useRouter();
  const createMutation = useCreateAssessment();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const handleSubmit = async (input: CreateAssessmentInput) => {
    try {
      await createMutation.mutateAsync(input);
      setToast({ isOpen: true, message: "Contrôle continu créé avec succès.", type: "success" });
      setTimeout(() => router.push("/assessments"), 1000);
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la création.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouveau contrôle continu">
        <AssessmentForm
          initialValues={defaultFormState}
          onSubmit={handleSubmit}
          isPending={createMutation.isPending}
          submitLabel="Enregistrer"
          backHref="/assessments"
          toast={toast}
          onCloseToast={() => setToast({ ...toast, isOpen: false })}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
