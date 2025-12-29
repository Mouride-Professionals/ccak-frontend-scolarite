/**
 * Enrollment Module Types
 * Based on UML diagram for CCAK academic management system
 */

// =====================
// ENUMS
// =====================

export enum EnrollmentStatus {
  PENDING = "PENDING",
  REGISTERED = "REGISTERED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  WITHDRAWN = "WITHDRAWN",
}

export enum StudentStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  GRADUATED = "GRADUATED",
  WITHDRAWN = "WITHDRAWN",
  EXPELLED = "EXPELLED",
}

export enum Gender {
  M = "M",
  F = "F",
}

// =====================
// INTERFACES
// =====================

/**
 * Enrollment
 * Represents a student enrollment in a specific program, year, and semester
 */
export interface Enrollment {
  id: string;
  student_id: string;
  academic_program_id: string;
  academic_year_id: string;
  current_semester: number;
  status: EnrollmentStatus;
  enrollment_date: string; // ISO date string
  registration_fee_paid: number;
  is_scholarship: boolean;
  created_at: string;
  updated_at: string;

  // Populated relations (optional, for joined queries)
  student?: {
    id: string;
    student_number: string;
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
}

/**
 * Student (full schema)
 */
export interface Student {
  id: string;
  user_id: string;
  student_number: string;
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
  current_semester: number;
  enrollment_date: string;
  registration_fee_paid: number;
  is_scholarship: boolean;
  status?: EnrollmentStatus;
}

export interface UpdateEnrollmentInput extends Partial<CreateEnrollmentInput> {
  status?: EnrollmentStatus;
}

// =====================
// FILTERS & QUERIES
// =====================

export interface EnrollmentFilters {
  student_id?: string;
  academic_program_id?: string;
  academic_year_id?: string;
  current_semester?: number;
  status?: EnrollmentStatus;
  is_scholarship?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// =====================
// API RESPONSES
// =====================

/**
 * Enrollment List Item (simplified for list view)
 * Backend will format and return only these fields for the list
 */
export interface EnrollmentListItem {
  id: string;
  student_number: string; // from Student
  full_name: string; // from Student
  academic_year_name: string; // from AcademicYear.name
  current_semester: number; // from Enrollment
  enrollment_date: string; // from Enrollment (ISO date string)
}

/**
 * Enrollments List Response
 */
export interface EnrollmentsResponse {
  data: Enrollment[]; // For list view, backend should return EnrollmentListItem[]
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
