/**
 * Security: Centralized validation schemas using Zod
 * Prevents XSS, injection attacks, and ensures data integrity
 */

import { z } from "zod";
import { Gender } from "@/types/student";
import { EnrollmentStatus } from "@/types/enrollment";

// Common validation patterns
const PHONE_REGEX = /^\+221\d{9}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;
const CODE_REGEX = /^[A-Z0-9-]+$/;

// ============================================================================
// STUDENT VALIDATIONS
// ============================================================================

export const StudentSchema = z.object({
  full_name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(NAME_REGEX, "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets"),
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
    .number()
    .int("Les crédits doivent être un nombre entier")
    .min(1, "Les crédits doivent être au moins 1")
    .max(30, "Les crédits ne peuvent pas dépasser 30"),
  hours_lecture: z.number().int().min(0, "Les heures doivent être positives").max(200),
  hours_td: z.number().int().min(0, "Les heures doivent être positives").max(200),
  hours_tp: z.number().int().min(0, "Les heures doivent être positives").max(200),
  coefficient: z.number().min(0, "Le coefficient doit être positif").max(10),
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
  current_semester: z
    .number()
    .int("Le semestre doit être un nombre entier")
    .min(1, "Le semestre doit être compris entre 1 et 6")
    .max(6, "Le semestre doit être compris entre 1 et 6"),
  enrollment_date: z.string().min(1, "La date d'inscription est requise"),
  registration_fee_paid: z
    .number()
    .min(0, "Les frais d'inscription ne peuvent pas être négatifs"),
  is_scholarship: z.boolean().default(false),
  status: z.nativeEnum(EnrollmentStatus).default(EnrollmentStatus.PENDING),
});

// ============================================================================
// GRADE VALIDATIONS
// ============================================================================

export const GradeSchema = z
  .object({
    student_id: z.string().min(1, "L'étudiant est requis"),
    course_id: z.string().min(1, "Le cours est requis"),
    type: z.string().min(1, "Le type d'évaluation est requis"),
    score: z.number().min(0, "La note ne peut pas être négative"),
    max_score: z.number().min(1, "La note maximale doit être positive"),
    weight: z
      .number()
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
  name: z.string().min(1, "Le nom est requis").max(200),
  code: z
    .string()
    .min(2, "Le code doit contenir au moins 2 caractères")
    .max(20)
    .regex(CODE_REGEX, "Le code ne peut contenir que des lettres majuscules, chiffres et tirets"),
  dean_id: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

// ============================================================================
// DEPARTMENT VALIDATIONS
// ============================================================================

export const DepartmentSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200),
  code: z
    .string()
    .min(2, "Le code doit contenir au moins 2 caractères")
    .max(20)
    .regex(CODE_REGEX, "Le code ne peut contenir que des lettres majuscules, chiffres et tirets"),
  faculty_id: z.string().min(1, "La faculté est requise"),
  head_id: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

// ============================================================================
// PROGRAMME VALIDATIONS
// ============================================================================

export const ProgrammeSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200),
  code: z
    .string()
    .min(2, "Le code doit contenir au moins 2 caractères")
    .max(20)
    .regex(CODE_REGEX, "Le code ne peut contenir que des lettres majuscules, chiffres et tirets"),
  department_id: z.string().min(1, "Le département est requis"),
  level: z.enum(["L1", "L2", "L3", "M1", "M2", "D"]),
  duration_years: z.number().int().min(1).max(10),
  total_credits: z.number().int().min(1).max(500),
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
  duration_minutes: z.number().int().min(1).max(600),
  total_marks: z.number().min(1).max(100),
});

// Export type inference helpers
export type StudentFormData = z.infer<typeof StudentSchema>;
export type CourseFormData = z.infer<typeof CourseSchema>;
export type EnrollmentFormData = z.infer<typeof EnrollmentSchema>;
export type GradeFormData = z.infer<typeof GradeSchema>;
export type FacultyFormData = z.infer<typeof FacultySchema>;
export type DepartmentFormData = z.infer<typeof DepartmentSchema>;
export type ProgrammeFormData = z.infer<typeof ProgrammeSchema>;
export type EvaluationFormData = z.infer<typeof EvaluationSchema>;
