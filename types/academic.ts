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

export enum FacultyContractType {
  PERMANENT = "PERMANENT",
  TEMPORARY = "TEMPORARY",
  VACATAIRE = "VACATAIRE",
}

export enum FacultyDocumentType {
  CV = "CV",
  DIPLOMA = "DIPLOMA",
  CNI = "CNI",
  OTHER = "OTHER",
}

export enum FacultyDocumentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum FacultyContractStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
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
  contract_type: FacultyContractType | string;
  hire_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  department?: Department;
}

export interface FacultyDocument {
  id: string;
  faculty_member_id: string;
  type: FacultyDocumentType;
  status: FacultyDocumentStatus;
  file_path: string;
  reviewed_by?: string | null;
  created_at: string;
}

export interface FacultyContract {
  id: string;
  faculty_member_id: string;
  contract_type: FacultyContractType | string;
  start_date: string;
  end_date?: string | null;
  salary?: number | null;
  status: FacultyContractStatus;
  is_current: boolean;
  file_path?: string | null;
  created_at: string;
}

export interface FacultyMemberFilters {
  page?: number;
  limit?: number;
  search?: string;
  department_id?: string;
  rank?: FacultyRank;
  contract_type?: FacultyContractType | string;
  is_active?: boolean;
}

export interface FacultyMembersResponse {
  data: FacultyMember[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateFacultyMemberInput {
  full_name: string;
  email?: string;
  phone: string;
  address?: string;
  department_id: string;
  rank: FacultyRank;
  contract_type: FacultyContractType | string;
  hire_date: string;
  salary?: number | null;
  contract_start?: string;
  contract_end?: string | null;
  contract_terms?: string;
  is_active?: boolean;
}

export type UpdateFacultyMemberInput = Partial<CreateFacultyMemberInput>;

export interface CreateFacultyDocumentInput {
  type: FacultyDocumentType;
  document: File;
}

export interface CreateFacultyContractInput {
  contract_type: FacultyContractType | string;
  start_date: string;
  end_date?: string | null;
  salary?: number | null;
  is_current?: boolean;
  file?: File | null;
}

export interface FacultyWorkload {
  total_hours: number;
  assigned_courses: number;
  overload_hours: number;
  breakdown: Array<{
    label: string;
    value: number;
  }>;
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
