"use client";

import { useState } from "react";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateStudentInput, Student } from "@/types/student";
import { Gender, DocumentType, Provenance, IDType } from "@/types/student";
import DocumentUploader from "./document-uploader";
import { StudentSchema, type StudentFormData } from "@/lib/validations/schemas";
import { extractValidationErrors, toUserError } from "@/lib/error-handler";
import { formatPhone, formatPhoneInput, parsePhone } from "@/lib/format";

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
  const isReadOnly = useIsReadOnly();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(StudentSchema),
    defaultValues: {
      first_name: initialData?.first_name ?? "",
      last_name: initialData?.last_name ?? "",
      ine: initialData?.ine ?? "",
      registration_number: initialData?.registration_number ?? "",
      provenance: initialData?.provenance ?? undefined,
      gender: initialData?.gender ?? Gender.M,
      date_of_birth: initialData?.date_of_birth ?? "",
      place_of_birth: initialData?.place_of_birth ?? "",
      nationality: initialData?.nationality ?? "",
      phone: initialData?.phone ? formatPhone(initialData.phone) : "+221 ",
      phone_2: initialData?.phone_2 ? formatPhone(initialData.phone_2) : "",
      email: initialData?.email ?? "",
      type_of_id: initialData?.type_of_id ?? undefined,
      id_details: initialData?.id_details ?? "",
      emergency_contact_name: initialData?.emergency_contact_name ?? "",
      emergency_contact_phone: initialData?.emergency_contact_phone ? formatPhone(initialData.emergency_contact_phone) : "+221 ",
      address: initialData?.address ?? "",
      documents: [],
    },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  // registration_number is read-only when editing a student that already has one
  const isRegistrationNumberReadOnly = !!(initialData && initialData.registration_number);

  const phoneReg = register("phone");
  const phone2Reg = register("phone_2");
  const emergencyPhoneReg = register("emergency_contact_phone");

  const handleDocumentUpload = (files: File[], type: DocumentType) => {
    const currentDocs = watch("documents") || [];
    setValue("documents", [...currentDocs, ...files]);
  };

  const handleFormSubmit = async (data: StudentFormData) => {
    setSubmitError(null);
    try {
      await onSubmit({
        ...data,
        phone: parsePhone(data.phone),
        phone_2: parsePhone(data.phone_2) || undefined,
        emergency_contact_phone: parsePhone(data.emergency_contact_phone),
      } as CreateStudentInput);
    } catch (error) {
      const validationErrors = extractValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field as keyof StudentFormData, { type: "server", message });
        });
        setSubmitError("Veuillez corriger les champs en erreur.");
        return;
      }
      const userError = toUserError(error);
      setSubmitError(userError.message);
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
          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="mb-2 block text-sm text-zinc-900">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="first_name"
              {...register("first_name")}
              placeholder="Prénom"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.first_name ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.first_name && (
              <p className="mt-1.5 text-xs text-red-600">{errors.first_name.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="mb-2 block text-sm text-zinc-900">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="last_name"
              {...register("last_name")}
              placeholder="NOM"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.last_name ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.last_name && (
              <p className="mt-1.5 text-xs text-red-600">{errors.last_name.message}</p>
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

      {/* INFORMATIONS ACADÉMIQUES */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Informations académiques
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* INE */}
          <div>
            <label htmlFor="ine" className="mb-2 block text-sm text-zinc-900">
              INE
            </label>
            <input
              type="text"
              id="ine"
              {...register("ine")}
              placeholder="Identifiant National Étudiant"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.ine ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.ine && <p className="mt-1.5 text-xs text-red-600">{errors.ine.message}</p>}
          </div>

          {/* Registration Number (CCAK) */}
          <div>
            <label htmlFor="registration_number" className="mb-2 block text-sm text-zinc-900">
              N° Inscription CCAK
              {isRegistrationNumberReadOnly && (
                <span className="ml-2 text-xs text-zinc-400">(lecture seule)</span>
              )}
            </label>
            <input
              type="text"
              id="registration_number"
              {...register("registration_number")}
              placeholder="Numéro CCAK"
              readOnly={isRegistrationNumberReadOnly}
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${isRegistrationNumberReadOnly ? "cursor-not-allowed bg-zinc-50 text-zinc-500" : ""} ${errors.registration_number ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.registration_number && (
              <p className="mt-1.5 text-xs text-red-600">{errors.registration_number.message}</p>
            )}
          </div>

          {/* Provenance */}
          <div>
            <label htmlFor="provenance" className="mb-2 block text-sm text-zinc-900">
              Provenance
            </label>
            <select
              id="provenance"
              {...register("provenance")}
              className="block w-full appearance-none rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value="">— Sélectionner —</option>
              <option value={Provenance.ETAT}>État</option>
              <option value={Provenance.PLATEFORME}>Plateforme</option>
            </select>
            {errors.provenance && (
              <p className="mt-1.5 text-xs text-red-600">{errors.provenance.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* PIÈCE D'IDENTITÉ */}
      <div>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
          Pièce d&apos;identité
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Type de pièce */}
          <div>
            <label htmlFor="type_of_id" className="mb-2 block text-sm text-zinc-900">
              Type de pièce
            </label>
            <select
              id="type_of_id"
              {...register("type_of_id")}
              className="block w-full appearance-none rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-[#00365F] focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              disabled={isLoading}
            >
              <option value="">— Sélectionner —</option>
              <option value={IDType.NATIONAL_ID}>Carte nationale d&apos;identité</option>
              <option value={IDType.PASSPORT}>Passeport</option>
              <option value={IDType.DRIVING_LICENSE}>Permis de conduire</option>
              <option value={IDType.OTHER}>Autre</option>
            </select>
            {errors.type_of_id && (
              <p className="mt-1.5 text-xs text-red-600">{errors.type_of_id.message}</p>
            )}
          </div>

          {/* Numéro / détails */}
          <div>
            <label htmlFor="id_details" className="mb-2 block text-sm text-zinc-900">
              Numéro de la pièce
            </label>
            <input
              type="text"
              id="id_details"
              {...register("id_details")}
              placeholder="Numéro ou référence"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.id_details ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.id_details && (
              <p className="mt-1.5 text-xs text-red-600">{errors.id_details.message}</p>
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
              {...phoneReg}
              onBlur={(e) => {
                setValue("phone", formatPhoneInput(e.target.value) || "+221 ", { shouldValidate: true });
                phoneReg.onBlur(e);
              }}
              placeholder="+221 XX XXX XX XX"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.phone ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          {/* Phone 2 */}
          <div>
            <label htmlFor="phone_2" className="mb-2 block text-sm text-zinc-900">
              Téléphone 2
            </label>
            <input
              type="tel"
              id="phone_2"
              {...phone2Reg}
              onBlur={(e) => {
                setValue("phone_2", formatPhoneInput(e.target.value) || "", { shouldValidate: true });
                phone2Reg.onBlur(e);
              }}
              placeholder="+221 XX XXX XX XX"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.phone_2 ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.phone_2 && (
              <p className="mt-1.5 text-xs text-red-600">{errors.phone_2.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-zinc-900">
              Email personnel
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              placeholder="prenom.nom@email.com"
              className={`block w-full rounded-md border bg-white px-4 py-2.5 text-sm text-[#00365F] placeholder-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${errors.email ? "border-red-300" : "border-zinc-300"}`}
              disabled={isLoading}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
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
              {...emergencyPhoneReg}
              onBlur={(e) => {
                setValue("emergency_contact_phone", formatPhoneInput(e.target.value) || "+221 ", { shouldValidate: true });
                emergencyPhoneReg.onBlur(e);
              }}
              placeholder="+221 XX XXX XX XX"
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
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
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
          disabled={isLoading || isReadOnly}
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
