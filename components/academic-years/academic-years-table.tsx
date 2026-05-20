"use client";

import type { AcademicYear } from "@/types/academic-year";
import { useIsReadOnly } from "@/hooks/use-selected-year";

interface AcademicYearsTableProps {
  academicYears: AcademicYear[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetCurrent?: (id: string) => void;
  actionLoadingId?: string | null;
}

const formatDate = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR");
};

const isPastDate = (value?: string | null) => {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date < today;
};

const getCurrentEligibilityBlockReason = (year: AcademicYear) => {
  if (year.status === "F") return "Annee fermee";
  if (year.is_active === false) return "Annee inactive";
  if (isPastDate(year.end_date)) return "Annee passee";

  return null;
};

export default function AcademicYearsTable({
  academicYears,
  onEdit,
  onDelete,
  onSetCurrent,
  actionLoadingId,
}: AcademicYearsTableProps) {
  const isReadOnly = useIsReadOnly();
  if (academicYears.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">Aucune annee academique trouvee.</p>
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
                Nom
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Debut
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Fin
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Statut
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {academicYears.map((year) => {
              const isActionLoading = actionLoadingId === year.id;
              const currentEligibilityBlockReason = getCurrentEligibilityBlockReason(year);
              return (
                <tr key={year.id} className="bg-white transition-colors hover:bg-zinc-50/50">
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-zinc-900">
                      {year.name}
                      {year.code ? (
                        <span className="ml-2 text-xs font-normal text-zinc-500">
                          · {year.code}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-zinc-700">{formatDate(year.start_date)}</td>
                  <td className="px-6 py-5 text-sm text-zinc-700">{formatDate(year.end_date)}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {year.is_current ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Actuelle
                        </span>
                      ) : null}
                      {year.status === "O" ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Ouvert
                        </span>
                      ) : year.status === "F" ? (
                        <span className="inline-flex rounded-full bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600">
                          Fermé
                        </span>
                      ) : null}
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          year.is_active === false
                            ? "bg-red-100 text-red-800"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {year.is_active === false ? "Inactive" : "Active"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      {onSetCurrent &&
                      !year.is_current &&
                      currentEligibilityBlockReason === null ? (
                        <button
                          type="button"
                          onClick={() => onSetCurrent(year.id)}
                          disabled={isActionLoading}
                          className="rounded-lg border border-[#008D36]/30 px-2.5 py-1 text-xs font-medium text-[#008D36] transition-colors hover:bg-[#008D36]/10 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Definir comme annee actuelle"
                        >
                          {isActionLoading ? "..." : "Definir actuelle"}
                        </button>
                      ) : null}
                      {onEdit && !isReadOnly ? (
                        <button
                          onClick={() => onEdit(year.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#00365F]"
                          title="Modifier"
                          type="button"
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
                      ) : null}
                      {onDelete && !isReadOnly ? (
                        <button
                          onClick={() => onDelete(year.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Supprimer"
                          type="button"
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
                      ) : null}
                    </div>
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
