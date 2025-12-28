/**
 * Programme-specific types
 * Extends academic types for programme management
 */

import type { AcademicProgram } from "@/types/academic";

export interface AcademicProgramFilters {
  page?: number;
  limit?: number;
  department_id?: string;
  level?: string;
  is_active?: boolean;
  search?: string;
}

export interface CreateProgrammeInput {
  department_id: string;
  name: string;
  level: string;
  duration_semesters: number;
  total_credits_required: number;
  is_active: boolean;
}

export interface UpdateProgrammeInput {
  id: string;
  input: CreateProgrammeInput;
}

export interface ProgrammesResponse {
  data: AcademicProgram[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}