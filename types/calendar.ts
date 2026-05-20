export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface AcademicCalendar {
  id: string;
  academic_year_id: string;
  start_date: string;
  end_date: string;
  working_days: DayOfWeek[];
  hour_slots: { start: string; end: string }[];
  breaks?: { start: string; end: string; label?: string }[];
  created_at?: string;
  updated_at?: string;
}

export interface Holiday {
  id: string;
  academic_year_id: string;
  name: string;
  date: string;
  type: string;
  is_recurring: boolean;
}

export type RoomType = "LECTURE_HALL" | "LAB" | "TD_ROOM";

export interface Room {
  id: string;
  room_number: string;
  name: string | null;
  building?: string | null;
  capacity: number;
  type: RoomType;
  equipment?: string[];
  is_available: boolean;
}

export interface ActivityType {
  id: string;
  name: string;
  code: string;
  duration_default?: number;
  color?: string;
}

export interface Schedule {
  id: string;
  course_id: string;
  course_name?: string;
  faculty_member_id: string;
  faculty_name?: string;
  room_id: string;
  room_name?: string;
  activity_type_id: string;
  activity_type_name?: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  academic_year_id: string;
  semester?: number;
}

export interface AvailabilityRequest {
  room_id?: string;
  faculty_member_id?: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface AvailabilityResponse {
  available: boolean;
  conflicts: Array<{
    id: string;
    type: "room" | "faculty";
    message: string;
  }>;
  suggestions?: Array<{ start_time: string; end_time: string }>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
