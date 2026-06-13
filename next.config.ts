import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://si-api.ucak.sn";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const requiredEnv = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "KEYCLOAK_BASE_URL",
  "KEYCLOAK_REALM",
  "KEYCLOAK_CLIENT_ID",
];

if (isProd) {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

const toConnectSources = (rawUrl: string) => {
  const normalized = rawUrl.trim().replace(/\/$/, "");

  try {
    const parsed = new URL(normalized);
    return [parsed.origin, normalized];
  } catch {
    return [normalized];
  }
};

const connectSrc = new Set<string>(["'self'", "https://si-api.ucak.sn"]);

for (const value of [apiBaseUrl, apiUrl]) {
  if (value) {
    for (const source of toConnectSources(value)) {
      connectSrc.add(source);
    }
  }
}

// CSP is report-only in dev, enforced in prod.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src ${Array.from(connectSrc).join(" ")}`,
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  {
    key: isProd ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    value: csp,
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
