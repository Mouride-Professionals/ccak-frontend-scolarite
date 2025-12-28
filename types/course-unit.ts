export interface CourseUnit {
  id: string;
  academicProgramId: string;
  academicProgram?: {
    id: string;
    name: string;
  };
  code: string;
  name: string;
  semesterNumber: number;
  credits: number;
  type: 'OBLIGATOIRE' | 'OPTIONNEL';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseUnitInput {
  academicProgramId: string;
  code: string;
  name: string;
  semesterNumber: number;
  credits: number;
  type: 'OBLIGATOIRE' | 'OPTIONNEL';
  isActive?: boolean;
}

export interface UpdateCourseUnitInput extends CreateCourseUnitInput {
  id: string;
}

export interface CourseUnitFilters {
  page?: number;
  limit?: number;
  search?: string;
  academicProgramId?: string;
  type?: 'OBLIGATOIRE' | 'OPTIONNEL';
  isActive?: boolean;
}

export interface AcademicProgram {
  id: string;
  name: string;
}