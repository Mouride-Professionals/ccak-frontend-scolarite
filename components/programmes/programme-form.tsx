"use client";

import { useState } from "react";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateProgrammeInput } from "@/types/programme";
import type { Department } from "@/types/academic";
import { AcademicLevel } from "@/types/academic";
import { ProgrammeSchema, type ProgrammeFormData } from "@/lib/validations/schemas";
import { extractValidationErrors, toUserError } from "@/lib/error-handler";

interface ProgrammeFormProps {
  onSubmit: (data: CreateProgrammeInput) => void;
  onCancel?: () => void;
  departments: Department[];
  isLoading?: boolean;
  initialData?: Partial<CreateProgrammeInput>;
}

export default function ProgrammeForm({
  onSubmit,
  onCancel,
  departments,
  isLoading = false,
  initialData,
}: ProgrammeFormProps) {
  const isReadOnly = useIsReadOnly();
  const initialLevel =
    initialData?.level && Object.values(AcademicLevel).includes(initialData.level as AcademicLevel)
      ? (initialData.level as AcademicLevel)
      : AcademicLevel.LICENCE;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProgrammeFormData>({
    resolver: zodResolver(ProgrammeSchema),
    defaultValues: {
      department_id: initialData?.department_id ?? "",
      name: initialData?.name ?? "",
      level: initialLevel,
      duration_semesters: initialData?.duration_semesters ?? 6,
      total_credits_required: initialData?.total_credits_required ?? 180,
      is_active: initialData?.is_active ?? true,
    },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormSubmit = async (data: ProgrammeFormData) => {
    setSubmitError(null);
    try {
      await onSubmit(data as CreateProgrammeInput);
    } catch (error) {
      const validationErrors = extractValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field as keyof ProgrammeFormData, { type: "server", message });
        });
        setSubmitError("Veuillez corriger les champs en erreur.");
        return;
      }
      const userError = toUserError(error);
      setSubmitError(userError.message);
      console.error("Form submission error:", userError.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Department */}
      <div>
        <label htmlFor="department_id" className="mb-2 block text-sm font-medium text-zinc-700">
          Département *
        </label>
        <select
          id="department_id"
          {...register("department_id")}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.department_id ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
        >
          <option value="">Sélectionner un département</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name} ({dept.code})
            </option>
          ))}
        </select>
        {errors.department_id && (
          <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-700">
          Nom du programme *
        </label>
        <input
          type="text"
          id="name"
          {...register("name", { setValueAs: (value) => String(value ?? "").trimStart() })}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.name ? "border-red-300" : "border-zinc-300"
          }`}
          placeholder="Ex: Licence Informatique"
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Level */}
      <div>
        <label htmlFor="level" className="mb-2 block text-sm font-medium text-zinc-700">
          Niveau *
        </label>
        <select
          id="level"
          {...register("level")}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.level ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
        >
          <option value={AcademicLevel.LICENCE}>Licence</option>
          <option value={AcademicLevel.MASTER}>Master</option>
          <option value={AcademicLevel.DOCTORAT}>Doctorat</option>
        </select>
        {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>}
      </div>

      {/* Duration */}
      <div>
        <label
          htmlFor="duration_semesters"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Durée (semestres) *
        </label>
        <input
          type="number"
          id="duration_semesters"
          {...register("duration_semesters", { valueAsNumber: true })}
          min="1"
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.duration_semesters ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
        />
        {errors.duration_semesters && (
          <p className="mt-1 text-sm text-red-600">{errors.duration_semesters.message}</p>
        )}
      </div>

      {/* Credits */}
      <div>
        <label
          htmlFor="total_credits_required"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Crédits requis *
        </label>
        <input
          type="number"
          id="total_credits_required"
          {...register("total_credits_required", { valueAsNumber: true })}
          min="1"
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.total_credits_required ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
        />
        {errors.total_credits_required && (
          <p className="mt-1 text-sm text-red-600">{errors.total_credits_required.message}</p>
        )}
      </div>

      {/* Active Status */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register("is_active")}
            className="rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-zinc-700">Programme actif</span>
        </label>
      </div>

      {/* Actions */}
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            disabled={isLoading}
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || isReadOnly}
          className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
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
