/**
 * Student Types
 * Based on API_Data_Models_FULL_FINAL.pdf
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
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  GRADUATED = "GRADUATED",
  WITHDRAWN = "WITHDRAWN",
  EXPELLED = "EXPELLED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
}

export enum IDType {
  PASSPORT = "PASSPORT",
  NATIONAL_ID = "NATIONAL_ID",
  DRIVING_LICENSE = "DRIVING_LICENSE",
  OTHER = "OTHER",
}

export enum AddressType {
  HOME = "HOME",
  UNIVERSITY_CITY = "UNIVERSITY_CITY",
  WORK = "WORK",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  FULLY_PAID = "FULLY_PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export enum Provenance {
  ETAT = "ETAT",
  PLATEFORME = "PLATEFORME",
}

// Kept for backward compatibility with mock data
export enum GuardianRelationship {
  FATHER = "FATHER",
  MOTHER = "MOTHER",
  GUARDIAN = "GUARDIAN",
}

// =====================
// NEW INTERFACES
// =====================

export interface Address {
  id: string;
  addressable_type: string;
  addressable_id: string;
  type: AddressType;
  street: string | null;
  city: string | null;
  region: string | null;
  department: string | null;
  country: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialProfile {
  id: string;
  profilable_type: string;
  profilable_id: string;
  family_status: string | null;
  number_of_children: number | null;
  is_employed: boolean | null;
  socio_professional_category: string | null;
  student_regime: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentBacInfo {
  id: string;
  student_id: string;
  serie: string;
  year_of_bac: number;
  bac_result_id: string | null;
  first_round_average: number | null;
  second_round_average: number | null;
  bac_mention: string | null;
  bac_institution: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriorDiploma {
  id: string;
  diplomable_type: string;
  diplomable_id: string;
  name: string;
  year: number | null;
  mention: string | null;
  institution: string | null;
  created_at: string;
  updated_at: string;
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
  student_number: string | null;
  registration_number: string | null;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  ine: string | null;
  provenance: Provenance | null;
  gender: Gender;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  phone: string;
  phone_2: string | null;
  email: string | null;
  email_university: string | null;
  type_of_id: IDType | null;
  id_details: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address: string;
  photo_url: string | null;
  status: StudentStatus;
  // Relations
  bac_info?: StudentBacInfo | null;
  addresses?: Address[];
  social_profile?: SocialProfile | null;
  prior_diplomas?: PriorDiploma[];
  created_at: string;
  updated_at: string;
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
  first_name: string;
  last_name: string;
  ine?: string | null;
  registration_number?: string | null;
  provenance?: Provenance | null;
  gender: Gender;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  phone: string;
  phone_2?: string | null;
  email?: string | null;
  email_university?: string | null;
  type_of_id?: IDType | null;
  id_details?: string | null;
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

export interface Guardian {
  id: string;
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  relationship: string;
  phone: string;
  phone_2: string | null;
  email: string;
  address: string;
  occupation: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGuardianInput {
  student_id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name: string;
  relationship: string;
  phone: string;
  phone_2?: string | null;
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

export interface CreateStudentBacInfoInput {
  student_id: string;
  serie: string;
  year_of_bac: number;
  bac_mention?: string | null;
  bac_institution?: string | null;
  first_round_average?: number | null;
  second_round_average?: number | null;
  [key: string]: unknown;
}

export interface CreatePriorDiplomaInput {
  student_id: string;
  name: string;
  year?: number | null;
  mention?: string | null;
  institution?: string | null;
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
