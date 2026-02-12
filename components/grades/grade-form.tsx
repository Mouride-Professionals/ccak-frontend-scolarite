"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Student, Course, EvaluationTypeOption, CreateGradeInput } from "@/types/grade";
import { GradeStatus } from "@/types/grade";
import { GradeSchema, type GradeFormData } from "@/lib/validations/schemas";
import { extractValidationErrors, toUserError } from "@/lib/error-handler";

interface GradeFormProps {
  onSubmit: (data: CreateGradeInput) => Promise<void>;
  onCancel: () => void;
  students: Student[];
  courses: Course[];
  evaluationTypes: EvaluationTypeOption[];
  isLoading?: boolean;
  initialData?: Partial<CreateGradeInput>;
}

export default function GradeForm({
  onSubmit,
  onCancel,
  students,
  courses,
  evaluationTypes,
  isLoading = false,
  initialData,
}: GradeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<GradeFormData>({
    resolver: zodResolver(GradeSchema),
    defaultValues: {
      student_id: initialData?.student_id || "",
      course_id: initialData?.course_id || "",
      type: initialData?.type || "",
      score: initialData?.score || 0,
      max_score: initialData?.max_score || 20,
      weight: initialData?.weight || 1,
      status: initialData?.status || GradeStatus.DRAFT,
      comments: initialData?.comments || "",
    },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormSubmit = async (data: GradeFormData) => {
    setSubmitError(null);
    try {
      await onSubmit(data as CreateGradeInput);
    } catch (error) {
      const validationErrors = extractValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field as keyof GradeFormData, { type: "server", message });
        });
        setSubmitError("Veuillez corriger les champs en erreur.");
        return;
      }
      const userError = toUserError(error);
      setSubmitError(userError.message);
      console.error("Form submission error:", userError.message);
    }
  };

  const handleEvaluationTypeChange = (typeCode: string) => {
    const selectedType = evaluationTypes.find((t) => t.code === typeCode);
    setValue("type", typeCode);
    if (selectedType?.default_weight) {
      setValue("weight", selectedType.default_weight);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* INFORMATIONS GÉNÉRALES */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Informations de la note
        </h3>
        <div className="space-y-5">
          {/* Student Selection */}
          <div>
            <label htmlFor="student" className="mb-2 block text-sm text-zinc-900">
              Étudiant <span className="text-red-500">*</span>
            </label>
            <select
              id="student"
              {...register("student_id")}
              aria-invalid={!!errors.student_id}
              aria-describedby={errors.student_id ? "student_id-error" : undefined}
              className={`block w-full appearance-none rounded-md border ${
                errors.student_id ? "border-red-300" : "border-zinc-300"
              } bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]`}
              disabled={isLoading}
            >
              <option value="">Sélectionner un étudiant</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.student_number} - {student.full_name}
                </option>
              ))}
            </select>
            {errors.student_id && (
              <p id="student_id-error" className="mt-1.5 text-xs text-red-600">
                {errors.student_id.message}
              </p>
            )}
          </div>

          {/* Course Selection */}
          <div>
            <label htmlFor="course" className="mb-2 block text-sm text-zinc-900">
              Cours <span className="text-red-500">*</span>
            </label>
            <select
              id="course"
              {...register("course_id")}
              aria-invalid={!!errors.course_id}
              aria-describedby={errors.course_id ? "course_id-error" : undefined}
              className={`block w-full appearance-none rounded-md border ${
                errors.course_id ? "border-red-300" : "border-zinc-300"
              } bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]`}
              disabled={isLoading}
            >
              <option value="">Sélectionner un cours</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
            {errors.course_id && (
              <p id="course_id-error" className="mt-1.5 text-xs text-red-600">
                {errors.course_id.message}
              </p>
            )}
          </div>

          {/* Evaluation Type */}
          <div>
            <label htmlFor="type" className="mb-2 block text-sm text-zinc-900">
              Type d&apos;évaluation <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              {...register("type")}
              onChange={(e) => handleEvaluationTypeChange(e.target.value)}
              aria-invalid={!!errors.type}
              aria-describedby={errors.type ? "type-error" : undefined}
              className={`block w-full appearance-none rounded-md border ${
                errors.type ? "border-red-300" : "border-zinc-300"
              } bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]`}
              disabled={isLoading}
            >
              <option value="">Sélectionner un type</option>
              {evaluationTypes.map((type) => (
                <option key={type.id} value={type.code}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.type && (
              <p id="type-error" className="mt-1.5 text-xs text-red-600">
                {errors.type.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* NOTATION */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">Notation</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Score */}
          <div>
            <label htmlFor="score" className="mb-2 block text-sm text-zinc-900">
              Note obtenue <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="score"
              {...register("score", { valueAsNumber: true })}
              aria-invalid={!!errors.score}
              aria-describedby={errors.score ? "score-error" : undefined}
              min="0"
              step="0.5"
              placeholder="0"
              className={`block w-full rounded-md border ${
                errors.score ? "border-red-300" : "border-zinc-300"
              } bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]`}
              disabled={isLoading}
            />
            {errors.score && (
              <p id="score-error" className="mt-1.5 text-xs text-red-600">
                {errors.score.message}
              </p>
            )}
          </div>

          {/* Max Score */}
          <div>
            <label htmlFor="max_score" className="mb-2 block text-sm text-zinc-900">
              Note maximale <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="max_score"
              {...register("max_score", { valueAsNumber: true })}
              aria-invalid={!!errors.max_score}
              aria-describedby={errors.max_score ? "max_score-error" : undefined}
              min="1"
              step="0.5"
              placeholder="20"
              className={`block w-full rounded-md border ${
                errors.max_score ? "border-red-300" : "border-zinc-300"
              } bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]`}
              disabled={isLoading}
            />
            {errors.max_score && (
              <p id="max_score-error" className="mt-1.5 text-xs text-red-600">
                {errors.max_score.message}
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="weight" className="mb-2 block text-sm text-zinc-900">
              Coefficient <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="weight"
              {...register("weight", { valueAsNumber: true })}
              aria-invalid={!!errors.weight}
              aria-describedby={errors.weight ? "weight-error" : undefined}
              min="0"
              max="1"
              step="0.1"
              placeholder="1"
              className={`block w-full rounded-md border ${
                errors.weight ? "border-red-300" : "border-zinc-300"
              } bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]`}
              disabled={isLoading}
            />
            {errors.weight && (
              <p id="weight-error" className="mt-1.5 text-xs text-red-600">
                {errors.weight.message}
              </p>
            )}
            <p className="mt-1 text-xs text-zinc-500">Entre 0 et 1 (ex: 0.3 pour 30%)</p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="mb-2 block text-sm text-zinc-900">
              Statut
            </label>
            <select
              id="status"
              {...register("status")}
              className="block w-full appearance-none rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value={GradeStatus.DRAFT}>Brouillon</option>
              <option value={GradeStatus.SUBMITTED}>Soumise</option>
              <option value={GradeStatus.VALIDATED}>Validée</option>
              <option value={GradeStatus.PUBLISHED}>Publiée</option>
            </select>
          </div>
        </div>
      </div>

      {/* COMMENTAIRES */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Commentaires (optionnel)
        </h3>
        <div>
          <label htmlFor="comments" className="mb-2 block text-sm text-zinc-900">
            Remarques ou observations
          </label>
          <textarea
            id="comments"
            {...register("comments")}
            aria-invalid={!!errors.comments}
            aria-describedby={errors.comments ? "comments-error" : undefined}
            rows={4}
            placeholder="| Saisir des commentaires..."
            className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
            disabled={isLoading}
          />
          {errors.comments && (
            <p id="comments-error" className="mt-1.5 text-xs text-red-600">
              {errors.comments.message}
            </p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
        {submitError && (
          <p className="mr-auto text-sm text-red-600" role="alert">
            {submitError}
          </p>
        )}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-[#008D36] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          )}
          {isLoading
            ? initialData
              ? "Modification..."
              : "Création..."
            : initialData
              ? "Modifier la note"
              : "Créer la note"}
        </button>
      </div>
    </form>
  );
}
