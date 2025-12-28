/**
 * Faculty-specific types
 */

export interface Faculty {
  id: string;
  name: string;
  code: string;
  dean_id?: string | null;
  dean?: {
    id: string;
    name: string;
    email: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacultyFilters {
  page?: number;
  limit?: number;
  is_active?: boolean;
  search?: string;
}

export interface CreateFacultyInput {
  name: string;
  code: string;
  dean_id?: string | null;
  is_active: boolean;
}

export interface UpdateFacultyInput {
  id: string;
  input: CreateFacultyInput;
}

export interface FacultiesResponse {
  data: Faculty[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
