import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import type { AcademicCalendar } from "@/types/calendar";

export async function getAcademicCalendar(academicYearId?: string): Promise<AcademicCalendar | null> {
  const params = new URLSearchParams();
  if (academicYearId) params.append("filter[academic_year_id]", academicYearId);
  const response = await api.get(`/academic-calendar${params.toString() ? `?${params}` : ""}`);
  return unwrapData<AcademicCalendar | null>(response);
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
  const response = await api.put(
    `/academic-calendar/${id}`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<AcademicCalendar>(response);
}
