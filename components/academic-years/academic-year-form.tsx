"use client";

import { useIsReadOnly } from "@/hooks/use-selected-year";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AcademicYear, CreateAcademicYearInput } from "@/types/academic-year";

interface AcademicYearFormProps {
  academicYear?: AcademicYear | null;
  onSubmit: (input: CreateAcademicYearInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const AcademicYearSchema = z
  .object({
    name: z
      .string()
      .min(1, "Le nom est requis")
      .max(255, "Le nom ne doit pas depasser 255 caracteres"),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_current: z.boolean().default(false),
    is_active: z.boolean().default(true),
  })
  .refine((data) => !data.start_date || !data.end_date || data.end_date >= data.start_date, {
    message: "La date de fin doit etre posterieure ou egale a la date de debut.",
    path: ["end_date"],
  });

type AcademicYearFormData = z.input<typeof AcademicYearSchema>;

const isPastDate = (value?: string | null) => {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date < today;
};

const getCurrentEligibilityBlockReason = (data: {
  status?: AcademicYear["status"];
  end_date?: string | null;
  is_active?: boolean;
}) => {
  if (data.status === "F") return "Une annee fermee ne peut pas etre actuelle.";
  if (data.is_active === false) return "Une annee inactive ne peut pas etre actuelle.";
  if (isPastDate(data.end_date)) return "Une annee passee ne peut pas etre actuelle.";

  return null;
};

export default function AcademicYearForm({
  academicYear,
  onSubmit,
  onCancel,
  isLoading = false,
}: AcademicYearFormProps) {
  const isReadOnly = useIsReadOnly();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AcademicYearFormData>({
    resolver: zodResolver(AcademicYearSchema),
    defaultValues: {
      name: academicYear?.name ?? "",
      start_date: academicYear?.start_date ? academicYear.start_date.slice(0, 10) : "",
      end_date: academicYear?.end_date ? academicYear.end_date.slice(0, 10) : "",
      is_current: academicYear?.is_current ?? false,
      is_active: academicYear?.is_active ?? true,
    },
  });

  const watchedEndDate = useWatch({ control, name: "end_date" });
  const watchedIsActive = useWatch({ control, name: "is_active" });
  const currentEligibilityBlockReason = getCurrentEligibilityBlockReason({
    status: academicYear?.status,
    end_date: watchedEndDate,
    is_active: watchedIsActive,
  });
  const canSetAsCurrent = currentEligibilityBlockReason === null;

  const handleFormSubmit = async (data: AcademicYearFormData) => {
    await onSubmit({
      name: data.name.trim(),
      start_date: data.start_date ? data.start_date : null,
      end_date: data.end_date ? data.end_date : null,
      is_current: canSetAsCurrent ? (data.is_current ?? false) : false,
      is_active: data.is_active ?? true,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="academic-year-name"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Nom de l&apos;annee academique *
        </label>
        <input
          id="academic-year-name"
          type="text"
          placeholder="Ex: 2025-2026"
          {...register("name")}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.name ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="academic-year-start-date"
            className="mb-2 block text-sm font-medium text-zinc-700"
          >
            Date de debut
          </label>
          <input
            id="academic-year-start-date"
            type="date"
            {...register("start_date")}
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            disabled={isLoading}
          />
          {errors.start_date ? (
            <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="academic-year-end-date"
            className="mb-2 block text-sm font-medium text-zinc-700"
          >
            Date de fin
          </label>
          <input
            id="academic-year-end-date"
            type="date"
            {...register("end_date")}
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            disabled={isLoading}
          />
          {errors.end_date ? (
            <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register("is_current")}
            className="rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
            disabled={isLoading || !canSetAsCurrent}
          />
          <span className="ml-2 text-sm text-zinc-700">Definir comme annee actuelle</span>
          {currentEligibilityBlockReason ? (
            <span className="ml-2 text-xs text-zinc-500">{currentEligibilityBlockReason}</span>
          ) : null}
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register("is_active")}
            className="rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-zinc-700">Annee active</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            disabled={isLoading}
          >
            Annuler
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isLoading || isReadOnly}
          className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
