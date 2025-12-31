/**
 * Students API Service
 * Handles all API calls related to students
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  Student,
  StudentFilters,
  CreateStudentInput,
  UpdateStudentInput,
  StudentsResponse,
} from "@/types/student";
import { DocumentType } from "@/types/student";

const inferDocumentType = (file: File): DocumentType => {
  const name = file.name.toLowerCase();
  if (name.includes("photo") || file.type.startsWith("image/")) {
    return DocumentType.PHOTO;
  }
  if (name.includes("naissance") || name.includes("birth")) {
    return DocumentType.BIRTH_CERT;
  }
  if (name.includes("bac") || name.includes("diploma")) {
    return DocumentType.BAC_DIPLOMA;
  }
  if (name.includes("transcript")) {
    return DocumentType.TRANSCRIPT;
  }
  return DocumentType.CNI;
};

const uploadStudentDocument = async (studentId: string, file: File, type: DocumentType) => {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("type", type);
  await api.post(`/students/${studentId}/documents`, formData, {
    headers: {},
  });
};

/**
 * Get all students with optional filters
 */
export async function getStudents(filters?: StudentFilters): Promise<StudentsResponse> {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.set("status", filters.status);
  if (filters?.gender) queryParams.set("gender", filters.gender);
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  const response = await api.get(`/students?${queryParams.toString()}`);
  return toPaginated<Student>(response);
}

/**
 * Get a single student by ID
 */
export async function getStudent(id: string): Promise<Student> {
  const response = await api.get(`/students/${id}`);
  return unwrapData<Student>(response);
}

/**
 * Create a new student
 */
export async function createStudent(input: CreateStudentInput): Promise<Student> {
  const { documents, ...payload } = input;
  const response = await api.post("/students", payload);
  const student = unwrapData<Student>(response);

  if (documents && documents.length > 0) {
    const uploads = documents.map((file) =>
      uploadStudentDocument(student.id, file, inferDocumentType(file))
    );
    await Promise.all(uploads);
  }

  return student;
}

/**
 * Update an existing student
 */
export async function updateStudent(id: string, input: UpdateStudentInput): Promise<Student> {
  const response = await api.put(`/students/${id}`, input);
  return unwrapData<Student>(response);
}

/**
 * Delete a student
 */
export async function deleteStudent(id: string): Promise<void> {
  return api.del<void>(`/students/${id}`);
}

/**
 * Update student status
 */
export async function updateStudentStatus(id: string, status: Student["status"]): Promise<Student> {
  return updateStudent(id, { status });
}
