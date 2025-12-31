export interface ApiEnvelope<T> {
  data: T;
  success?: boolean;
  message?: string;
  meta?: Record<string, unknown>;
  links?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

type PaginatorShape<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function unwrapData<T>(payload: unknown): T {
  if (isObject(payload) && "data" in payload) {
    return (payload as unknown as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export function toPaginated<T>(payload: unknown): PaginatedResponse<T> {
  if (!payload) {
    return { data: [], total: 0, page: 1, limit: 0, total_pages: 1 };
  }

  const value = payload as Record<string, unknown>;
  const dataField = value.data;

  if (isObject(dataField) && Array.isArray((dataField as PaginatorShape<T>).data)) {
    const paginator = dataField as PaginatorShape<T>;
    return {
      data: paginator.data,
      total: paginator.total,
      page: paginator.current_page,
      limit: paginator.per_page,
      total_pages: paginator.last_page,
    };
  }

  if (Array.isArray(dataField) && isObject(value.meta)) {
    const meta = value.meta as Record<string, unknown>;
    return {
      data: dataField,
      total: Number(meta.total ?? dataField.length),
      page: Number(meta.current_page ?? 1),
      limit: Number(meta.per_page ?? dataField.length),
      total_pages: Number(meta.last_page ?? 1),
    };
  }

  if (
    Array.isArray(dataField) &&
    typeof value.current_page === "number" &&
    typeof value.per_page === "number"
  ) {
    return {
      data: dataField,
      total: Number(value.total ?? dataField.length),
      page: Number(value.current_page),
      limit: Number(value.per_page),
      total_pages: Number(value.last_page ?? 1),
    };
  }

  if (Array.isArray(dataField)) {
    return {
      data: dataField,
      total: dataField.length,
      page: 1,
      limit: dataField.length,
      total_pages: 1,
    };
  }

  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      total: (payload as T[]).length,
      page: 1,
      limit: (payload as T[]).length,
      total_pages: 1,
    };
  }

  return { data: [], total: 0, page: 1, limit: 0, total_pages: 1 };
}
