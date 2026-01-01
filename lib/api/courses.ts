import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import {
  Course,
  CreateCourseInput,
  UpdateCourseInput,
  CourseFilters,
  CoursesResponse,
} from "@/types/course";

export const getCourses = async (filters?: CourseFilters): Promise<CoursesResponse> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("filter[search]", filters.search);
  if (filters?.course_unit_id) params.append("filter[course_unit_id]", filters.course_unit_id);
  if (filters?.is_active !== undefined)
    params.append("filter[is_active]", filters.is_active.toString());
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());

  const response = await api.get(`/courses?${params.toString()}`);
  return toPaginated<Course>(response);
};

export const getCourse = async (id: string): Promise<Course | null> => {
  try {
    const response = await api.get(`/courses/${id}`);
    return unwrapData<Course>(response);
  } catch {
    return null;
  }
};

export const createCourse = async (data: CreateCourseInput): Promise<Course> => {
  const response = await api.post("/courses", data as unknown as Record<string, unknown>);
  return unwrapData<Course>(response);
};

export const updateCourse = async (data: UpdateCourseInput): Promise<Course> => {
  const response = await api.put(`/courses/${data.id}`, data as unknown as Record<string, unknown>);
  return unwrapData<Course>(response);
};

export const deleteCourse = async (id: string): Promise<void> => {
  await api.del(`/courses/${id}`);
};
