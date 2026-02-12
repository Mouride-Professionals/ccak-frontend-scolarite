import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  TeachingAssignment,
  TeachingAssignmentFilters,
  TeachingAssignmentsResponse,
  CreateTeachingAssignmentInput,
  TeachingAssignmentConflict,
} from "@/types/teaching-assignment";

export async function getTeachingAssignments(
  filters?: TeachingAssignmentFilters
): Promise<TeachingAssignmentsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("per_page", String(filters.limit));
  if (filters?.search) params.append("filter[search]", filters.search);
  if (filters?.faculty_member_id)
    params.append("filter[faculty_member_id]", filters.faculty_member_id);
  if (filters?.course_id) params.append("filter[course_id]", filters.course_id);
  if (filters?.academic_year_id)
    params.append("filter[academic_year_id]", filters.academic_year_id);
  if (filters?.role) params.append("filter[role]", filters.role);

  const response = await api.get(`/teaching-assignments${params.toString() ? `?${params}` : ""}`);
  return toPaginated<TeachingAssignment>(response);
}

export async function createTeachingAssignment(
  input: CreateTeachingAssignmentInput
): Promise<TeachingAssignment> {
  const response = await api.post(
    "/teaching-assignments",
    input as unknown as Record<string, unknown>
  );
  return unwrapData<TeachingAssignment>(response);
}

export async function deleteTeachingAssignment(id: string): Promise<void> {
  await api.del(`/teaching-assignments/${id}`);
}

export async function checkTeachingAssignmentConflicts(
  input: CreateTeachingAssignmentInput
): Promise<TeachingAssignmentConflict> {
  try {
    const response = await api.post("/teaching-assignments/check-conflicts", input);
    return unwrapData<TeachingAssignmentConflict>(response);
  } catch {
    return {
      has_conflict: false,
    };
  }
}
