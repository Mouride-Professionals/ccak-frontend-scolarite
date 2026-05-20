"use client";

import { useState } from "react";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateEnrollmentInput,
  AcademicProgram,
  AcademicYear,
} from "@/types/enrollment";
import { RegistrationStatus } from "@/types/enrollment";
import type { Student } from "@/types/student";
import { EnrollmentSchema, type EnrollmentFormData } from "@/lib/validations/schemas";
import { extractValidationErrors, toUserError } from "@/lib/error-handler";
import StudentSearch from "@/components/students/student-search";
import { useLevels } from "@/hooks/use-levels";
import { useDegreeCycles } from "@/hooks/use-degree-cycles";

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
  const isReadOnly = useIsReadOnly();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(EnrollmentSchema),
    defaultValues: {
      student_id: initialData?.student_id ?? "",
      academic_program_id: initialData?.academic_program_id ?? "",
      academic_year_id: initialData?.academic_year_id ?? "",
      level_id: initialData?.level_id ?? "",
      current_semester: initialData?.current_semester ?? 1,
      enrollment_date: initialData?.enrollment_date ?? new Date().toISOString().split("T")[0],
      registration_fee_paid: initialData?.registration_fee_paid ?? 0,
      is_scholarship_holder: initialData?.is_scholarship_holder ?? false,
      scholarship_type: initialData?.scholarship_type ?? "",
      scholarship_amount: initialData?.scholarship_amount ?? undefined,
      notes: initialData?.notes ?? "",
      is_repeating: initialData?.is_repeating ?? false,
      is_medically_fit: initialData?.is_medically_fit ?? false,
      is_registered_elsewhere: initialData?.is_registered_elsewhere ?? false,
      is_willing_to_cancel_other_registration:
        initialData?.is_willing_to_cancel_other_registration ?? false,
      status: initialData?.status ?? RegistrationStatus.DRAFT,
    },
  });
  const [selectedStudentLabel, setSelectedStudentLabel] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: levelsData } = useLevels();
  const { data: degreeCycles } = useDegreeCycles();
  const levels = levelsData?.data ?? [];

  const isScholarshipHolder = watch("is_scholarship_holder");
  const isRegisteredElsewhere = watch("is_registered_elsewhere");

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
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.enrollment_date ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.enrollment_date && (
              <p className="mt-1.5 text-xs text-red-600">{errors.enrollment_date.message}</p>
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
              <p className="mt-1.5 text-xs text-red-600">{errors.academic_program_id.message}</p>
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
              <p className="mt-1.5 text-xs text-red-600">{errors.academic_year_id.message}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label htmlFor="level_id" className="mb-2 block text-sm text-zinc-900">
              Niveau
            </label>
            <select
              id="level_id"
              {...register("level_id")}
              className="block w-full appearance-none rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value="">— Sélectionner un niveau —</option>
              {degreeCycles && degreeCycles.length > 0
                ? degreeCycles.map((cycle) => {
                    const cycleLevels = levels.filter((l) => l.degree_cycle_id === cycle.id);
                    if (cycleLevels.length === 0) return null;
                    return (
                      <optgroup key={cycle.id} label={cycle.name}>
                        {cycleLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name} ({level.code})
                          </option>
                        ))}
                      </optgroup>
                    );
                  })
                : levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name} ({level.code})
                    </option>
                  ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label htmlFor="current_semester" className="mb-2 block text-sm text-zinc-900">
              Semestre actuel <span className="text-red-500">*</span>
            </label>
            <select
              id="current_semester"
              {...register("current_semester", { valueAsNumber: true })}
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
              <p className="mt-1.5 text-xs text-red-600">{errors.current_semester.message}</p>
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
              <option value={RegistrationStatus.DRAFT}>Brouillon</option>
              <option value={RegistrationStatus.PENDING_VALIDATION}>En attente de validation</option>
              <option value={RegistrationStatus.VALIDATED}>Validée</option>
              <option value={RegistrationStatus.SUSPENDED}>Suspendue</option>
              <option value={RegistrationStatus.CANCELLED}>Annulée</option>
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
              placeholder="| Saisir"
              min="0"
              step="1000"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.registration_fee_paid ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.registration_fee_paid && (
              <p className="mt-1.5 text-xs text-red-600">{errors.registration_fee_paid.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* DÉTAILS DE L'INSCRIPTION */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Détails de l&apos;inscription
        </h3>
        <div className="space-y-4">
          {/* Checkboxes row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("is_repeating")}
                className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
                disabled={isLoading}
              />
              <span className="text-sm text-zinc-900">Redoublant</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("is_medically_fit")}
                className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
                disabled={isLoading}
              />
              <span className="text-sm text-zinc-900">Apte médicalement</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("is_registered_elsewhere")}
                className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
                disabled={isLoading}
              />
              <span className="text-sm text-zinc-900">Inscrit ailleurs</span>
            </label>

            {isRegisteredElsewhere && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("is_willing_to_cancel_other_registration")}
                  className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
                  disabled={isLoading}
                />
                <span className="text-sm text-zinc-900">Prêt à annuler l&apos;autre inscription</span>
              </label>
            )}
          </div>

          {/* Scholarship */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("is_scholarship_holder")}
                className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
                disabled={isLoading}
              />
              <span className="text-sm text-zinc-900">Étudiant boursier</span>
            </label>

            {isScholarshipHolder && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pl-6">
                <div>
                  <label htmlFor="scholarship_type" className="mb-2 block text-sm text-zinc-900">
                    Type de bourse
                  </label>
                  <input
                    type="text"
                    id="scholarship_type"
                    {...register("scholarship_type")}
                    placeholder="Ex: Bourse d'État, Bourse UCAD..."
                    className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="scholarship_amount" className="mb-2 block text-sm text-zinc-900">
                    Montant de la bourse (FCFA)
                  </label>
                  <input
                    type="number"
                    id="scholarship_amount"
                    {...register("scholarship_amount", { valueAsNumber: true })}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.scholarship_amount ? "border-red-300" : "border-zinc-300"}`}
                    disabled={isLoading}
                  />
                  {errors.scholarship_amount && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.scholarship_amount.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="mb-2 block text-sm text-zinc-900">
              Notes
            </label>
            <textarea
              id="notes"
              {...register("notes")}
              placeholder="Observations, remarques..."
              rows={3}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.notes && (
              <p className="mt-1.5 text-xs text-red-600">{errors.notes.message}</p>
            )}
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
          disabled={isLoading || isReadOnly}
          className="rounded-md bg-[#008D36] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : initialData ? "Modifier" : "Créer"}
        </button>
      </div>
    </form>
  );
}
