"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import SyncLogTable from "@/components/sync/sync-log-table";
import Pagination from "@/components/ui/pagination";
import Toast from "@/components/ui/toast";
import { useSyncLogs, useTriggerSync } from "@/hooks/use-sync-logs";

function getRealmRoles(accessToken: string | undefined): string[] {
  if (!accessToken) return [];
  try {
    const [, payload] = accessToken.split(".");
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(padded)) as { realm_access?: { roles?: string[] } };
    return decoded?.realm_access?.roles ?? [];
  } catch {
    return [];
  }
}

function SyncPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const isAdmin =
    status === "authenticated" && getRealmRoles(session?.accessToken).includes("ADMIN");

  // Redirect non-admins once session is resolved
  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [status, isAdmin, router]);

  const { data, isLoading } = useSyncLogs({ page, limit: 20 });
  const triggerSync = useTriggerSync();

  // Backend sync routes are not yet implemented — disable trigger until available
  const isSyncEndpointReady = true;

  const handleTriggerSync = async () => {
    try {
      await triggerSync.mutateAsync(undefined);
      setToast({
        isOpen: true,
        message: "Synchronisation déclenchée avec succès.",
        type: "success",
      });
    } catch {
      setToast({
        isOpen: true,
        message: "Erreur lors du déclenchement de la synchronisation.",
        type: "error",
      });
    }
  };

  if (status === "loading" || (status === "authenticated" && !isAdmin)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Synchronisation CCAK">
      <div className="space-y-6">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-600">
            Historique des synchronisations de données avec l&apos;API CCAK.
          </p>
          <div className="relative group">
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={!isSyncEndpointReady || triggerSync.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {triggerSync.isPending ? "Synchronisation..." : "Déclencher la synchronisation"}
            </button>
            {!isSyncEndpointReady && (
              <div className="pointer-events-none absolute right-0 top-full z-10 mt-1 hidden w-64 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-500 shadow-lg group-hover:block">
                En attente du endpoint backend (<code>/admin/sync</code>)
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]" />
          </div>
        ) : (
          <SyncLogTable logs={data?.data ?? []} />
        )}

        <Pagination
          page={data?.page ?? 1}
          totalPages={data?.total_pages ?? 1}
          totalItems={data?.total ?? 0}
          perPage={data?.limit ?? 20}
          itemLabel="journaux"
          onPageChange={setPage}
          onPerPageChange={() => {}}
        />
      </div>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </DashboardLayout>
  );
}

export default function SyncPage() {
  return (
    <ProtectedRoute>
      <SyncPageContent />
    </ProtectedRoute>
  );
}
