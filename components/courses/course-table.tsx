"use client";

import Link from "next/link";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import type { Course } from "@/types/course";

interface CourseTableProps {
  courses: Course[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  viewMode?: "table" | "grid";
}

const getPrerequisiteLabels = (course: Course, courses: Course[]) => {
  const map = new Map(courses.map((item) => [item.id, `${item.code} - ${item.name}`]));
  return (course.prerequisites || []).map((id) => map.get(id) || id);
};

export default function CourseTable({
  courses,
  onEdit,
  onDelete,
  viewMode = "table",
}: CourseTableProps) {
  const isReadOnly = useIsReadOnly();
  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">Aucun cours trouvé</p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const prerequisites = getPrerequisiteLabels(course, courses);
          return (
            <div
              key={course.id}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {course.code}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-900">{course.name}</h3>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    course.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {course.is_active ? "Actif" : "Inactif"}
                </span>
              </div>

              <p className="mt-3 text-xs text-zinc-500 line-clamp-2">
                {course.description || "Sans description"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-zinc-600">
                <div>
                  Crédits: <span className="font-medium">{course.credits}</span>
                </div>
                <div>
                  Coeff: <span className="font-medium">{course.coefficient}</span>
                </div>
                <div className="col-span-2">
                  CM/TD/TP/TPE: {course.hours_lecture}/{course.hours_td}/{course.hours_tp}/
                  {course.hours_tpe ?? 0} · VHT:{" "}
                  <span className="font-medium">
                    {course.hours_lecture +
                      course.hours_td +
                      course.hours_tp +
                      (course.hours_tpe ?? 0)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-zinc-600">Prérequis</p>
                {prerequisites.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {prerequisites.slice(0, 2).map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700"
                      >
                        {label}
                      </span>
                    ))}
                    {prerequisites.length > 2 && (
                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700">
                        +{prerequisites.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-zinc-500">Aucun</p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => !isReadOnly && onEdit(course.id)}
                  disabled={isReadOnly}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-[#00365F] hover:bg-zinc-100"
                >
                  Éditer
                </button>
                <Link
                  href={`/courses/${course.id}/detail`}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-[#00365F] hover:bg-zinc-100"
                >
                  Voir
                </Link>
                <button
                  onClick={() => !isReadOnly && onDelete(course.id)}
                  disabled={isReadOnly}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="w-full">
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Code</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Nom</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Crédits</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">
              CM/TD/TP/TPE (VHT)
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Coefficient</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Prérequis</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900">Statut</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-zinc-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {courses.map((course) => {
            const prerequisites = getPrerequisiteLabels(course, courses);
            return (
              <tr key={course.id} className="bg-white transition-colors hover:bg-zinc-50/50">
                <td className="px-6 py-5 text-sm font-medium text-zinc-900">{course.code}</td>
                <td className="px-6 py-5 text-sm text-zinc-600">
                  <div>
                    <p className="font-medium">{course.name}</p>
                    {course.description && (
                      <p className="text-xs text-zinc-500 line-clamp-1">{course.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-zinc-600">{course.credits}</td>
                <td className="px-6 py-5 text-sm text-zinc-600">
                  {course.hours_lecture}/{course.hours_td}/{course.hours_tp}/{course.hours_tpe ?? 0}{" "}
                  <span className="text-xs text-zinc-400">
                    (
                    {course.hours_lecture +
                      course.hours_td +
                      course.hours_tp +
                      (course.hours_tpe ?? 0)}
                    h)
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-zinc-600">{course.coefficient}</td>
                <td className="px-6 py-5 text-sm text-zinc-600">
                  {prerequisites.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {prerequisites.slice(0, 2).map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700"
                        >
                          {label}
                        </span>
                      ))}
                      {prerequisites.length > 2 && (
                        <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700">
                          +{prerequisites.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-zinc-400">Aucun</span>
                  )}
                </td>
                <td className="px-6 py-5 text-sm">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      course.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {course.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => !isReadOnly && onEdit(course.id)}
                      disabled={isReadOnly}
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
                    <Link
                      href={`/courses/${course.id}/detail`}
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
                    <button
                      onClick={() => !isReadOnly && onDelete(course.id)}
                      disabled={isReadOnly}
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
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
