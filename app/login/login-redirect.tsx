"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

type LoginRedirectProps = {
  callbackUrl: string;
};

export default function LoginRedirect({ callbackUrl }: LoginRedirectProps) {
  useEffect(() => {
    void signIn("keycloak", { callbackUrl });
  }, [callbackUrl]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#DAE4EB]">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-lg">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
            <img src="/logo.svg" alt="CCAK Logo" className="h-full w-full" />
          </div>
          <h1 className="text-2xl font-bold text-[#00365F]">CCAK - Back Office</h1>
          <p className="mt-2 text-sm text-zinc-600">Gestion académique et administrative</p>
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">Redirection vers Keycloak...</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Vous allez être redirigé vers la page de connexion.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Si la redirection ne fonctionne pas, cliquez sur le bouton ci-dessous.
          </p>

          <button
            className="mt-6 w-full rounded-lg bg-[#008D36] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
            onClick={() => signIn("keycloak", { callbackUrl })}
          >
            Se connecter avec Keycloak
          </button>
        </div>
      </div>
    </main>
  );
}
