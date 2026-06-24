"use client";

import { useEffect, useRef, useState } from "react";
import type { EntityStats } from "@/types/sync-log";
import { SyncStatus } from "@/types/sync-log";

interface SyncSourceCardProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  isStatic: boolean;
  stats?: EntityStats | null;
  statsLoading?: boolean;
  isSyncing?: boolean;
  onSync?: () => void;
}

const statusConfig: Record<SyncStatus, { label: string; bgColor: string; textColor: string }> = {
  [SyncStatus.SUCCESS]: { label: "Succès", bgColor: "bg-green-100", textColor: "text-green-700" },
  [SyncStatus.PARTIAL]: { label: "Partiel", bgColor: "bg-amber-100", textColor: "text-amber-700" },
  [SyncStatus.FAILED]: { label: "Échec", bgColor: "bg-red-100", textColor: "text-red-700" },
};

const formatDatetime = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function useElapsedTime(active: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      startRef.current = null;
      return;
    }
    startRef.current = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current!) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  return elapsed;
}

export default function SyncSourceCard({
  label,
  description,
  icon,
  isStatic,
  stats,
  statsLoading,
  isSyncing,
  onSync,
}: SyncSourceCardProps) {
  const lastSynced = formatDatetime(stats?.last_synced_at);
  const statusCfg = stats?.status ? statusConfig[stats.status] : null;
  const elapsed = useElapsedTime(!!isSyncing);

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
        isSyncing
          ? "border-[#008D36] shadow-[0_0_0_3px_rgba(0,141,54,0.15)]"
          : isStatic
            ? "border-zinc-200"
            : "border-[#008D36]/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isStatic ? "bg-zinc-100 text-zinc-500" : "bg-[#008D36]/10 text-[#008D36]"
            }`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{label}</p>
            <p className="text-xs text-zinc-500">{description}</p>
          </div>
        </div>

        {isStatic ? (
          <div className="group relative shrink-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
              Statique
            </span>
            <div className="pointer-events-none absolute right-0 top-full z-20 mt-1.5 hidden w-60 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs leading-relaxed text-zinc-500 shadow-lg group-hover:block">
              Ces données ont été fournies directement par CCAK et chargées manuellement. Elles
              seront synchronisables automatiquement lorsque l&apos;API les exposera.
            </div>
          </div>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#008D36]/10 px-2.5 py-1 text-xs font-medium text-[#008D36]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#008D36]" />
            Via API
          </span>
        )}
      </div>

      {/* Stats */}
      {!isStatic && (
        <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3">
          {isSyncing ? (
            <>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full animate-[indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-[#008D36]" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">Synchronisation en cours…</p>
                <p className="text-xs font-medium tabular-nums text-zinc-400">{elapsed}s</p>
              </div>
            </>
          ) : statsLoading ? (
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-100" />
          ) : (
            <div className="flex items-center gap-4">
              {stats?.total != null && (
                <div className="text-center">
                  <p className="text-lg font-bold text-zinc-900">
                    {stats.total.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-xs text-zinc-500">synchronisés</p>
                </div>
              )}
              {statusCfg && (
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.bgColor} ${statusCfg.textColor}`}
                >
                  {statusCfg.label}
                </span>
              )}
              <div className="ml-auto text-right">
                {lastSynced ? (
                  <>
                    <p className="text-xs text-zinc-400">Dernière sync</p>
                    <p className="text-xs font-medium text-zinc-700">{lastSynced}</p>
                  </>
                ) : (
                  <p className="text-xs text-zinc-400">Jamais synchronisé</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action */}
      {!isStatic && (
        <button
          type="button"
          onClick={onSync}
          disabled={isSyncing}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#008D36] px-3 py-2 text-sm font-medium text-[#008D36] transition-colors hover:bg-[#008D36] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
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
          {isSyncing ? "Synchronisation..." : "Synchroniser"}
        </button>
      )}
    </div>
  );
}
