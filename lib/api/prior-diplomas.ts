/**
 * Prior Diplomas API Service
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type { PriorDiploma, CreatePriorDiplomaInput } from "@/types/student";

export async function getPriorDiplomas(studentId: string): Promise<PriorDiploma[]> {
  const response = await api.get(`/students/${studentId}/prior-diplomas`);
  return toPaginated<PriorDiploma>(response).data;
}

export async function createPriorDiploma(input: CreatePriorDiplomaInput): Promise<PriorDiploma> {
  const response = await api.post(`/students/${input.student_id}/prior-diplomas`, input);
  return unwrapData<PriorDiploma>(response);
}

export async function deletePriorDiploma(studentId: string, id: string): Promise<void> {
  return api.del<void>(`/students/${studentId}/prior-diplomas/${id}`);
}
