"use client";

import { useState, useEffect } from "react";
import type { Student, Course, EvaluationTypeOption, CreateGradeInput } from "@/types/grade";
import { GradeStatus } from "@/types/grade";

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
  const [formData, setFormData] = useState<CreateGradeInput>({
    student_id: initialData?.student_id || "",
    course_id: initialData?.course_id || "",
    type: initialData?.type || "",
    score: initialData?.score || 0,
    max_score: initialData?.max_score || 20,
    weight: initialData?.weight || 1,
    status: initialData?.status || GradeStatus.DRAFT,
    comments: initialData?.comments || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        student_id: initialData.student_id || "",
        course_id: initialData.course_id || "",
        type: initialData.type || "",
        score: initialData.score || 0,
        max_score: initialData.max_score || 20,
        weight: initialData.weight || 1,
        status: initialData.status || GradeStatus.DRAFT,
        comments: initialData.comments || "",
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_id) {
      newErrors.student_id = "Veuillez sélectionner un étudiant";
    }
    if (!formData.course_id) {
      newErrors.course_id = "Veuillez sélectionner un cours";
    }
    if (!formData.type) {
      newErrors.type = "Veuillez sélectionner un type d'évaluation";
    }
    if (formData.score < 0) {
      newErrors.score = "La note ne peut pas être négative";
    }
    if (formData.score > formData.max_score) {
      newErrors.score = "La note ne peut pas dépasser la note maximale";
    }
    if (formData.max_score <= 0) {
      newErrors.max_score = "La note maximale doit être positive";
    }
    if (formData.weight <= 0 || formData.weight > 1) {
      newErrors.weight = "Le coefficient doit être entre 0 et 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleChange = (field: keyof CreateGradeInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEvaluationTypeChange = (typeCode: string) => {
    const selectedType = evaluationTypes.find((t) => t.code === typeCode);
    setFormData((prev) => ({
      ...prev,
      type: typeCode,
      weight: selectedType?.default_weight || prev.weight,
    }));
    if (errors.type) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.type;
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
              value={formData.student_id}
              onChange={(e) => handleChange("student_id", e.target.value)}
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
              <p className="mt-1.5 text-xs text-red-600">{errors.student_id}</p>
            )}
          </div>

          {/* Course Selection */}
          <div>
            <label htmlFor="course" className="mb-2 block text-sm text-zinc-900">
              Cours <span className="text-red-500">*</span>
            </label>
            <select
              id="course"
              value={formData.course_id}
              onChange={(e) => handleChange("course_id", e.target.value)}
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
            {errors.course_id && <p className="mt-1.5 text-xs text-red-600">{errors.course_id}</p>}
          </div>

          {/* Evaluation Type */}
          <div>
            <label htmlFor="type" className="mb-2 block text-sm text-zinc-900">
              Type d&apos;évaluation <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleEvaluationTypeChange(e.target.value)}
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
            {errors.type && <p className="mt-1.5 text-xs text-red-600">{errors.type}</p>}
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
              value={formData.score}
              onChange={(e) => handleChange("score", parseFloat(e.target.value) || 0)}
              min="0"
              step="0.5"
              placeholder="0"
              className={`block w-full rounded-md border ${
                errors.score ? "border-red-300" : "border-zinc-300"
              } bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]`}
              disabled={isLoading}
            />
            {errors.score && <p className="mt-1.5 text-xs text-red-600">{errors.score}</p>}
          </div>

          {/* Max Score */}
          <div>
            <label htmlFor="max_score" className="mb-2 block text-sm text-zinc-900">
              Note maximale <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="max_score"
              value={formData.max_score}
              onChange={(e) => handleChange("max_score", parseFloat(e.target.value) || 20)}
              min="1"
              step="0.5"
              placeholder="20"
              className={`block w-full rounded-md border ${
                errors.max_score ? "border-red-300" : "border-zinc-300"
              } bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]`}
              disabled={isLoading}
            />
            {errors.max_score && <p className="mt-1.5 text-xs text-red-600">{errors.max_score}</p>}
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="weight" className="mb-2 block text-sm text-zinc-900">
              Coefficient <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="weight"
              value={formData.weight}
              onChange={(e) => handleChange("weight", parseFloat(e.target.value) || 1)}
              min="0"
              max="1"
              step="0.1"
              placeholder="1"
              className={`block w-full rounded-md border ${
                errors.weight ? "border-red-300" : "border-zinc-300"
              } bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]`}
              disabled={isLoading}
            />
            {errors.weight && <p className="mt-1.5 text-xs text-red-600">{errors.weight}</p>}
            <p className="mt-1 text-xs text-zinc-500">Entre 0 et 1 (ex: 0.3 pour 30%)</p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="mb-2 block text-sm text-zinc-900">
              Statut
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="block w-full appearance-none rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value={GradeStatus.DRAFT}>Brouillon</option>
              <option value={GradeStatus.PENDING}>En attente</option>
              <option value={GradeStatus.VALIDATED}>Validée</option>
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
            value={formData.comments}
            onChange={(e) => handleChange("comments", e.target.value)}
            rows={4}
            placeholder="| Saisir des commentaires..."
            className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
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
