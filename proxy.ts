import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/forgot-password"];
const PUBLIC_PATH_PREFIXES = ["/api/auth", "/documents/verify"];
const ROLE_PROTECTED_PREFIXES = [
  {
    prefix: "/dashboard/announcements",
    allowedRoles: ["admin", "super_admin", "super-admin"],
  },
  {
    prefix: "/dashboard/notifications",
    allowedRoles: ["admin", "super_admin", "super-admin"],
  },
  {
    prefix: "/dashboard/templates",
    allowedRoles: ["admin", "super_admin", "super-admin"],
  },
] as const;

const normalizeRole = (role: string) => role.trim().toLowerCase();

const extractStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

const decodeJwtPayload = (jwt: string): Record<string, unknown> | null => {
  const parts = jwt.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = atob(padded);
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const extractRoles = (token: Record<string, unknown>): Set<string> => {
  const roles = new Set<string>();
  const pushRoles = (values: string[]) => {
    values.forEach((role) => {
      const normalized = normalizeRole(role);
      if (normalized) roles.add(normalized);
    });
  };

  pushRoles(extractStringArray(token.roles));

  const realmAccess = token.realm_access as Record<string, unknown> | undefined;
  if (realmAccess) {
    pushRoles(extractStringArray(realmAccess.roles));
  }

  const resourceAccess = token.resource_access as Record<string, unknown> | undefined;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  if (resourceAccess && clientId && typeof resourceAccess[clientId] === "object") {
    const clientAccess = resourceAccess[clientId] as Record<string, unknown>;
    pushRoles(extractStringArray(clientAccess.roles));
  }

  const accessToken = typeof token.accessToken === "string" ? token.accessToken : null;
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    const payloadRealmAccess = payload?.realm_access as Record<string, unknown> | undefined;
    if (payloadRealmAccess) {
      pushRoles(extractStringArray(payloadRealmAccess.roles));
    }

    const payloadResourceAccess = payload?.resource_access as Record<string, unknown> | undefined;
    if (payloadResourceAccess && clientId && typeof payloadResourceAccess[clientId] === "object") {
      const payloadClientAccess = payloadResourceAccess[clientId] as Record<string, unknown>;
      pushRoles(extractStringArray(payloadClientAccess.roles));
    }
  }

  return roles;
};

const isPublicPath = (pathname: string): boolean => {
  if (PUBLIC_PATHS.includes(pathname)) {
    return true;
  }
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

const buildLoginRedirect = (req: NextRequest) => {
  const loginUrl = req.nextUrl.clone();
  const callbackUrl = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("callbackUrl", callbackUrl || "/dashboard");
  return NextResponse.redirect(loginUrl);
};

const buildForbiddenRedirect = (req: NextRequest) => {
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = "/dashboard";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("error", "forbidden");
  return NextResponse.redirect(redirectUrl);
};

export async function proxy(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const proto = req.headers.get("x-forwarded-proto");
    if (proto && proto !== "https") {
      const httpsUrl = req.nextUrl.clone();
      httpsUrl.protocol = "https:";
      return NextResponse.redirect(httpsUrl);
    }
  }

  const { pathname } = req.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.error === "RefreshAccessTokenError") {
    return buildLoginRedirect(req);
  }

  const roleRule = ROLE_PROTECTED_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (roleRule) {
    const roles = extractRoles(token as Record<string, unknown>);
    const hasAllowedRole = roleRule.allowedRoles.some((role) => roles.has(normalizeRole(role)));

    // Enforce role checks only when role claims are present in the token.
    if (roles.size > 0 && !hasAllowedRole) {
      return buildForbiddenRedirect(req);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
