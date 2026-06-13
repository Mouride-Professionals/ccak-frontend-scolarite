export type SearchResultType =
  | "student"
  | "faculty_member"
  | "course"
  | "course_unit"
  | "academic_program"
  | "department"
  | "faculty"
  | "exam_session";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  label: string;
  sublabel?: string;
  url_hint: string;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResultItem[];
}
