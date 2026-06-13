import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
  }

  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id?: string;
    };
    accessToken?: string;
    idToken?: string;
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpires?: number;
    error?: "RefreshAccessTokenError";
  }
}

export {};
