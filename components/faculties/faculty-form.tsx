"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Faculty, CreateFacultyInput } from "@/types/faculty";
import { useCreateFaculty, useUpdateFaculty } from "@/hooks/use-faculties";
import { toast } from "sonner";
import { FacultySchema, type FacultyFormData } from "@/lib/validations/schemas";
import { extractValidationErrors, toUserError } from "@/lib/error-handler";
import FacultySearch from "@/components/faculty-members/faculty-search";

interface FacultyFormProps {
  faculty?: Faculty;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FacultyForm({ faculty, onSuccess, onCancel }: FacultyFormProps) {
  const { mutateAsync: createFaculty, isPending: isCreating } = useCreateFaculty();
  const { mutateAsync: updateFaculty, isPending: isUpdating } = useUpdateFaculty();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FacultyFormData>({
    resolver: zodResolver(FacultySchema),
    defaultValues: faculty
      ? {
          name: faculty.name,
          code: faculty.code,
          dean_id: faculty.dean_id,
          is_active: faculty.is_active,
        }
      : { is_active: true },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedDeanLabel, setSelectedDeanLabel] = useState<string | null>(null);

  const onSubmit = async (data: FacultyFormData) => {
    setSubmitError(null);
    const input: CreateFacultyInput = {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      dean_id: data.dean_id || null,
      is_active: data.is_active ?? true,
    };

    try {
      if (faculty) {
        await updateFaculty({ id: faculty.id, input });
        toast.success("Établissement mis à jour avec succès");
      } else {
        await createFaculty(input);
        toast.success("Établissement créé avec succès");
      }
      onSuccess?.();
    } catch (error) {
      const validationErrors = extractValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field as keyof FacultyFormData, { type: "server", message });
        });
        setSubmitError("Veuillez corriger les champs en erreur.");
        return;
      }

      const userError = toUserError(error);
      setSubmitError(userError.message);
    }
  };

  const isPending = isCreating || isUpdating;
  const initialDeanLabel = faculty?.dean_id ?? "";
  const displayedDeanLabel = selectedDeanLabel ?? initialDeanLabel;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-700">
          Nom de l'établissement *
        </label>
        <input
          id="name"
          type="text"
          placeholder="Ex: Sciences et Technologies"
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
          Code de l'établissement *
        </label>
        <input
          id="code"
          type="text"
          placeholder="Ex: FST"
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

      {/* Dean */}
      <div>
        <label htmlFor="dean_id" className="mb-2 block text-sm font-medium text-zinc-700">
          Doyen (optionnel)
        </label>
        <input
          type="hidden"
          id="dean_id"
          {...register("dean_id", {
            setValueAs: (value) => (value ? String(value).trim() : null),
          })}
        />
        <FacultySearch
          value={displayedDeanLabel}
          onSelect={(member) => {
            setValue("dean_id", member.user_id, { shouldDirty: true, shouldValidate: true });
            setSelectedDeanLabel(`${member.full_name} · ${member.staff_number || "—"}`);
          }}
          onClear={() => {
            setValue("dean_id", null, { shouldDirty: true, shouldValidate: true });
            setSelectedDeanLabel("");
          }}
          placeholder="Rechercher par nom ou matricule..."
          disabled={isPending}
        />
        {errors.dean_id && (
          <p id="dean_id-error" className="mt-1 text-sm text-red-600">
            {errors.dean_id.message}
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
          <span className="ml-2 text-sm text-zinc-700">Établissement actif</span>
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
          disabled={isPending}
          className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? faculty
              ? "Mise à jour..."
              : "Création..."
            : faculty
              ? "Mettre à jour"
              : "Créer"}
        </button>
      </div>
    </form>
  );
}
