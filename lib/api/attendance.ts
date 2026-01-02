import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  AttendanceFilters,
  AttendanceRecord,
  AttendanceResponse,
  CreateAttendanceInput,
  Dispensation,
} from "@/types/attendance";

export async function createAttendance(input: CreateAttendanceInput): Promise<AttendanceRecord[]> {
  const response = await api.post("/attendance", input as unknown as Record<string, unknown>);
  return unwrapData<AttendanceRecord[]>(response);
}

export async function getStudentAttendance(
  studentId: string,
  filters?: AttendanceFilters
): Promise<AttendanceResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.course_id) params.append("filter[course_id]", filters.course_id);
  if (filters?.status) params.append("filter[status]", filters.status);
  if (filters?.date_from) params.append("filter[date_from]", filters.date_from);
  if (filters?.date_to) params.append("filter[date_to]", filters.date_to);

  const response = await api.get(
    `/students/${studentId}/attendance${params.toString() ? `?${params}` : ""}`
  );
  return toPaginated<AttendanceRecord>(response);
}

export async function getCourseAttendance(
  courseId: string,
  filters?: AttendanceFilters
): Promise<AttendanceResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.status) params.append("filter[status]", filters.status);
  if (filters?.date_from) params.append("filter[date_from]", filters.date_from);
  if (filters?.date_to) params.append("filter[date_to]", filters.date_to);

  const response = await api.get(
    `/courses/${courseId}/attendance${params.toString() ? `?${params}` : ""}`
  );
  return toPaginated<AttendanceRecord>(response);
}

export async function getStudentDispensations(studentId: string): Promise<Dispensation[]> {
  const response = await api.get(`/students/${studentId}/dispensations`);
  return unwrapData<Dispensation[]>(response);
}
