import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type { FacultyMember, FacultyMemberFilters, FacultyMembersResponse } from "@/types/academic";

export async function getFacultyMembers(
  filters?: FacultyMemberFilters
): Promise<FacultyMembersResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.search) params.append("filter[search]", filters.search);
  if (filters?.department_id) params.append("filter[department_id]", filters.department_id);
  if (filters?.rank) params.append("filter[rank]", filters.rank);
  if (filters?.contract_type)
    params.append("filter[contract_type]", filters.contract_type.toString());
  if (filters?.is_active !== undefined)
    params.append("filter[is_active]", filters.is_active.toString());

  const response = await api.get(`/faculty-members${params.toString() ? `?${params}` : ""}`);
  return toPaginated<FacultyMember>(response);
}

export async function getFacultyMember(id: string): Promise<FacultyMember | null> {
  try {
    const response = await api.get(`/faculty-members/${id}`);
    return unwrapData<FacultyMember>(response);
  } catch {
    return null;
  }
}
