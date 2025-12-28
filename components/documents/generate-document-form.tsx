"use client";

import { useState } from "react";
import type {
  DocumentType,
  GenerateTranscriptInput,
  GenerateCertificateInput,
  GenerateIdCardInput,
  GenerateDiplomaInput,
  GenerateAttestationInput,
} from "@/types/document";
import { DocumentType as DocType } from "@/types/document";

interface GenerateDocumentFormProps {
  type: DocumentType;
  studentId: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function GenerateDocumentForm({
  type,
  studentId,
  onSubmit,
  onCancel,
  isLoading = false,
}: GenerateDocumentFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({
    student_id: studentId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (type === DocType.ATTESTATION && !formData.custom_text?.trim()) {
      newErrors.custom_text = "Le texte personnalisé est requis";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Error generating document:", err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transcript Fields */}
      {type === DocType.TRANSCRIPT && (
        <>
          <div>
            <label
              htmlFor="academic_year"
              className="block text-sm font-medium text-zinc-700 mb-2"
            >
              Année académique (optionnel)
            </label>
            <input
              id="academic_year"
              type="text"
              value={formData.academic_year || ""}
              onChange={(e) => handleChange("academic_year", e.target.value)}
              placeholder="Ex: 2024-2025"
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
            />
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.include_all ?? true}
                onChange={(e) => handleChange("include_all", e.target.checked)}
                className="rounded border-zinc-300 text-[#00365F] focus:ring-[#00365F]"
              />
              <span className="text-sm text-zinc-700">
                Inclure tous les semestres
              </span>
            </label>
          </div>
        </>
      )}

      {/* Certificate Fields */}
      {type === DocType.CERTIFICATE && (
        <>
          <div>
            <label
              htmlFor="purpose"
              className="block text-sm font-medium text-zinc-700 mb-2"
            >
              Objet (optionnel)
            </label>
            <input
              id="purpose"
              type="text"
              value={formData.purpose || ""}
              onChange={(e) => handleChange("purpose", e.target.value)}
              placeholder="Ex: Inscription à un concours"
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
            />
          </div>
          <div>
            <label
              htmlFor="academic_year"
              className="block text-sm font-medium text-zinc-700 mb-2"
            >
              Année académique (optionnel)
            </label>
            <input
              id="academic_year"
              type="text"
              value={formData.academic_year || ""}
              onChange={(e) => handleChange("academic_year", e.target.value)}
              placeholder="Ex: 2024-2025"
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
            />
          </div>
        </>
      )}

      {/* Diploma Fields */}
      {type === DocType.DIPLOMA && (
        <>
          <div>
            <label
              htmlFor="degree"
              className="block text-sm font-medium text-zinc-700 mb-2"
            >
              Diplôme (optionnel)
            </label>
            <input
              id="degree"
              type="text"
              value={formData.degree || ""}
              onChange={(e) => handleChange("degree", e.target.value)}
              placeholder="Ex: Licence, Master, Doctorat"
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
            />
          </div>
          <div>
            <label
              htmlFor="graduation_date"
              className="block text-sm font-medium text-zinc-700 mb-2"
            >
              Date de graduation (optionnel)
            </label>
            <input
              id="graduation_date"
              type="date"
              value={formData.graduation_date || ""}
              onChange={(e) => handleChange("graduation_date", e.target.value)}
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
            />
          </div>
          <div>
            <label
              htmlFor="honors"
              className="block text-sm font-medium text-zinc-700 mb-2"
            >
              Mention (optionnel)
            </label>
            <select
              id="honors"
              value={formData.honors || ""}
              onChange={(e) => handleChange("honors", e.target.value)}
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
            >
              <option value="">Aucune mention</option>
              <option value="PASSABLE">Passable</option>
              <option value="ASSEZ_BIEN">Assez Bien</option>
              <option value="BIEN">Bien</option>
              <option value="TRES_BIEN">Très Bien</option>
            </select>
          </div>
        </>
      )}

      {/* Attestation Fields */}
      {type === DocType.ATTESTATION && (
        <div>
          <label
            htmlFor="custom_text"
            className="block text-sm font-medium text-zinc-700 mb-2"
          >
            Texte personnalisé <span className="text-red-500">*</span>
          </label>
          <textarea
            id="custom_text"
            value={formData.custom_text || ""}
            onChange={(e) => handleChange("custom_text", e.target.value)}
            rows={6}
            required
            placeholder="Entrez le texte de l'attestation..."
            className={`block w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 ${
              errors.custom_text
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-zinc-300 focus:border-[#00365F] focus:ring-[#00365F]"
            }`}
          />
          {errors.custom_text && (
            <p className="mt-1 text-xs text-red-600">{errors.custom_text}</p>
          )}
        </div>
      )}

      {/* ID Card - No additional fields */}
      {type === DocType.ID_CARD && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm text-zinc-600">
            La carte étudiante sera générée avec les informations de l'étudiant.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Génération...
            </span>
          ) : (
            "Générer le document"
          )}
        </button>
      </div>
    </form>
  );
}

