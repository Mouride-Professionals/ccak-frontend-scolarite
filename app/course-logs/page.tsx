"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import Toast from "@/components/ui/toast";
import { useCourses } from "@/hooks/use-courses";
import { useCourseLogsForCourse, useUpdateCourseLog } from "@/hooks/use-course-logs";
import type { CourseLog } from "@/types/course-log";

const formatList = (items?: string[]) => (items?.length ? items.join(", ") : "");
const formatTopics = (topics?: string[]) => formatList(topics);

export default function CourseLogHistoryPage() {
  const { data: courses } = useCourses({ page: 1, limit: 100 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    course_id: "",
    date_from: "",
    date_to: "",
    search: "",
  });
  const { data: logs, isLoading } = useCourseLogsForCourse(filters.course_id, {
    page: filters.page,
    limit: filters.limit,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
  });

  const [editingLog, setEditingLog] = useState<CourseLog | null>(null);
  const [editForm, setEditForm] = useState({
    topics: "",
    chapters: "",
    objectives: "",
    notes: "",
  });

  const updateLog = useUpdateCourseLog();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const filteredLogs = useMemo(() => {
    const data = logs?.data ?? [];
    if (!filters.search.trim()) return data;
    const term = filters.search.toLowerCase();
    return data.filter((log) => {
      const topics = formatTopics(log.topics).toLowerCase();
      return topics.includes(term) || (log.notes ?? "").toLowerCase().includes(term);
    });
  }, [logs?.data, filters.search]);

  const handleEdit = (log: CourseLog) => {
    setEditingLog(log);
    setEditForm({
      topics: formatTopics(log.topics),
      chapters: formatList(log.chapters),
      objectives: formatList(log.objectives),
      notes: log.notes ?? "",
    });
  };

  const handleUpdate = async () => {
    if (!editingLog) return;
    try {
      await updateLog.mutateAsync({
        id: editingLog.id,
        input: {
          topics: editForm.topics.split(/\n|,/).map((entry) => entry.trim()).filter(Boolean),
          chapters: editForm.chapters
            ? editForm.chapters.split(/\n|,/).map((entry) => entry.trim()).filter(Boolean)
            : undefined,
          objectives: editForm.objectives
            ? editForm.objectives.split(/\n|,/).map((entry) => entry.trim()).filter(Boolean)
            : undefined,
          notes: editForm.notes || undefined,
        },
      });
      setToast({ isOpen: true, message: "Cahier mis à jour.", type: "success" });
      setEditingLog(null);
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la mise à jour.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Historique des cahiers de texte">
        <ListHeader
          searchValue={filters.search}
          onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
          searchPlaceholder="Rechercher par sujet ou note..."
          rightSlot={
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={filters.date_from}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, date_from: event.target.value, page: 1 }))
                }
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={filters.date_to}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, date_to: event.target.value, page: 1 }))
                }
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-zinc-700">Cours</label>
              <select
                value={filters.course_id}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    course_id: event.target.value,
                    page: 1,
                  }))
                }
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">Sélectionner un cours</option>
                {(courses?.data ?? []).map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {filters.course_id ? (
              isLoading ? (
                <div className="text-center text-sm text-zinc-500">Chargement...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-[#00365F]/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Sujets
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Notes
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-4 py-3">
                            {new Date(log.session_date).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-4 py-3">{formatTopics(log.topics)}</td>
                          <td className="px-4 py-3 text-zinc-500">{log.notes || "—"}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleEdit(log)}
                              className="text-sm font-medium text-[#00365F]"
                            >
                              Modifier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="text-sm text-zinc-500">
                Sélectionnez un cours pour afficher l'historique.
              </div>
            )}

            <Pagination
              page={logs?.page ?? filters.page}
              totalPages={logs?.total_pages ?? 1}
              totalItems={logs?.total ?? 0}
              perPage={logs?.limit ?? filters.limit}
              itemLabel="cahiers"
              onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
              onPerPageChange={(nextLimit) =>
                setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
              }
            />
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Éditer la séance</h2>
            {editingLog ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Sujets abordés
                  </label>
                  <textarea
                    value={editForm.topics}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, topics: event.target.value }))
                    }
                    rows={4}
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Chapitres
                  </label>
                  <input
                    value={editForm.chapters}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, chapters: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Objectifs
                  </label>
                  <textarea
                    value={editForm.objectives}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, objectives: event.target.value }))
                    }
                    rows={3}
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, notes: event.target.value }))
                    }
                    rows={3}
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLog(null)}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">
                Sélectionnez une séance pour modifier son contenu.
              </p>
            )}
          </div>
        </div>

        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isOpen: false })}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
