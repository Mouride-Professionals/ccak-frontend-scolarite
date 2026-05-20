"use client";

import type { TeachingAssignment } from "@/types/teaching-assignment";
import { useIsReadOnly } from "@/hooks/use-selected-year";

interface TeachingAssignmentsTableProps {
  assignments: TeachingAssignment[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const roleLabels: Record<string, string> = {
  TITULAR: "Titulaire",
  TD: "TD",
  TP: "TP",
};

export default function TeachingAssignmentsTable({
  assignments,
  onEdit,
  onDelete,
}: TeachingAssignmentsTableProps) {
  const isReadOnly = useIsReadOnly();
  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">Aucune affectation trouvée.</p>
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
                Enseignant
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Cours
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 md:table-cell">
                Année
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 md:table-cell">
                Rôle
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 lg:table-cell">
                Heures
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="bg-white transition-colors hover:bg-zinc-50/50">
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="text-sm font-medium text-[#00365F]">
                    {assignment.faculty_name}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 md:hidden">
                    {assignment.role} · {assignment.academic_year_label}
                  </div>
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5 text-sm text-zinc-700">
                  {assignment.course_name}
                </td>
                <td className="hidden px-4 py-4 text-sm text-zinc-600 sm:px-6 sm:py-5 md:table-cell">
                  {assignment.academic_year_label}
                </td>
                <td className="hidden px-4 py-4 text-sm text-zinc-600 sm:px-6 sm:py-5 md:table-cell">
                  {roleLabels[assignment.role] || assignment.role}
                </td>
                <td className="hidden px-4 py-4 text-sm text-zinc-600 sm:px-6 sm:py-5 lg:table-cell">
                  {assignment.hours_assigned}h
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && !isReadOnly && (
                      <button
                        onClick={() => onEdit(assignment.id)}
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
                    {onDelete && !isReadOnly && (
                      <button
                        onClick={() => onDelete(assignment.id)}
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
