'use client';

import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';
import CourseForm from '@/components/courses/course-form';
import { useCreateCourse, useCourseUnits } from '@/hooks/use-courses';
import type { CreateCourseInput } from '@/types/course';

export default function NewCoursePage() {
  const router = useRouter();
  const createMutation = useCreateCourse();

  // Load form data
  const { data: courseUnits, isLoading: loadingCourseUnits } = useCourseUnits();

  const handleSubmit = async (data: CreateCourseInput) => {
    try {
      await createMutation.mutateAsync(data);
      router.push('/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Erreur lors de la création du cours. Veuillez réessayer.');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouveau Cours">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-sm text-zinc-600">
              Créez un nouveau cours
            </p>
          </div>

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
                onCancel={() => router.push('/courses')}
                courseUnits={Array.isArray(courseUnits) ? courseUnits : []}
                isLoading={createMutation.isPending}
              />
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
