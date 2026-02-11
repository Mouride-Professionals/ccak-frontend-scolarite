const allowedRedirectHosts = new Set<string>(
  [process.env.NEXTAUTH_URL, process.env.NEXT_PUBLIC_APP_URL]
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value as string).host;
      } catch {
        return "";
      }
    })
    .filter(Boolean)
);

export function normalizeRedirectUrl(input: string, fallback = "/dashboard"): string {
  if (!input) return fallback;
  if (input.startsWith("/")) return input;

  try {
    const url = new URL(input);
    if (!allowedRedirectHosts.has(url.host)) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function isSafeRedirect(input?: string): boolean {
  if (!input) return false;
  if (input.startsWith("/")) return true;

  try {
    const url = new URL(input);
    return allowedRedirectHosts.has(url.host);
  } catch {
    return false;
  }
}
