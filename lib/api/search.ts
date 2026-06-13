import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import type { SearchResponse } from "@/types/search";

/**
 * Global search API
 */
export async function globalSearch(query: string): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query });
  const response = await api.get(`/search?${params.toString()}`);
  return unwrapData<SearchResponse>(response);
}
