/**
 * Academic year specific types.
 */

export interface AcademicYear {
  id: string;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AcademicYearFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateAcademicYearInput {
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  is_active?: boolean;
}

export interface UpdateAcademicYearInput {
  id: string;
  input: Partial<CreateAcademicYearInput>;
}

export interface AcademicYearsResponse {
  data: AcademicYear[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
