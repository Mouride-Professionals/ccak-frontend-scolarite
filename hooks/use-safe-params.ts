"use client";

import { useParams } from "next/navigation";
import { sanitizeUrlParam } from "@/lib/sanitize";

export function useSafeParams<T extends Record<string, string>>() {
  const params = useParams();
  const sanitized = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      sanitizeUrlParam(Array.isArray(value) ? (value[0] ?? "") : (value ?? "")),
    ])
  );

  return sanitized as T;
}
