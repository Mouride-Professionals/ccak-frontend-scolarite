"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import FacultySearch from "@/components/faculty-members/faculty-search";
import { useCourses } from "@/hooks/use-courses";
import { useCurrentAcademicYear } from "@/hooks/use-academic-years";
import {
  useCreateTeachingAssignment,
  useTeachingAssignmentConflictCheck,
} from "@/hooks/use-teaching-assignments";
import { TeachingRole } from "@/types/teaching-assignment";

export default function TeachingAssignmentNewPage() {
  const router = useRouter();
  const { data: coursesData } = useCourses({ page: 1, limit: 100 });
  const { data: currentYear } = useCurrentAcademicYear();
  const createMutation = useCreateTeachingAssignment();
  const conflictMutation = useTeachingAssignmentConflictCheck();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [form, setForm] = useState({
    facultyId: "",
    facultyName: "",
    courseId: "",
    academicYearId: "",
    role: TeachingRole.TITULAR,
    hours: "",
    hourlyRate: "",
  });

  useEffect(() => {
    if (currentYear) setForm((prev) => ({ ...prev, academicYearId: currentYear.id }));
  }, [currentYear]);

  const handleSubmit = async () => {
    if (!form.facultyId || !form.courseId || !form.academicYearId || !form.hours) {
      setToast({
        isOpen: true,
        message: "Veuillez compléter les champs obligatoires.",
        type: "error",
      });
      return;
    }

    const payload = {
      faculty_member_id: form.facultyId,
      course_id: form.courseId,
      academic_year_id: form.academicYearId,
      role: form.role,
      hours_assigned: Number(form.hours),
      hourly_rate: form.hourlyRate ? Number(form.hourlyRate) : null,
    };

    try {
      const conflict = await conflictMutation.mutateAsync(payload);
      if (conflict.has_conflict) {
        setToast({
          isOpen: true,
          message:
            conflict.message || "Conflit détecté: cet enseignant est déjà affecté sur ce créneau.",
          type: "error",
        });
        return;
      }

      await createMutation.mutateAsync(payload);
      setToast({
        isOpen: true,
        message: "Affectation créée avec succès.",
        type: "success",
      });
      setTimeout(() => {
        router.push("/teaching-assignments");
      }, 1000);
    } catch (error) {
      console.error("Error creating teaching assignment:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la création de l'affectation.",
        type: "error",
      });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Affecter un cours">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-700">Enseignant *</label>
              <FacultySearch
                onSelect={(faculty) =>
                  setForm((prev) => ({
                    ...prev,
                    facultyId: faculty.id,
                    facultyName: faculty.full_name,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Cours *</label>
              <select
                value={form.courseId}
                onChange={(event) => setForm((prev) => ({ ...prev, courseId: event.target.value }))}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
              >
                <option value="">Sélectionner un cours</option>
                {coursesData?.data?.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Année académique *
              </label>
              <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                {currentYear?.name ?? "Chargement..."}
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Rôle *</label>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, role: event.target.value as TeachingRole }))
                }
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
              >
                {Object.values(TeachingRole).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Heures *</label>
              <input
                type="number"
                value={form.hours}
                onChange={(event) => setForm((prev) => ({ ...prev, hours: event.target.value }))}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Taux horaire</label>
              <input
                type="number"
                value={form.hourlyRate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, hourlyRate: event.target.value }))
                }
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/teaching-assignments")}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending || conflictMutation.isPending}
              className="rounded-lg bg-[#008D36] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#007A2E]"
            >
              {createMutation.isPending || conflictMutation.isPending
                ? "Enregistrement..."
                : "Enregistrer"}
            </button>
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
