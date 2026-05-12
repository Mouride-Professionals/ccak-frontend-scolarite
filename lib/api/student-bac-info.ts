/**
 * Student Bac Info API Service
 */

import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import type { StudentBacInfo, CreateStudentBacInfoInput } from "@/types/student";

export async function getStudentBacInfo(studentId: string): Promise<StudentBacInfo> {
  const response = await api.get(`/students/${studentId}/bac-info`);
  return unwrapData<StudentBacInfo>(response);
}

export async function createStudentBacInfo(input: CreateStudentBacInfoInput): Promise<StudentBacInfo> {
  const response = await api.post(`/students/${input.student_id}/bac-info`, input);
  return unwrapData<StudentBacInfo>(response);
}

export async function updateStudentBacInfo(
  studentId: string,
  input: Partial<CreateStudentBacInfoInput>
): Promise<StudentBacInfo> {
  const response = await api.put(`/students/${studentId}/bac-info`, input);
  return unwrapData<StudentBacInfo>(response);
}
