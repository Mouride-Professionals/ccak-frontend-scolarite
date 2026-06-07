"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import SyncLogTable from "@/components/sync/sync-log-table";
import SyncSourceCard from "@/components/sync/sync-source-card";
import Pagination from "@/components/ui/pagination";
import Toast from "@/components/ui/toast";
import { useSyncLogs, useSyncStats, useTriggerSync } from "@/hooks/use-sync-logs";

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

// Entity definitions — ordered: API-syncable first, then static
const ENTITY_CONFIG = [
  {
    key: "students",
    label: "Étudiants",
    description: "Données étudiants depuis le SI CCAK",
    isStatic: false,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    key: "degree_cycles",
    label: "Cycles de formation",
    description: "Licence, Master, Doctorat, Classe Préparatoire",
    isStatic: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    ),
  },
  {
    key: "niveaux",
    label: "Niveaux",
    description: "L1, L2, L3, M1, M2, Doctorat…",
    isStatic: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    key: "ufr",
    label: "UFR / Facultés",
    description: "ETISAR, SATA, MET, SMS, ILAMEL, CP",
    isStatic: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    key: "departements",
    label: "Départements",
    description: "HEC, Informatique, Agronomie…",
    isStatic: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    key: "programmes",
    label: "Programmes",
    description: "Licences et spécialités par département",
    isStatic: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    key: "academic_years",
    label: "Années académiques",
    description: "2023-2024, 2024-2025, 2025-2026",
    isStatic: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

const API_ENTITIES = ENTITY_CONFIG.filter((e) => !e.isStatic).map((e) => e.key);

function SyncPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState<string>("");
  const [syncingEntity, setSyncingEntity] = useState<string | null>(null); // entity key or "all"
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({ isOpen: false, message: "", type: "success" });

  const isAdmin =
    status === "authenticated" && getRealmRoles(session?.accessToken).includes("ADMIN");

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [status, isAdmin, router]);

  const { data: logsData, isLoading: logsLoading } = useSyncLogs({
    page,
    limit: 20,
    entity_type: entityFilter || undefined,
  });
  const { data: stats, isLoading: statsLoading } = useSyncStats();
  const triggerSync = useTriggerSync();

  const handleSync = async (entityKey?: string) => {
    const key = entityKey ?? "all";
    setSyncingEntity(key);
    try {
      await triggerSync.mutateAsync(entityKey);
      setToast({
        isOpen: true,
        message: entityKey
          ? `Synchronisation de "${ENTITY_CONFIG.find((e) => e.key === entityKey)?.label}" réussie.`
          : "Synchronisation globale déclenchée avec succès.",
        type: "success",
      });
    } catch {
      setToast({
        isOpen: true,
        message: "Erreur lors de la synchronisation.",
        type: "error",
      });
    } finally {
      setSyncingEntity(null);
    }
  };

  if (status === "loading" || (status === "authenticated" && !isAdmin)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]" />
      </div>
    );
  }

  const isSyncingAll = syncingEntity === "all";

  return (
    <DashboardLayout title="Synchronisation CCAK">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600 sm:max-w-md">
            Gérez la synchronisation des données avec le système d&apos;information CCAK. Les
            données statiques ont été fournies directement par CCAK.
          </p>
          <button
            type="button"
            onClick={() => handleSync()}
            disabled={syncingEntity !== null}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${isSyncingAll ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isSyncingAll ? "Synchronisation..." : "Tout synchroniser"}
          </button>
        </div>

        {/* Sources grid */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Sources de données
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ENTITY_CONFIG.map((entity) => (
              <SyncSourceCard
                key={entity.key}
                label={entity.label}
                description={entity.description}
                icon={entity.icon}
                isStatic={entity.isStatic}
                stats={stats?.[entity.key]}
                statsLoading={statsLoading}
                isSyncing={
                  syncingEntity === entity.key ||
                  (isSyncingAll && API_ENTITIES.includes(entity.key))
                }
                onSync={() => handleSync(entity.key)}
              />
            ))}
          </div>
        </section>

        {/* History */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Historique
            </h2>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            >
              <option value="">Toutes les entités</option>
              {ENTITY_CONFIG.map((e) => (
                <option key={e.key} value={e.key}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          {logsLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]" />
            </div>
          ) : (
            <SyncLogTable logs={logsData?.data ?? []} />
          )}

          <div className="mt-4">
            <Pagination
              page={logsData?.page ?? 1}
              totalPages={logsData?.total_pages ?? 1}
              totalItems={logsData?.total ?? 0}
              perPage={logsData?.limit ?? 20}
              itemLabel="journaux"
              onPageChange={setPage}
              onPerPageChange={() => {}}
            />
          </div>
        </section>
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
