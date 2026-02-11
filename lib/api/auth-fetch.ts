import { getSession, signOut } from "next-auth/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api/v1";

const enforceHttps = (url: string) => {
  if (process.env.NODE_ENV === "production" && url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
};

export async function authFetch(endpoint: string, options: RequestInit = {}) {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }

  const url = enforceHttps(`${API_BASE_URL}${endpoint}`);

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.accessToken}`,
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    await signOut({ callbackUrl: "/login" });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "An error occurred",
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response;
}
