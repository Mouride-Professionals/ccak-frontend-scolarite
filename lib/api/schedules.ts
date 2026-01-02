import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  AvailabilityRequest,
  AvailabilityResponse,
  PaginatedResult,
  Schedule,
} from "@/types/calendar";

export interface ScheduleFilters {
  page?: number;
  limit?: number;
  academic_year_id?: string;
  semester?: number;
  program_id?: string;
  course_id?: string;
  faculty_member_id?: string;
  student_id?: string;
  week?: string;
}

export async function getSchedules(filters?: ScheduleFilters): Promise<PaginatedResult<Schedule>> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.academic_year_id)
    params.append("filter[academic_year_id]", filters.academic_year_id);
  if (filters?.semester) params.append("filter[semester]", filters.semester.toString());
  if (filters?.program_id) params.append("filter[program_id]", filters.program_id);
  if (filters?.course_id) params.append("filter[course_id]", filters.course_id);
  if (filters?.faculty_member_id)
    params.append("filter[faculty_member_id]", filters.faculty_member_id);
  if (filters?.student_id) params.append("filter[student_id]", filters.student_id);
  if (filters?.week) params.append("filter[week]", filters.week);

  const response = await api.get(`/schedules${params.toString() ? `?${params}` : ""}`);
  return toPaginated<Schedule>(response);
}

export async function createSchedule(input: Omit<Schedule, "id">): Promise<Schedule> {
  const response = await api.post("/schedules", input as unknown as Record<string, unknown>);
  return unwrapData<Schedule>(response);
}

export async function checkAvailability(
  input: AvailabilityRequest
): Promise<AvailabilityResponse> {
  const response = await api.post(
    "/schedules/check-availability",
    input as unknown as Record<string, unknown>
  );
  return unwrapData<AvailabilityResponse>(response);
}

export async function getProgramSchedule(
  programId: string,
  filters?: { semester?: number; week?: string }
): Promise<Schedule[]> {
  const params = new URLSearchParams();
  if (filters?.semester) params.append("filter[semester]", filters.semester.toString());
  if (filters?.week) params.append("filter[week]", filters.week);
  const response = await api.get(`/programs/${programId}/schedule${params.toString() ? `?${params}` : ""}`);
  return unwrapData<Schedule[]>(response);
}

export async function getFacultySchedule(
  facultyId: string,
  filters?: { week?: string; month?: string }
): Promise<Schedule[]> {
  const params = new URLSearchParams();
  if (filters?.week) params.append("filter[week]", filters.week);
  if (filters?.month) params.append("filter[month]", filters.month);
  const response = await api.get(`/faculty/${facultyId}/schedule${params.toString() ? `?${params}` : ""}`);
  return unwrapData<Schedule[]>(response);
}

export async function getStudentSchedule(
  studentId: string,
  filters?: { week?: string }
): Promise<Schedule[]> {
  const params = new URLSearchParams();
  if (filters?.week) params.append("filter[week]", filters.week);
  const response = await api.get(`/students/${studentId}/schedule${params.toString() ? `?${params}` : ""}`);
  return unwrapData<Schedule[]>(response);
}
