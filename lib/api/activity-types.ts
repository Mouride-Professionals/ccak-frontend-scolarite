import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type { ActivityType, PaginatedResult } from "@/types/calendar";

export interface ActivityTypeFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getActivityTypes(
  filters?: ActivityTypeFilters
): Promise<PaginatedResult<ActivityType>> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.search) params.append("filter[search]", filters.search);

  const response = await api.get(`/activity-types${params.toString() ? `?${params}` : ""}`);
  return toPaginated<ActivityType>(response);
}

export async function createActivityType(input: Omit<ActivityType, "id">): Promise<ActivityType> {
  const response = await api.post("/activity-types", input as unknown as Record<string, unknown>);
  return unwrapData<ActivityType>(response);
}
