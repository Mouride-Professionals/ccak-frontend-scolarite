/**
 * Students API Service
 * Handles all API calls related to students
 */

import { api } from "@/lib/api-client";
import type {
  Student,
  StudentFilters,
  CreateStudentInput,
  UpdateStudentInput,
  StudentsResponse,
} from "@/types/student";
import { StudentStatus, DocumentType, DocumentStatus } from "@/types/student";
import { mockStudents, mockDocuments } from "./mock-data";

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true;

/**
 * Simulate API delay for realistic testing
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all students with optional filters
 */
export async function getStudents(filters?: StudentFilters): Promise<StudentsResponse> {
  if (USE_MOCK_DATA) {
    await delay(500); // Simulate network delay

    let filtered = [...mockStudents];

    // Apply filters
    if (filters?.status) {
      filtered = filtered.filter((s) => s.status === filters.status);
    }
    if (filters?.gender) {
      filtered = filtered.filter((s) => s.gender === filters.gender);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.student_number.toLowerCase().includes(searchLower) ||
          s.full_name.toLowerCase().includes(searchLower) ||
          s.nationality.toLowerCase().includes(searchLower)
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
  if (filters?.status) queryParams.set("status", filters.status);
  if (filters?.gender) queryParams.set("gender", filters.gender);
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  return api.get(`/students?${queryParams.toString()}`);
}

/**
 * Get a single student by ID
 */
export async function getStudent(id: string): Promise<Student> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const student = mockStudents.find((s) => s.id === id);
    if (!student) {
      throw new Error(`Student not found: ${id}`);
    }
    return student;
  }

  return api.get<Student>(`/students/${id}`);
}

/**
 * Create a new student
 */
export async function createStudent(input: CreateStudentInput): Promise<Student> {
  if (USE_MOCK_DATA) {
    await delay(800);

    // Générer automatiquement le numéro d'étudiant
    const currentYear = new Date().getFullYear();
    const existingStudents = mockStudents.filter((s) =>
      s.student_number.startsWith(`UCAK${currentYear}`)
    );
    const nextNumber = existingStudents.length + 1;
    const studentNumber = `UCAK${currentYear}${nextNumber.toString().padStart(4, "0")}`;

    const newStudent: Student = {
      id: `stud-${Date.now()}`,
      user_id: `user-stud-${Date.now()}`,
      student_number: studentNumber,
      full_name: input.full_name,
      gender: input.gender,
      date_of_birth: input.date_of_birth,
      place_of_birth: input.place_of_birth,
      nationality: input.nationality,
      phone: input.phone,
      emergency_contact_name: input.emergency_contact_name,
      emergency_contact_phone: input.emergency_contact_phone,
      address: input.address,
      photo_url: null, // Sera défini par le document PHOTO uploadé
      status: StudentStatus.ACTIVE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Traiter les documents uploadés
    if (input.documents && input.documents.length > 0) {
      for (const file of input.documents) {
        // Déterminer le type de document basé sur le nom du fichier ou type
        let documentType: DocumentType = DocumentType.CNI; // Default
        if (file.name.toLowerCase().includes("photo") || file.type.startsWith("image/")) {
          documentType = DocumentType.PHOTO;
        } else if (
          file.name.toLowerCase().includes("naissance") ||
          file.name.toLowerCase().includes("birth")
        ) {
          documentType = DocumentType.BIRTH_CERT;
        } else if (
          file.name.toLowerCase().includes("bac") ||
          file.name.toLowerCase().includes("diploma")
        ) {
          documentType = DocumentType.BAC_DIPLOMA;
        }

        // Créer le document
        const newDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          student_id: newStudent.id,
          type: documentType,
          file_path: `/uploads/students/${newStudent.id}/${file.name}`,
          file_name: file.name,
          status: DocumentStatus.PENDING,
          uploaded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mockDocuments.push(newDocument);

        // Si c'est une photo, mettre à jour photo_url de l'étudiant
        if (documentType === "PHOTO") {
          newStudent.photo_url = newDocument.file_path;
        }
      }
    }

    // Add to mock data (in-memory only)
    mockStudents.unshift(newStudent);

    return newStudent;
  }

  return api.post<Student>("/students", input);
}

/**
 * Update an existing student
 */
export async function updateStudent(id: string, input: UpdateStudentInput): Promise<Student> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const index = mockStudents.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Student not found: ${id}`);
    }

    const updated: Student = {
      ...mockStudents[index],
      ...input,
      updated_at: new Date().toISOString(),
    };

    mockStudents[index] = updated;
    return updated;
  }

  return api.put<Student>(`/students/${id}`, input);
}

/**
 * Delete a student
 */
export async function deleteStudent(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const index = mockStudents.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Student not found: ${id}`);
    }

    mockStudents.splice(index, 1);
    return;
  }

  return api.del<void>(`/students/${id}`);
}

/**
 * Update student status
 */
export async function updateStudentStatus(id: string, status: Student["status"]): Promise<Student> {
  return updateStudent(id, { status });
}
