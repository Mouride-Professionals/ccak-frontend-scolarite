import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  FacultyMember,
  FacultyMemberFilters,
  FacultyMembersResponse,
  CreateFacultyMemberInput,
  UpdateFacultyMemberInput,
  FacultyDocument,
  CreateFacultyDocumentInput,
  FacultyContract,
  CreateFacultyContractInput,
  FacultyWorkload,
} from "@/types/academic";

export async function getFacultyMembers(
  filters?: FacultyMemberFilters
): Promise<FacultyMembersResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.search) params.append("filter[search]", filters.search);
  if (filters?.department_id) params.append("filter[department_id]", filters.department_id);
  if (filters?.rank) params.append("filter[rank]", filters.rank);
  if (filters?.contract_type)
    params.append("filter[contract_type]", filters.contract_type.toString());
  if (filters?.is_active !== undefined)
    params.append("filter[is_active]", filters.is_active.toString());

  const response = await api.get(`/faculty-members${params.toString() ? `?${params}` : ""}`);
  return toPaginated<FacultyMember>(response);
}

export async function getFacultyMember(id: string): Promise<FacultyMember | null> {
  try {
    const response = await api.get(`/faculty-members/${id}`);
    return unwrapData<FacultyMember>(response);
  } catch {
    return null;
  }
}

export async function createFacultyMember(input: CreateFacultyMemberInput): Promise<FacultyMember> {
  const response = await api.post("/faculty-members", input as unknown as Record<string, unknown>);
  return unwrapData<FacultyMember>(response);
}

export async function updateFacultyMember(
  id: string,
  input: UpdateFacultyMemberInput
): Promise<FacultyMember> {
  const response = await api.put(
    `/faculty-members/${id}`,
    input as unknown as Record<string, unknown>
  );
  return unwrapData<FacultyMember>(response);
}

export async function getFacultyDocuments(facultyId: string): Promise<FacultyDocument[]> {
  const response = await api.get(`/faculty-members/${facultyId}/documents`);
  return toPaginated<FacultyDocument>(response).data;
}

export async function createFacultyDocument(
  facultyId: string,
  input: CreateFacultyDocumentInput
): Promise<FacultyDocument> {
  const formData = new FormData();
  formData.append("document", input.document);
  formData.append("type", input.type);

  const response = await api.post(`/faculty-members/${facultyId}/documents`, formData, {
    headers: {},
  });
  return unwrapData<FacultyDocument>(response);
}

export async function getFacultyContracts(facultyId: string): Promise<FacultyContract[]> {
  const response = await api.get(`/faculty-members/${facultyId}/contracts`);
  return toPaginated<FacultyContract>(response).data;
}

export async function createFacultyContract(
  facultyId: string,
  input: CreateFacultyContractInput
): Promise<FacultyContract> {
  if (input.file) {
    const formData = new FormData();
    formData.append("contract_type", String(input.contract_type));
    formData.append("start_date", input.start_date);
    if (input.end_date) formData.append("end_date", input.end_date);
    if (input.salary != null) formData.append("salary", String(input.salary));
    formData.append("is_current", String(input.is_current ?? true));
    formData.append("file", input.file);

    const response = await api.post(`/faculty-members/${facultyId}/contracts`, formData, {
      headers: {},
    });
    return unwrapData<FacultyContract>(response);
  }

  const response = await api.post(
    `/faculty-members/${facultyId}/contracts`,
    {
      contract_type: input.contract_type,
      start_date: input.start_date,
      end_date: input.end_date ?? null,
      salary: input.salary ?? null,
      is_current: input.is_current ?? true,
    },
    {}
  );
  return unwrapData<FacultyContract>(response);
}

export async function getFacultyWorkload(facultyId: string): Promise<FacultyWorkload> {
  const response = await api.get(`/faculty-members/${facultyId}/workload`);
  const payload = unwrapData<FacultyWorkload | null>(response);

  if (!payload) {
    return {
      total_hours: 0,
      assigned_courses: 0,
      overload_hours: 0,
      breakdown: [],
    };
  }
  return payload;
}
