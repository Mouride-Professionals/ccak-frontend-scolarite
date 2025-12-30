"use client";

import { useState } from "react";
import type { CreateCourseUnitInput } from "@/types/course-unit";
import type { AcademicProgram } from "@/types/course-unit";

interface CourseUnitFormProps {
  onSubmit: (data: CreateCourseUnitInput) => void;
  onCancel?: () => void;
  academicPrograms: AcademicProgram[];
  isLoading?: boolean;
  initialData?: Partial<CreateCourseUnitInput>;
}

export default function CourseUnitForm({
  onSubmit,
  onCancel,
  academicPrograms,
  isLoading = false,
  initialData,
}: CourseUnitFormProps) {
  const [formData, setFormData] = useState<CreateCourseUnitInput>({
    academicProgramId: initialData?.academicProgramId ?? "",
    code: initialData?.code ?? "",
    name: initialData?.name ?? "",
    semesterNumber: initialData?.semesterNumber ?? 1,
    credits: initialData?.credits ?? 1,
    type: initialData?.type ?? "OBLIGATOIRE",
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateCourseUnitInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'unité d'enseignement est requis";
    }
    if (!formData.code.trim()) {
      newErrors.code = "Le code de l'unité d'enseignement est requis";
    }
    if (!formData.academicProgramId) {
      newErrors.academicProgramId = "Le programme académique est requis";
    }
    if (formData.semesterNumber < 1) {
      newErrors.semesterNumber = "Le numéro de semestre doit être positif";
    }
    if (formData.credits < 1) {
      newErrors.credits = "Le nombre de crédits doit être positif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
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
        >
          <option value="">Sélectionner un programme</option>
          {academicPrograms.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
        {errors.academicProgramId && (
          <p className="mt-1 text-sm text-red-600">{errors.academicProgramId}</p>
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
        />
        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-2">
          Nom de l'unité d'enseignement *
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
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
          onChange={(e) => handleChange("semesterNumber", parseInt(e.target.value) || 1)}
          min="1"
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.semesterNumber ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
        />
        {errors.semesterNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.semesterNumber}</p>
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
          onChange={(e) => handleChange("credits", parseInt(e.target.value) || 1)}
          min="1"
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.credits ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
        />
        {errors.credits && <p className="mt-1 text-sm text-red-600">{errors.credits}</p>}
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
          className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
          disabled={isLoading}
        >
          <option value="OBLIGATOIRE">Obligatoire</option>
          <option value="OPTIONNEL">Optionnel</option>
        </select>
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
          disabled={isLoading}
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
