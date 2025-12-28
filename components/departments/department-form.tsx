"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Department, CreateDepartmentInput } from "@/types/department";
import {
  useCreateDepartment,
  useUpdateDepartment,
} from "@/hooks/use-departments";
import { useFaculties } from "@/hooks/use-faculties";
import { toast } from "sonner";

interface DepartmentFormProps {
  department?: Department;
  onSuccess?: () => void;
  onCancel?: () => void;
}

//
const DepartmentSchema = z.object({
  faculty_id: z.string().min(1, "Faculty is required"),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  head_id: z.string().optional().nullable(),
  is_active: z.boolean(),
});

type DepartmentFormData = z.input<typeof DepartmentSchema>;

export function DepartmentForm({
  department,
  onSuccess,
  onCancel,
}: DepartmentFormProps) {
  const { mutate: createDepartment, isPending: isCreating } =
    useCreateDepartment();
  const { mutate: updateDepartment, isPending: isUpdating } =
    useUpdateDepartment();
  const { data: facultiesData } = useFaculties();

  const {
    register,
    handleSubmit,
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

  const onSubmit: SubmitHandler<DepartmentFormData> = async (data) => {
    const input: CreateDepartmentInput = {
      faculty_id: data.faculty_id,
      name: data.name,
      code: data.code,
      head_id: data.head_id || null,
      is_active: data.is_active ?? true,
    };

    if (department) {
      updateDepartment(
        { id: department.id, input },
        {
          onSuccess: () => {
            toast.success("Department updated successfully");
            onSuccess?.();
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
          },
        }
      );
    } else {
      createDepartment(input, {
        onSuccess: () => {
          toast.success("Department created successfully");
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`);
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;
  const faculties = facultiesData?.data || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Faculty */}
      <div>
        <label htmlFor="faculty_id" className="mb-2 block text-sm font-medium text-zinc-700">
          Faculté *
        </label>
        <select
          id="faculty_id"
          defaultValue={department?.faculty_id || ""}
          onChange={(e) => setValue("faculty_id", e.target.value)}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.faculty_id ? "border-red-300" : "border-zinc-300"}`}
        >
          <option value="" disabled>
            Sélectionnez une faculté
          </option>
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>
        {errors.faculty_id && (
          <p className="mt-1 text-sm text-red-600">{errors.faculty_id.message}</p>
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
          {...register("name")}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.name ? "border-red-300" : "border-zinc-300"}`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
          {...register("code")}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.code ? "border-red-300" : "border-zinc-300"}`}
        />
        {errors.code && (
          <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
        )}
      </div>

      {/* Head */}
      <div>
        <label htmlFor="head_id" className="mb-2 block text-sm font-medium text-zinc-700">
          Chef de département (optionnel)
        </label>
        <select
          id="head_id"
          defaultValue={department?.head_id || ""}
          onChange={(e) => setValue("head_id", e.target.value || null)}
          className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
        >
          <option value="">Aucun chef assigné</option>
          <option value="user-1">Dr. Mamadou Diallo</option>
          <option value="user-2">Dr. Aminata Sow</option>
        </select>
      </div>

      {/* Active */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            defaultChecked={department?.is_active ?? true}
            onChange={(e) => setValue("is_active", e.target.checked)}
            className="rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
          />
          <span className="ml-2 text-sm text-zinc-700">Département actif</span>
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
          {isPending ? (department ? "Mise à jour..." : "Création...") : department ? "Mettre à jour" : "Créer"}
        </button>
      </div>
    </form>
  );
}
