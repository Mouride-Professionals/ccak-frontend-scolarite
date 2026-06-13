export interface Evaluation {
  id: string;
  course_id: string;
  faculty_member_id: string;
  academic_year_id?: string;
  start_date?: string | null;
  end_date?: string | null;
  response_deadline?: string;
  is_published: boolean;
  question_template: string[];
  rating_scale_min?: number;
  rating_scale_max?: number;
  rating_scale_low_label?: string | null;
  rating_scale_high_label?: string | null;
  created_at?: string;
  updated_at?: string;
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

export interface EvaluationFilters {
  page?: number;
  limit?: number;
  search?: string;
  course_id?: string;
  faculty_member_id?: string;
}

export interface EvaluationResponseInput {
  evaluation_id: string;
  responses: string[];
  rating_scores?: string[];
  comments?: string | null;
  is_anonymous?: boolean;
}

export interface EvaluationResponse {
  id: string;
  evaluation_id: string;
  student_id?: string;
  responses: string[];
  rating_scores?: string[] | null;
  comments?: string | null;
  submitted_at?: string;
}

export interface EvaluationResult {
  evaluation_id: string;
  response_rate?: number;
  average_rating?: number;
  response_count?: number;
  total_targets?: number;
  benchmark_average?: number;
  ratings?: Array<{ question: string; average: number }>;
  comments?: Array<string>;
}

export interface EvaluationsResponse {
  data: Evaluation[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
