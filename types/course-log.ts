export interface CourseLog {
  id: string;
  schedule_id: string;
  course_id?: string;
  faculty_member_id?: string;
  date: string;
  topics: string[] | string;
  chapters?: string;
  objectives?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  schedule?: {
    id: string;
    day_of_week?: string;
    start_time?: string;
    end_time?: string;
  };
  course?: {
    id: string;
    name: string;
    code?: string;
  };
  faculty_member?: {
    id: string;
    full_name: string;
  };
}

export interface CourseLogFilters {
  page?: number;
  limit?: number;
  course_id?: string;
  faculty_member_id?: string;
  schedule_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface CreateCourseLogInput {
  schedule_id: string;
  date: string;
  topics: string[] | string;
  chapters?: string;
  objectives?: string;
  notes?: string;
}

export interface UpdateCourseLogInput extends Partial<CreateCourseLogInput> {}

export interface CourseLogsResponse {
  data: CourseLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
