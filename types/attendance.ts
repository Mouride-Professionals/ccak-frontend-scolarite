export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface AttendanceRecord {
  id: string;
  course_log_id: string;
  student_id: string;
  status: AttendanceStatus;
  marked_at?: string;
  notes?: string;
  absence_count?: number;
  student?: {
    id: string;
    full_name: string;
    student_number?: string;
  };
  course?: {
    id: string;
    name: string;
    code?: string;
  };
}

export interface AttendanceFilters {
  page?: number;
  limit?: number;
  course_id?: string;
  student_id?: string;
  session_date?: string;
}

export interface CreateAttendanceInput {
  course_log_id: string;
  records: Array<{
    student_id: string;
    status: AttendanceStatus;
    notes?: string;
  }>;
}

export interface AttendanceResponse {
  data: AttendanceRecord[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

export interface Dispensation {
  course_id: string;
  course_name?: string;
  absence_count?: number;
  dispensed?: boolean;
}
