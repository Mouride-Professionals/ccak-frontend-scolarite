"use client";

import { useState } from "react";
import type { CreateProgrammeInput } from "@/types/programme";
import type { Department } from "@/types/academic";
import { AcademicLevel } from "@/types/academic";

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
  const [formData, setFormData] = useState<CreateProgrammeInput>({
    department_id: initialData?.department_id ?? "",
    name: initialData?.name ?? "",
    level: initialData?.level ?? AcademicLevel.LICENCE,
    duration_semesters: initialData?.duration_semesters ?? 6,
    total_credits_required: initialData?.total_credits_required ?? 180,
    is_active: initialData?.is_active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateProgrammeInput, value: unknown) => {
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
      newErrors.name = "Le nom du programme est requis";
    }
    if (!formData.department_id) {
      newErrors.department_id = "Le département est requis";
    }
    if (formData.duration_semesters < 1) {
      newErrors.duration_semesters = "La durée doit être d'au moins 1 semestre";
    }
    if (formData.total_credits_required < 1) {
      newErrors.total_credits_required = "Le nombre de crédits doit être positif";
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
      {/* Department */}
      <div>
        <label
          htmlFor="department_id"
          className="block text-sm font-medium text-zinc-700 mb-2"
        >
          Département *
        </label>
        <select
          id="department_id"
          value={formData.department_id}
          onChange={(e) => handleChange("department_id", e.target.value)}
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
          <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-zinc-700 mb-2"
        >
          Nom du programme *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.name ? "border-red-300" : "border-zinc-300"
          }`}
          placeholder="Ex: Licence Informatique"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Level */}
      <div>
        <label
          htmlFor="level"
          className="block text-sm font-medium text-zinc-700 mb-2"
        >
          Niveau *
        </label>
        <select
          id="level"
          value={formData.level}
          onChange={(e) => handleChange("level", e.target.value)}
          className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
          disabled={isLoading}
        >
          <option value={AcademicLevel.LICENCE}>Licence</option>
          <option value={AcademicLevel.MASTER}>Master</option>
          <option value={AcademicLevel.DOCTORAT}>Doctorat</option>
        </select>
      </div>

      {/* Duration */}
      <div>
        <label
          htmlFor="duration_semesters"
          className="block text-sm font-medium text-zinc-700 mb-2"
        >
          Durée (semestres) *
        </label>
        <input
          type="number"
          id="duration_semesters"
          value={formData.duration_semesters}
          onChange={(e) => handleChange("duration_semesters", parseInt(e.target.value) || 0)}
          min="1"
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.duration_semesters ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
        />
        {errors.duration_semesters && (
          <p className="mt-1 text-sm text-red-600">{errors.duration_semesters}</p>
        )}
      </div>

      {/* Credits */}
      <div>
        <label
          htmlFor="total_credits_required"
          className="block text-sm font-medium text-zinc-700 mb-2"
        >
          Crédits requis *
        </label>
        <input
          type="number"
          id="total_credits_required"
          value={formData.total_credits_required}
          onChange={(e) => handleChange("total_credits_required", parseInt(e.target.value) || 0)}
          min="1"
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
            errors.total_credits_required ? "border-red-300" : "border-zinc-300"
          }`}
          disabled={isLoading}
        />
        {errors.total_credits_required && (
          <p className="mt-1 text-sm text-red-600">{errors.total_credits_required}</p>
        )}
      </div>

      {/* Active Status */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => handleChange("is_active", e.target.checked)}
            className="rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-zinc-700">Programme actif</span>
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