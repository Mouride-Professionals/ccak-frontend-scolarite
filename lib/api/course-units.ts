import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import {
  CourseUnit,
  CreateCourseUnitInput,
  UpdateCourseUnitInput,
  AcademicProgram,
} from "@/types/course-unit";

type ApiCourseUnit = {
  id: string;
  academic_program_id: string;
  code: string;
  name: string;
  semester_number: number;
  credits: number;
  type: "OBLIGATOIRE" | "OPTIONNEL";
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  academic_program?: {
    id: string;
    name: string;
  };
};

const mapCourseUnit = (unit: ApiCourseUnit): CourseUnit => ({
  id: unit.id,
  academicProgramId: unit.academic_program_id,
  academicProgram: unit.academic_program
    ? { id: unit.academic_program.id, name: unit.academic_program.name }
    : undefined,
  code: unit.code,
  name: unit.name,
  semesterNumber: unit.semester_number,
  credits: unit.credits,
  type: unit.type,
  isActive: unit.is_active,
  createdAt: unit.created_at ?? "",
  updatedAt: unit.updated_at ?? "",
});

const mapCourseUnitInput = (input: CreateCourseUnitInput | UpdateCourseUnitInput) => ({
  academic_program_id: input.academicProgramId,
  code: input.code,
  name: input.name,
  semester_number: input.semesterNumber,
  credits: input.credits,
  type: input.type,
  is_active: input.isActive ?? true,
});

export const getCourseUnits = async (): Promise<CourseUnit[]> => {
  const response = await api.get("/course-units");
  const data = unwrapData<ApiCourseUnit[]>(response);
  return data.map(mapCourseUnit);
};

export const getCourseUnit = async (id: string): Promise<CourseUnit | null> => {
  try {
    const response = await api.get(`/course-units/${id}`);
    return mapCourseUnit(unwrapData<ApiCourseUnit>(response));
  } catch {
    return null;
  }
};

export const createCourseUnit = async (data: CreateCourseUnitInput): Promise<CourseUnit> => {
  const response = await api.post("/course-units", mapCourseUnitInput(data));
  return mapCourseUnit(unwrapData<ApiCourseUnit>(response));
};

export const updateCourseUnit = async (data: UpdateCourseUnitInput): Promise<CourseUnit> => {
  const response = await api.put(`/course-units/${data.id}`, mapCourseUnitInput(data));
  return mapCourseUnit(unwrapData<ApiCourseUnit>(response));
};

export const deleteCourseUnit = async (id: string): Promise<void> => {
  await api.del(`/course-units/${id}`);
};

export const getAcademicPrograms = async (): Promise<AcademicProgram[]> => {
  const response = await api.get("/academic-programs");
  return unwrapData<AcademicProgram[]>(response);
};
