/**
 * Academic Structure Types
 * Based on UML diagram for CCAK academic management system
 */

import type { Department as DepartmentType } from "./department";

// =====================
// ENUMS
// =====================

export enum AcademicLevel {
  LICENCE = "LICENCE",
  MASTER = "MASTER",
  DOCTORAT = "DOCTORAT",
}

export enum CourseType {
  OBLIGATOIRE = "OBLIGATOIRE",
  OPTIONNEL = "OPTIONNEL",
}

export enum FacultyRank {
  PROFESSEUR = "PROFESSEUR",
  MAITRE_CONF = "MAITRE_CONF",
  MAITRE_ASS = "MAITRE_ASS",
  ASSISTANT = "ASSISTANT",
  VACATAIRE = "VACATAIRE",
}

// =====================
// INTERFACES
// =====================

/**
 * Academic Year
 */
export interface AcademicYear {
  id: string;
  name: string; // Ex: "2024-2025"
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Faculty (Faculté)
 */
export interface Faculty {
  id: string;
  name: string; // Ex: "Faculté des Sciences"
  code: string; // Ex: "FST"
  description: string;
  dean_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type Department = DepartmentType;

/**
 * Academic Program (Programme académique)
 */
export interface AcademicProgram {
  id: string;
  department_id: string;
  name: string; // Ex: "Licence Informatique"
  level: AcademicLevel;
  duration_semesters: number;
  total_credits_required: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  department?: Department;
}

/**
 * Faculty Member (Enseignant)
 */
export interface FacultyMember {
  id: string;
  user_id: string;
  staff_number: string;
  full_name: string;
  phone: string;
  address: string;
  department_id: string;
  rank: FacultyRank;
  contract_type: string;
  hire_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  department?: Department;
}

/**
 * Course Unit (Unité d'enseignement)
 */
export interface CourseUnit {
  id: string;
  academic_program_id: string;
  code: string;
  name: string;
  semester_number: number;
  credits: number;
  type: CourseType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Course (Cours/Matière)
 */
export interface Course {
  id: string;
  course_unit_id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  hours_lecture: number;
  hours_td: number;
  hours_tp: number;
  coefficient: number;
  prerequisites: string[]; // Array of course IDs
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  course_unit?: CourseUnit;
}
