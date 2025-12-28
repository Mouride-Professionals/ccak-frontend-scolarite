"use client";

import { useState } from "react";
import type { CreateEnrollmentInput, Student, AcademicProgram, AcademicYear } from "@/types/enrollment";
import { EnrollmentStatus } from "@/types/enrollment";

interface EnrollmentFormProps {
  onSubmit: (data: CreateEnrollmentInput) => void;
  onCancel?: () => void;
  students: Student[];
  programs: AcademicProgram[];
  years: AcademicYear[];
  isLoading?: boolean;
  initialData?: Partial<CreateEnrollmentInput>;
}

export default function EnrollmentForm({
  onSubmit,
  onCancel,
  students,
  programs,
  years,
  isLoading = false,
  initialData,
}: EnrollmentFormProps) {
  const [formData, setFormData] = useState<CreateEnrollmentInput>({
    student_id: initialData?.student_id ?? "",
    academic_program_id: initialData?.academic_program_id ?? "",
    academic_year_id: initialData?.academic_year_id ?? "",
    current_semester: initialData?.current_semester ?? 1,
    enrollment_date: initialData?.enrollment_date ?? new Date().toISOString().split('T')[0],
    registration_fee_paid: initialData?.registration_fee_paid ?? 0,
    is_scholarship: initialData?.is_scholarship ?? false,
    status: initialData?.status ?? EnrollmentStatus.PENDING,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateEnrollmentInput, value: unknown) => {
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_id) {
      newErrors.student_id = "L'étudiant est requis";
    }

    if (!formData.academic_program_id) {
      newErrors.academic_program_id = "Le programme académique est requis";
    }

    if (!formData.academic_year_id) {
      newErrors.academic_year_id = "L'année académique est requise";
    }

    if (!formData.current_semester || formData.current_semester < 1 || formData.current_semester > 10) {
      newErrors.current_semester = "Le semestre doit être entre 1 et 10";
    }

    if (!formData.enrollment_date) {
      newErrors.enrollment_date = "La date d'inscription est requise";
    }

    if (formData.registration_fee_paid < 0) {
      newErrors.registration_fee_paid = "Les frais d'inscription ne peuvent pas être négatifs";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* INFORMATIONS GÉNÉRALES */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Informations générales
        </h3>
        <div className="space-y-5">
          {/* Student */}
          <div>
            <label htmlFor="student_id" className="mb-2 block text-sm text-zinc-900">
              Étudiant <span className="text-red-500">*</span>
            </label>
            <select
              id="student_id"
              value={formData.student_id}
              onChange={(e) => handleChange("student_id", e.target.value)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
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
              <p className="mt-1.5 text-xs text-red-600">{errors.student_id}</p>
            )}
          </div>

          {/* Enrollment Date */}
          <div>
            <label htmlFor="enrollment_date" className="mb-2 block text-sm text-zinc-900">
              Date d'inscription <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="enrollment_date"
              value={formData.enrollment_date}
              onChange={(e) => handleChange("enrollment_date", e.target.value)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.enrollment_date && (
              <p className="mt-1.5 text-xs text-red-600">{errors.enrollment_date}</p>
            )}
          </div>
        </div>
      </div>

      {/* PROGRAMME ET PÉRIODE */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Programme et période
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Academic Program */}
          <div>
            <label htmlFor="academic_program_id" className="mb-2 block text-sm text-zinc-900">
              Programme académique <span className="text-red-500">*</span>
            </label>
            <select
              id="academic_program_id"
              value={formData.academic_program_id}
              onChange={(e) => handleChange("academic_program_id", e.target.value)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value="">Sélectionner un programme</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name} ({program.level})
                </option>
              ))}
            </select>
            {errors.academic_program_id && (
              <p className="mt-1.5 text-xs text-red-600">{errors.academic_program_id}</p>
            )}
          </div>

          {/* Academic Year */}
          <div>
            <label htmlFor="academic_year_id" className="mb-2 block text-sm text-zinc-900">
              Année académique <span className="text-red-500">*</span>
            </label>
            <select
              id="academic_year_id"
              value={formData.academic_year_id}
              onChange={(e) => handleChange("academic_year_id", e.target.value)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value="">Sélectionner une année</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name} {year.is_current && "(Actuelle)"}
                </option>
              ))}
            </select>
            {errors.academic_year_id && (
              <p className="mt-1.5 text-xs text-red-600">{errors.academic_year_id}</p>
            )}
          </div>

          {/* Semester */}
          <div>
            <label htmlFor="current_semester" className="mb-2 block text-sm text-zinc-900">
              Semestre actuel <span className="text-red-500">*</span>
            </label>
            <select
              id="current_semester"
              value={formData.current_semester}
              onChange={(e) => handleChange("current_semester", parseInt(e.target.value, 10))}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <option key={sem} value={sem}>
                  Semestre {sem}
                </option>
              ))}
            </select>
            {errors.current_semester && (
              <p className="mt-1.5 text-xs text-red-600">{errors.current_semester}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="mb-2 block text-sm text-zinc-900">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value as EnrollmentStatus)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value={EnrollmentStatus.PENDING}>En attente</option>
              <option value={EnrollmentStatus.REGISTERED}>Enregistrée</option>
              <option value={EnrollmentStatus.ACTIVE}>Active</option>
              <option value={EnrollmentStatus.COMPLETED}>Terminée</option>
              <option value={EnrollmentStatus.WITHDRAWN}>Retirée</option>
            </select>
          </div>

          {/* Registration Fee Paid */}
          <div>
            <label htmlFor="registration_fee_paid" className="mb-2 block text-sm text-zinc-900">
              Frais d'inscription payés (FCFA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="registration_fee_paid"
              value={formData.registration_fee_paid}
              onChange={(e) => handleChange("registration_fee_paid", parseFloat(e.target.value) || 0)}
              placeholder="| Saisir"
              min="0"
              step="1000"
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.registration_fee_paid && (
              <p className="mt-1.5 text-xs text-red-600">{errors.registration_fee_paid}</p>
            )}
          </div>

          {/* Is Scholarship */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_scholarship"
              checked={formData.is_scholarship}
              onChange={(e) => handleChange("is_scholarship", e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
              disabled={isLoading}
            />
            <label htmlFor="is_scholarship" className="ml-2 text-sm text-zinc-900">
              Étudiant boursier
            </label>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-[#008D36] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : initialData ? "Modifier" : "Créer"}
        </button>
      </div>
    </form>
  );
}
