"use client";

import type { Department } from "@/types/department";
import Link from "next/link";

interface DepartmentsTableProps {
  departments: Department[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function DepartmentsTable({
  departments,
  onEdit,
  onDelete,
}: DepartmentsTableProps) {
  if (departments.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">Aucun département trouvé.</p>
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
                Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Faculté
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Chef de Département
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
            {departments.map((department) => (
              <tr
                key={department.id}
                className="bg-white transition-colors hover:bg-zinc-50/50"
              >
                <td className="px-6 py-5">
                  <div className="text-sm font-medium text-zinc-900">
                    {department.name}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex rounded-md bg-[#00365F]/10 px-2.5 py-1 text-xs font-medium text-[#00365F]">
                    {department.code}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-zinc-700">
                    {department.faculty?.name || "-"}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-zinc-700">
                    {department.head?.name || (
                      <span className="text-zinc-400">Non assigné</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      department.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {department.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(department.id)}
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
                    {/* View (center) */}
                    <Link
                      href={`/departments/${department.id}`}
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
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        />
                        <circle cx="12" cy="12" r="3" strokeWidth={2} />
                      </svg>
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(department.id)}
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
