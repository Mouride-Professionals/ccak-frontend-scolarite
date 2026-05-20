/**
 * Enrollment Module Types
 * Based on API_Data_Models_FULL_FINAL.pdf
 */

import type { Gender, StudentStatus } from "@/types/student";

// =====================
// ENUMS
// =====================

export enum RegistrationStatus {
  DRAFT = "DRAFT",
  PENDING_VALIDATION = "PENDING_VALIDATION",
  VALIDATED = "VALIDATED",
  SUSPENDED = "SUSPENDED",
  CANCELLED = "CANCELLED",
}

// =====================
// INTERFACES
// =====================

/**
 * Enrollment (Inscription)
 * Represents a student registration in a specific program for an academic year
 */
export interface Enrollment {
  id: string;
  student_id: string;
  academic_program_id: string;
  academic_year_id: string;
  level_id: string | null;
  current_semester: number;
  status: RegistrationStatus;
  enrollment_date: string;
  registration_number: string | null;
  registration_fee_paid: number;
  is_scholarship_holder: boolean;
  scholarship_type: string | null;
  scholarship_amount: number | null;
  notes: string | null;
  is_repeating: boolean;
  is_medically_fit: boolean;
  is_registered_elsewhere: boolean;
  is_willing_to_cancel_other_registration: boolean;
  certification_file_url: string | null;
  created_at: string;
  updated_at: string;

  // Populated relations (optional, for joined queries)
  student?: {
    id: string;
    student_number: string | null;
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
  };
  academic_program?: {
    id: string;
    name: string;
    level: string;
  };
  academic_year?: {
    id: string;
    name: string;
    is_current: boolean;
  };
  level?: {
    id: string;
    name: string;
    code: string;
  };
}

/**
 * Academic Program (simplified for enrollments)
 */
export interface AcademicProgram {
  id: string;
  name: string;
  level: string;
  duration_years: number;
}

/**
 * Academic Year (simplified for enrollments)
 */
export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

// =====================
// FORM TYPES
// =====================

export interface CreateEnrollmentInput {
  student_id: string;
  academic_program_id: string;
  academic_year_id: string;
  level_id?: string | null;
  current_semester: number;
  enrollment_date: string;
  registration_fee_paid: number;
  is_scholarship_holder: boolean;
  scholarship_type?: string | null;
  scholarship_amount?: number | null;
  notes?: string | null;
  is_repeating?: boolean;
  is_medically_fit?: boolean;
  is_registered_elsewhere?: boolean;
  is_willing_to_cancel_other_registration?: boolean;
  status?: RegistrationStatus;
}

export interface UpdateEnrollmentInput extends Partial<CreateEnrollmentInput> {
  status?: RegistrationStatus;
}

// =====================
// FILTERS & QUERIES
// =====================

export interface EnrollmentFilters {
  student_id?: string;
  academic_program_id?: string;
  academic_year_id?: string;
  level_id?: string;
  current_semester?: number;
  status?: RegistrationStatus;
  is_scholarship_holder?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// =====================
// API RESPONSES
// =====================

/**
 * Enrollment List Item (simplified for list view)
 */
export interface EnrollmentListItem {
  id: string;
  student_number: string | null;
  full_name: string;
  academic_year_name: string;
  current_semester: number;
  enrollment_date: string;
}

/**
 * Enrollments List Response
 */
export interface EnrollmentsResponse {
  data: Enrollment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
