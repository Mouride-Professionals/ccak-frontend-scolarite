"use client";

import { useState } from "react";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import { z } from "zod";
import type { CreateDeliberationSessionInput } from "@/types/deliberation";
import type { AcademicProgram, AcademicYear, FacultyMember } from "@/types/academic";
import { zodErrorToFieldErrors, type FieldErrors } from "@/lib/validations/zod-errors";

interface DeliberationFormProps {
  onSubmit: (data: CreateDeliberationSessionInput) => void;
  onCancel?: () => void;
  programs: AcademicProgram[];
  years: AcademicYear[];
  facultyMembers: FacultyMember[];
  isLoading?: boolean;
  initialData?: Partial<CreateDeliberationSessionInput>;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const DeliberationFormSchema = z
  .object({
    academic_program_id: z.string().min(1, "Le programme académique est requis"),
    academic_year_id: z.string().min(1, "L'année académique est requise"),
    semester: z
      .number({ error: "Le semestre est requis" })
      .int("Le semestre doit être un nombre entier")
      .min(1, "Le semestre doit être compris entre 1 et 10")
      .max(10, "Le semestre doit être compris entre 1 et 10"),
    session_name: z
      .string()
      .trim()
      .min(5, "Le nom de la session doit contenir au moins 5 caractères")
      .max(120, "Le nom de la session ne peut pas dépasser 120 caractères"),
    session_date: z
      .string()
      .min(1, "La date de session est requise")
      .regex(ISO_DATE_REGEX, "La date de session doit être au format YYYY-MM-DD"),
    presided_by: z.string().min(1, "Le président du jury est requis"),
    jury_members: z.array(z.string()).min(1, "Au moins un membre du jury est requis"),
  })
  .superRefine((data, ctx) => {
    if (data.jury_members.includes(data.presided_by)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["jury_members"],
        message: "Le président du jury ne peut pas être aussi membre du jury",
      });
    }
  });

type DeliberationFormData = z.infer<typeof DeliberationFormSchema>;

export default function DeliberationForm({
  onSubmit,
  onCancel,
  programs,
  years,
  facultyMembers,
  isLoading = false,
  initialData,
}: DeliberationFormProps) {
  const isReadOnly = useIsReadOnly();
  const [formData, setFormData] = useState<DeliberationFormData>({
    academic_program_id: initialData?.academic_program_id ?? "",
    academic_year_id: initialData?.academic_year_id ?? "",
    semester: initialData?.semester ?? 1,
    session_name: initialData?.session_name ?? "",
    session_date: initialData?.session_date ?? "",
    presided_by: initialData?.presided_by ?? "",
    jury_members: initialData?.jury_members ?? [],
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const canSubmit =
    formData.session_name.trim().length > 0 &&
    formData.session_date.trim().length > 0 &&
    formData.academic_program_id.trim().length > 0 &&
    formData.academic_year_id.trim().length > 0 &&
    formData.presided_by.trim().length > 0 &&
    formData.jury_members.length > 0;
  const getErrorId = (field: keyof DeliberationFormData) => `${field}-error`;

  const handleChange = <K extends keyof DeliberationFormData>(
    field: K,
    value: DeliberationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    const fieldKey = String(field);
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const handlePresidentChange = (presidentId: string) => {
    setFormData((prev) => ({
      ...prev,
      presided_by: presidentId,
      jury_members: prev.jury_members.filter((memberId) => memberId !== presidentId),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.presided_by;
      delete next.jury_members;
      return next;
    });
  };

  const handleJuryMemberToggle = (memberId: string) => {
    const isSelected = formData.jury_members.includes(memberId);
    const newMembers = isSelected
      ? formData.jury_members.filter((id) => id !== memberId)
      : [...formData.jury_members, memberId];

    handleChange("jury_members", newMembers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = DeliberationFormSchema.safeParse(formData);
    if (!parsed.success) {
      setErrors(zodErrorToFieldErrors(parsed.error));
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  };

  // Filter out the president from available jury members
  const availableJuryMembers = facultyMembers.filter(
    (member) => member.id !== formData.presided_by
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* INFORMATIONS GÉNÉRALES */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Informations générales
        </h3>
        <div className="space-y-5">
          {/* Session Name */}
          <div>
            <label htmlFor="session_name" className="mb-2 block text-sm text-zinc-900">
              Nom de la session <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="session_name"
              value={formData.session_name}
              onChange={(e) => handleChange("session_name", e.target.value)}
              placeholder="| Saisir"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                errors.session_name ? "border-red-300" : "border-zinc-300"
              }`}
              disabled={isLoading}
              aria-invalid={Boolean(errors.session_name)}
              aria-describedby={errors.session_name ? getErrorId("session_name") : undefined}
            />
            {errors.session_name && (
              <p id={getErrorId("session_name")} className="mt-1.5 text-xs text-red-600">
                {errors.session_name}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="session_date" className="mb-2 block text-sm text-zinc-900">
              Date de session <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="session_date"
              value={formData.session_date}
              onChange={(e) => handleChange("session_date", e.target.value)}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                errors.session_date ? "border-red-300" : "border-zinc-300"
              }`}
              disabled={isLoading}
              aria-invalid={Boolean(errors.session_date)}
              aria-describedby={errors.session_date ? getErrorId("session_date") : undefined}
            />
            {errors.session_date && (
              <p id={getErrorId("session_date")} className="mt-1.5 text-xs text-red-600">
                {errors.session_date}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PROGRAMME ACADÉMIQUE */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Programme académique
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Academic Program */}
          <div>
            <label htmlFor="academic_program_id" className="mb-2 block text-sm text-zinc-900">
              Filière / Programme <span className="text-red-500">*</span>
            </label>
            <select
              id="academic_program_id"
              value={formData.academic_program_id}
              onChange={(e) => handleChange("academic_program_id", e.target.value)}
              className={`block w-full appearance-none rounded-md border bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                errors.academic_program_id ? "border-red-300" : "border-zinc-300"
              }`}
              disabled={isLoading}
              aria-invalid={Boolean(errors.academic_program_id)}
              aria-describedby={
                errors.academic_program_id ? getErrorId("academic_program_id") : undefined
              }
            >
              <option value="">Sélectionner un programme</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name} ({program.level})
                </option>
              ))}
            </select>
            {errors.academic_program_id && (
              <p id={getErrorId("academic_program_id")} className="mt-1.5 text-xs text-red-600">
                {errors.academic_program_id}
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
              value={formData.academic_year_id}
              onChange={(e) => handleChange("academic_year_id", e.target.value)}
              className={`block w-full appearance-none rounded-md border bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                errors.academic_year_id ? "border-red-300" : "border-zinc-300"
              }`}
              disabled={isLoading}
              aria-invalid={Boolean(errors.academic_year_id)}
              aria-describedby={
                errors.academic_year_id ? getErrorId("academic_year_id") : undefined
              }
            >
              <option value="">Sélectionner une année</option>
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

          {/* Semester */}
          <div>
            <label htmlFor="semester" className="mb-2 block text-sm text-zinc-900">
              Semestre <span className="text-red-500">*</span>
            </label>
            <select
              id="semester"
              value={formData.semester}
              onChange={(e) => handleChange("semester", Number.parseInt(e.target.value, 10))}
              className={`block w-full appearance-none rounded-md border bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                errors.semester ? "border-red-300" : "border-zinc-300"
              }`}
              disabled={isLoading}
              aria-invalid={Boolean(errors.semester)}
              aria-describedby={errors.semester ? getErrorId("semester") : undefined}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
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
        </div>
      </div>

      {/* COMPOSITION DU JURY */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Composition du jury
        </h3>
        <div className="space-y-5">
          {/* President */}
          <div>
            <label htmlFor="presided_by" className="mb-2 block text-sm text-zinc-900">
              Président du jury <span className="text-red-500">*</span>
            </label>
            <select
              id="presided_by"
              value={formData.presided_by}
              onChange={(e) => handlePresidentChange(e.target.value)}
              className={`block w-full appearance-none rounded-md border bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                errors.presided_by ? "border-red-300" : "border-zinc-300"
              }`}
              disabled={isLoading}
              aria-invalid={Boolean(errors.presided_by)}
              aria-describedby={errors.presided_by ? getErrorId("presided_by") : undefined}
            >
              <option value="">Sélectionner un président</option>
              {facultyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name} ({member.rank})
                </option>
              ))}
            </select>
            {errors.presided_by && (
              <p id={getErrorId("presided_by")} className="mt-1.5 text-xs text-red-600">
                {errors.presided_by}
              </p>
            )}
          </div>

          {/* Jury Members */}
          <div>
            <label className="mb-2 block text-sm text-zinc-900">
              Membres du jury <span className="text-red-500">*</span>
              <span className="ml-2 font-normal text-zinc-500">
                ({formData.jury_members.length} sélectionné
                {formData.jury_members.length > 1 ? "s" : ""})
              </span>
            </label>
            <div
              className={`max-h-56 space-y-2 overflow-y-auto rounded-md border bg-white p-4 ${
                errors.jury_members ? "border-red-300" : "border-zinc-300"
              }`}
              aria-invalid={Boolean(errors.jury_members)}
              aria-describedby={errors.jury_members ? getErrorId("jury_members") : undefined}
            >
              {availableJuryMembers.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Veuillez d&apos;abord sélectionner un président
                </p>
              ) : (
                availableJuryMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-zinc-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.jury_members.includes(member.id)}
                      onChange={() => handleJuryMemberToggle(member.id)}
                      className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-zinc-900">
                      {member.full_name}
                      <span className="ml-2 text-xs text-zinc-500">({member.rank})</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            {errors.jury_members && (
              <p id={getErrorId("jury_members")} className="mt-1.5 text-xs text-red-600">
                {errors.jury_members}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            disabled={isLoading}
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className="rounded-lg bg-[#008D36] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || !canSubmit || isReadOnly}
        >
          {isLoading
            ? initialData
              ? "Modification en cours..."
              : "Création en cours..."
            : initialData
              ? "Modifier la session"
              : "Créer la session"}
        </button>
      </div>
    </form>
  );
}
