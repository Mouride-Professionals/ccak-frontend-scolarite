/**
 * Guardians API Service
 * Handles all API calls related to student guardians
 */

import { api } from "@/lib/api-client";
import type {
  Guardian,
  GuardiansResponse,
  CreateGuardianInput,
  UpdateGuardianInput,
} from "@/types/student";
import { mockGuardians } from "./mock-data";

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true;

/**
 * Simulate API delay for realistic testing
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all guardians for a student
 */
export async function getGuardians(studentId: string): Promise<Guardian[]> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const guardians = mockGuardians.filter((g) => g.student_id === studentId);
    return guardians;
  }

  return api.get<Guardian[]>(`/students/${studentId}/guardians`);
}

/**
 * Get a single guardian by ID
 */
export async function getGuardian(id: string): Promise<Guardian> {
  if (USE_MOCK_DATA) {
    await delay(200);

    const guardian = mockGuardians.find((g) => g.id === id);
    if (!guardian) {
      throw new Error(`Guardian not found: ${id}`);
    }
    return guardian;
  }

  return api.get<Guardian>(`/guardians/${id}`);
}

/**
 * Create a new guardian
 */
export async function createGuardian(input: CreateGuardianInput): Promise<Guardian> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const newGuardian: Guardian = {
      id: `guardian-${Date.now()}`,
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to mock data (in-memory only)
    mockGuardians.push(newGuardian);

    return newGuardian;
  }

  return api.post<Guardian>("/guardians", input);
}

/**
 * Update an existing guardian
 */
export async function updateGuardian(id: string, input: UpdateGuardianInput): Promise<Guardian> {
  if (USE_MOCK_DATA) {
    await delay(400);

    const index = mockGuardians.findIndex((g) => g.id === id);
    if (index === -1) {
      throw new Error(`Guardian not found: ${id}`);
    }

    const updated: Guardian = {
      ...mockGuardians[index],
      ...input,
      updated_at: new Date().toISOString(),
    };

    mockGuardians[index] = updated;
    return updated;
  }

  return api.put<Guardian>(`/guardians/${id}`, input);
}

/**
 * Delete a guardian
 */
export async function deleteGuardian(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const index = mockGuardians.findIndex((g) => g.id === id);
    if (index === -1) {
      throw new Error(`Guardian not found: ${id}`);
    }

    mockGuardians.splice(index, 1);
    return;
  }

  return api.del<void>(`/guardians/${id}`);
}