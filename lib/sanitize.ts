import DOMPurify from "dompurify";

const stripTagsConfig = { ALLOWED_TAGS: [] as string[], ALLOWED_ATTR: [] as string[] };

export function sanitizeHtml(input: string): string {
  if (typeof window === "undefined") {
    return input;
  }
  return DOMPurify.sanitize(input, { USE_PROFILES: { html: true } });
}

export function sanitizeText(input: string): string {
  if (typeof window === "undefined") {
    return input.replace(/[<>]/g, "");
  }
  return DOMPurify.sanitize(input, stripTagsConfig);
}

export function sanitizeUrlParam(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return sanitizeText(trimmed);
}

export function sanitizePayload<T>(payload: T): T {
  if (!payload || typeof payload !== "object") return payload;

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item)) as T;
  }

  const entries = Object.entries(payload as Record<string, unknown>).map(([key, value]) => {
    if (typeof value === "string") {
      return [key, sanitizeText(value)];
    }
    return [key, sanitizePayload(value)];
  });

  return Object.fromEntries(entries) as T;
}
