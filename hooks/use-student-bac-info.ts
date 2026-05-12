"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateStudentBacInfoInput } from "@/types/student";
import * as bacInfoApi from "@/lib/api/student-bac-info";

export const bacInfoKeys = {
  all: ["student-bac-info"] as const,
  detail: (studentId: string) => [...bacInfoKeys.all, studentId] as const,
};

export function useStudentBacInfo(studentId: string, enabled = true) {
  return useQuery({
    queryKey: bacInfoKeys.detail(studentId),
    queryFn: () => bacInfoApi.getStudentBacInfo(studentId),
    enabled: enabled && !!studentId,
    staleTime: 30000,
  });
}

export function useCreateStudentBacInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStudentBacInfoInput) => bacInfoApi.createStudentBacInfo(input),
    onSuccess: (data) => {
      queryClient.setQueryData(bacInfoKeys.detail(data.student_id), data);
    },
  });
}

export function useUpdateStudentBacInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      input,
    }: {
      studentId: string;
      input: Partial<CreateStudentBacInfoInput>;
    }) => bacInfoApi.updateStudentBacInfo(studentId, input),
    onSuccess: (data) => {
      queryClient.setQueryData(bacInfoKeys.detail(data.student_id), data);
    },
  });
}
