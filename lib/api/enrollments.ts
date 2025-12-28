/**
 * Enrollments API Service
 * Handles all API calls related to student enrollments
 */

import { api } from "@/lib/api-client";
import type {
  Enrollment,
  EnrollmentsResponse,
  EnrollmentFilters,
  CreateEnrollmentInput,
  UpdateEnrollmentInput,
  Student,
  AcademicProgram,
  AcademicYear,
} from "@/types/enrollment";
import { EnrollmentStatus } from "@/types/enrollment";

// Mock data
const mockStudents: Student[] = [
  {
    id: "student-1",
    user_id: "user-1",
    student_number: "UCAK2024001",
    full_name: "Aminata Diallo",
    gender: "F" as const,
    date_of_birth: "2002-05-15",
    place_of_birth: "Dakar",
    nationality: "Sénégalaise",
    phone: "+221 77 123 4567",
    emergency_contact_name: "Ousmane Diallo",
    emergency_contact_phone: "+221 77 234 5678",
    address: "Liberté 6, Dakar",
    photo_url: null,
    status: "ACTIVE" as const,
    created_at: "2024-09-01T10:00:00Z",
    updated_at: "2024-09-01T10:00:00Z",
  },
  {
    id: "student-2",
    user_id: "user-2",
    student_number: "UCAK2024002",
    full_name: "Ibrahima Sarr",
    gender: "M" as const,
    date_of_birth: "2003-03-20",
    place_of_birth: "Thiès",
    nationality: "Sénégalais",
    phone: "+221 78 123 4567",
    emergency_contact_name: "Fatou Sarr",
    emergency_contact_phone: "+221 78 234 5678",
    address: "Plateau, Dakar",
    photo_url: null,
    status: "ACTIVE" as const,
    created_at: "2024-09-01T10:00:00Z",
    updated_at: "2024-09-01T10:00:00Z",
  },
  {
    id: "student-3",
    user_id: "user-3",
    student_number: "UCAK2024003",
    full_name: "Fatou Ndiaye",
    gender: "F" as const,
    date_of_birth: "2002-08-10",
    place_of_birth: "Saint-Louis",
    nationality: "Sénégalaise",
    phone: "+221 77 345 6789",
    emergency_contact_name: "Modou Ndiaye",
    emergency_contact_phone: "+221 77 456 7890",
    address: "Parcelles Assainies, Dakar",
    photo_url: null,
    status: "ACTIVE" as const,
    created_at: "2024-09-01T10:00:00Z",
    updated_at: "2024-09-01T10:00:00Z",
  },
  {
    id: "student-4",
    user_id: "user-4",
    student_number: "UCAK2024004",
    full_name: "Moussa Kane",
    gender: "M" as const,
    date_of_birth: "2003-01-25",
    place_of_birth: "Kaolack",
    nationality: "Sénégalais",
    phone: "+221 76 234 5678",
    emergency_contact_name: "Awa Kane",
    emergency_contact_phone: "+221 76 345 6789",
    address: "Médina, Dakar",
    photo_url: null,
    status: "ACTIVE" as const,
    created_at: "2024-09-01T10:00:00Z",
    updated_at: "2024-09-01T10:00:00Z",
  },
];

const mockAcademicPrograms: AcademicProgram[] = [
  {
    id: "prog-1",
    name: "Licence en Informatique",
    level: "Licence",
    duration_years: 3,
  },
  {
    id: "prog-2",
    name: "Master en Génie Logiciel",
    level: "Master",
    duration_years: 2,
  },
  {
    id: "prog-3",
    name: "Licence en Mathématiques",
    level: "Licence",
    duration_years: 3,
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

const mockEnrollments: Enrollment[] = [
  {
    id: "enroll-1",
    student_id: "student-1",
    academic_program_id: "prog-1",
    academic_year_id: "year-1",
    current_semester: 1,
    enrollment_date: "2024-09-15",
    registration_fee_paid: 350000,
    is_scholarship: false,
    status: EnrollmentStatus.ACTIVE,
    created_at: "2024-09-15T10:00:00Z",
    updated_at: "2024-09-15T10:00:00Z",
    student: mockStudents[0],
    academic_program: mockAcademicPrograms[0],
    academic_year: mockAcademicYears[0],
  },
  {
    id: "enroll-2",
    student_id: "student-2",
    academic_program_id: "prog-2",
    academic_year_id: "year-1",
    current_semester: 1,
    enrollment_date: "2024-09-16",
    registration_fee_paid: 0,
    is_scholarship: true,
    status: EnrollmentStatus.PENDING,
    created_at: "2024-09-16T11:00:00Z",
    updated_at: "2024-09-16T11:00:00Z",
    student: mockStudents[1],
    academic_program: mockAcademicPrograms[1],
    academic_year: mockAcademicYears[0],
  },
  {
    id: "enroll-3",
    student_id: "student-3",
    academic_program_id: "prog-1",
    academic_year_id: "year-1",
    current_semester: 2,
    enrollment_date: "2024-09-17",
    registration_fee_paid: 350000,
    is_scholarship: false,
    status: EnrollmentStatus.REGISTERED,
    created_at: "2024-09-17T12:00:00Z",
    updated_at: "2024-09-17T12:00:00Z",
    student: mockStudents[2],
    academic_program: mockAcademicPrograms[0],
    academic_year: mockAcademicYears[0],
  },
  {
    id: "enroll-4",
    student_id: "student-4",
    academic_program_id: "prog-3",
    academic_year_id: "year-1",
    current_semester: 1,
    enrollment_date: "2024-09-18",
    registration_fee_paid: 175000,
    is_scholarship: true,
    status: EnrollmentStatus.ACTIVE,
    created_at: "2024-09-18T13:00:00Z",
    updated_at: "2024-09-18T13:00:00Z",
    student: mockStudents[3],
    academic_program: mockAcademicPrograms[2],
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
 * Get all enrollments with optional filters
 * NOTE: In production, backend will return simplified EnrollmentListItem[] for list view
 * and full Enrollment for detail view
 */
export async function getEnrollments(
  filters?: EnrollmentFilters
): Promise<EnrollmentsResponse> {
  if (USE_MOCK_DATA) {
    await delay(500); // Simulate network delay

    let filtered = [...mockEnrollments];

    // Apply filters
    if (filters?.student_id) {
      filtered = filtered.filter((e) => e.student_id === filters.student_id);
    }
    if (filters?.academic_program_id) {
      filtered = filtered.filter((e) => e.academic_program_id === filters.academic_program_id);
    }
    if (filters?.academic_year_id) {
      filtered = filtered.filter((e) => e.academic_year_id === filters.academic_year_id);
    }
    if (filters?.current_semester) {
      filtered = filtered.filter((e) => e.current_semester === filters.current_semester);
    }
    if (filters?.status) {
      filtered = filtered.filter((e) => e.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.student?.full_name.toLowerCase().includes(searchLower) ||
          e.student?.student_number.toLowerCase().includes(searchLower) ||
          e.academic_program?.name.toLowerCase().includes(searchLower)
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

    // NOTE: In production, backend will return only necessary fields for list:
    // - student_number (from Student)
    // - full_name (from Student)
    // - academic_year_name (from AcademicYear.name)
    // - current_semester (from Enrollment)
    // - enrollment_date (from Enrollment)

    return { data, total, page, limit, total_pages };
  }

  // Real API call (when backend is ready)
  const queryParams = new URLSearchParams();
  if (filters?.student_id) queryParams.set("student_id", filters.student_id);
  if (filters?.academic_program_id)
    queryParams.set("academic_program_id", filters.academic_program_id);
  if (filters?.academic_year_id) queryParams.set("academic_year_id", filters.academic_year_id);
  if (filters?.current_semester) queryParams.set("current_semester", filters.current_semester.toString());
  if (filters?.status) queryParams.set("status", filters.status);
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  return api.get<EnrollmentsResponse>(`/enrollments?${queryParams.toString()}`);
}

/**
 * Get a single enrollment by ID
 */
export async function getEnrollment(id: string): Promise<Enrollment> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const enrollment = mockEnrollments.find((e) => e.id === id);
    if (!enrollment) {
      throw new Error(`Enrollment not found: ${id}`);
    }
    return enrollment;
  }

  return api.get<Enrollment>(`/enrollments/${id}`);
}

/**
 * Create a new enrollment
 */
export async function createEnrollment(
  input: CreateEnrollmentInput
): Promise<Enrollment> {
  if (USE_MOCK_DATA) {
    await delay(800);

    // Find related data
    const student = mockStudents.find((s) => s.id === input.student_id);
    const program = mockAcademicPrograms.find((p) => p.id === input.academic_program_id);
    const year = mockAcademicYears.find((y) => y.id === input.academic_year_id);

    const newEnrollment: Enrollment = {
      id: `enroll-${Date.now()}`,
      ...input,
      status: input.status || EnrollmentStatus.PENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      student: student,
      academic_program: program,
      academic_year: year,
    };

    // Add to mock data (in-memory only)
    mockEnrollments.unshift(newEnrollment);

    return newEnrollment;
  }

  return api.post<Enrollment>("/enrollments", input as unknown as Record<string, unknown>);
}

/**
 * Update an existing enrollment
 */
export async function updateEnrollment(
  id: string,
  input: UpdateEnrollmentInput
): Promise<Enrollment> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const index = mockEnrollments.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Enrollment not found: ${id}`);
    }

    const updated: Enrollment = {
      ...mockEnrollments[index],
      ...input,
      updated_at: new Date().toISOString(),
    };

    mockEnrollments[index] = updated;
    return updated;
  }

  return api.put<Enrollment>(`/enrollments/${id}`, input as unknown as Record<string, unknown>);
}

/**
 * Delete an enrollment
 */
export async function deleteEnrollment(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const index = mockEnrollments.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Enrollment not found: ${id}`);
    }

    mockEnrollments.splice(index, 1);
    return;
  }

  return api.del<void>(`/enrollments/${id}`);
}

/**
 * Change the status of an enrollment
 */
export async function updateEnrollmentStatus(
  id: string,
  status: Enrollment["status"]
): Promise<Enrollment> {
  return updateEnrollment(id, { status });
}

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Get all students (for form selects)
 */
export async function getStudents(): Promise<Student[]> {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockStudents;
  }
  return api.get("/students");
}

/**
 * Get all academic programs (for form selects)
 */
export async function getAcademicPrograms(): Promise<AcademicProgram[]> {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockAcademicPrograms;
  }
  return api.get("/academic-programs");
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
