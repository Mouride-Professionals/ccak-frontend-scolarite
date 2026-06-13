"use client";

import { useState } from "react";
import type { AcademicYear } from "@/types/academic-year";
import type { CreateExamSessionInput } from "@/types/exam";
import { ExamSessionType } from "@/types/exam";

interface ExamSessionFormProps {
  onSubmit: (data: CreateExamSessionInput) => void;
  onCancel: () => void;
  academicYear: AcademicYear;
  isLoading?: boolean;
}

interface FormErrors {
  name?: string;
  type?: string;
  semester_number?: string;
  start_date?: string;
  end_date?: string;
}

export default function ExamSessionForm({
  onSubmit,
  onCancel,
  academicYear,
  isLoading,
}: ExamSessionFormProps) {
  const [formData, setFormData] = useState<CreateExamSessionInput>({
    academic_year_id: academicYear.id,
    semester_number: 1,
    name: "",
    type: ExamSessionType.NORMAL,
    start_date: "",
    end_date: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis.";
    if (!formData.start_date) newErrors.start_date = "La date de début est requise.";
    if (!formData.end_date) newErrors.end_date = "La date de fin est requise.";
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = "La date de fin doit être après la date de début.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const field = (key: keyof CreateExamSessionInput, value: string | number) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const inputClass = (err?: string) =>
    `block w-full rounded-lg border px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-1 ${
      err
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "border-zinc-300 focus:border-[#008D36] focus:ring-[#008D36]"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Année académique (read-only display) */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Année académique</label>
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-zinc-700">{academicYear.name}</span>
          {academicYear.is_current && (
            <span className="ml-auto text-xs text-[#008D36]">Actuelle</span>
          )}
        </div>
      </div>

      {/* Nom */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5">
          Nom de la session <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => field("name", e.target.value)}
          placeholder="Ex: Session Normale Janvier 2026"
          className={inputClass(errors.name)}
        />
        {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
      </div>

      {/* Type + Semestre (2 cols) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => field("type", e.target.value)}
            className={inputClass(errors.type)}
          >
            <option value={ExamSessionType.NORMAL}>Session Normale</option>
            <option value={ExamSessionType.RATTRAPAGE}>Session de Rattrapage</option>
          </select>
        </div>
        <div>
          <label htmlFor="semester" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Semestre <span className="text-red-500">*</span>
          </label>
          <select
            id="semester"
            value={formData.semester_number}
            onChange={(e) => field("semester_number", parseInt(e.target.value))}
            className={inputClass(errors.semester_number)}
          >
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <option key={s} value={s}>
                Semestre {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates (2 cols) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Date de début <span className="text-red-500">*</span>
          </label>
          <input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => field("start_date", e.target.value)}
            className={inputClass(errors.start_date)}
          />
          {errors.start_date && <p className="mt-1.5 text-xs text-red-600">{errors.start_date}</p>}
        </div>
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Date de fin <span className="text-red-500">*</span>
          </label>
          <input
            id="end_date"
            type="date"
            value={formData.end_date}
            min={formData.start_date || undefined}
            onChange={(e) => field("end_date", e.target.value)}
            className={inputClass(errors.end_date)}
          />
          {errors.end_date && <p className="mt-1.5 text-xs text-red-600">{errors.end_date}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:opacity-50"
        >
          {isLoading && (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          Créer la session
        </button>
      </div>
    </form>
  );
}
