'use client';

import Link from 'next/link';
import type { Course } from '@/types/course';

interface CourseTableProps {
  courses: Course[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CourseTable({
  courses,
  onEdit,
  onDelete,
}: CourseTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="w-full">
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
              Code
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
              Crédits
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
              Heures (CM/TD/TP)
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
              Coefficient
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
              Statut
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-zinc-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {courses.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center">
                <p className="text-sm text-zinc-500">
                  Aucun cours trouvé
                </p>
              </td>
            </tr>
          ) : (
            courses.map((course) => (
              <tr
                key={course.id}
                className="bg-white transition-colors hover:bg-zinc-50/50"
              >
                <td className="px-6 py-5 text-sm font-medium text-zinc-900">
                  {course.code}
                </td>
                <td className="px-6 py-5 text-sm text-zinc-600">
                  <div>
                    <p className="font-medium">{course.name}</p>
                    {course.description && (
                      <p className="text-xs text-zinc-500 line-clamp-1">
                        {course.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-zinc-600">
                  {course.credits}
                </td>
                <td className="px-6 py-5 text-sm text-zinc-600">
                  {course.hours_lecture}/{course.hours_td}/{course.hours_tp}
                </td>
                <td className="px-6 py-5 text-sm text-zinc-600">
                  {course.coefficient}
                </td>
                <td className="px-6 py-5 text-sm">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      course.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {course.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(course.id)}
                      className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#00365F]"
                      title="Éditer"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <Link
                      href={`/courses/${course.id}/detail`}
                      className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#00365F]"
                      title="Voir"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <button
                      onClick={() => onDelete(course.id)}
                      className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Supprimer"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
