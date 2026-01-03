import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import type { AcademicCalendar } from "@/types/calendar";

export async function getAcademicCalendar(academicYearId?: string): Promise<AcademicCalendar | null> {
  if (!academicYearId) return null;
  const response = await api.get(`/academic-calendar/${academicYearId}`);
  return unwrapData<AcademicCalendar>(response);
}

export async function createAcademicCalendar(
  input: Omit<AcademicCalendar, "id">
): Promise<AcademicCalendar> {
  const response = await api.post("/academic-calendar", input as unknown as Record<string, unknown>);
  return unwrapData<AcademicCalendar>(response);
}

export async function updateAcademicCalendar(
  id: string,
  input: Partial<AcademicCalendar>
): Promise<AcademicCalendar> {
  const response = await api.post("/academic-calendar", {
    ...input,
    academic_year_id: input.academic_year_id ?? id,
  } as unknown as Record<string, unknown>);
  return unwrapData<AcademicCalendar>(response);
}
