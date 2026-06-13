import { api } from "@/lib/api-client";
import type { DegreeCycle } from "@/types/degree-cycle";

export async function getDegreeCycles(): Promise<DegreeCycle[]> {
  const response = await api.get("/degree-cycles");
  if (Array.isArray(response)) return response as DegreeCycle[];
  const wrapped = response as { data?: DegreeCycle[] };
  return wrapped.data ?? [];
}
