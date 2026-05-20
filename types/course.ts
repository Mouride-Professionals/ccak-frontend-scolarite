export interface Course {
  id: string;
  course_unit_id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  hours_lecture: number;
  hours_td: number;
  hours_tp: number;
  hours_tpe?: number;
  vht?: number;
  coefficient: number;
  prerequisites?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCourseInput {
  course_unit_id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  hours_lecture?: number;
  hours_td?: number;
  hours_tp?: number;
  hours_tpe?: number;
  coefficient?: number;
  prerequisites?: string[];
  is_active?: boolean;
}

export interface UpdateCourseInput extends CreateCourseInput {
  id: string;
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  course_unit_id?: string;
  is_active?: boolean;
}

export interface CoursesResponse {
  data: Course[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
