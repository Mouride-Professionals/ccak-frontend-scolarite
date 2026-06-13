"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CourseEnrollmentTable from "@/components/course-enrollments/course-enrollment-table";
import CourseEnrollmentForm from "@/components/course-enrollments/course-enrollment-form";
import type { CreateCourseEnrollmentBatchInput } from "@/components/course-enrollments/course-enrollment-form";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import Pagination from "@/components/ui/pagination";
import {
  useCourseEnrollments,
  useDeleteCourseEnrollment,
  useCreateCourseEnrollment,
  useCourses,
} from "@/hooks/use-course-enrollments";
import { useEnrollment } from "@/hooks/use-enrollments";
import { CourseEnrollmentStatus, type CourseEnrollmentFilters } from "@/types/course-enrollment";
import { useCourseBasketStore } from "@/stores/course-basket-store";
import { toUserError } from "@/lib/error-handler";
import { useSelectedYear } from "@/hooks/use-selected-year";

export default function EnrollmentCoursesPageClient() {
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get("enrollment_id") || "";
  const { selectedYear } = useSelectedYear();

  const [filters, setFilters] = useState<CourseEnrollmentFilters>({
    enrollment_id: enrollmentId,
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, academic_year_id: selectedYear?.id, page: 1 }));
  }, [selectedYear?.id]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    courseEnrollmentId: string | null;
  }>({
    isOpen: false,
    courseEnrollmentId: null,
  });
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const { data, isLoading, error } = useCourseEnrollments(filters);
  const { data: enrollment } = useEnrollment(enrollmentId);
  const clearBasket = useCourseBasketStore((state) => state.clear);
  const deleteMutation = useDeleteCourseEnrollment();
  const createMutation = useCreateCourseEnrollment();

  // Load form data
  const { data: courses, isLoading: loadingCourses } = useCourses();

  const handleViewClick = (id: string) => {
    // Vous pouvez créer une page de détail si nécessaire
    console.log("View course enrollment:", id);
  };

  const handleEditClick = (id: string) => {
    // Vous pouvez créer une page d'édition si nécessaire
    console.log("Edit course enrollment:", id);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, courseEnrollmentId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.courseEnrollmentId) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirm.courseEnrollmentId);
      setDeleteConfirm({ isOpen: false, courseEnrollmentId: null });
      setToast({
        isOpen: true,
        message: "Cours retiré avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error deleting course enrollment:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors du retrait du cours",
        type: "error",
      });
    }
  };

  const handleCreateSubmit = async (payload: CreateCourseEnrollmentBatchInput) => {
    try {
      await Promise.all(
        payload.course_ids.map((courseId) =>
          createMutation.mutateAsync({
            enrollment_id: payload.enrollment_id,
            course_id: courseId,
            academic_year_id: payload.academic_year_id,
            semester: payload.semester,
            enrollment_date: payload.enrollment_date,
            status: payload.status,
          })
        )
      );
      clearBasket();
      setIsCreateModalOpen(false);
      setToast({
        isOpen: true,
        message: `${payload.course_ids.length} cours ajouté(s) avec succès`,
        type: "success",
      });
    } catch (error) {
      console.error("Error creating course enrollment batch:", error);
      setToast({
        isOpen: true,
        message: toUserError(error).message,
        type: "error",
      });
    }
  };

  if (!enrollmentId) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Cours enrolés">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              ID d&apos;inscription manquant. Veuillez retourner à la liste des inscriptions.
            </p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Cours enrolés">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/enrollments"
              className="text-zinc-500 transition-colors hover:text-[#00365F]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">Cours enrolés</h2>
              {enrollment && (
                <p className="mt-1 text-sm text-zinc-500">
                  {enrollment.student?.full_name} ({enrollment.student?.student_number}) -{" "}
                  {enrollment.academic_program?.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Ajouter un Cours
            </button>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Erreur lors du chargement des cours. Veuillez réessayer.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement des cours...</p>
            </div>
          </div>
        ) : (
          <>
            <CourseEnrollmentTable
              enrollments={data?.data ?? []}
              onView={handleViewClick}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />

            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.total_pages ?? 1}
              totalItems={data?.total ?? 0}
              perPage={data?.limit ?? filters.limit ?? 10}
              itemLabel="cours"
              onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
              onPerPageChange={(nextLimit) =>
                setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
              }
            />
          </>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            clearBasket();
            setIsCreateModalOpen(false);
          }}
          title="Ajouter un Cours"
          subtitle="Formulaire d'ajout de cours"
          size="lg"
        >
          {loadingCourses ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
                <p className="mt-3 text-sm text-zinc-500">Chargement des données...</p>
              </div>
            </div>
          ) : (
            <CourseEnrollmentForm
              onSubmit={handleCreateSubmit}
              onCancel={() => {
                clearBasket();
                setIsCreateModalOpen(false);
              }}
              enrollments={enrollment ? [enrollment] : []}
              courses={courses ?? []}
              alreadyEnrolledCourseIds={(data?.data ?? [])
                .filter((item) => item.status !== CourseEnrollmentStatus.DROPPED)
                .map((item) => item.course_id)}
              isLoading={createMutation.isPending}
              initialData={{
                enrollment_id: enrollmentId,
                course_id: "",
                academic_year_id: enrollment?.academic_year_id || "",
                semester: enrollment?.current_semester || 1,
                enrollment_date: new Date().toISOString().split("T")[0],
              }}
            />
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, courseEnrollmentId: null })}
          onConfirm={handleDeleteConfirm}
          title="Retirer le cours"
          message="Êtes-vous sûr de vouloir retirer cet étudiant de ce cours ? Cette action est irréversible."
          confirmText="Retirer"
          cancelText="Annuler"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        {/* Toast Notifications */}
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
