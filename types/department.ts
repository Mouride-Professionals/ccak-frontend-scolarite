/**
 * Department-specific types
 */

export interface Department {
  id: string;
  faculty_id: string;
  faculty?: {
    id: string;
    name: string;
    code: string;
  };
  name: string;
  code: string;
  head_id?: string | null;
  head?: {
    id: string;
    name: string;
    email: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentFilters {
  page?: number;
  limit?: number;
  faculty_id?: string;
  is_active?: boolean;
  search?: string;
}

export interface CreateDepartmentInput {
  faculty_id: string;
  name: string;
  code: string;
  head_id?: string | null;
  is_active: boolean;
}

export interface UpdateDepartmentInput {
  id: string;
  input: CreateDepartmentInput;
}

export interface DepartmentsResponse {
  data: Department[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
