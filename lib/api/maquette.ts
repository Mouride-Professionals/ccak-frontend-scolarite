import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import type { MaquetteFilters, MaquetteResponse } from "@/types/maquette";

export async function getMaquette(filters?: MaquetteFilters): Promise<MaquetteResponse> {
  const params = new URLSearchParams();
  if (filters?.program_id) params.append("filter[program_id]", filters.program_id);
  const response = await api.get(`/maquette${params.toString() ? `?${params}` : ""}`);
  return unwrapData<MaquetteResponse>(response);
}
