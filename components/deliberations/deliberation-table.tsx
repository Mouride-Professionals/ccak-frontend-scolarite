"use client";

import Link from "next/link";
import type { DeliberationSession } from "@/types/deliberation";
import DeliberationStatusBadge from "./deliberation-status-badge";

interface DeliberationTableProps {
  sessions: DeliberationSession[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function DeliberationTable({ sessions, onEdit, onDelete }: DeliberationTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">Aucune session de délibération trouvée.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 bg-[#00365F]/10">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Session
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Programme
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Année
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Semestre
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Statut
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Président
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Étudiants
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sessions.map((session) => (
              <tr key={session.id} className="bg-white transition-colors hover:bg-zinc-50/50">
                <td className="px-6 py-5">
                  <Link
                    href={`/deliberations/${session.id}`}
                    className="text-sm font-medium text-[#00365F] hover:text-[#008D36] transition-colors"
                  >
                    {session.session_name}
                  </Link>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-zinc-700">{session.academic_program?.name}</div>
                </td>
                <td className="px-6 py-5 text-sm text-zinc-600">{session.academic_year?.name}</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center rounded-md bg-[#00365F]/10 px-2.5 py-1 text-xs font-medium text-[#00365F]">
                    S{session.semester}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-zinc-600">
                  {new Date(session.session_date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-5">
                  <DeliberationStatusBadge status={session.status} />
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-zinc-700">{session.president?.full_name}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm font-medium text-zinc-900">
                    {session.stats?.total_students ?? 0}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(session.id)}
                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#00365F]"
                        title="Éditer"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}
                    <Link
                      href={`/deliberations/${session.id}`}
                      className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#00365F]"
                      title="Voir"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </Link>
                    <Link
                      href={`/deliberations/${session.id}/results`}
                      className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-[#008D36]/10 hover:text-[#008D36]"
                      title="Résultats"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(session.id)}
                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Supprimer"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
