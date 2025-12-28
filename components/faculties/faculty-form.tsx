"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Faculty, CreateFacultyInput } from "@/types/faculty";
import {
  useCreateFaculty,
  useUpdateFaculty,
} from "@/hooks/use-faculties";
import { toast } from "sonner";
import { useFacultyMembers } from "@/hooks/use-faculty-members";

interface FacultyFormProps {
  faculty?: Faculty;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FacultySchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  dean_id: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

type FacultyFormData = z.infer<typeof FacultySchema>;

export function FacultyForm({ faculty, onSuccess, onCancel }: FacultyFormProps) {
  const { mutate: createFaculty, isPending: isCreating } = useCreateFaculty();
  const { mutate: updateFaculty, isPending: isUpdating } = useUpdateFaculty();
  
  // Placeholder: Replace with proper user/dean query when available
  const deanOptions = [
    { id: "user-1", name: "Dr. Mamadou Diallo" },
    { id: "user-2", name: "Dr. Aminata Sow" },
  ];

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FacultyFormData>(
    {
      resolver: zodResolver(FacultySchema),
      defaultValues: faculty
        ? {
            name: faculty.name,
            code: faculty.code,
            dean_id: faculty.dean_id,
            is_active: faculty.is_active,
          }
        : { is_active: true },
    }
  );

  const onSubmit = async (data: FacultyFormData) => {
    const input: CreateFacultyInput = {
      name: data.name,
      code: data.code,
      dean_id: data.dean_id || null,
      is_active: data.is_active,
    };

    if (faculty) {
      updateFaculty(
        { id: faculty.id, input },
        {
          onSuccess: () => {
            toast.success("Faculty updated successfully");
            onSuccess?.();
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
          },
        }
      );
    } else {
      createFaculty(input, {
        onSuccess: () => {
          toast.success("Faculty created successfully");
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`);
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-700">
          Nom de la faculté *
        </label>
        <input
          id="name"
          type="text"
          placeholder="Ex: Faculté des Sciences"
          {...register("name")}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.name ? "border-red-300" : "border-zinc-300"}`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Code */}
      <div>
        <label htmlFor="code" className="mb-2 block text-sm font-medium text-zinc-700">
          Code de la faculté *
        </label>
        <input
          id="code"
          type="text"
          placeholder="Ex: FST"
          {...register("code")}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.code ? "border-red-300" : "border-zinc-300"}`}
        />
        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
      </div>

      {/* Dean */}
      <div>
        <label htmlFor="dean_id" className="mb-2 block text-sm font-medium text-zinc-700">
          Doyen (optionnel)
        </label>
        <select
          id="dean_id"
          defaultValue={faculty?.dean_id || ""}
          onChange={(e) => setValue("dean_id", e.target.value || null)}
          className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
        >
          <option value="">Aucun doyen</option>
          {deanOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {/* Active */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            defaultChecked={faculty?.is_active ?? true}
            onChange={(e) => setValue("is_active", e.target.checked)}
            className="rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
          />
          <span className="ml-2 text-sm text-zinc-700">Faculté active</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6">
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
          {isPending ? (faculty ? "Mise à jour..." : "Création...") : faculty ? "Mettre à jour" : "Créer"}
        </button>
      </div>
    </form>
  );
}
