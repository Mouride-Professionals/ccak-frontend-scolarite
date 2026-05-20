"use client";

import { useMemo, useState } from "react";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import { z } from "zod";
import type { Course, CreateCourseEnrollmentInput } from "@/types/course-enrollment";
import { CourseEnrollmentStatus } from "@/types/course-enrollment";
import type { Enrollment, AcademicYear } from "@/types/enrollment";
import { useCourseAvailabilities } from "@/hooks/use-course-enrollments";
import { useCourseBasketStore } from "@/stores/course-basket-store";
import { zodErrorToFieldErrors, type FieldErrors } from "@/lib/validations/zod-errors";

export interface CreateCourseEnrollmentBatchInput extends Omit<
  CreateCourseEnrollmentInput,
  "course_id"
> {
  course_ids: string[];
}

interface CourseEnrollmentFormProps {
  onSubmit: (data: CreateCourseEnrollmentBatchInput) => void;
  onCancel?: () => void;
  enrollments?: Enrollment[];
  courses?: Course[];
  years?: AcademicYear[];
  alreadyEnrolledCourseIds?: string[];
  isLoading?: boolean;
  initialData?: CreateCourseEnrollmentInput;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const CourseEnrollmentFormSchema = z.object({
  enrollment_id: z.string().min(1, "L'inscription au programme est requise"),
  academic_year_id: z.string().min(1, "L'année académique est requise"),
  semester: z
    .number({ error: "Le semestre est requis" })
    .int("Le semestre doit être un nombre entier")
    .min(1, "Le semestre doit être compris entre 1 et 6")
    .max(6, "Le semestre doit être compris entre 1 et 6"),
  enrollment_date: z
    .string()
    .min(1, "La date d'inscription est requise")
    .regex(ISO_DATE_REGEX, "La date d'inscription doit être au format YYYY-MM-DD"),
  status: z.nativeEnum(CourseEnrollmentStatus),
});

type CourseEnrollmentFormData = z.infer<typeof CourseEnrollmentFormSchema>;

export default function CourseEnrollmentForm({
  onSubmit,
  onCancel,
  enrollments = [],
  courses = [],
  years = [],
  alreadyEnrolledCourseIds = [],
  isLoading = false,
  initialData,
}: CourseEnrollmentFormProps) {
  const isReadOnly = useIsReadOnly();
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<CourseEnrollmentFormData>({
    enrollment_id: initialData?.enrollment_id ?? "",
    academic_year_id: initialData?.academic_year_id ?? "",
    semester: initialData?.semester ?? 1,
    enrollment_date: initialData?.enrollment_date ?? new Date().toISOString().split("T")[0],
    status: initialData?.status ?? CourseEnrollmentStatus.ENROLLED,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const getErrorId = (field: keyof CourseEnrollmentFormData | "basket") => `${field}-error`;

  const basketItems = useCourseBasketStore((state) => state.items);
  const addCourse = useCourseBasketStore((state) => state.addCourse);
  const removeCourse = useCourseBasketStore((state) => state.removeCourse);
  const clearBasket = useCourseBasketStore((state) => state.clear);
  const hasCourse = useCourseBasketStore((state) => state.hasCourse);
  const totalCredits = useCourseBasketStore((state) => state.totalCredits);
  const canSubmit =
    formData.enrollment_id.trim().length > 0 &&
    formData.academic_year_id.trim().length > 0 &&
    formData.enrollment_date.trim().length > 0 &&
    basketItems.length > 0;

  const availabilityByCourseId = useCourseAvailabilities(
    courses,
    formData.academic_year_id,
    formData.semester,
    !!formData.academic_year_id
  );

  const selectedEnrollment = useMemo(
    () => enrollments.find((item) => item.id === formData.enrollment_id),
    [enrollments, formData.enrollment_id]
  );

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        (course.description || "").toLowerCase().includes(q)
    );
  }, [courses, search]);

  const takenOrSelectedCourseIds = useMemo(() => {
    return new Set([...alreadyEnrolledCourseIds, ...basketItems.map((item) => item.id)]);
  }, [alreadyEnrolledCourseIds, basketItems]);

  const getMissingPrerequisites = (course: Course) => {
    const prerequisites = course.prerequisites ?? [];
    return prerequisites.filter((requiredId) => !takenOrSelectedCourseIds.has(requiredId));
  };

  const handleChange = <K extends keyof CourseEnrollmentFormData>(
    field: K,
    value: CourseEnrollmentFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const fieldKey = String(field);
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
  };

  const handleAddCourse = (course: Course) => {
    const availability = availabilityByCourseId[course.id];
    const missing = getMissingPrerequisites(course);

    if (missing.length > 0) {
      setErrors((prev) => ({
        ...prev,
        basket: `Prérequis manquants pour ${course.code}.`,
      }));
      return;
    }

    if (availability && !availability.is_available) {
      setErrors((prev) => ({
        ...prev,
        basket: availability.message || `Aucune place disponible pour ${course.code}.`,
      }));
      return;
    }

    addCourse(course);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.basket;
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = CourseEnrollmentFormSchema.safeParse(formData);
    const nextErrors = parsed.success ? {} : zodErrorToFieldErrors(parsed.error);

    if (basketItems.length === 0) {
      nextErrors.basket = "Ajoutez au moins un cours dans le panier";
    }

    if (!parsed.success || Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    onSubmit({
      enrollment_id: parsed.data.enrollment_id,
      academic_year_id: parsed.data.academic_year_id,
      semester: parsed.data.semester,
      enrollment_date: parsed.data.enrollment_date,
      status: parsed.data.status,
      course_ids: basketItems.map((item) => item.id),
    });
  };

  const handleCancel = () => {
    clearBasket();
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[#00365F]">Informations de base</h4>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="enrollment_id" className="mb-2 block text-sm text-zinc-900">
              Inscription au programme <span className="text-red-500">*</span>
            </label>
            <select
              id="enrollment_id"
              value={formData.enrollment_id}
              onChange={(e) => handleChange("enrollment_id", e.target.value)}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                errors.enrollment_id ? "border-red-300" : "border-zinc-300"
              }`}
              disabled={isLoading}
              aria-invalid={Boolean(errors.enrollment_id)}
              aria-describedby={errors.enrollment_id ? getErrorId("enrollment_id") : undefined}
            >
              <option value="">| Sélectionner une inscription</option>
              {enrollments.map((enrollment) => (
                <option key={enrollment.id} value={enrollment.id}>
                  {enrollment.student?.student_number} - {enrollment.student?.full_name} (
                  {enrollment.academic_program?.name})
                </option>
              ))}
            </select>
            {errors.enrollment_id && (
              <p id={getErrorId("enrollment_id")} className="mt-1.5 text-xs text-red-600">
                {errors.enrollment_id}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="academic_year_id" className="mb-2 block text-sm text-zinc-900">
              Année académique <span className="text-red-500">*</span>
            </label>
            <select
              id="academic_year_id"
              value={formData.academic_year_id}
              onChange={(e) => handleChange("academic_year_id", e.target.value)}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                errors.academic_year_id ? "border-red-300" : "border-zinc-300"
              }`}
              disabled={isLoading}
              aria-invalid={Boolean(errors.academic_year_id)}
              aria-describedby={
                errors.academic_year_id ? getErrorId("academic_year_id") : undefined
              }
            >
              <option value="">| Sélectionner une année</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name} {year.is_current && "(Actuelle)"}
                </option>
              ))}
            </select>
            {errors.academic_year_id && (
              <p id={getErrorId("academic_year_id")} className="mt-1.5 text-xs text-red-600">
                {errors.academic_year_id}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="semester" className="mb-2 block text-sm text-zinc-900">
              Semestre <span className="text-red-500">*</span>
            </label>
            <select
              id="semester"
              value={formData.semester}
              onChange={(e) => handleChange("semester", Number.parseInt(e.target.value, 10))}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                errors.semester ? "border-red-300" : "border-zinc-300"
              }`}
              disabled={isLoading}
              aria-invalid={Boolean(errors.semester)}
              aria-describedby={errors.semester ? getErrorId("semester") : undefined}
            >
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <option key={sem} value={sem}>
                  Semestre {sem}
                </option>
              ))}
            </select>
            {errors.semester && (
              <p id={getErrorId("semester")} className="mt-1.5 text-xs text-red-600">
                {errors.semester}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="enrollment_date" className="mb-2 block text-sm text-zinc-900">
              Date d&apos;inscription <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="enrollment_date"
              value={formData.enrollment_date}
              onChange={(e) => handleChange("enrollment_date", e.target.value)}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                errors.enrollment_date ? "border-red-300" : "border-zinc-300"
              }`}
              disabled={isLoading}
              aria-invalid={Boolean(errors.enrollment_date)}
              aria-describedby={errors.enrollment_date ? getErrorId("enrollment_date") : undefined}
            />
            {errors.enrollment_date && (
              <p id={getErrorId("enrollment_date")} className="mt-1.5 text-xs text-red-600">
                {errors.enrollment_date}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="mb-2 block text-sm text-zinc-900">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value as CourseEnrollmentStatus)}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                errors.status ? "border-red-300" : "border-zinc-300"
              }`}
              disabled={isLoading}
              aria-invalid={Boolean(errors.status)}
              aria-describedby={errors.status ? getErrorId("status") : undefined}
            >
              <option value={CourseEnrollmentStatus.ENROLLED}>Inscrit</option>
              <option value={CourseEnrollmentStatus.DROPPED}>Abandon</option>
              <option value={CourseEnrollmentStatus.COMPLETED}>Terminé</option>
            </select>
            {errors.status && (
              <p id={getErrorId("status")} className="mt-1.5 text-xs text-red-600">
                {errors.status}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-[#00365F]">Catalogue des cours</h4>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un cours..."
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm sm:w-72"
            />
          </div>

          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {filteredCourses.map((course) => {
              const availability = availabilityByCourseId[course.id];
              const missingPrereqs = getMissingPrerequisites(course);
              const selected = hasCourse(course.id);

              return (
                <div key={course.id} className="rounded-lg border border-zinc-200 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#00365F]">
                        {course.code} - {course.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-[#00365F]/10 px-2 py-0.5 text-[#00365F]">
                          {course.credits} crédits
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 ${
                            missingPrereqs.length > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {missingPrereqs.length > 0
                            ? `${missingPrereqs.length} prérequis manquant(s)`
                            : "Prérequis validés"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 ${
                            availability && !availability.is_available
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {availability?.remaining_seats != null
                            ? `${availability.remaining_seats} place(s) restante(s)`
                            : availability?.is_available === false
                              ? "Complet"
                              : "Disponibilité à vérifier"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={
                        isLoading ||
                        selected ||
                        missingPrereqs.length > 0 ||
                        (availability ? !availability.is_available : false)
                      }
                      onClick={() => handleAddCourse(course)}
                      className="rounded-lg bg-[#008D36] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0A8F3D] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {selected ? "Ajouté" : "Ajouter"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-[#00365F]">Panier de cours</h4>
          <p className="mt-1 text-xs text-zinc-500">
            {selectedEnrollment
              ? `${selectedEnrollment.student?.full_name ?? "Étudiant"} - Total crédits: ${totalCredits()}`
              : `Total crédits: ${totalCredits()}`}
          </p>

          {basketItems.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
              Aucun cours sélectionné.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {basketItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{item.code}</p>
                    <p className="text-xs text-zinc-500">{item.credits} crédits</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCourse(item.id)}
                    className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <span className="sr-only">Retirer</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  clearBasket();
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.basket;
                    return next;
                  });
                }}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
              >
                Vider le panier
              </button>
            </div>
          )}
        </div>
      </div>

      {errors.basket && (
        <p id={getErrorId("basket")} className="text-sm text-red-600" role="alert">
          {errors.basket}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="rounded-lg border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !canSubmit || isReadOnly}
          className="rounded-lg bg-[#008D36] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : "Valider le panier"}
        </button>
      </div>
    </form>
  );
}
