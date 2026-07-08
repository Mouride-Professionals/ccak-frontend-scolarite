"use client";

import Link from "next/link";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import type { AcademicProgram } from "@/types/academic";
import { AcademicLevel } from "@/types/academic";

interface ProgrammeTableProps {
  programmes: AcademicProgram[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ProgrammeTable({ programmes, onEdit, onDelete }: ProgrammeTableProps) {
  const isReadOnly = useIsReadOnly();
  if (programmes.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">Aucun programme académique trouvé.</p>
      </div>
    );
  }

  const getLevelLabel = (level: AcademicLevel) => {
    switch (level) {
      case AcademicLevel.LICENCE:
        return "Licence";
      case AcademicLevel.MASTER:
        return "Master";
      case AcademicLevel.DOCTORAT:
        return "Doctorat";
      case AcademicLevel.CLASSE_PREPARATOIRE:
        return "Cycle Préparatoire";
      default:
        return level;
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 bg-[#00365F]/10">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Programme
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Niveau
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Département
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Durée
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Crédits
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Statut
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {programmes.map((programme) => (
              <tr key={programme.id} className="bg-white transition-colors hover:bg-zinc-50/50">
                <td className="px-6 py-5">
                  <div className="text-sm font-medium text-zinc-900">{programme.name}</div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {getLevelLabel(programme.level)}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-zinc-900">{programme.department?.name || "N/A"}</div>
                  <div className="text-xs text-zinc-500">{programme.department?.code}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-zinc-900">
                    {programme.duration_semesters} semestres
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-zinc-900">{programme.total_credits_required}</div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      programme.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {programme.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && !isReadOnly && (
                      <button
                        onClick={() => onEdit(programme.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#00365F]"
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
                      href={`/programmes/${programme.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#00365F]"
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
                    {onDelete && !isReadOnly && (
                      <button
                        onClick={() => onDelete(programme.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
