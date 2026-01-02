import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type { PaginatedResult, Room } from "@/types/calendar";

export interface RoomFilters {
  page?: number;
  limit?: number;
  building?: string;
  type?: string;
  search?: string;
  is_available?: boolean;
}

export async function getRooms(filters?: RoomFilters): Promise<PaginatedResult<Room>> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("per_page", filters.limit.toString());
  if (filters?.building) params.append("filter[building]", filters.building);
  if (filters?.type) params.append("filter[type]", filters.type);
  if (filters?.search) params.append("filter[search]", filters.search);
  if (filters?.is_available !== undefined)
    params.append("filter[is_available]", filters.is_available.toString());

  const response = await api.get(`/rooms${params.toString() ? `?${params}` : ""}`);
  return toPaginated<Room>(response);
}

export async function createRoom(input: Omit<Room, "id">): Promise<Room> {
  const response = await api.post("/rooms", input as unknown as Record<string, unknown>);
  return unwrapData<Room>(response);
}

export async function updateRoom(id: string, input: Partial<Room>): Promise<Room> {
  const response = await api.put(`/rooms/${id}`, input as unknown as Record<string, unknown>);
  return unwrapData<Room>(response);
}

export async function deleteRoom(id: string): Promise<void> {
  await api.del(`/rooms/${id}`);
}
