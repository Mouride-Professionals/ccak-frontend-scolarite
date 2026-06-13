import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type { Level, LevelFilters, LevelsResponse } from "@/types/level";

export async function getLevels(filters?: LevelFilters): Promise<LevelsResponse> {
  const params = new URLSearchParams();
  if (filters?.degree_cycle_id) params.set("filter[degree_cycle_id]", filters.degree_cycle_id);
  if (filters?.type) params.set("filter[type]", filters.type);

  const query = params.toString();
  const response = await api.get(`/levels${query ? `?${query}` : ""}`);
  return toPaginated<Level>(response);
}

export async function getLevel(id: string): Promise<Level> {
  const response = await api.get(`/levels/${id}`);
  return unwrapData<Level>(response);
}
