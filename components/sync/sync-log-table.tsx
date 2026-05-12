"use client";

import type { SyncLog } from "@/types/sync-log";
import { SyncStatus } from "@/types/sync-log";

interface SyncLogTableProps {
  logs: SyncLog[];
}

const statusConfig: Record<SyncStatus, { label: string; bgColor: string; textColor: string }> = {
  [SyncStatus.SUCCESS]: { label: "Succès", bgColor: "bg-green-100", textColor: "text-green-800" },
  [SyncStatus.PARTIAL]: { label: "Partiel", bgColor: "bg-amber-100", textColor: "text-amber-800" },
  [SyncStatus.FAILED]: { label: "Échec", bgColor: "bg-red-100", textColor: "text-red-800" },
};

const formatDatetime = (value: string | null) => {
  if (!value) return "—";
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

export default function SyncLogTable({ logs }: SyncLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">Aucun journal de synchronisation trouvé.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-[#00365F]/10">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6">
                Entité
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6">
                Statut
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6">
                Reçus
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6">
                Mis à jour
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6">
                Erreurs
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 lg:table-cell">
                Démarré
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 lg:table-cell">
                Terminé
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {logs.map((log) => {
              const cfg = statusConfig[log.status];
              return (
                <tr key={log.id} className="bg-white transition-colors hover:bg-zinc-50/50">
                  <td className="px-4 py-4 font-medium text-zinc-900 sm:px-6">{log.entity_type}</td>
                  <td className="px-4 py-4 sm:px-6">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bgColor} ${cfg.textColor}`}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-zinc-600 sm:px-6">{log.total_received}</td>
                  <td className="px-4 py-4 text-right text-zinc-600 sm:px-6">{log.total_updated}</td>
                  <td className="px-4 py-4 text-right sm:px-6">
                    <span className={log.total_errors > 0 ? "font-medium text-red-600" : "text-zinc-600"}>
                      {log.total_errors}
                    </span>
                  </td>
                  <td className="hidden px-4 py-4 text-zinc-600 sm:px-6 lg:table-cell">
                    {formatDatetime(log.started_at)}
                  </td>
                  <td className="hidden px-4 py-4 text-zinc-600 sm:px-6 lg:table-cell">
                    {formatDatetime(log.completed_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
