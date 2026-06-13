"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useInactivityTimer } from "@/hooks/use-inactivity-timer";

const TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes
const WARNING_MS = 55 * 60 * 1000; // 55 minutes

const clearSensitiveStorage = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // ignore storage errors
  }
};

export default function InactivityGuard() {
  const router = useRouter();
  const { status } = useSession();

  const handleTimeout = async () => {
    clearSensitiveStorage();
    await signOut({ redirect: false });
    router.replace("/login");
  };

  const { showWarning, resetTimers } = useInactivityTimer({
    timeoutMs: TIMEOUT_MS,
    warningMs: WARNING_MS,
    onTimeout: handleTimeout,
  });

  if (status !== "authenticated") {
    return null;
  }

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[#00365F]">Inactivité détectée</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Vous serez déconnecté dans 5 minutes pour des raisons de sécurité.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetTimers}
            className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
          >
            Rester connecté
          </button>
          <button
            type="button"
            onClick={handleTimeout}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
