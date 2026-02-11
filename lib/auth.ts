import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";
import { buildKeycloakIssuer, buildKeycloakTokenUrl, buildKeycloakLogoutUrl } from "@/lib/keycloak";

type RefreshableToken = JWT & {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpires?: number;
  error?: "RefreshAccessTokenError";
};

const keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL;
const keycloakRealm = process.env.KEYCLOAK_REALM;
const keycloakIssuer =
  process.env.KEYCLOAK_ISSUER ??
  (keycloakBaseUrl && keycloakRealm
    ? buildKeycloakIssuer(keycloakBaseUrl, keycloakRealm)
    : undefined);
const keycloakTokenUrl =
  keycloakBaseUrl && keycloakRealm
    ? buildKeycloakTokenUrl(keycloakBaseUrl, keycloakRealm)
    : undefined;

const refreshAccessToken = async (token: RefreshableToken): Promise<RefreshableToken> => {
  if (!token.refreshToken || !keycloakTokenUrl || !process.env.KEYCLOAK_CLIENT_ID) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  try {
    const params = new URLSearchParams();
    params.set("client_id", process.env.KEYCLOAK_CLIENT_ID);
    if (process.env.KEYCLOAK_CLIENT_SECRET) {
      params.set("client_secret", process.env.KEYCLOAK_CLIENT_SECRET);
    }
    params.set("grant_type", "refresh_token");
    params.set("refresh_token", token.refreshToken);

    const response = await fetch(keycloakTokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const refreshedTokens = (await response.json()) as {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
      id_token?: string;
    };

    if (!response.ok) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      idToken: refreshedTokens.id_token ?? token.idToken,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.callback-url"
          : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.csrf-token"
          : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
      issuer: keycloakIssuer,
      authorization: { params: { scope: "openid profile email" } },
      checks: ["pkce", "state"],
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        const accountWithExpiresIn = account as typeof account & { expires_in?: number };
        const expiresAt =
          account.expires_at ??
          (accountWithExpiresIn.expires_in
            ? Math.floor(Date.now() / 1000) + accountWithExpiresIn.expires_in
            : undefined);

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          accessTokenExpires: expiresAt ? expiresAt * 1000 : undefined,
        } satisfies RefreshableToken;
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - 60_000) {
        return token;
      }

      return refreshAccessToken(token as RefreshableToken);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.idToken = token.idToken as string | undefined;
      session.error = token.error as "RefreshAccessTokenError" | undefined;
      return session;
    },
  },
};
