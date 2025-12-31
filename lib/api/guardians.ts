/**
 * Guardians API Service
 * Handles all API calls related to student guardians
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type { Guardian, CreateGuardianInput, UpdateGuardianInput } from "@/types/student";

/**
 * Get all guardians for a student
 */
export async function getGuardians(studentId: string): Promise<Guardian[]> {
  const response = await api.get(`/students/${studentId}/guardians`);
  return toPaginated<Guardian>(response).data;
}

/**
 * Get a single guardian by ID
 */
export async function getGuardian(studentId: string, id: string): Promise<Guardian> {
  const response = await api.get(`/students/${studentId}/guardians/${id}`);
  return unwrapData<Guardian>(response);
}

/**
 * Create a new guardian
 */
export async function createGuardian(input: CreateGuardianInput): Promise<Guardian> {
  const response = await api.post(`/students/${input.student_id}/guardians`, input);
  return unwrapData<Guardian>(response);
}

/**
 * Update an existing guardian
 */
export async function updateGuardian(
  studentId: string,
  id: string,
  input: UpdateGuardianInput
): Promise<Guardian> {
  const response = await api.put(`/students/${studentId}/guardians/${id}`, input);
  return unwrapData<Guardian>(response);
}

/**
 * Delete a guardian
 */
export async function deleteGuardian(studentId: string, id: string): Promise<void> {
  return api.del<void>(`/students/${studentId}/guardians/${id}`);
}
