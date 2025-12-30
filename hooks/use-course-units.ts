import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseUnits,
  getCourseUnit,
  createCourseUnit,
  updateCourseUnit,
  deleteCourseUnit,
  getAcademicPrograms,
} from "@/lib/api/course-units";
import { CreateCourseUnitInput, UpdateCourseUnitInput } from "@/types/course-unit";

// Query keys
export const courseUnitKeys = {
  all: ["course-units"] as const,
  lists: () => [...courseUnitKeys.all, "list"] as const,
  list: (filters?: any) => [...courseUnitKeys.lists(), filters] as const,
  details: () => [...courseUnitKeys.all, "detail"] as const,
  detail: (id: string) => [...courseUnitKeys.details(), id] as const,
  academicPrograms: () => [...courseUnitKeys.all, "academic-programs"] as const,
};

// Hooks
export const useCourseUnits = () => {
  return useQuery({
    queryKey: courseUnitKeys.lists(),
    queryFn: getCourseUnits,
  });
};

export const useCourseUnit = (id: string) => {
  return useQuery({
    queryKey: courseUnitKeys.detail(id),
    queryFn: () => getCourseUnit(id),
    enabled: !!id,
  });
};

export const useAcademicPrograms = () => {
  return useQuery({
    queryKey: courseUnitKeys.academicPrograms(),
    queryFn: getAcademicPrograms,
  });
};

export const useCreateCourseUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourseUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseUnitKeys.lists() });
    },
  });
};

export const useUpdateCourseUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCourseUnit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: courseUnitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseUnitKeys.detail(data.id) });
    },
  });
};

export const useDeleteCourseUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourseUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseUnitKeys.lists() });
    },
  });
};
