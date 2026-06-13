"use client";

import { useState } from "react";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Department, CreateDepartmentInput } from "@/types/department";
import { useCreateDepartment, useUpdateDepartment } from "@/hooks/use-departments";
import { useFaculties } from "@/hooks/use-faculties";
import { toast } from "sonner";
import { DepartmentSchema, type DepartmentFormData } from "@/lib/validations/schemas";
import { extractValidationErrors, toUserError } from "@/lib/error-handler";
import FacultySearch from "@/components/faculty-members/faculty-search";

interface DepartmentFormProps {
  department?: Department;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DepartmentForm({ department, onSuccess, onCancel }: DepartmentFormProps) {
  const isReadOnly = useIsReadOnly();
  const { mutateAsync: createDepartment, isPending: isCreating } = useCreateDepartment();
  const { mutateAsync: updateDepartment, isPending: isUpdating } = useUpdateDepartment();
  const { data: facultiesData } = useFaculties();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(DepartmentSchema),
    defaultValues: department
      ? {
          faculty_id: department.faculty_id,
          name: department.name,
          code: department.code,
          head_id: department.head_id,
          is_active: department.is_active,
        }
      : { is_active: true },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedHeadLabel, setSelectedHeadLabel] = useState<string | null>(null);

  const onSubmit: SubmitHandler<DepartmentFormData> = async (data) => {
    setSubmitError(null);
    const input: CreateDepartmentInput = {
      faculty_id: data.faculty_id,
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      head_id: data.head_id || null,
      is_active: data.is_active ?? true,
    };

    try {
      if (department) {
        await updateDepartment({ id: department.id, input });
        toast.success("Department updated successfully");
      } else {
        await createDepartment(input);
        toast.success("Department created successfully");
      }
      onSuccess?.();
    } catch (error) {
      const validationErrors = extractValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field as keyof DepartmentFormData, { type: "server", message });
        });
        setSubmitError("Veuillez corriger les champs en erreur.");
        return;
      }

      const userError = toUserError(error);
      setSubmitError(userError.message);
    }
  };

  const isPending = isCreating || isUpdating;
  const faculties = facultiesData?.data || [];
  const initialHeadLabel = department?.head_id ?? "";
  const displayedHeadLabel = selectedHeadLabel ?? initialHeadLabel;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Faculty */}
      <div>
        <label htmlFor="faculty_id" className="mb-2 block text-sm font-medium text-zinc-700">
          Établissement *
        </label>
        <select
          id="faculty_id"
          {...register("faculty_id")}
          disabled={isPending}
          aria-invalid={!!errors.faculty_id}
          aria-describedby={errors.faculty_id ? "faculty_id-error" : undefined}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.faculty_id ? "border-red-300" : "border-zinc-300"}`}
        >
          <option value="" disabled>
            Sélectionnez un établissement
          </option>
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>
        {errors.faculty_id && (
          <p id="faculty_id-error" className="mt-1 text-sm text-red-600">
            {errors.faculty_id.message}
          </p>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-700">
          Nom du département *
        </label>
        <input
          id="name"
          type="text"
          placeholder="Ex: Informatique"
          {...register("name", { setValueAs: (value) => String(value ?? "").trimStart() })}
          disabled={isPending}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.name ? "border-red-300" : "border-zinc-300"}`}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Code */}
      <div>
        <label htmlFor="code" className="mb-2 block text-sm font-medium text-zinc-700">
          Code du département *
        </label>
        <input
          id="code"
          type="text"
          placeholder="Ex: INFO"
          {...register("code", { setValueAs: (value) => String(value ?? "").toUpperCase() })}
          disabled={isPending}
          aria-invalid={!!errors.code}
          aria-describedby={errors.code ? "code-error" : undefined}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.code ? "border-red-300" : "border-zinc-300"}`}
        />
        {errors.code && (
          <p id="code-error" className="mt-1 text-sm text-red-600">
            {errors.code.message}
          </p>
        )}
      </div>

      {/* Head */}
      <div>
        <label htmlFor="head_id" className="mb-2 block text-sm font-medium text-zinc-700">
          Chef de département (optionnel)
        </label>
        <input
          type="hidden"
          id="head_id"
          {...register("head_id", {
            setValueAs: (value) => (value ? String(value).trim() : null),
          })}
        />
        <FacultySearch
          value={displayedHeadLabel}
          onSelect={(member) => {
            setValue("head_id", member.user_id, { shouldDirty: true, shouldValidate: true });
            setSelectedHeadLabel(`${member.full_name} · ${member.staff_number || "—"}`);
          }}
          onClear={() => {
            setValue("head_id", null, { shouldDirty: true, shouldValidate: true });
            setSelectedHeadLabel("");
          }}
          placeholder="Rechercher par nom ou matricule..."
          disabled={isPending}
        />
        {errors.head_id && (
          <p id="head_id-error" className="mt-1 text-sm text-red-600">
            {errors.head_id.message}
          </p>
        )}
      </div>

      {/* Active */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register("is_active")}
            disabled={isPending}
            className="rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
          />
          <span className="ml-2 text-sm text-zinc-700">Département actif</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6">
        {submitError && (
          <p className="mr-auto text-sm text-red-600" role="alert">
            {submitError}
          </p>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            disabled={isPending}
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || isReadOnly}
          className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? department
              ? "Mise à jour..."
              : "Création..."
            : department
              ? "Mettre à jour"
              : "Créer"}
        </button>
      </div>
    </form>
  );
}
