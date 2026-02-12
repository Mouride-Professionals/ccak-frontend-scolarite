"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CourseForm from "@/components/courses/course-form";
import { useCreateCourse, useCourseUnits } from "@/hooks/use-courses";
import { toUserError } from "@/lib/error-handler";
import type { CreateCourseInput } from "@/types/course";

export default function NewCoursePage() {
  const router = useRouter();
  const createMutation = useCreateCourse();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load form data
  const { data: courseUnits, isLoading: loadingCourseUnits } = useCourseUnits();
  const courseUnitOptions = courseUnits?.data ?? [];

  const handleSubmit = async (data: CreateCourseInput) => {
    setSubmitError(null);
    try {
      await createMutation.mutateAsync(data);
      router.push("/courses");
    } catch (error) {
      console.error("Error creating course:", error);
      setSubmitError(
        toUserError(error, "Erreur lors de la création du cours. Veuillez réessayer.").message
      );
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouveau Cours">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-sm text-zinc-600">Créez un nouveau cours</p>
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
            {loadingCourseUnits ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                  <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                    Chargement des données...
                  </p>
                </div>
              </div>
            ) : (
              <CourseForm
                onSubmit={handleSubmit}
                onCancel={() => router.push("/courses")}
                courseUnits={courseUnitOptions}
                isLoading={createMutation.isPending}
              />
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
