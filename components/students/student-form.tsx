"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateStudentInput, Student } from "@/types/student";
import { Gender, DocumentType } from "@/types/student";
import DocumentUploader from "./document-uploader";
import { StudentSchema, type StudentFormData } from "@/lib/validations/schemas";
import { toUserError } from "@/lib/error-handler";

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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(StudentSchema),
    defaultValues: {
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
    },
  });

  const handleDocumentUpload = (files: File[], type: DocumentType) => {
    const currentDocs = watch("documents") || [];
    setValue("documents", [...currentDocs, ...files]);
  };

  const handleFormSubmit = async (data: StudentFormData) => {
    try {
      await onSubmit(data as CreateStudentInput);
    } catch (error) {
      const userError = toUserError(error);
      console.error("Form submission error:", userError.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
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
              {...register("full_name")}
              placeholder="Prénom NOM"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.full_name ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.full_name && (
              <p className="mt-1.5 text-xs text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="mb-2 block text-sm text-zinc-900">
              Genre <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              {...register("gender")}
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
              {...register("date_of_birth")}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.date_of_birth ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.date_of_birth && (
              <p className="mt-1.5 text-xs text-red-600">{errors.date_of_birth.message}</p>
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
              {...register("place_of_birth")}
              placeholder="Ville, Pays"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.place_of_birth ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.place_of_birth && (
              <p className="mt-1.5 text-xs text-red-600">{errors.place_of_birth.message}</p>
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
              {...register("nationality")}
              placeholder="Sénégalaise"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.nationality ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.nationality && (
              <p className="mt-1.5 text-xs text-red-600">{errors.nationality.message}</p>
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
              {...register("phone")}
              placeholder="+221771234567"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.phone ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="mb-2 block text-sm text-zinc-900">
              Adresse <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              {...register("address")}
              placeholder="Adresse complète"
              rows={3}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.address ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.address && (
              <p className="mt-1.5 text-xs text-red-600">{errors.address.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* CONTACT D'URGENCE */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Contact d&apos;urgence
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
              {...register("emergency_contact_name")}
              placeholder="Prénom NOM"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.emergency_contact_name ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.emergency_contact_name && (
              <p className="mt-1.5 text-xs text-red-600">{errors.emergency_contact_name.message}</p>
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
              {...register("emergency_contact_phone")}
              placeholder="+221771234567"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.emergency_contact_phone ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.emergency_contact_phone && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.emergency_contact_phone.message}
              </p>
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
          <p className="mt-2 text-xs text-red-600">{errors.documents.message}</p>
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
            ? initialData
              ? "Modification en cours..."
              : "Création en cours..."
            : initialData
              ? "Modifier l'étudiant"
              : "Créer l'étudiant"}
        </button>
      </div>
    </form>
  );
}
