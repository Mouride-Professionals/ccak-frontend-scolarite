import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  TeachingAssignment,
  TeachingAssignmentFilters,
  TeachingAssignmentsResponse,
  CreateTeachingAssignmentInput,
  TeachingAssignmentConflict,
  PlanningFilters,
  UpdateDeliveryInput,
  PlanningDashboard,
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

export async function getPlanning(filters?: PlanningFilters): Promise<TeachingAssignment[]> {
  const params = new URLSearchParams();
  if (filters?.program_id) params.append("filter[program_id]", filters.program_id);
  if (filters?.academic_year_id)
    params.append("filter[academic_year_id]", filters.academic_year_id);
  if (filters?.level_id) params.append("filter[level_id]", filters.level_id);
  const response = await api.get(
    `/teaching-assignments/planning${params.toString() ? `?${params}` : ""}`
  );
  return unwrapData<TeachingAssignment[]>(response);
}

export async function getPlanningDashboard(
  filters?: Pick<PlanningFilters, "program_id" | "academic_year_id">
): Promise<PlanningDashboard> {
  const params = new URLSearchParams();
  if (filters?.program_id) params.append("filter[program_id]", filters.program_id);
  if (filters?.academic_year_id)
    params.append("filter[academic_year_id]", filters.academic_year_id);
  const response = await api.get(
    `/teaching-assignments/planning/dashboard${params.toString() ? `?${params}` : ""}`
  );
  return unwrapData<PlanningDashboard>(response);
}

export async function updateDelivery(
  id: string,
  input: UpdateDeliveryInput
): Promise<TeachingAssignment> {
  const response = await api.patch(
    `/teaching-assignments/${id}/delivery`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<TeachingAssignment>(response);
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
