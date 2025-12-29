/**
 * Course Enrollment Module Types
 * Based on UML diagram for CCAK academic management system
 */

// =====================
// ENUMS
// =====================

export enum CourseEnrollmentStatus {
  ENROLLED = "ENROLLED",
  DROPPED = "DROPPED",
  COMPLETED = "COMPLETED",
}

// =====================
// INTERFACES
// =====================

/**
 * Course Enrollment
 * Represents a student enrollment in a specific course for a semester
 */
export interface CourseEnrollment {
  id: string;
  enrollment_id: string; // Reference to program enrollment
  course_id: string;
  academic_year_id: string;
  semester: number;
  status: CourseEnrollmentStatus;
  enrollment_date: string; // ISO date string
  created_at: string;
  updated_at: string;

  // Populated relations (optional, for joined queries)
  enrollment?: {
    id: string;
    student_id: string;
    student?: {
      id: string;
      student_number: string;
      full_name: string;
    };
  };
  course?: {
    id: string;
    code: string;
    name: string;
    credits: number;
  };
  academic_year?: {
    id: string;
    name: string;
    is_current: boolean;
  };
}

/**
 * Course (simplified for course enrollments)
 */
export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  description?: string;
}

// =====================
// FORM TYPES
// =====================

export interface CreateCourseEnrollmentInput {
  enrollment_id: string;
  course_id: string;
  academic_year_id: string;
  semester: number;
  enrollment_date: string;
  status?: CourseEnrollmentStatus;
}

export interface UpdateCourseEnrollmentInput extends Partial<CreateCourseEnrollmentInput> {
  status?: CourseEnrollmentStatus;
}

// =====================
// FILTERS & QUERIES
// =====================

export interface CourseEnrollmentFilters {
  enrollment_id?: string;
  course_id?: string;
  academic_year_id?: string;
  semester?: number;
  status?: CourseEnrollmentStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// =====================
// API RESPONSES
// =====================

/**
 * Course Enrollment List Item (simplified for list view)
 */
export interface CourseEnrollmentListItem {
  id: string;
  student_number: string; // from Enrollment.Student
  full_name: string; // from Enrollment.Student
  course_code: string; // from Course
  course_name: string; // from Course
  semester: number; // from CourseEnrollment
  enrollment_date: string; // from CourseEnrollment (ISO date string)
  status: CourseEnrollmentStatus; // from CourseEnrollment
}

/**
 * Course Enrollments List Response
 */
export interface CourseEnrollmentsResponse {
  data: CourseEnrollment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
