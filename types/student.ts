/**
 * Student Types
 * Based on UML diagram for CCAK academic management system
 */

// =====================
// ENUMS
// =====================

export enum Gender {
  M = "M",
  F = "F",
}

export enum StudentStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  GRADUATED = "GRADUATED",
  WITHDRAWN = "WITHDRAWN",
  EXPELLED = "EXPELLED",
}

export enum EnrollmentStatus {
  PENDING = "PENDING",
  REGISTERED = "REGISTERED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  WITHDRAWN = "WITHDRAWN",
}

// =====================
// INTERFACES
// =====================

/**
 * Student
 */
export interface Student {
  id: string;
  user_id: string;
  student_number: string; // Ex: "UCAK2024001"
  full_name: string;
  gender: Gender;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address: string;
  photo_url: string | null;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Enrollment (Inscription)
 */
export interface Enrollment {
  id: string;
  student_id: string;
  academic_program_id: string;
  academic_year_id: string;
  current_semester: number;
  status: EnrollmentStatus;
  enrollment_date: string;
  registration_fee_paid: number;
  is_scholarship: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  student?: Student;
  academic_program?: {
    id: string;
    name: string;
    level: string;
  };
  academic_year?: {
    id: string;
    name: string;
  };
}

/**
 * Semester Result
 */
export interface SemesterResult {
  id: string;
  student_id: string;
  academic_year_id: string;
  semester: number;
  total_credits_enrolled: number;
  total_credits_earned: number;
  semester_average: number;
  semester_gpa: number;
  decision: string;
  calculated_by: string | null;
  calculated_at: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  student?: Student;
}

// =====================
// FORM TYPES
// =====================

export interface CreateStudentInput {
  full_name: string;
  gender: Gender;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address: string;
  documents?: File[];
  [key: string]: unknown;
}

export interface UpdateStudentInput extends Partial<CreateStudentInput> {
  status?: StudentStatus;
  [key: string]: unknown;
}

// =====================
// FILTERS & QUERIES
// =====================

export interface StudentFilters {
  status?: StudentStatus;
  gender?: Gender;
  search?: string;
  page?: number;
  limit?: number;
}

// =====================
// GUARDIAN TYPES
// =====================

export enum GuardianRelationship {
  FATHER = "FATHER",
  MOTHER = "MOTHER",
  GUARDIAN = "GUARDIAN",
}

export interface Guardian {
  id: string;
  student_id: string;
  full_name: string;
  relationship: GuardianRelationship;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGuardianInput {
  student_id: string;
  full_name: string;
  relationship: GuardianRelationship;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  [key: string]: unknown;
}

export interface UpdateGuardianInput extends Partial<CreateGuardianInput> {
  [key: string]: unknown;
}

export interface GuardiansResponse {
  data: Guardian[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// =====================
// DOCUMENT TYPES
// =====================

export enum DocumentType {
  ATTESTATION = "ATTESTATION",
  CNI = "CNI",
  BIRTH_CERT = "BIRTH_CERT",
  BAC_DIPLOMA = "BAC_DIPLOMA",
  TRANSCRIPT = "TRANSCRIPT",
  PHOTO = "PHOTO",
  MEDICAL = "MEDICAL",
}

export enum DocumentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface Document {
  id: string;
  student_id: string;
  type: DocumentType;
  file_path: string;
  file_name: string;
  status: DocumentStatus;
  reviewed_by?: string;
  notes?: string;
  uploaded_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;

  // Relations
  reviewer?: {
    id: string;
    full_name: string;
  };
}

export interface CreateDocumentInput {
  student_id: string;
  type: DocumentType;
  document: File;
  notes?: string;
  [key: string]: unknown;
}

export interface UpdateDocumentInput extends Partial<CreateDocumentInput> {
  status?: DocumentStatus;
  reviewed_by?: string;
  notes?: string;
  reviewed_at?: string;
  [key: string]: unknown;
}

export interface DocumentsResponse {
  data: Document[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// =====================
// ADMIN TYPES
// =====================

export interface Admin {
  id: string;
  full_name: string;
}

// =====================
// API RESPONSES
// =====================

export interface StudentsResponse {
  data: Student[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
