"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateCourseInput, Course } from "@/types/course";
import type { CourseUnit } from "@/types/course-unit";
import { CourseSchema, type CourseFormData } from "@/lib/validations/schemas";
import { extractValidationErrors, toUserError } from "@/lib/error-handler";

interface CourseFormProps {
  onSubmit: (data: CreateCourseInput) => Promise<void>;
  onCancel: () => void;
  courseUnits: CourseUnit[];
  availableCourses?: Course[];
  isLoading?: boolean;
  initialData?: Partial<Course>;
}

export default function CourseForm({
  onSubmit,
  onCancel,
  courseUnits,
  availableCourses = [],
  isLoading = false,
  initialData,
}: CourseFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(CourseSchema),
    defaultValues: {
      course_unit_id: initialData?.course_unit_id || "",
      code: initialData?.code || "",
      name: initialData?.name || "",
      description: initialData?.description || "",
      credits: initialData?.credits || 3,
      hours_lecture: initialData?.hours_lecture || 0,
      hours_td: initialData?.hours_td || 0,
      hours_tp: initialData?.hours_tp || 0,
      coefficient: initialData?.coefficient || 1,
      prerequisites: initialData?.prerequisites || [],
      is_active: initialData?.is_active !== false,
    },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const prerequisiteChoices = availableCourses.filter((course) => course.id !== initialData?.id);

  const handleFormSubmit = async (data: CourseFormData) => {
    setSubmitError(null);
    try {
      await onSubmit(data as CreateCourseInput);
    } catch (error) {
      const validationErrors = extractValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field as keyof CourseFormData, { type: "server", message });
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
      {/* Course Unit */}
      <div>
        <label htmlFor="course_unit_id" className="mb-2 block text-sm font-medium text-zinc-700">
          Unité d&apos;Enseignement *
        </label>
        <select
          id="course_unit_id"
          {...register("course_unit_id")}
          className={`block w-full rounded-lg border px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.course_unit_id ? "border-red-300" : "border-zinc-300"}`}
        >
          <option value="">Sélectionner une unité</option>
          {courseUnits?.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
        {errors.course_unit_id && (
          <p className="mt-1 text-sm text-red-600">{errors.course_unit_id.message}</p>
        )}
      </div>

      {/* Code and Name */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="code" className="mb-2 block text-sm font-medium text-zinc-700">
            Code *
          </label>
          <input
            type="text"
            id="code"
            {...register("code")}
            placeholder="ex: CS101"
            className={`block w-full rounded-lg border px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.code ? "border-red-300" : "border-zinc-300"}`}
          />
          {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
        </div>

        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-700">
            Nom *
          </label>
          <input
            type="text"
            id="name"
            {...register("name")}
            placeholder="ex: Introduction à la Programmation"
            className={`block w-full rounded-lg border px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.name ? "border-red-300" : "border-zinc-300"}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-zinc-700">
          Description
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={3}
          placeholder="Description du cours..."
          className={`block w-full rounded-lg border px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.description ? "border-red-300" : "border-zinc-300"}`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Credits and Coefficient */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="credits" className="mb-2 block text-sm font-medium text-zinc-700">
            Crédits *
          </label>
          <input
            type="number"
            id="credits"
            {...register("credits", { valueAsNumber: true })}
            min="1"
            className={`block w-full rounded-lg border px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.credits ? "border-red-300" : "border-zinc-300"}`}
          />
          {errors.credits && <p className="mt-1 text-sm text-red-600">{errors.credits.message}</p>}
        </div>

        <div>
          <label htmlFor="coefficient" className="mb-2 block text-sm font-medium text-zinc-700">
            Coefficient
          </label>
          <input
            type="number"
            id="coefficient"
            {...register("coefficient", { valueAsNumber: true })}
            min="0"
            step="0.1"
            className={`block w-full rounded-lg border px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.coefficient ? "border-red-300" : "border-zinc-300"}`}
          />
          {errors.coefficient && (
            <p className="mt-1 text-sm text-red-600">{errors.coefficient.message}</p>
          )}
        </div>
      </div>

      {/* Hours */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="hours_lecture" className="mb-2 block text-sm font-medium text-zinc-700">
            Heures CM
          </label>
          <input
            type="number"
            id="hours_lecture"
            {...register("hours_lecture", { valueAsNumber: true })}
            min="0"
            className={`block w-full rounded-lg border px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.hours_lecture ? "border-red-300" : "border-zinc-300"}`}
          />
          {errors.hours_lecture && (
            <p className="mt-1 text-sm text-red-600">{errors.hours_lecture.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="hours_td" className="mb-2 block text-sm font-medium text-zinc-700">
            Heures TD
          </label>
          <input
            type="number"
            id="hours_td"
            {...register("hours_td", { valueAsNumber: true })}
            min="0"
            className={`block w-full rounded-lg border px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.hours_td ? "border-red-300" : "border-zinc-300"}`}
          />
          {errors.hours_td && (
            <p className="mt-1 text-sm text-red-600">{errors.hours_td.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="hours_tp" className="mb-2 block text-sm font-medium text-zinc-700">
            Heures TP
          </label>
          <input
            type="number"
            id="hours_tp"
            {...register("hours_tp", { valueAsNumber: true })}
            min="0"
            className={`block w-full rounded-lg border px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${errors.hours_tp ? "border-red-300" : "border-zinc-300"}`}
          />
          {errors.hours_tp && (
            <p className="mt-1 text-sm text-red-600">{errors.hours_tp.message}</p>
          )}
        </div>
      </div>

      {/* Prerequisites */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">Prérequis</label>
        <Controller
          control={control}
          name="prerequisites"
          render={({ field }) => {
            const selectedPrerequisites = field.value || [];
            const togglePrerequisite = (courseId: string) => {
              const isSelected = selectedPrerequisites.includes(courseId);
              const updated = isSelected
                ? selectedPrerequisites.filter((item) => item !== courseId)
                : [...selectedPrerequisites, courseId];
              field.onChange(updated);
            };

            return (
              <>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  {prerequisiteChoices.length === 0 ? (
                    <p className="text-sm text-zinc-500">Aucun cours disponible pour les prérequis.</p>
                  ) : (
                    prerequisiteChoices.map((course) => (
                      <label key={course.id} className="flex items-center gap-2 text-sm text-zinc-700">
                        <input
                          type="checkbox"
                          checked={selectedPrerequisites.includes(course.id)}
                          onChange={() => togglePrerequisite(course.id)}
                        />
                        <span>
                          {course.code} - {course.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {selectedPrerequisites.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedPrerequisites.map((id) => {
                      const prerequisite = prerequisiteChoices.find((item) => item.id === id);
                      return (
                        <span
                          key={id}
                          className="rounded-full bg-[#00365F]/10 px-2 py-1 text-xs font-medium text-[#00365F]"
                        >
                          {prerequisite?.code || id}
                        </span>
                      );
                    })}
                  </div>
                )}
              </>
            );
          }}
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          {...register("is_active")}
          className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
        />
        <label htmlFor="is_active" className="ml-3 text-sm font-medium text-zinc-700">
          Cours actif
        </label>
      </div>

      {/* Actions */}
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
