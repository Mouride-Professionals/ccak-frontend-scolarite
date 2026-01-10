"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as calendarApi from "@/lib/api/academic-calendar";
import * as holidaysApi from "@/lib/api/holidays";
import * as roomsApi from "@/lib/api/rooms";
import * as activityTypesApi from "@/lib/api/activity-types";
import * as schedulesApi from "@/lib/api/schedules";
import type { AcademicCalendar, Holiday, Room } from "@/types/calendar";
import type { HolidayFilters } from "@/lib/api/holidays";
import type { RoomFilters } from "@/lib/api/rooms";
import type { ActivityTypeFilters } from "@/lib/api/activity-types";
import type { ScheduleFilters } from "@/lib/api/schedules";

export const calendarKeys = {
  calendar: (academicYearId?: string) => ["academic-calendar", academicYearId],
  holidays: (filters?: HolidayFilters) => ["holidays", filters],
  rooms: (filters?: RoomFilters) => ["rooms", filters],
  activityTypes: (filters?: ActivityTypeFilters) => ["activity-types", filters],
  schedules: (filters?: ScheduleFilters) => ["schedules", filters],
  programSchedule: (programId: string, filters?: { semester?: number; week?: string }) => [
    "program-schedule",
    programId,
    filters,
  ],
  facultySchedule: (facultyId: string, filters?: { week?: string; month?: string }) => [
    "faculty-schedule",
    facultyId,
    filters,
  ],
  studentSchedule: (studentId: string, filters?: { week?: string }) => [
    "student-schedule",
    studentId,
    filters,
  ],
};

export function useAcademicCalendar(academicYearId?: string) {
  return useQuery({
    queryKey: calendarKeys.calendar(academicYearId),
    queryFn: () => calendarApi.getAcademicCalendar(academicYearId),
  });
}

export function useSaveAcademicCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string; payload: AcademicCalendar }) =>
      input.id
        ? calendarApi.updateAcademicCalendar(input.id, input.payload)
        : calendarApi.createAcademicCalendar(input.payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: calendarKeys.calendar(variables.payload.academic_year_id),
      });
    },
  });
}

export function useHolidays(filters?: HolidayFilters) {
  return useQuery({
    queryKey: calendarKeys.holidays(filters),
    queryFn: () => holidaysApi.getHolidays(filters),
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: holidaysApi.createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Holiday> }) =>
      holidaysApi.updateHoliday(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => holidaysApi.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useRooms(filters?: RoomFilters) {
  return useQuery({
    queryKey: calendarKeys.rooms(filters),
    queryFn: () => roomsApi.getRooms(filters),
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roomsApi.createRoom,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Room> }) =>
      roomsApi.updateRoom(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomsApi.deleteRoom(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useActivityTypes(filters?: ActivityTypeFilters) {
  return useQuery({
    queryKey: calendarKeys.activityTypes(filters),
    queryFn: () => activityTypesApi.getActivityTypes(filters),
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: schedulesApi.createSchedule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  });
}

export function useSchedules(filters?: ScheduleFilters) {
  return useQuery({
    queryKey: calendarKeys.schedules(filters),
    queryFn: () => schedulesApi.getSchedules(filters),
  });
}

export function useCheckAvailability() {
  return useMutation({
    mutationFn: schedulesApi.checkAvailability,
  });
}

export function useProgramSchedule(
  programId: string,
  filters?: { semester?: number; week?: string }
) {
  return useQuery({
    queryKey: calendarKeys.programSchedule(programId, filters),
    queryFn: () => schedulesApi.getProgramSchedule(programId, filters),
    enabled: !!programId,
  });
}

export function useFacultySchedule(facultyId: string, filters?: { week?: string; month?: string }) {
  return useQuery({
    queryKey: calendarKeys.facultySchedule(facultyId, filters),
    queryFn: () => schedulesApi.getFacultySchedule(facultyId, filters),
    enabled: !!facultyId,
  });
}

export function useStudentSchedule(studentId: string, filters?: { week?: string }) {
  return useQuery({
    queryKey: calendarKeys.studentSchedule(studentId, filters),
    queryFn: () => schedulesApi.getStudentSchedule(studentId, filters),
    enabled: !!studentId,
  });
}
