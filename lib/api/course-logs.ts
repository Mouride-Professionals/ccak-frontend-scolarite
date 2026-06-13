import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  CourseLog,
  CourseLogFilters,
  CourseLogsResponse,
  CreateCourseLogInput,
  UpdateCourseLogInput,
} from "@/types/course-log";

export async function getCourseLogs(filters?: CourseLogFilters): Promise<CourseLogsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.course_id) params.append("filter[course_id]", filters.course_id);
  if (filters?.faculty_member_id)
    params.append("filter[faculty_member_id]", filters.faculty_member_id);
  if (filters?.schedule_id) params.append("filter[schedule_id]", filters.schedule_id);
  if (filters?.date_from) params.append("filter[date_from]", filters.date_from);
  if (filters?.date_to) params.append("filter[date_to]", filters.date_to);
  if (filters?.search) params.append("filter[search]", filters.search);

  const response = await api.get(`/course-logs${params.toString() ? `?${params}` : ""}`);
  return toPaginated<CourseLog>(response);
}

export async function getCourseLog(id: string): Promise<CourseLog> {
  const response = await api.get(`/course-logs/${id}`);
  return unwrapData<CourseLog>(response);
}

export async function getCourseLogsForCourse(
  courseId: string,
  filters?: Pick<CourseLogFilters, "page" | "limit" | "date_from" | "date_to">
): Promise<CourseLogsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.date_from) params.append("filter[date_from]", filters.date_from);
  if (filters?.date_to) params.append("filter[date_to]", filters.date_to);
  const response = await api.get(
    `/courses/${courseId}/logs${params.toString() ? `?${params}` : ""}`
  );
  return toPaginated<CourseLog>(response);
}

export async function createCourseLog(input: CreateCourseLogInput): Promise<CourseLog> {
  const response = await api.post("/course-logs", input as unknown as Record<string, unknown>);
  return unwrapData<CourseLog>(response);
}

export async function updateCourseLog(id: string, input: UpdateCourseLogInput): Promise<CourseLog> {
  const response = await api.put(`/course-logs/${id}`, input as unknown as Record<string, unknown>);
  return unwrapData<CourseLog>(response);
}
