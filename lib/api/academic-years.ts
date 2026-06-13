/**
 * Academic Years API service.
 * OpenAPI source: docs/openapi-original.json
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  AcademicYear,
  AcademicYearFilters,
  AcademicYearsResponse,
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
} from "@/types/academic-year";

export async function getAcademicYears(
  filters?: AcademicYearFilters
): Promise<AcademicYearsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.search) params.append("filter[search]", filters.search);

  const query = params.toString();
  const response = await api.get(`/academic-years${query ? `?${query}` : ""}`);
  return toPaginated<AcademicYear>(response);
}

export async function getAcademicYear(id: string): Promise<AcademicYear | null> {
  try {
    const response = await api.get(`/academic-years/${id}`, { suppressErrorLogging: true });
    return unwrapData<AcademicYear>(response);
  } catch {
    return null;
  }
}

export async function createAcademicYear(input: CreateAcademicYearInput): Promise<AcademicYear> {
  const response = await api.post("/academic-years", input as unknown as Record<string, unknown>);
  return unwrapData<AcademicYear>(response);
}

export async function updateAcademicYear({
  id,
  input,
}: UpdateAcademicYearInput): Promise<AcademicYear> {
  const response = await api.put(
    `/academic-years/${id}`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<AcademicYear>(response);
}

export async function deleteAcademicYear(id: string): Promise<void> {
  await api.del(`/academic-years/${id}`);
}

export async function getCurrentAcademicYear(): Promise<AcademicYear | null> {
  try {
    const response = await api.get("/academic-years/current", { suppressErrorLogging: true });
    return unwrapData<AcademicYear>(response);
  } catch {
    return null;
  }
}

export async function setAcademicYearAsCurrent(id: string): Promise<AcademicYear> {
  const response = await api.put(`/academic-years/${id}/set-current`);
  return unwrapData<AcademicYear>(response);
}
