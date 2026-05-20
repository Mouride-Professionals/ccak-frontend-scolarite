"use client";

import Link from "next/link";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import type { Student } from "@/types/student";
import StudentStatusBadge from "./student-status-badge";

interface StudentTableProps {
  students: Student[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function StudentTable({ students, onEdit, onDelete }: StudentTableProps) {
  const isReadOnly = useIsReadOnly();
  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">Aucun étudiant trouvé.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-[#00365F]/10">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Numéro étudiant
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Nom complet
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 md:table-cell">
                Genre
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 lg:table-cell">
                Date de naissance
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 lg:table-cell">
                Téléphone
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 xl:table-cell">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Statut
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {students.map((student) => (
              <tr key={student.id} className="bg-white transition-colors hover:bg-zinc-50/50">
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <Link
                    href={`/students/${student.id}`}
                    className="text-sm font-medium text-[#00365F] hover:text-[#008D36] transition-colors"
                  >
                    {student.student_number}
                  </Link>
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="text-sm text-zinc-700">{student.full_name}</div>
                  <div className="mt-1 text-xs text-zinc-500 lg:hidden">{student.phone || "—"}</div>
                </td>
                <td className="hidden px-4 py-4 sm:px-6 sm:py-5 md:table-cell">
                  <span className="inline-flex items-center rounded-md bg-[#00365F]/10 px-2.5 py-1 text-xs font-medium text-[#00365F]">
                    {student.gender === "M" ? "Masculin" : "Féminin"}
                  </span>
                </td>
                <td className="hidden px-4 py-4 text-sm text-zinc-600 sm:px-6 sm:py-5 lg:table-cell">
                  {new Date(student.date_of_birth).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="hidden px-4 py-4 text-sm text-zinc-600 sm:px-6 sm:py-5 lg:table-cell">
                  {student.phone}
                </td>
                <td className="hidden px-4 py-4 text-sm text-zinc-600 sm:px-6 sm:py-5 xl:table-cell">
                  {student.email ?? "—"}
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <StudentStatusBadge status={student.status} />
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && !isReadOnly && (
                      <button
                        onClick={() => onEdit(student.id)}
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
                      href={`/students/${student.id}`}
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
                        onClick={() => onDelete(student.id)}
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
