"use client";

import { useState } from "react";
import { z } from "zod";
import type { CreateCourseUnitInput } from "@/types/course-unit";
import type { AcademicProgram } from "@/types/course-unit";
import { zodErrorToFieldErrors, type FieldErrors } from "@/lib/validations/zod-errors";

interface CourseUnitFormProps {
  onSubmit: (data: CreateCourseUnitInput) => void;
  onCancel?: () => void;
  academicPrograms: AcademicProgram[];
  isLoading?: boolean;
  initialData?: Partial<CreateCourseUnitInput>;
}

const COURSE_UNIT_CODE_REGEX = /^[A-Z0-9-]+$/;

const CourseUnitFormSchema = z.object({
  academicProgramId: z.string().min(1, "Le programme académique est requis"),
  code: z
    .string()
    .trim()
    .min(2, "Le code doit contenir au moins 2 caractères")
    .max(20, "Le code ne peut pas dépasser 20 caractères")
    .regex(
      COURSE_UNIT_CODE_REGEX,
      "Le code ne peut contenir que des lettres majuscules, chiffres et tirets"
    ),
  name: z
    .string()
    .trim()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(200, "Le nom ne peut pas dépasser 200 caractères"),
  semesterNumber: z
    .number({ error: "Le numéro de semestre est requis" })
    .int("Le numéro de semestre doit être un nombre entier")
    .min(1, "Le numéro de semestre doit être compris entre 1 et 12")
    .max(12, "Le numéro de semestre doit être compris entre 1 et 12"),
  credits: z
    .number({ error: "Le nombre de crédits est requis" })
    .int("Le nombre de crédits doit être un nombre entier")
    .min(1, "Le nombre de crédits doit être compris entre 1 et 60")
    .max(60, "Le nombre de crédits doit être compris entre 1 et 60"),
  type: z.enum(["OBLIGATOIRE", "OPTIONNEL"]),
  isActive: z.boolean().default(true),
});

type CourseUnitFormData = z.infer<typeof CourseUnitFormSchema>;

export default function CourseUnitForm({
  onSubmit,
  onCancel,
  academicPrograms,
  isLoading = false,
  initialData,
}: CourseUnitFormProps) {
  const [formData, setFormData] = useState<CourseUnitFormData>({
    academicProgramId: initialData?.academicProgramId ?? "",
    code: initialData?.code ?? "",
    name: initialData?.name ?? "",
    semesterNumber: initialData?.semesterNumber ?? 1,
    credits: initialData?.credits ?? 1,
    type: initialData?.type ?? "OBLIGATOIRE",
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const canSubmit =
    formData.academicProgramId.trim().length > 0 &&
    formData.code.trim().length > 0 &&
    formData.name.trim().length > 0;
  const getErrorId = (field: keyof CourseUnitFormData) => `${field}-error`;

  const handleChange = (field: keyof CourseUnitFormData, value: unknown) => {
    const normalizedValue =
      field === "code" && typeof value === "string" ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [field]: normalizedValue }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = CourseUnitFormSchema.safeParse(formData);

    if (!parsed.success) {
      setErrors(zodErrorToFieldErrors(parsed.error));
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Academic Program */}
      <div>
        <label htmlFor="academicProgramId" className="block text-sm font-medium text-zinc-700 mb-2">
          Programme Académique *
        </label>
        <select
          id="academicProgramId"
          value={formData.academicProgramId}
          onChange={(e) => handleChange("academicProgramId", e.target.value)}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.academicProgramId ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
          aria-invalid={Boolean(errors.academicProgramId)}
          aria-describedby={errors.academicProgramId ? getErrorId("academicProgramId") : undefined}
        >
          <option value="">Sélectionner un programme</option>
          {academicPrograms.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
        {errors.academicProgramId && (
          <p id={getErrorId("academicProgramId")} className="mt-1 text-sm text-red-600">
            {errors.academicProgramId}
          </p>
        )}
      </div>

      {/* Code */}
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-zinc-700 mb-2">
          Code *
        </label>
        <input
          type="text"
          id="code"
          value={formData.code}
          onChange={(e) => handleChange("code", e.target.value)}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.code ? "border-red-300" : "border-zinc-300"
          }`}
          placeholder="Ex: UE001"
          disabled={isLoading}
          aria-invalid={Boolean(errors.code)}
          aria-describedby={errors.code ? getErrorId("code") : undefined}
        />
        {errors.code && (
          <p id={getErrorId("code")} className="mt-1 text-sm text-red-600">
            {errors.code}
          </p>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-2">
          Nom de l&apos;unité d&apos;enseignement *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.name ? "border-red-300" : "border-zinc-300"
          }`}
          placeholder="Ex: Algorithmique et Programmation"
          disabled={isLoading}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? getErrorId("name") : undefined}
        />
        {errors.name && (
          <p id={getErrorId("name")} className="mt-1 text-sm text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* Semester Number */}
      <div>
        <label htmlFor="semesterNumber" className="block text-sm font-medium text-zinc-700 mb-2">
          Numéro de semestre *
        </label>
        <input
          type="number"
          id="semesterNumber"
          value={formData.semesterNumber}
          onChange={(e) => {
            const parsedValue = Number.parseInt(e.target.value, 10);
            handleChange("semesterNumber", Number.isNaN(parsedValue) ? 0 : parsedValue);
          }}
          min="1"
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.semesterNumber ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
          aria-invalid={Boolean(errors.semesterNumber)}
          aria-describedby={errors.semesterNumber ? getErrorId("semesterNumber") : undefined}
        />
        {errors.semesterNumber && (
          <p id={getErrorId("semesterNumber")} className="mt-1 text-sm text-red-600">
            {errors.semesterNumber}
          </p>
        )}
      </div>

      {/* Credits */}
      <div>
        <label htmlFor="credits" className="block text-sm font-medium text-zinc-700 mb-2">
          Crédits *
        </label>
        <input
          type="number"
          id="credits"
          value={formData.credits}
          onChange={(e) => {
            const parsedValue = Number.parseInt(e.target.value, 10);
            handleChange("credits", Number.isNaN(parsedValue) ? 0 : parsedValue);
          }}
          min="1"
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.credits ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
          aria-invalid={Boolean(errors.credits)}
          aria-describedby={errors.credits ? getErrorId("credits") : undefined}
        />
        {errors.credits && (
          <p id={getErrorId("credits")} className="mt-1 text-sm text-red-600">
            {errors.credits}
          </p>
        )}
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-zinc-700 mb-2">
          Type *
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => handleChange("type", e.target.value)}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.type ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
          aria-invalid={Boolean(errors.type)}
          aria-describedby={errors.type ? getErrorId("type") : undefined}
        >
          <option value="OBLIGATOIRE">Obligatoire</option>
          <option value="OPTIONNEL">Optionnel</option>
        </select>
        {errors.type && (
          <p id={getErrorId("type")} className="mt-1 text-sm text-red-600">
            {errors.type}
          </p>
        )}
      </div>

      {/* Active Status */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
            className="rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-zinc-700">Unité active</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            disabled={isLoading}
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white hover:bg-[#007A2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Enregistrement...
            </div>
          ) : (
            "Enregistrer"
          )}
        </button>
      </div>
    </form>
  );
}
