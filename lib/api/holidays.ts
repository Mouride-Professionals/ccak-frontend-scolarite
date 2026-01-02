import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type { Holiday, PaginatedResult } from "@/types/calendar";

export interface HolidayFilters {
  page?: number;
  limit?: number;
  academic_year_id?: string;
  type?: string;
  search?: string;
}

export async function getHolidays(filters?: HolidayFilters): Promise<PaginatedResult<Holiday>> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.academic_year_id)
    params.append("filter[academic_year_id]", filters.academic_year_id);
  if (filters?.type) params.append("filter[type]", filters.type);
  if (filters?.search) params.append("filter[search]", filters.search);

  const response = await api.get(`/holidays${params.toString() ? `?${params}` : ""}`);
  return toPaginated<Holiday>(response);
}

export async function createHoliday(input: Omit<Holiday, "id">): Promise<Holiday> {
  const response = await api.post("/holidays", input as unknown as Record<string, unknown>);
  return unwrapData<Holiday>(response);
}

export async function updateHoliday(id: string, input: Partial<Holiday>): Promise<Holiday> {
  const response = await api.put(`/holidays/${id}`, input as unknown as Record<string, unknown>);
  return unwrapData<Holiday>(response);
}

export async function deleteHoliday(id: string): Promise<void> {
  await api.del(`/holidays/${id}`);
}
