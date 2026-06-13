"use client";

import { getSession } from "next-auth/react";
import { sanitizePayload } from "@/lib/sanitize";
import { logError } from "@/lib/error-handler";

type ApiOptions = Omit<RequestInit, "body" | "headers"> & {
  /** Relative path (appends to base) or absolute URL */
  path: string;
  /** When true, treats empty responses as null */
  expectJson?: boolean;
  /** When true, do not write failed responses to console logging. */
  suppressErrorLogging?: boolean;
  /** Request body: JSON-serializable object or standard BodyInit */
  body?: BodyInit | object | null;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  status: number;
  statusText: string;
  body?: unknown;

  constructor(message: string, status: number, statusText: string, body?: unknown) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

const getAuthToken = async (): Promise<string | undefined> => {
  const session = await getSession();
  return session?.accessToken;
};

async function handleResponse<T>(
  res: Response,
  expectJson: boolean,
  suppressErrorLogging = false
): Promise<T> {
  if (res.ok) {
    if (expectJson === false || res.status === 204) {
      return null as T;
    }
    const text = await res.text();
    if (!text) return null as T;
    return JSON.parse(text) as T;
  }

  let body: unknown = undefined;
  try {
    body = await res.json();
  } catch {
    // non-JSON error body
  }
  const error = new ApiError("Request failed", res.status, res.statusText, body);

  if (process.env.NODE_ENV === "development") {
    console.warn("[apiFetch] Non-OK response", {
      status: res.status,
      statusText: res.statusText,
      redirected: res.redirected,
      responseUrl: res.url,
    });
  }

  // Security: Log errors without exposing sensitive data
  if (!suppressErrorLogging) {
    logError(error, `API ${res.status}`);
  }

  throw error;
}

export async function apiFetch<T = unknown>(options: ApiOptions): Promise<T> {
  const { path, expectJson = true, suppressErrorLogging = false, headers, body, ...rest } = options;

  if (!path.startsWith("http") && !BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required for relative API paths.");
  }

  const rawUrl = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const url =
    process.env.NODE_ENV === "production" && rawUrl.startsWith("http://")
      ? rawUrl.replace("http://", "https://")
      : rawUrl;

  const authToken = await getAuthToken();

  const isJsonBody =
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob);

  const mergedHeaders: HeadersInit = {
    Accept: "application/json",
    ...(isJsonBody ? { "Content-Type": "application/json" } : null),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : null),
    ...headers,
  };

  const init: RequestInit = {
    ...rest,
    headers: mergedHeaders,
    // Sanitize string fields before sending to reduce XSS risk.
    body: isJsonBody ? JSON.stringify(sanitizePayload(body)) : (body as BodyInit),
  };

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[apiFetch] Network/CORS failure", {
        url,
        method: init.method ?? "GET",
        hasAuthToken: Boolean(authToken),
        error,
      });
    }
    throw error;
  }
  // Do not force sign-out at transport layer.
  // Some endpoints can return 401 for domain/permission mismatches, and global sign-out
  // here creates redirect loops. Authentication flow is handled by NextAuth middleware/session.
  return handleResponse<T>(res, expectJson, suppressErrorLogging);
}

// Convenience helpers
export const api = {
  get: <T>(path: string, init: Omit<ApiOptions, "path" | "method" | "body"> = {}) =>
    apiFetch<T>({ path, method: "GET", ...init }),
  post: <T>(
    path: string,
    body?: ApiOptions["body"],
    init: Omit<ApiOptions, "path" | "method" | "body"> = {}
  ) => apiFetch<T>({ path, method: "POST", body, ...init }),
  put: <T>(
    path: string,
    body?: ApiOptions["body"],
    init: Omit<ApiOptions, "path" | "method" | "body"> = {}
  ) => apiFetch<T>({ path, method: "PUT", body, ...init }),
  patch: <T>(
    path: string,
    body?: ApiOptions["body"],
    init: Omit<ApiOptions, "path" | "method" | "body"> = {}
  ) => apiFetch<T>({ path, method: "PATCH", body, ...init }),
  del: <T>(path: string, init: Omit<ApiOptions, "path" | "method" | "body"> = {}) =>
    apiFetch<T>({ path, method: "DELETE", ...init }),
};
