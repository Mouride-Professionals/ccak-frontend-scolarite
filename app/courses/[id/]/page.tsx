"use client";

import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CourseForm from "@/components/courses/course-form";
import { useCourse, useUpdateCourse, useCourseUnits } from "@/hooks/use-courses";
import type { CreateCourseInput } from "@/types/course";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useSafeParams<{ id: string }>();
  const courseId = params.id as string;

  const { data: course, isLoading: loadingCourse } = useCourse(courseId);
  const { data: courseUnits, isLoading: loadingCourseUnits } = useCourseUnits();
  const updateMutation = useUpdateCourse();

  const handleSubmit = async (data: CreateCourseInput) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        id: courseId,
      });
      router.push("/courses");
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Erreur lors de la modification du cours. Veuillez réessayer.");
    }
  };

  const isLoading = loadingCourse || loadingCourseUnits;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Modifier Cours">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-sm text-zinc-600">Modifiez les informations du cours</p>
          </div>

          {/* Form */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            {isLoading || !course ? (
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
                courseUnits={Array.isArray(courseUnits) ? courseUnits : []}
                isLoading={updateMutation.isPending}
                initialData={course}
              />
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
