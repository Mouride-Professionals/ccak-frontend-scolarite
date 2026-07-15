"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import { useDepartments } from "@/hooks/use-departments";
import {
  useCreateFacultyMember,
  useCreateFacultyDocument,
} from "@/hooks/use-faculty-members-management";
import { toUserError } from "@/lib/error-handler";
import { formatPhoneInput, parsePhone } from "@/lib/format";
import { zodErrorToFieldErrors, type FieldErrors } from "@/lib/validations/zod-errors";
import { FacultyContractType, FacultyDocumentType, FacultyRank } from "@/types/academic";

const PHONE_REGEX = /^\+?[0-9\s-]{8,20}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const steps = [
  { id: 1, label: "Informations personnelles" },
  { id: 2, label: "Informations académiques" },
  { id: 3, label: "Contrat" },
  { id: 4, label: "Documents" },
];

const toOptionalTrimmedString = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const FacultyRegistrationBaseSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "Le nom complet doit contenir au moins 3 caractères")
    .max(120, "Le nom complet ne peut pas dépasser 120 caractères"),
  email: z
    .string()
    .trim()
    .min(1, "L'email est requis")
    .email("Veuillez saisir une adresse email valide"),
  phone: z
    .string()
    .trim()
    .min(1, "Le téléphone est requis")
    .regex(PHONE_REGEX, "Veuillez saisir un numéro de téléphone valide"),
  address: z.preprocess(
    toOptionalTrimmedString,
    z.string().max(200, "L'adresse ne peut pas dépasser 200 caractères").optional()
  ),
  department_id: z.string().min(1, "Le département est requis"),
  rank: z.nativeEnum(FacultyRank),
  hire_date: z
    .string()
    .min(1, "La date d'embauche est requise")
    .regex(ISO_DATE_REGEX, "La date d'embauche doit être au format YYYY-MM-DD"),
  contract_type: z.nativeEnum(FacultyContractType),
  contract_start: z
    .string()
    .min(1, "La date de début de contrat est requise")
    .regex(ISO_DATE_REGEX, "La date de début doit être au format YYYY-MM-DD"),
  contract_end: z.preprocess(
    toOptionalTrimmedString,
    z.string().regex(ISO_DATE_REGEX, "La date de fin doit être au format YYYY-MM-DD").optional()
  ),
  salary: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? trimmed : parsed;
      }
      return value;
    },
    z
      .number({ error: "Le salaire doit être un nombre" })
      .min(0, "Le salaire ne peut pas être négatif")
      .max(100_000_000, "Le salaire ne peut pas dépasser 100000000")
      .optional()
  ),
  contract_terms: z.preprocess(
    toOptionalTrimmedString,
    z.string().max(2000, "Les termes du contrat ne peuvent pas dépasser 2000 caractères").optional()
  ),
});

const FacultyRegistrationSchema = FacultyRegistrationBaseSchema.superRefine((data, ctx) => {
  if (data.contract_end && data.contract_end < data.contract_start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["contract_end"],
      message: "La fin de contrat doit être postérieure au début de contrat",
    });
  }
});

const StepOneSchema = FacultyRegistrationBaseSchema.pick({
  full_name: true,
  email: true,
  phone: true,
  address: true,
});

const StepTwoSchema = FacultyRegistrationBaseSchema.pick({
  department_id: true,
  rank: true,
  hire_date: true,
});

const StepThreeSchema = FacultyRegistrationBaseSchema.pick({
  contract_type: true,
  contract_start: true,
  contract_end: true,
  salary: true,
  contract_terms: true,
}).superRefine((data, ctx) => {
  if (data.contract_end && data.contract_end < data.contract_start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["contract_end"],
      message: "La fin de contrat doit être postérieure au début de contrat",
    });
  }
});

type FacultyRegistrationValidationData = z.input<typeof FacultyRegistrationSchema>;
type FacultyRegistrationParsedData = z.output<typeof FacultyRegistrationSchema>;
type FacultyRegistrationField = keyof FacultyRegistrationValidationData;
type StepId = 1 | 2 | 3 | 4;

type FacultyRegistrationFormData = {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  department_id: string;
  rank: FacultyRank;
  hire_date: string;
  contract_type: FacultyContractType;
  contract_start: string;
  contract_end: string;
  salary: string;
  contract_terms: string;
  documents: {
    cv: File | null;
    diploma: File | null;
    cni: File | null;
    other: File | null;
  };
};

type FacultyDocumentKey = keyof FacultyRegistrationFormData["documents"];

const DOCUMENT_FIELDS: {
  key: FacultyDocumentKey;
  label: string;
  description: string;
}[] = [
  {
    key: "cv",
    label: "CV",
    description: "Curriculum vitae de l'enseignant",
  },
  {
    key: "diploma",
    label: "Diplome",
    description: "Diplome principal ou attestation",
  },
  {
    key: "cni",
    label: "CNI",
    description: "Piece d'identite",
  },
  {
    key: "other",
    label: "Autre document",
    description: "Tout document complementaire",
  },
];

const STEP_FIELDS: Record<StepId, FacultyRegistrationField[]> = {
  1: ["full_name", "email", "phone", "address"],
  2: ["department_id", "rank", "hire_date"],
  3: ["contract_type", "contract_start", "contract_end", "salary", "contract_terms"],
  4: [],
};

const FIELD_STEP_MAP: Partial<Record<FacultyRegistrationField, StepId>> = {
  full_name: 1,
  email: 1,
  phone: 1,
  address: 1,
  department_id: 2,
  rank: 2,
  hire_date: 2,
  contract_type: 3,
  contract_start: 3,
  contract_end: 3,
  salary: 3,
  contract_terms: 3,
};

const getStepSchema = (step: StepId) => {
  if (step === 1) return StepOneSchema;
  if (step === 2) return StepTwoSchema;
  if (step === 3) return StepThreeSchema;
  return z.object({});
};

const getErrorId = (field: FacultyRegistrationField) => `${field}-error`;

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
const buildValidationPayload = (
  data: FacultyRegistrationFormData
): FacultyRegistrationValidationData => ({
  full_name: data.full_name,
  email: data.email,
  phone: data.phone,
  address: data.address,
  department_id: data.department_id,
  rank: data.rank,
  hire_date: data.hire_date,
  contract_type: data.contract_type,
  contract_start: data.contract_start,
  contract_end: data.contract_end,
  salary: data.salary,
  contract_terms: data.contract_terms,
});

export default function FacultyRegistrationPage() {
  const router = useRouter();
  const { data: departmentsData } = useDepartments({ page: 1, limit: 50 });
  const createFacultyMutation = useCreateFacultyMember();
  const uploadDocumentMutation = useCreateFacultyDocument();
  const [step, setStep] = useState<StepId>(1);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FacultyRegistrationFormData>({
    full_name: "",
    email: "",
    phone: "+221 ",
    address: "",
    department_id: "",
    rank: FacultyRank.ASSISTANT,
    hire_date: "",
    contract_type: FacultyContractType.PERMANENT,
    contract_start: "",
    contract_end: "",
    salary: "",
    contract_terms: "",
    documents: {
      cv: null,
      diploma: null,
      cni: null,
      other: null,
    },
  });

  const validationPayload = useMemo(
    (): FacultyRegistrationValidationData => buildValidationPayload(formData),
    [formData]
  );

  const isSubmitting = createFacultyMutation.isPending || uploadDocumentMutation.isPending;

  const canGoNext = useMemo(() => {
    const schema = getStepSchema(step);
    return schema.safeParse(validationPayload).success;
  }, [step, validationPayload]);

  const canSubmit = useMemo(
    () => FacultyRegistrationSchema.safeParse(validationPayload).success,
    [validationPayload]
  );

  const validateStep = (targetStep: StepId, payload: FacultyRegistrationValidationData) => {
    const schema = getStepSchema(targetStep);
    const parsed = schema.safeParse(payload);
    const fields = STEP_FIELDS[targetStep];

    setFieldErrors((prev) => {
      const next = { ...prev };
      fields.forEach((field) => {
        delete next[field];
      });
      if (!parsed.success) {
        Object.assign(next, zodErrorToFieldErrors(parsed.error));
      }
      return next;
    });

    return parsed.success;
  };

  const setFieldValue = <K extends keyof FacultyRegistrationFormData>(
    field: K,
    value: FacultyRegistrationFormData[K]
  ) => {
    const nextFormData = { ...formData, [field]: value };
    setFormData(nextFormData);
    setFormError(null);

    const stepForField = FIELD_STEP_MAP[field as FacultyRegistrationField];
    if (stepForField && stepForField === step) {
      validateStep(step, buildValidationPayload(nextFormData));
      return;
    }

    const fieldKey = String(field);
    if (fieldErrors[fieldKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNext = () => {
    if (!validateStep(step, validationPayload)) {
      setFormError("Veuillez corriger les champs en erreur avant de continuer.");
      return;
    }
    setFormError(null);
    setStep((prev) => (prev < 4 ? ((prev + 1) as StepId) : prev));
  };

  const handleBack = () => {
    setFormError(null);
    setStep((prev) => (prev > 1 ? ((prev - 1) as StepId) : prev));
  };

  const handleSubmit = async () => {
    const parsed = FacultyRegistrationSchema.safeParse(validationPayload);
    if (!parsed.success) {
      const nextErrors = zodErrorToFieldErrors(parsed.error);
      setFieldErrors(nextErrors);
      setFormError("Veuillez corriger les champs en erreur avant d'enregistrer.");
      const firstErrorField = Object.keys(nextErrors)[0] as FacultyRegistrationField | undefined;
      if (firstErrorField && FIELD_STEP_MAP[firstErrorField]) {
        setStep(FIELD_STEP_MAP[firstErrorField] as StepId);
      }
      return;
    }

    setFormError(null);
    setFieldErrors({});

    try {
      const validData: FacultyRegistrationParsedData = parsed.data;
      const createdFaculty = await createFacultyMutation.mutateAsync({
        full_name: validData.full_name,
        email: validData.email,
        phone: parsePhone(validData.phone),
        address: validData.address || undefined,
        department_id: validData.department_id,
        rank: validData.rank,
        contract_type: validData.contract_type,
        hire_date: validData.hire_date,
        salary: validData.salary ?? null,
        contract_start: validData.contract_start || undefined,
        contract_end: validData.contract_end || undefined,
        contract_terms: validData.contract_terms || undefined,
      });

      const documents = [
        { file: formData.documents.cv, type: FacultyDocumentType.CV },
        { file: formData.documents.diploma, type: FacultyDocumentType.DIPLOMA },
        { file: formData.documents.cni, type: FacultyDocumentType.CNI },
        { file: formData.documents.other, type: FacultyDocumentType.OTHER },
      ].filter((item): item is { file: File; type: FacultyDocumentType } => item.file !== null);

      if (documents.length > 0) {
        await Promise.all(
          documents.map((doc) =>
            uploadDocumentMutation.mutateAsync({
              facultyId: createdFaculty.id,
              input: {
                document: doc.file,
                type: doc.type,
              },
            })
          )
        );
      }

      setToast({
        isOpen: true,
        message: "Enseignant créé avec succès.",
        type: "success",
      });
      setTimeout(() => {
        router.push("/faculty-members");
      }, 1200);
    } catch (error) {
      console.error("Error creating faculty member:", error);
      setFormError(toUserError(error, "Erreur lors de la création de l'enseignant.").message);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nouvel enseignant">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {steps.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    item.id <= step ? "bg-[#008D36] text-white" : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {item.id}
                </div>
                <span className="text-sm text-zinc-600">{item.label}</span>
              </div>
            ))}
          </div>

          {formError && (
            <div
              className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {formError}
            </div>
          )}

          <div className="mt-6 space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="full_name"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Nom complet *
                  </label>
                  <input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(event) => setFieldValue("full_name", event.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.full_name ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.full_name)}
                    aria-describedby={fieldErrors.full_name ? getErrorId("full_name") : undefined}
                  />
                  {fieldErrors.full_name && (
                    <p id={getErrorId("full_name")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.full_name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-700">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFieldValue("email", event.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.email ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? getErrorId("email") : undefined}
                  />
                  {fieldErrors.email && (
                    <p id={getErrorId("email")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-zinc-700">
                    Téléphone *
                  </label>
                  <input
                    id="phone"
                    value={formData.phone}
                    onChange={(event) => setFieldValue("phone", event.target.value)}
                    onBlur={(e) =>
                      setFieldValue("phone", formatPhoneInput(e.target.value) || "+221 ")
                    }
                    placeholder="+221 XX XXX XX XX"
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.phone ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={fieldErrors.phone ? getErrorId("phone") : undefined}
                  />
                  {fieldErrors.phone && (
                    <p id={getErrorId("phone")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="address" className="mb-2 block text-sm font-medium text-zinc-700">
                    Adresse
                  </label>
                  <input
                    id="address"
                    value={formData.address}
                    onChange={(event) => setFieldValue("address", event.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.address ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.address)}
                    aria-describedby={fieldErrors.address ? getErrorId("address") : undefined}
                  />
                  {fieldErrors.address && (
                    <p id={getErrorId("address")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="department_id"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Département *
                  </label>
                  <select
                    id="department_id"
                    value={formData.department_id}
                    onChange={(event) => setFieldValue("department_id", event.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.department_id ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.department_id)}
                    aria-describedby={
                      fieldErrors.department_id ? getErrorId("department_id") : undefined
                    }
                  >
                    <option value="">Sélectionner</option>
                    {departmentsData?.data?.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.department_id && (
                    <p id={getErrorId("department_id")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.department_id}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="rank" className="mb-2 block text-sm font-medium text-zinc-700">
                    Rang *
                  </label>
                  <select
                    id="rank"
                    value={formData.rank}
                    onChange={(event) => setFieldValue("rank", event.target.value as FacultyRank)}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.rank ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.rank)}
                    aria-describedby={fieldErrors.rank ? getErrorId("rank") : undefined}
                  >
                    {Object.values(FacultyRank).map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.rank && (
                    <p id={getErrorId("rank")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.rank}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="hire_date"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Date d&apos;embauche *
                  </label>
                  <input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(event) => setFieldValue("hire_date", event.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.hire_date ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.hire_date)}
                    aria-describedby={fieldErrors.hire_date ? getErrorId("hire_date") : undefined}
                  />
                  {fieldErrors.hire_date && (
                    <p id={getErrorId("hire_date")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.hire_date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Matricule</label>
                  <input
                    value="Auto-généré"
                    disabled
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-500"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contract_type"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Type de contrat *
                  </label>
                  <select
                    id="contract_type"
                    value={formData.contract_type}
                    onChange={(event) =>
                      setFieldValue("contract_type", event.target.value as FacultyContractType)
                    }
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.contract_type ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.contract_type)}
                    aria-describedby={
                      fieldErrors.contract_type ? getErrorId("contract_type") : undefined
                    }
                  >
                    {Object.values(FacultyContractType).map((type) => (
                      <option key={type} value={type}>
                        {{ PERMANENT: "Permanent", TEMPORARY: "Temporaire", HOURLY: "Vacataire" }[
                          type
                        ] ?? type}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.contract_type && (
                    <p id={getErrorId("contract_type")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.contract_type}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="salary" className="mb-2 block text-sm font-medium text-zinc-700">
                    Salaire mensuel (FCFA)
                  </label>
                  <input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(event) => setFieldValue("salary", event.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.salary ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.salary)}
                    aria-describedby={fieldErrors.salary ? getErrorId("salary") : undefined}
                  />
                  {fieldErrors.salary && (
                    <p id={getErrorId("salary")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.salary}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contract_start"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Début de contrat *
                  </label>
                  <input
                    id="contract_start"
                    type="date"
                    value={formData.contract_start}
                    onChange={(event) => setFieldValue("contract_start", event.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.contract_start ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.contract_start)}
                    aria-describedby={
                      fieldErrors.contract_start ? getErrorId("contract_start") : undefined
                    }
                  />
                  {fieldErrors.contract_start && (
                    <p id={getErrorId("contract_start")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.contract_start}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contract_end"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Fin de contrat
                  </label>
                  <input
                    id="contract_end"
                    type="date"
                    value={formData.contract_end}
                    onChange={(event) => setFieldValue("contract_end", event.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.contract_end ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.contract_end)}
                    aria-describedby={
                      fieldErrors.contract_end ? getErrorId("contract_end") : undefined
                    }
                  />
                  {fieldErrors.contract_end && (
                    <p id={getErrorId("contract_end")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.contract_end}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="contract_terms"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Termes du contrat
                  </label>
                  <textarea
                    id="contract_terms"
                    value={formData.contract_terms}
                    onChange={(event) => setFieldValue("contract_terms", event.target.value)}
                    rows={4}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] ${
                      fieldErrors.contract_terms ? "border-red-300" : "border-zinc-300"
                    }`}
                    aria-invalid={Boolean(fieldErrors.contract_terms)}
                    aria-describedby={
                      fieldErrors.contract_terms ? getErrorId("contract_terms") : undefined
                    }
                  />
                  {fieldErrors.contract_terms && (
                    <p id={getErrorId("contract_terms")} className="mt-1 text-xs text-red-600">
                      {fieldErrors.contract_terms}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600">
                  Ajoutez les pieces justificatives si disponibles. Formats recommandes: PDF, JPG,
                  PNG (max 10 MB par fichier).
                </p>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {DOCUMENT_FIELDS.map((doc) => {
                    const selectedFile = formData.documents[doc.key];
                    return (
                      <div
                        key={doc.key}
                        className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4"
                      >
                        <div className="mb-3">
                          <label
                            htmlFor={`document-${doc.key}`}
                            className="block text-sm font-semibold text-zinc-800"
                          >
                            {doc.label}
                          </label>
                          <p className="mt-1 text-xs text-zinc-500">{doc.description}</p>
                        </div>

                        {!selectedFile ? (
                          <input
                            id={`document-${doc.key}`}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(event) =>
                              setFormData((prev) => ({
                                ...prev,
                                documents: {
                                  ...prev.documents,
                                  [doc.key]: event.target.files?.[0] ?? null,
                                },
                              }))
                            }
                            className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#00365F]/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#00365F] hover:file:bg-[#00365F]/15"
                          />
                        ) : (
                          <div className="rounded-lg border border-[#008D36]/20 bg-white p-3">
                            <p className="text-sm font-medium text-zinc-800">{selectedFile.name}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {selectedFile.type || "Type inconnu"} •{" "}
                              {formatFileSize(selectedFile.size)}
                            </p>
                            <div className="mt-3 flex gap-2">
                              <label
                                htmlFor={`document-${doc.key}`}
                                className="cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                              >
                                Remplacer
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    documents: {
                                      ...prev.documents,
                                      [doc.key]: null,
                                    },
                                  }))
                                }
                                className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                              >
                                Retirer
                              </button>
                            </div>
                            <input
                              id={`document-${doc.key}`}
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={(event) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  documents: {
                                    ...prev.documents,
                                    [doc.key]: event.target.files?.[0] ?? null,
                                  },
                                }))
                              }
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>
            {step < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="rounded-lg bg-[#008D36] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit}
                className="rounded-lg bg-[#008D36] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            )}
          </div>
          {step < steps.length && !canGoNext && !formError && (
            <p className="mt-2 text-sm text-amber-700">
              Certains champs sont invalides. Corrigez-les puis cliquez sur Continuer.
            </p>
          )}
        </div>

        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isOpen: false })}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
