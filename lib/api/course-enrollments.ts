/**
 * Course Enrollments API Service
 * Handles all API calls related to student course enrollments
 */

import { api } from "@/lib/api-client";
import type {
  CourseEnrollment,
  CourseEnrollmentsResponse,
  CourseEnrollmentFilters,
  CreateCourseEnrollmentInput,
  UpdateCourseEnrollmentInput,
  Course,
} from "@/types/course-enrollment";
import { CourseEnrollmentStatus } from "@/types/course-enrollment";
import type { AcademicYear } from "@/types/enrollment";

// Mock data for courses
const mockCourses: Course[] = [
  {
    id: "course-1",
    code: "INF101",
    name: "Introduction à la Programmation",
    credits: 3,
    description: "Cours d'introduction à la programmation avec Python",
  },
  {
    id: "course-2",
    code: "MAT101",
    name: "Mathématiques pour l'Informatique",
    credits: 4,
    description: "Algèbre linéaire et mathématiques discrètes",
  },
  {
    id: "course-3",
    code: "INF102",
    name: "Structures de Données",
    credits: 3,
    description: "Étude des structures de données fondamentales",
  },
  {
    id: "course-4",
    code: "INF201",
    name: "Bases de Données",
    credits: 3,
    description: "Conception et gestion de bases de données relationnelles",
  },
  {
    id: "course-5",
    code: "INF202",
    name: "Développement Web",
    credits: 4,
    description: "HTML, CSS, JavaScript et frameworks modernes",
  },
];

const mockAcademicYears: AcademicYear[] = [
  {
    id: "year-1",
    name: "2024-2025",
    start_date: "2024-09-01",
    end_date: "2025-06-30",
    is_current: true,
  },
  {
    id: "year-2",
    name: "2023-2024",
    start_date: "2023-09-01",
    end_date: "2024-06-30",
    is_current: false,
  },
];

const mockCourseEnrollments: CourseEnrollment[] = [
  {
    id: "course-enroll-1",
    enrollment_id: "enroll-1",
    course_id: "course-1",
    academic_year_id: "year-1",
    semester: 1,
    status: CourseEnrollmentStatus.ENROLLED,
    enrollment_date: "2024-09-20",
    created_at: "2024-09-20T10:00:00Z",
    updated_at: "2024-09-20T10:00:00Z",
    enrollment: {
      id: "enroll-1",
      student_id: "student-1",
      student: {
        id: "student-1",
        student_number: "UCAK2024001",
        full_name: "Aminata Diallo",
      },
    },
    course: mockCourses[0],
    academic_year: mockAcademicYears[0],
  },
  {
    id: "course-enroll-2",
    enrollment_id: "enroll-1",
    course_id: "course-2",
    academic_year_id: "year-1",
    semester: 1,
    status: CourseEnrollmentStatus.ENROLLED,
    enrollment_date: "2024-09-20",
    created_at: "2024-09-20T10:00:00Z",
    updated_at: "2024-09-20T10:00:00Z",
    enrollment: {
      id: "enroll-1",
      student_id: "student-1",
      student: {
        id: "student-1",
        student_number: "UCAK2024001",
        full_name: "Aminata Diallo",
      },
    },
    course: mockCourses[1],
    academic_year: mockAcademicYears[0],
  },
  {
    id: "course-enroll-3",
    enrollment_id: "enroll-2",
    course_id: "course-4",
    academic_year_id: "year-1",
    semester: 1,
    status: CourseEnrollmentStatus.ENROLLED,
    enrollment_date: "2024-09-21",
    created_at: "2024-09-21T11:00:00Z",
    updated_at: "2024-09-21T11:00:00Z",
    enrollment: {
      id: "enroll-2",
      student_id: "student-2",
      student: {
        id: "student-2",
        student_number: "UCAK2024002",
        full_name: "Ibrahima Sarr",
      },
    },
    course: mockCourses[3],
    academic_year: mockAcademicYears[0],
  },
  {
    id: "course-enroll-4",
    enrollment_id: "enroll-3",
    course_id: "course-3",
    academic_year_id: "year-1",
    semester: 2,
    status: CourseEnrollmentStatus.COMPLETED,
    enrollment_date: "2024-09-22",
    created_at: "2024-09-22T12:00:00Z",
    updated_at: "2024-12-15T10:00:00Z",
    enrollment: {
      id: "enroll-3",
      student_id: "student-3",
      student: {
        id: "student-3",
        student_number: "UCAK2024003",
        full_name: "Fatou Ndiaye",
      },
    },
    course: mockCourses[2],
    academic_year: mockAcademicYears[0],
  },
];

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true;

/**
 * Simulate API delay for realistic testing
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all course enrollments with optional filters
 */
export async function getCourseEnrollments(
  filters?: CourseEnrollmentFilters
): Promise<CourseEnrollmentsResponse> {
  if (USE_MOCK_DATA) {
    await delay(500);

    let filtered = [...mockCourseEnrollments];

    // Apply filters
    if (filters?.enrollment_id) {
      filtered = filtered.filter((e) => e.enrollment_id === filters.enrollment_id);
    }
    if (filters?.course_id) {
      filtered = filtered.filter((e) => e.course_id === filters.course_id);
    }
    if (filters?.academic_year_id) {
      filtered = filtered.filter((e) => e.academic_year_id === filters.academic_year_id);
    }
    if (filters?.semester) {
      filtered = filtered.filter((e) => e.semester === filters.semester);
    }
    if (filters?.status) {
      filtered = filtered.filter((e) => e.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.enrollment?.student?.full_name.toLowerCase().includes(searchLower) ||
          e.enrollment?.student?.student_number.toLowerCase().includes(searchLower) ||
          e.course?.name.toLowerCase().includes(searchLower) ||
          e.course?.code.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const total = filtered.length;
    const total_pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = filtered.slice(start, end);

    return { data, total, page, limit, total_pages };
  }

  // Real API call (when backend is ready)
  const queryParams = new URLSearchParams();
  if (filters?.enrollment_id) queryParams.set("enrollment_id", filters.enrollment_id);
  if (filters?.course_id) queryParams.set("course_id", filters.course_id);
  if (filters?.academic_year_id) queryParams.set("academic_year_id", filters.academic_year_id);
  if (filters?.semester) queryParams.set("semester", filters.semester.toString());
  if (filters?.status) queryParams.set("status", filters.status);
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  return api.get<CourseEnrollmentsResponse>(`/course-enrollments?${queryParams.toString()}`);
}

/**
 * Get a single course enrollment by ID
 */
export async function getCourseEnrollment(id: string): Promise<CourseEnrollment> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const enrollment = mockCourseEnrollments.find((e) => e.id === id);
    if (!enrollment) {
      throw new Error(`Course enrollment not found: ${id}`);
    }
    return enrollment;
  }

  return api.get<CourseEnrollment>(`/course-enrollments/${id}`);
}

/**
 * Create a new course enrollment
 */
export async function createCourseEnrollment(
  input: CreateCourseEnrollmentInput
): Promise<CourseEnrollment> {
  if (USE_MOCK_DATA) {
    await delay(800);

    // Find related data
    const course = mockCourses.find((c) => c.id === input.course_id);
    const year = mockAcademicYears.find((y) => y.id === input.academic_year_id);

    const newEnrollment: CourseEnrollment = {
      id: `course-enroll-${Date.now()}`,
      ...input,
      status: input.status || CourseEnrollmentStatus.ENROLLED,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      course: course,
      academic_year: year,
    };

    // Add to mock data (in-memory only)
    mockCourseEnrollments.unshift(newEnrollment);

    return newEnrollment;
  }

  return api.post<CourseEnrollment>(
    "/course-enrollments",
    input as unknown as Record<string, unknown>
  );
}

/**
 * Update an existing course enrollment
 */
export async function updateCourseEnrollment(
  id: string,
  input: UpdateCourseEnrollmentInput
): Promise<CourseEnrollment> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const index = mockCourseEnrollments.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Course enrollment not found: ${id}`);
    }

    const updated: CourseEnrollment = {
      ...mockCourseEnrollments[index],
      ...input,
      updated_at: new Date().toISOString(),
    };

    mockCourseEnrollments[index] = updated;
    return updated;
  }

  return api.put<CourseEnrollment>(
    `/course-enrollments/${id}`,
    input as unknown as Record<string, unknown>
  );
}

/**
 * Delete a course enrollment
 */
export async function deleteCourseEnrollment(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const index = mockCourseEnrollments.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Course enrollment not found: ${id}`);
    }

    mockCourseEnrollments.splice(index, 1);
    return;
  }

  return api.del<void>(`/course-enrollments/${id}`);
}

/**
 * Change the status of a course enrollment
 */
export async function updateCourseEnrollmentStatus(
  id: string,
  status: CourseEnrollment["status"]
): Promise<CourseEnrollment> {
  return updateCourseEnrollment(id, { status });
}

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Get all courses (for form selects)
 */
export async function getCourses(): Promise<Course[]> {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockCourses;
  }
  return api.get("/courses");
}

/**
 * Get all academic years (for form selects)
 */
export async function getAcademicYears(): Promise<AcademicYear[]> {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockAcademicYears;
  }
  return api.get("/academic-years");
}
