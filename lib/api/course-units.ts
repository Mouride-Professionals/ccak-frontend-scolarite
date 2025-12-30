import {
  CourseUnit,
  CreateCourseUnitInput,
  UpdateCourseUnitInput,
  AcademicProgram,
} from "@/types/course-unit";

// Mock data for development
const mockCourseUnits: CourseUnit[] = [
  {
    id: "1",
    academicProgramId: "1",
    academicProgram: {
      id: "1",
      name: "Informatique de Gestion",
    },
    code: "UE001",
    name: "Algorithmique et Programmation",
    semesterNumber: 1,
    credits: 6,
    type: "OBLIGATOIRE",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    academicProgramId: "1",
    academicProgram: {
      id: "1",
      name: "Informatique de Gestion",
    },
    code: "UE002",
    name: "Bases de Données",
    semesterNumber: 2,
    credits: 5,
    type: "OBLIGATOIRE",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    academicProgramId: "2",
    academicProgram: {
      id: "2",
      name: "Génie Civil",
    },
    code: "UE003",
    name: "Résistance des Matériaux",
    semesterNumber: 1,
    credits: 4,
    type: "OPTIONNEL",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const mockAcademicPrograms: AcademicProgram[] = [
  {
    id: "1",
    name: "Informatique de Gestion",
  },
  {
    id: "2",
    name: "Génie Civil",
  },
  {
    id: "3",
    name: "Économie",
  },
];

// API functions
export const getCourseUnits = async (): Promise<CourseUnit[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockCourseUnits;
};

export const getCourseUnit = async (id: string): Promise<CourseUnit | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockCourseUnits.find((courseUnit) => courseUnit.id === id) || null;
};

export const createCourseUnit = async (data: CreateCourseUnitInput): Promise<CourseUnit> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newCourseUnit: CourseUnit = {
    id: Date.now().toString(),
    ...data,
    isActive: data.isActive ?? true,
    academicProgram: mockAcademicPrograms.find((p) => p.id === data.academicProgramId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockCourseUnits.push(newCourseUnit);
  return newCourseUnit;
};

export const updateCourseUnit = async (data: UpdateCourseUnitInput): Promise<CourseUnit> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = mockCourseUnits.findIndex((courseUnit) => courseUnit.id === data.id);
  if (index === -1) {
    throw new Error("Course unit not found");
  }

  const updatedCourseUnit: CourseUnit = {
    ...mockCourseUnits[index],
    ...data,
    academicProgram: mockAcademicPrograms.find((p) => p.id === data.academicProgramId),
    updatedAt: new Date().toISOString(),
  };

  mockCourseUnits[index] = updatedCourseUnit;
  return updatedCourseUnit;
};

export const deleteCourseUnit = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const index = mockCourseUnits.findIndex((courseUnit) => courseUnit.id === id);
  if (index === -1) {
    throw new Error("Course unit not found");
  }

  mockCourseUnits.splice(index, 1);
};

export const getAcademicPrograms = async (): Promise<AcademicProgram[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockAcademicPrograms;
};
