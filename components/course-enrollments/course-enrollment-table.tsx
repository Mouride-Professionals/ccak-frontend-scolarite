"use client";

import type { CourseEnrollment } from "@/types/course-enrollment";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import CourseEnrollmentStatusBadge from "./course-enrollment-status-badge";

interface CourseEnrollmentTableProps {
  enrollments: CourseEnrollment[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function CourseEnrollmentTable({
  enrollments,
  onView,
  onDelete,
  onEdit,
}: CourseEnrollmentTableProps) {
  const isReadOnly = useIsReadOnly();
  if (enrollments.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">Aucune inscription aux cours trouvée.</p>
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
                Code Cours
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Nom du Cours
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Semestre
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Date d'enrollement
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
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id} className="bg-white transition-colors hover:bg-zinc-50/50">
                <td className="px-6 py-5">
                  <div className="text-sm font-medium text-zinc-900">{enrollment.course?.code}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-zinc-700">{enrollment.course?.name}</div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center rounded-md bg-[#00365F]/10 px-2.5 py-1 text-xs font-medium text-[#00365F]">
                    Semestre {enrollment.semester}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-zinc-700">
                    {new Date(enrollment.enrollment_date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <CourseEnrollmentStatusBadge status={enrollment.status} />
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(enrollment.id)}
                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#00365F]"
                        title="Voir les détails"
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
                      </button>
                    )}
                    {onEdit && !isReadOnly && (
                      <button
                        onClick={() => onEdit(enrollment.id)}
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
                    {onDelete && !isReadOnly && (
                      <button
                        onClick={() => onDelete(enrollment.id)}
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
