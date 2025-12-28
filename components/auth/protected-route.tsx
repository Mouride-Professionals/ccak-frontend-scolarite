"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

function ProtectedRouteInner({ children }: ProtectedRouteProps) {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status ?? "loading";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "unauthenticated" || session?.error === "RefreshAccessTokenError") {
      const query = searchParams.toString();
      const safePath = pathname ?? "/";
      const callbackUrl = query ? `${safePath}?${query}` : safePath;
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      router.replace(loginUrl);
    }
  }, [status, session?.error, pathname, searchParams, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
          <p className="mt-4 text-sm text-zinc-600">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.error === "RefreshAccessTokenError") {
    return null;
  }

  return <>{children}</>;
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
            <p className="mt-4 text-sm text-zinc-600">Préparation de votre session...</p>
          </div>
        </div>
      }
    >
      <ProtectedRouteInner {...props} />
    </Suspense>
  );
}
