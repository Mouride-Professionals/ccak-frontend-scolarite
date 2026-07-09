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
      student_number: string | null;
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
  prerequisites?: string[];
  capacity?: number;
  enrolled_count?: number;
}

export interface CourseAvailability {
  course_id: string;
  is_available: boolean;
  remaining_seats: number | null;
  total_seats: number | null;
  enrolled_count: number | null;
  message?: string;
}

export interface ProgramAvailableCoursesInput {
  academic_year_id?: string;
  semester: number;
  student_id?: string;
  search?: string;
}

export interface ProgramAvailableCoursesResponse {
  program: {
    id: string;
    name: string;
    level: string;
  };
  academic_year_id: string;
  semester: number;
  courses: Course[];
  total_available: number;
}

export interface CourseEnrollmentMatrixCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  course_unit_id: string;
  course_unit_code: string | null;
  course_unit_name: string | null;
}

export interface CourseEnrollmentMatrixEnrollment {
  id: string;
  student_id: string;
  student_number: string | null;
  student_name: string | null;
  status: string;
}

export interface CourseEnrollmentMatrixCell {
  enrollment_id: string;
  course_id: string;
  course_enrollment_id: string | null;
  checked: boolean;
  status: CourseEnrollmentStatus | null;
  locked: boolean;
  lock_reason: string | null;
  has_grades: boolean;
}

export interface CourseEnrollmentMatrix {
  program: {
    id: string;
    name: string;
    level: string;
  };
  academic_year: {
    id: string;
    name: string;
    status: string | null;
    is_current: boolean;
  };
  semester: number;
  is_read_only: boolean;
  read_only_reason: string | null;
  courses: CourseEnrollmentMatrixCourse[];
  enrollments: CourseEnrollmentMatrixEnrollment[];
  cells: CourseEnrollmentMatrixCell[];
}

export interface CourseEnrollmentMatrixFilters {
  academic_year_id: string;
  semester: number;
  status?: string;
  search?: string;
}

export interface SaveCourseEnrollmentMatrixInput {
  academic_year_id: string;
  semester: number;
  enrollment_date?: string;
  creates: Array<{
    enrollment_id: string;
    course_id: string;
  }>;
  drops: Array<{
    course_enrollment_id: string;
  }>;
}

export interface SaveCourseEnrollmentMatrixResult {
  created: number;
  reactivated: number;
  dropped: number;
  skipped: number;
  errors: Array<{
    index: number;
    action: "create" | "drop";
    message: string;
  }>;
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
  student_number: string | null; // from Enrollment.Student
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
