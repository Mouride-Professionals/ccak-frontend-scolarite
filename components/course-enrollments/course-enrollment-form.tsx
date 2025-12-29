"use client";

import { useState } from "react";
import type { CreateCourseEnrollmentInput, Course } from "@/types/course-enrollment";
import { CourseEnrollmentStatus } from "@/types/course-enrollment";
import type { Enrollment, AcademicYear } from "@/types/enrollment";

interface CourseEnrollmentFormProps {
  onSubmit: (data: CreateCourseEnrollmentInput) => void;
  onCancel?: () => void;
  enrollments?: Enrollment[];
  courses?: Course[];
  years?: AcademicYear[];
  isLoading?: boolean;
  initialData?: CreateCourseEnrollmentInput;
}

export default function CourseEnrollmentForm({
  onSubmit,
  onCancel,
  enrollments = [],
  courses = [],
  years = [],
  isLoading = false,
  initialData,
}: CourseEnrollmentFormProps) {
  const [formData, setFormData] = useState<CreateCourseEnrollmentInput>({
    enrollment_id: initialData?.enrollment_id ?? "",
    course_id: initialData?.course_id ?? "",
    academic_year_id: initialData?.academic_year_id ?? "",
    semester: initialData?.semester ?? 1,
    enrollment_date: initialData?.enrollment_date ?? new Date().toISOString().split('T')[0],
    status: initialData?.status ?? CourseEnrollmentStatus.ENROLLED,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateCourseEnrollmentInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.enrollment_id) {
      newErrors.enrollment_id = "L'inscription de programme est requise";
    }

    if (!formData.course_id) {
      newErrors.course_id = "Le cours est requis";
    }

    if (!formData.academic_year_id) {
      newErrors.academic_year_id = "L'année académique est requise";
    }

    if (!formData.semester || formData.semester < 1 || formData.semester > 10) {
      newErrors.semester = "Le semestre doit être entre 1 et 10";
    }

    if (!formData.enrollment_date) {
      newErrors.enrollment_date = "La date d'inscription est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* BASIC INFO */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[#00365F]">Informations de base</h4>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Program Enrollment */}
          <div className="sm:col-span-2">
            <label htmlFor="enrollment_id" className="mb-2 block text-sm text-zinc-900">
              Inscription au programme <span className="text-red-500">*</span>
            </label>
            <select
              id="enrollment_id"
              value={formData.enrollment_id}
              onChange={(e) => handleChange("enrollment_id", e.target.value)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value="">| Sélectionner une inscription</option>
              {Array.isArray(enrollments) && enrollments.map((enrollment) => (
                <option key={enrollment.id} value={enrollment.id}>
                  {enrollment.student?.student_number} - {enrollment.student?.full_name} ({enrollment.academic_program?.name})
                </option>
              ))}
            </select>
            {errors.enrollment_id && (
              <p className="mt-1.5 text-xs text-red-600">{errors.enrollment_id}</p>
            )}
          </div>

          {/* Course */}
          <div className="sm:col-span-2">
            <label htmlFor="course_id" className="mb-2 block text-sm text-zinc-900">
              Cours <span className="text-red-500">*</span>
            </label>
            <select
              id="course_id"
              value={formData.course_id}
              onChange={(e) => handleChange("course_id", e.target.value)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value="">| Sélectionner un cours</option>
              {Array.isArray(courses) && courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name} ({course.credits} crédits)
                </option>
              ))}
            </select>
            {errors.course_id && (
              <p className="mt-1.5 text-xs text-red-600">{errors.course_id}</p>
            )}
          </div>

          {/* Academic Year */}
          <div>
            <label htmlFor="academic_year_id" className="mb-2 block text-sm text-zinc-900">
              Année académique <span className="text-red-500">*</span>
            </label>
            <select
              id="academic_year_id"
              value={formData.academic_year_id}
              onChange={(e) => handleChange("academic_year_id", e.target.value)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value="">| Sélectionner une année</option>
              {Array.isArray(years) && years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name} {year.is_current && "(Actuelle)"}
                </option>
              ))}
            </select>
            {errors.academic_year_id && (
              <p className="mt-1.5 text-xs text-red-600">{errors.academic_year_id}</p>
            )}
          </div>

          {/* Semester */}
          <div>
            <label htmlFor="semester" className="mb-2 block text-sm text-zinc-900">
              Semestre <span className="text-red-500">*</span>
            </label>
            <select
              id="semester"
              value={formData.semester}
              onChange={(e) => handleChange("semester", parseInt(e.target.value, 10))}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <option key={sem} value={sem}>
                  Semestre {sem}
                </option>
              ))}
            </select>
            {errors.semester && (
              <p className="mt-1.5 text-xs text-red-600">{errors.semester}</p>
            )}
          </div>

          {/* Enrollment Date */}
          <div>
            <label htmlFor="enrollment_date" className="mb-2 block text-sm text-zinc-900">
              Date d'inscription <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="enrollment_date"
              value={formData.enrollment_date}
              onChange={(e) => handleChange("enrollment_date", e.target.value)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.enrollment_date && (
              <p className="mt-1.5 text-xs text-red-600">{errors.enrollment_date}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="mb-2 block text-sm text-zinc-900">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value as CourseEnrollmentStatus)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value={CourseEnrollmentStatus.ENROLLED}>Inscrit</option>
              <option value={CourseEnrollmentStatus.DROPPED}>Abandon</option>
              <option value={CourseEnrollmentStatus.COMPLETED}>Terminé</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-[#008D36] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : initialData ? "Modifier" : "Créer"}
        </button>
      </div>
    </form>
  );
}
