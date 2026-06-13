"use client";

import Link from "next/link";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import type { Grade } from "@/types/grade";
import GradeStatusBadge from "./grades-status-badge";

interface GradesTableProps {
  grades: Grade[];
  onEdit?: (grade: Grade) => void;
  onDelete?: (grade: Grade) => void;
}

export default function GradesTable({ grades, onEdit, onDelete }: GradesTableProps) {
  const isReadOnly = useIsReadOnly();
  if (grades.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">Aucune note trouvée.</p>
      </div>
    );
  }

  const getEnteredByLabel = (grade: Grade) => {
    if (grade.entered_by_user?.full_name) {
      return grade.entered_by_user.full_name;
    }

    if (typeof grade.entered_by === "string") {
      return grade.entered_by;
    }

    return grade.entered_by?.full_name || grade.entered_by?.email || "N/A";
  };

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-[#00365F]/10">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Étudiant
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Cours
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 md:table-cell">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Note
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 lg:table-cell">
                Coefficient
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Statut
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 lg:table-cell">
                Saisi par
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 xl:table-cell">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {grades.map((grade) => (
              <tr key={grade.id} className="bg-white transition-colors hover:bg-zinc-50/50">
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="text-sm font-medium text-[#00365F]">
                    {grade.student?.full_name || "N/A"}
                  </div>
                  <div className="text-xs text-zinc-500">{grade.student?.student_number}</div>
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="text-sm text-zinc-700">{grade.course?.name || "N/A"}</div>
                  <div className="text-xs text-zinc-500">{grade.course?.code}</div>
                  <div className="mt-1 text-xs text-zinc-500 md:hidden">{grade.type}</div>
                </td>
                <td className="hidden px-4 py-4 sm:px-6 sm:py-5 md:table-cell">
                  <div className="text-sm text-zinc-700">{grade.type}</div>
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="text-sm">
                    <span className="font-semibold text-zinc-900">{grade.score}</span>
                    <span className="text-zinc-400 mx-1">/</span>
                    <span className="text-zinc-600">{grade.max_score}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-4 sm:px-6 sm:py-5 lg:table-cell">
                  <span className="inline-flex items-center rounded-md bg-[#00365F]/10 px-2.5 py-1 text-xs font-medium text-[#00365F]">
                    {grade.weight}
                  </span>
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <GradeStatusBadge status={grade.status} />
                </td>
                <td className="hidden px-4 py-4 sm:px-6 sm:py-5 lg:table-cell">
                  <div className="text-sm text-zinc-700">{getEnteredByLabel(grade)}</div>
                </td>
                <td className="hidden px-4 py-4 text-sm text-zinc-600 sm:px-6 sm:py-5 xl:table-cell">
                  {new Date(grade.entered_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && !isReadOnly && (
                      <button
                        onClick={() => onEdit(grade)}
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
                      href={`/grades/${grade.id}`}
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
                    {onDelete && !isReadOnly && (
                      <button
                        onClick={() => onDelete(grade)}
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
