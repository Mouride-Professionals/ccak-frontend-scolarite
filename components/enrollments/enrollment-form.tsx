"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateEnrollmentInput,
  Student,
  AcademicProgram,
  AcademicYear,
} from "@/types/enrollment";
import { EnrollmentStatus } from "@/types/enrollment";
import { EnrollmentSchema, type EnrollmentFormData } from "@/lib/validations/schemas";
import { extractValidationErrors, toUserError } from "@/lib/error-handler";
import StudentSearch from "@/components/students/student-search";

interface EnrollmentFormProps {
  onSubmit: (data: CreateEnrollmentInput) => Promise<void> | void;
  onCancel?: () => void;
  students: Student[];
  programs: AcademicProgram[];
  years: AcademicYear[];
  isLoading?: boolean;
  initialData?: Partial<CreateEnrollmentInput>;
}

export default function EnrollmentForm({
  onSubmit,
  onCancel,
  students,
  programs,
  years,
  isLoading = false,
  initialData,
}: EnrollmentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(EnrollmentSchema),
    defaultValues: {
      student_id: initialData?.student_id ?? "",
      academic_program_id: initialData?.academic_program_id ?? "",
      academic_year_id: initialData?.academic_year_id ?? "",
      current_semester: initialData?.current_semester ?? 1,
      enrollment_date: initialData?.enrollment_date ?? new Date().toISOString().split("T")[0],
      registration_fee_paid: initialData?.registration_fee_paid ?? 0,
      is_scholarship: initialData?.is_scholarship ?? false,
      status: initialData?.status ?? EnrollmentStatus.PENDING,
    },
  });
  const [selectedStudentLabel, setSelectedStudentLabel] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormSubmit = async (data: EnrollmentFormData) => {
    setSubmitError(null);
    try {
      await onSubmit(data as CreateEnrollmentInput);
    } catch (error) {
      const validationErrors = extractValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field as keyof EnrollmentFormData, { type: "server", message });
        });
        setSubmitError("Veuillez corriger les champs en erreur.");
        return;
      }
      const userError = toUserError(error);
      setSubmitError(userError.message);
      console.error("Form submission error:", userError.message);
    }
  };

  const initialSelectedStudentLabel = (() => {
    if (!initialData?.student_id) return "";
    const student = students.find((item) => item.id === initialData.student_id);
    return student ? `${student.full_name} · ${student.student_number}` : "";
  })();
  const displayedStudentLabel = selectedStudentLabel ?? initialSelectedStudentLabel;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* INFORMATIONS GÉNÉRALES */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Informations générales
        </h3>
        <div className="space-y-5">
          {/* Student */}
          <div>
            <label htmlFor="student_id" className="mb-2 block text-sm text-zinc-900">
              Étudiant <span className="text-red-500">*</span>
            </label>
            <input type="hidden" id="student_id" {...register("student_id")} />
            <StudentSearch
              value={displayedStudentLabel}
              onSelect={(student) => {
                setValue("student_id", student.id, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setSelectedStudentLabel(`${student.full_name} · ${student.student_number}`);
              }}
              onClear={() => {
                setValue("student_id", "", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setSelectedStudentLabel("");
              }}
              placeholder="Rechercher par nom ou matricule..."
              disabled={isLoading}
            />
            {errors.student_id && (
              <p className="mt-1.5 text-xs text-red-600">{errors.student_id.message}</p>
            )}
          </div>

          {/* Enrollment Date */}
          <div>
            <label htmlFor="enrollment_date" className="mb-2 block text-sm text-zinc-900">
              Date d&apos;inscription <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="enrollment_date"
              {...register("enrollment_date")}
              aria-invalid={!!errors.enrollment_date}
              aria-describedby={errors.enrollment_date ? "enrollment_date-error" : undefined}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.enrollment_date ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.enrollment_date && (
              <p id="enrollment_date-error" className="mt-1.5 text-xs text-red-600">
                {errors.enrollment_date.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PROGRAMME ET PÉRIODE */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Programme et période
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Academic Program */}
          <div>
            <label htmlFor="academic_program_id" className="mb-2 block text-sm text-zinc-900">
              Programme académique <span className="text-red-500">*</span>
            </label>
            <select
              id="academic_program_id"
              {...register("academic_program_id")}
              aria-invalid={!!errors.academic_program_id}
              aria-describedby={
                errors.academic_program_id ? "academic_program_id-error" : undefined
              }
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.academic_program_id ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            >
              <option value="">Sélectionner un programme</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name} ({program.level})
                </option>
              ))}
            </select>
            {errors.academic_program_id && (
              <p id="academic_program_id-error" className="mt-1.5 text-xs text-red-600">
                {errors.academic_program_id.message}
              </p>
            )}
          </div>

          {/* Academic Year */}
          <div>
            <label htmlFor="academic_year_id" className="mb-2 block text-sm text-zinc-900">
              Année académique <span className="text-red-500">*</span>
            </label>
            <select
              id="academic_year_id"
              {...register("academic_year_id")}
              aria-invalid={!!errors.academic_year_id}
              aria-describedby={errors.academic_year_id ? "academic_year_id-error" : undefined}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.academic_year_id ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            >
              <option value="">Sélectionner une année</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name} {year.is_current && "(Actuelle)"}
                </option>
              ))}
            </select>
            {errors.academic_year_id && (
              <p id="academic_year_id-error" className="mt-1.5 text-xs text-red-600">
                {errors.academic_year_id.message}
              </p>
            )}
          </div>

          {/* Semester */}
          <div>
            <label htmlFor="current_semester" className="mb-2 block text-sm text-zinc-900">
              Semestre actuel <span className="text-red-500">*</span>
            </label>
            <select
              id="current_semester"
              {...register("current_semester", { valueAsNumber: true })}
              aria-invalid={!!errors.current_semester}
              aria-describedby={errors.current_semester ? "current_semester-error" : undefined}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.current_semester ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            >
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <option key={sem} value={sem}>
                  Semestre {sem}
                </option>
              ))}
            </select>
            {errors.current_semester && (
              <p id="current_semester-error" className="mt-1.5 text-xs text-red-600">
                {errors.current_semester.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="mb-2 block text-sm text-zinc-900">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              {...register("status")}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value={EnrollmentStatus.PENDING}>En attente</option>
              <option value={EnrollmentStatus.REGISTERED}>Enregistrée</option>
              <option value={EnrollmentStatus.ACTIVE}>Active</option>
              <option value={EnrollmentStatus.COMPLETED}>Terminée</option>
              <option value={EnrollmentStatus.WITHDRAWN}>Retirée</option>
            </select>
          </div>

          {/* Registration Fee Paid */}
          <div>
            <label htmlFor="registration_fee_paid" className="mb-2 block text-sm text-zinc-900">
              Frais d&apos;inscription payés (FCFA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="registration_fee_paid"
              {...register("registration_fee_paid", { valueAsNumber: true })}
              aria-invalid={!!errors.registration_fee_paid}
              aria-describedby={
                errors.registration_fee_paid ? "registration_fee_paid-error" : undefined
              }
              placeholder="| Saisir"
              min="0"
              step="1000"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.registration_fee_paid ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.registration_fee_paid && (
              <p id="registration_fee_paid-error" className="mt-1.5 text-xs text-red-600">
                {errors.registration_fee_paid.message}
              </p>
            )}
          </div>

          {/* Is Scholarship */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_scholarship"
              {...register("is_scholarship")}
              className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
              disabled={isLoading}
            />
            <label htmlFor="is_scholarship" className="ml-2 text-sm text-zinc-900">
              Étudiant boursier
            </label>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
        {submitError && (
          <p className="mr-auto text-sm text-red-600" role="alert">
            {submitError}
          </p>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-[#008D36] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : initialData ? "Modifier" : "Créer"}
        </button>
      </div>
    </form>
  );
}
