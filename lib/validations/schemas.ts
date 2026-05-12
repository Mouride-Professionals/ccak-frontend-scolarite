/**
 * Security: Centralized validation schemas using Zod
 * Prevents XSS, injection attacks, and ensures data integrity
 */

import { z } from "zod";
import { Gender, Provenance, IDType, AddressType } from "@/types/student";
import { RegistrationStatus } from "@/types/enrollment";
import { AcademicLevel } from "@/types/academic";

// Common validation patterns
const PHONE_REGEX = /^\+221\d{9}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;
const CODE_REGEX = /^[A-Z0-9-]+$/;

// ============================================================================
// STUDENT VALIDATIONS
// ============================================================================

export const StudentSchema = z.object({
  first_name: z
    .string()
    .min(1, "Le prénom est requis")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(NAME_REGEX, "Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets"),
  last_name: z
    .string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(NAME_REGEX, "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets"),
  ine: z.string().max(20, "L'INE ne peut pas dépasser 20 caractères").optional().nullable(),
  registration_number: z
    .string()
    .max(50, "Le numéro d'inscription ne peut pas dépasser 50 caractères")
    .optional()
    .nullable(),
  provenance: z.nativeEnum(Provenance).optional().nullable(),
  gender: z.nativeEnum(Gender),
  date_of_birth: z
    .string()
    .min(1, "La date de naissance est requise")
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 15 && age <= 100;
      },
      { message: "L'âge doit être entre 15 et 100 ans" }
    ),
  place_of_birth: z.string().min(1, "Le lieu de naissance est requis").max(100),
  nationality: z.string().min(1, "La nationalité est requise").max(50),
  phone: z
    .string()
    .min(1, "Le numéro de téléphone est requis")
    .regex(PHONE_REGEX, "Le numéro doit être au format +221XXXXXXXXX"),
  phone_2: z
    .string()
    .regex(PHONE_REGEX, "Le numéro doit être au format +221XXXXXXXXX")
    .optional()
    .nullable()
    .or(z.literal("")),
  email: z.string().email("Adresse email invalide").optional().nullable().or(z.literal("")),
  type_of_id: z.nativeEnum(IDType).optional().nullable(),
  id_details: z.string().max(100, "Les détails ne peuvent pas dépasser 100 caractères").optional().nullable(),
  emergency_contact_name: z.string().min(2, "Le nom du contact d'urgence est requis").max(100),
  emergency_contact_phone: z
    .string()
    .min(1, "Le téléphone du contact d'urgence est requis")
    .regex(PHONE_REGEX, "Le numéro doit être au format +221XXXXXXXXX"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères").max(200),
  documents: z.array(z.instanceof(File)).optional(),
});

// ============================================================================
// COURSE VALIDATIONS
// ============================================================================

export const CourseSchema = z.object({
  course_unit_id: z.string().min(1, "L'unité d'enseignement est requise"),
  code: z
    .string()
    .min(2, "Le code doit contenir au moins 2 caractères")
    .max(20, "Le code ne peut pas dépasser 20 caractères")
    .regex(CODE_REGEX, "Le code ne peut contenir que des lettres majuscules, chiffres et tirets"),
  name: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(200, "Le nom ne peut pas dépasser 200 caractères"),
  description: z
    .string()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .optional(),
  credits: z
    .number({ error: "Les crédits sont requis" })
    .int("Les crédits doivent être un nombre entier")
    .min(1, "Les crédits doivent être au moins 1")
    .max(30, "Les crédits ne peuvent pas dépasser 30"),
  hours_lecture: z
    .number({ error: "Les heures de CM sont requises" })
    .int()
    .min(0, "Les heures doivent être positives")
    .max(200),
  hours_td: z
    .number({ error: "Les heures de TD sont requises" })
    .int()
    .min(0, "Les heures doivent être positives")
    .max(200),
  hours_tp: z
    .number({ error: "Les heures de TP sont requises" })
    .int()
    .min(0, "Les heures doivent être positives")
    .max(200),
  coefficient: z
    .number({ error: "Le coefficient est requis" })
    .min(0, "Le coefficient doit être positif")
    .max(10),
  prerequisites: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
});

// ============================================================================
// ENROLLMENT VALIDATIONS
// ============================================================================

export const EnrollmentSchema = z.object({
  student_id: z.string().min(1, "L'étudiant est requis"),
  academic_program_id: z.string().min(1, "Le programme académique est requis"),
  academic_year_id: z.string().min(1, "L'année académique est requise"),
  level_id: z.string().optional().nullable(),
  current_semester: z
    .number({ error: "Le semestre est requis" })
    .int("Le semestre doit être un nombre entier")
    .min(1, "Le semestre doit être compris entre 1 et 6")
    .max(6, "Le semestre doit être compris entre 1 et 6"),
  enrollment_date: z.string().min(1, "La date d'inscription est requise"),
  registration_fee_paid: z
    .number({ error: "Le montant des frais est requis" })
    .min(0, "Les frais d'inscription ne peuvent pas être négatifs"),
  is_scholarship_holder: z.boolean().default(false),
  scholarship_type: z.string().max(100).optional().nullable(),
  scholarship_amount: z
    .number()
    .min(0, "Le montant de la bourse ne peut pas être négatif")
    .optional()
    .nullable(),
  notes: z.string().max(1000, "Les notes ne peuvent pas dépasser 1000 caractères").optional().nullable(),
  is_repeating: z.boolean().default(false),
  is_medically_fit: z.boolean().default(false),
  is_registered_elsewhere: z.boolean().default(false),
  is_willing_to_cancel_other_registration: z.boolean().default(false),
  status: z.nativeEnum(RegistrationStatus).default(RegistrationStatus.DRAFT),
});

// ============================================================================
// GRADE VALIDATIONS
// ============================================================================

export const GradeSchema = z
  .object({
    student_id: z.string().min(1, "L'étudiant est requis"),
    course_id: z.string().min(1, "Le cours est requis"),
    type: z.string().min(1, "Le type d'évaluation est requis"),
    score: z
      .number({ error: "La note obtenue est requise" })
      .min(0, "La note ne peut pas être négative"),
    max_score: z
      .number({ error: "La note maximale est requise" })
      .min(1, "La note maximale doit être positive"),
    weight: z
      .number({ error: "Le coefficient est requis" })
      .min(0, "Le coefficient doit être positif")
      .max(1, "Le coefficient ne peut pas dépasser 1"),
    status: z.string().optional(),
    comments: z
      .string()
      .max(500, "Les commentaires ne peuvent pas dépasser 500 caractères")
      .optional(),
  })
  .refine((data) => data.score <= data.max_score, {
    message: "La note ne peut pas dépasser la note maximale",
    path: ["score"],
  });

// ============================================================================
// FACULTY VALIDATIONS
// ============================================================================

export const FacultySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom de la faculté doit contenir au moins 2 caractères")
    .max(200, "Le nom de la faculté ne peut pas dépasser 200 caractères"),
  code: z
    .string()
    .trim()
    .min(2, "Le code doit contenir au moins 2 caractères")
    .max(20, "Le code ne peut pas dépasser 20 caractères")
    .regex(CODE_REGEX, "Le code ne peut contenir que des lettres majuscules, chiffres et tirets"),
  dean_id: z.string().uuid("L'identifiant du doyen doit être un UUID valide").optional().nullable(),
  is_active: z.boolean().default(true),
});

// ============================================================================
// DEPARTMENT VALIDATIONS
// ============================================================================

export const DepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom du département doit contenir au moins 2 caractères")
    .max(200, "Le nom du département ne peut pas dépasser 200 caractères"),
  code: z
    .string()
    .trim()
    .min(2, "Le code doit contenir au moins 2 caractères")
    .max(20, "Le code ne peut pas dépasser 20 caractères")
    .regex(CODE_REGEX, "Le code ne peut contenir que des lettres majuscules, chiffres et tirets"),
  faculty_id: z.string().min(1, "La faculté est requise"),
  head_id: z
    .string()
    .uuid("L'identifiant du chef de département doit être un UUID valide")
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
});

// ============================================================================
// PROGRAMME VALIDATIONS
// ============================================================================

export const ProgrammeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Le nom du programme doit contenir au moins 3 caractères")
    .max(200, "Le nom du programme ne peut pas dépasser 200 caractères"),
  department_id: z.string().min(1, "Le département est requis"),
  level: z.nativeEnum(AcademicLevel),
  duration_semesters: z
    .number({ error: "La durée du programme est requise" })
    .int("La durée doit être un nombre entier")
    .min(1, "La durée doit être d'au moins 1 semestre")
    .max(20, "La durée ne peut pas dépasser 20 semestres"),
  total_credits_required: z
    .number({ error: "Le nombre total de crédits est requis" })
    .int("Le nombre de crédits doit être un entier")
    .min(1, "Le nombre de crédits doit être d'au moins 1")
    .max(500, "Le nombre de crédits ne peut pas dépasser 500"),
  is_active: z.boolean().default(true),
});

// ============================================================================
// EVALUATION VALIDATIONS
// ============================================================================

export const EvaluationSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères").max(200),
  description: z.string().max(1000).optional(),
  course_id: z.string().min(1, "Le cours est requis"),
  evaluation_type: z.enum(["exam", "quiz", "assignment", "project", "presentation"]),
  date: z.string().min(1, "La date est requise"),
  duration_minutes: z.number({ error: "La durée est requise" }).int().min(1).max(600),
  total_marks: z.number({ error: "Le total des points est requis" }).min(1).max(100),
});

// ============================================================================
// GUARDIAN VALIDATIONS
// ============================================================================

export const GuardianSchema = z.object({
  first_name: z
    .string()
    .min(1, "Le prénom est requis")
    .max(50)
    .regex(NAME_REGEX, "Caractères invalides")
    .optional()
    .nullable(),
  last_name: z
    .string()
    .min(1, "Le nom est requis")
    .max(50)
    .regex(NAME_REGEX, "Caractères invalides")
    .optional()
    .nullable(),
  full_name: z.string().max(100).optional().nullable(),
  relationship: z.string().min(1, "La relation est requise").max(50),
  phone: z
    .string()
    .regex(PHONE_REGEX, "Le numéro doit être au format +221XXXXXXXXX")
    .optional()
    .nullable()
    .or(z.literal("")),
  phone_2: z
    .string()
    .regex(PHONE_REGEX, "Le numéro doit être au format +221XXXXXXXXX")
    .optional()
    .nullable()
    .or(z.literal("")),
  email: z.string().email("Adresse email invalide").optional().nullable().or(z.literal("")),
  occupation: z.string().max(100).optional().nullable(),
});

// ============================================================================
// STUDENT BAC INFO VALIDATIONS
// ============================================================================

export const StudentBacInfoSchema = z.object({
  serie: z.string().min(1, "La série est requise").max(20),
  year_of_bac: z
    .number({ error: "L'année est requise" })
    .int()
    .min(1950, "Année invalide")
    .max(new Date().getFullYear(), "Année invalide"),
  bac_mention: z.string().max(50).optional().nullable(),
  bac_institution: z.string().max(200).optional().nullable(),
  average_first_session: z
    .number()
    .min(0)
    .max(20, "La moyenne ne peut pas dépasser 20")
    .optional()
    .nullable(),
  average_second_session: z
    .number()
    .min(0)
    .max(20, "La moyenne ne peut pas dépasser 20")
    .optional()
    .nullable(),
});

// ============================================================================
// ADDRESS VALIDATIONS
// ============================================================================

export const AddressSchema = z.object({
  type: z.nativeEnum(AddressType),
  street: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
});

// ============================================================================
// SOCIAL PROFILE VALIDATIONS
// ============================================================================

export const SocialProfileSchema = z.object({
  platform: z.string().min(1, "La plateforme est requise").max(50),
  url: z.string().url("URL invalide").max(500),
});

// Export type inference helpers
export type StudentFormData = z.infer<typeof StudentSchema>;
export type CourseFormData = z.input<typeof CourseSchema>;
export type EnrollmentFormData = z.infer<typeof EnrollmentSchema>;
export type GradeFormData = z.input<typeof GradeSchema>;
export type FacultyFormData = z.input<typeof FacultySchema>;
export type DepartmentFormData = z.input<typeof DepartmentSchema>;
export type ProgrammeFormData = z.input<typeof ProgrammeSchema>;
export type EvaluationFormData = z.input<typeof EvaluationSchema>;
export type GuardianFormData = z.infer<typeof GuardianSchema>;
export type StudentBacInfoFormData = z.infer<typeof StudentBacInfoSchema>;
export type AddressFormData = z.infer<typeof AddressSchema>;
export type SocialProfileFormData = z.infer<typeof SocialProfileSchema>;
