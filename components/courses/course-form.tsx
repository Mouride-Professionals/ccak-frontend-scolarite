'use client';

import { useState } from 'react';
import type { CreateCourseInput, Course } from '@/types/course';
import type { CourseUnit } from '@/types/course-unit';

interface CourseFormProps {
  onSubmit: (data: CreateCourseInput) => Promise<void>;
  onCancel: () => void;
  courseUnits: CourseUnit[];
  isLoading?: boolean;
  initialData?: Partial<Course>;
}

export default function CourseForm({
  onSubmit,
  onCancel,
  courseUnits,
  isLoading = false,
  initialData,
}: CourseFormProps) {
  const [formData, setFormData] = useState<CreateCourseInput>({
    course_unit_id: initialData?.course_unit_id || '',
    code: initialData?.code || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    credits: initialData?.credits || 3,
    hours_lecture: initialData?.hours_lecture || 0,
    hours_td: initialData?.hours_td || 0,
    hours_tp: initialData?.hours_tp || 0,
    coefficient: initialData?.coefficient || 1,
    prerequisites: initialData?.prerequisites || [],
    is_active: initialData?.is_active !== false,
  });

  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseInt(value) || 0
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.course_unit_id) {
      setError('Veuillez sélectionner une unité d\'enseignement');
      return;
    }

    if (!formData.code.trim()) {
      setError('Le code du cours est obligatoire');
      return;
    }

    if (!formData.name.trim()) {
      setError('Le nom du cours est obligatoire');
      return;
    }

    if (formData.credits <= 0) {
      setError('Les crédits doivent être supérieurs à 0');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de la sauvegarde'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Course Unit */}
      <div>
        <label
          htmlFor="course_unit_id"
          className="block text-sm font-medium text-zinc-700 mb-2"
        >
          Unité d'Enseignement *
        </label>
        <select
          id="course_unit_id"
          name="course_unit_id"
          value={formData.course_unit_id}
          onChange={handleChange}
          required
          className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
        >
          <option value="">Sélectionner une unité</option>
          {courseUnits?.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
      </div>

      {/* Code and Name */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-zinc-700 mb-2"
          >
            Code *
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            placeholder="ex: CS101"
            className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700 mb-2"
          >
            Nom *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="ex: Introduction à la Programmation"
            className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-700 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
          placeholder="Description du cours..."
          className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
        />
      </div>

      {/* Credits and Coefficient */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="credits"
            className="block text-sm font-medium text-zinc-700 mb-2"
          >
            Crédits *
          </label>
          <input
            type="number"
            id="credits"
            name="credits"
            value={formData.credits}
            onChange={handleChange}
            required
            min="1"
            className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
          />
        </div>

        <div>
          <label
            htmlFor="coefficient"
            className="block text-sm font-medium text-zinc-700 mb-2"
          >
            Coefficient
          </label>
          <input
            type="number"
            id="coefficient"
            name="coefficient"
            value={formData.coefficient}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
          />
        </div>
      </div>

      {/* Hours */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="hours_lecture"
            className="block text-sm font-medium text-zinc-700 mb-2"
          >
            Heures CM
          </label>
          <input
            type="number"
            id="hours_lecture"
            name="hours_lecture"
            value={formData.hours_lecture}
            onChange={handleChange}
            min="0"
            className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
          />
        </div>

        <div>
          <label
            htmlFor="hours_td"
            className="block text-sm font-medium text-zinc-700 mb-2"
          >
            Heures TD
          </label>
          <input
            type="number"
            id="hours_td"
            name="hours_td"
            value={formData.hours_td}
            onChange={handleChange}
            min="0"
            className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
          />
        </div>

        <div>
          <label
            htmlFor="hours_tp"
            className="block text-sm font-medium text-zinc-700 mb-2"
          >
            Heures TP
          </label>
          <input
            type="number"
            id="hours_tp"
            name="hours_tp"
            value={formData.hours_tp}
            onChange={handleChange}
            min="0"
            className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
          />
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
        />
        <label
          htmlFor="is_active"
          className="ml-3 text-sm font-medium text-zinc-700"
        >
          Cours actif
        </label>
      </div>

      {/* Actions */}
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
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
