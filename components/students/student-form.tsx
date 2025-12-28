"use client";

import { useState } from "react";
import type { CreateStudentInput, Student } from "@/types/student";
import { Gender, DocumentType } from "@/types/student";
import DocumentUploader from "./document-uploader";

interface StudentFormProps {
  onSubmit: (data: CreateStudentInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: Partial<Student>;
}

export default function StudentForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}: StudentFormProps) {
  const [formData, setFormData] = useState<CreateStudentInput>({
    full_name: initialData?.full_name ?? "",
    gender: initialData?.gender ?? Gender.M,
    date_of_birth: initialData?.date_of_birth ?? "",
    place_of_birth: initialData?.place_of_birth ?? "",
    nationality: initialData?.nationality ?? "",
    phone: initialData?.phone ?? "",
    emergency_contact_name: initialData?.emergency_contact_name ?? "",
    emergency_contact_phone: initialData?.emergency_contact_phone ?? "",
    address: initialData?.address ?? "",
    documents: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateStudentInput, value: unknown) => {
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

  const handleDocumentUpload = (files: File[], type: DocumentType) => {
    // Pour la création, on stocke temporairement les fichiers
    // Ils seront traités lors de la soumission du formulaire
    setFormData((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), ...files],
    }));

    // Clear documents error
    if (errors.documents) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.documents;
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Le nom complet est requis";
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "La date de naissance est requise";
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 15 || age > 100) {
        newErrors.date_of_birth = "L'âge doit être entre 15 et 100 ans";
      }
    }

    if (!formData.place_of_birth.trim()) {
      newErrors.place_of_birth = "Le lieu de naissance est requis";
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = "La nationalité est requise";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis";
    } else if (!/^\+221\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Le numéro de téléphone doit être au format +221XXXXXXXXX";
    }

    if (!formData.emergency_contact_name.trim()) {
      newErrors.emergency_contact_name = "Le nom du contact d'urgence est requis";
    }

    if (!formData.emergency_contact_phone.trim()) {
      newErrors.emergency_contact_phone = "Le téléphone du contact d'urgence est requis";
    } else if (!/^\+221\d{9}$/.test(formData.emergency_contact_phone.trim())) {
      newErrors.emergency_contact_phone = "Le numéro de téléphone doit être au format +221XXXXXXXXX";
    }

    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise";
    }

    // Validation des documents - au moins une photo de profil requise
    if (!formData.documents || formData.documents.length === 0) {
      newErrors.documents = "Au moins un document (photo de profil) est requis";
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
      {/* INFORMATIONS PERSONNELLES */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="mb-2 block text-sm text-zinc-900">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Prénom NOM"
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.full_name && (
              <p className="mt-1.5 text-xs text-red-600">{errors.full_name}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="mb-2 block text-sm text-zinc-900">
              Genre <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value as Gender)}
              className="block w-full appearance-none rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="date_of_birth" className="mb-2 block text-sm text-zinc-900">
              Date de naissance <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date_of_birth"
              value={formData.date_of_birth}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.date_of_birth && (
              <p className="mt-1.5 text-xs text-red-600">{errors.date_of_birth}</p>
            )}
          </div>

          {/* Place of Birth */}
          <div>
            <label htmlFor="place_of_birth" className="mb-2 block text-sm text-zinc-900">
              Lieu de naissance <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="place_of_birth"
              value={formData.place_of_birth}
              onChange={(e) => handleChange("place_of_birth", e.target.value)}
              placeholder="Ville, Pays"
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.place_of_birth && (
              <p className="mt-1.5 text-xs text-red-600">{errors.place_of_birth}</p>
            )}
          </div>

          {/* Nationality */}
          <div>
            <label htmlFor="nationality" className="mb-2 block text-sm text-zinc-900">
              Nationalité <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nationality"
              value={formData.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
              placeholder="Sénégalaise"
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.nationality && (
              <p className="mt-1.5 text-xs text-red-600">{errors.nationality}</p>
            )}
          </div>
        </div>
      </div>

      {/* INFORMATIONS DE CONTACT */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Informations de contact
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm text-zinc-900">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+221771234567"
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="mb-2 block text-sm text-zinc-900">
              Adresse <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Adresse complète"
              rows={3}
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.address && (
              <p className="mt-1.5 text-xs text-red-600">{errors.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* CONTACT D'URGENCE */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Contact d'urgence
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Emergency Contact Name */}
          <div>
            <label htmlFor="emergency_contact_name" className="mb-2 block text-sm text-zinc-900">
              Nom du contact <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
              placeholder="Prénom NOM"
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.emergency_contact_name && (
              <p className="mt-1.5 text-xs text-red-600">{errors.emergency_contact_name}</p>
            )}
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label htmlFor="emergency_contact_phone" className="mb-2 block text-sm text-zinc-900">
              Téléphone du contact <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={(e) => handleChange("emergency_contact_phone", e.target.value)}
              placeholder="+221771234567"
              className="block w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            />
            {errors.emergency_contact_phone && (
              <p className="mt-1.5 text-xs text-red-600">{errors.emergency_contact_phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENTS */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Documents requis
        </h3>
        <DocumentUploader
          studentId="temp" // Sera remplacé par l'ID réel après création
          onUpload={handleDocumentUpload}
          isLoading={isLoading}
          acceptedTypes=".pdf,.jpg,.jpeg,.png"
        />
        {errors.documents && (
          <p className="mt-2 text-xs text-red-600">{errors.documents}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            disabled={isLoading}
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className="rounded-lg bg-[#008D36] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading
            ? (initialData ? "Modification en cours..." : "Création en cours...")
            : (initialData ? "Modifier l'étudiant" : "Créer l'étudiant")
          }
        </button>
      </div>
    </form>
  );
}