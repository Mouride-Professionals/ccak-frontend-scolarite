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
