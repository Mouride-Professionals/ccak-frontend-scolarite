"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import Toast from "@/components/ui/toast";
import { useAcademicYears } from "@/hooks/use-enrollments";
import { useCreateHoliday, useDeleteHoliday, useHolidays } from "@/hooks/use-calendar";

export default function HolidaysPage() {
  const { data: years } = useAcademicYears();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    academic_year_id: "",
    type: "",
    search: "",
  });
  const { data, isLoading } = useHolidays(filters);
  const createHoliday = useCreateHoliday();
  const deleteHoliday = useDeleteHoliday();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [form, setForm] = useState({
    name: "",
    date: "",
    type: "",
    is_recurring: false,
    academic_year_id: "",
  });

  const handleCreate = async () => {
    try {
      await createHoliday.mutateAsync({
        ...form,
        academic_year_id: form.academic_year_id || filters.academic_year_id,
      });
      setToast({ isOpen: true, message: "Jour férié ajouté.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'ajout.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Jours fériés">
        <ListHeader
          searchValue={filters.search}
          onSearchChange={(value) =>
            setFilters((prev) => ({ ...prev, search: value, page: 1 }))
          }
          searchPlaceholder="Rechercher un jour férié..."
          onToggleFilters={() => {}}
          isFiltersOpen={false}
          filtersCount={0}
        />

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            {isLoading ? (
              <div className="text-center text-sm text-zinc-500">Chargement...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-[#00365F]/10">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Nom
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Type
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {(data?.data ?? []).map((holiday) => (
                      <tr key={holiday.id}>
                        <td className="px-4 py-3">{holiday.name}</td>
                        <td className="px-4 py-3">
                          {new Date(holiday.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-4 py-3">{holiday.type}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteHoliday.mutate(holiday.id)}
                            className="text-sm text-red-500 hover:text-red-600"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.total_pages ?? 1}
              totalItems={data?.total ?? 0}
              perPage={data?.limit ?? filters.limit}
              itemLabel="jours fériés"
              onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
              onPerPageChange={(nextLimit) =>
                setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
              }
            />
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Ajouter un jour férié</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Nom</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Type</label>
                <input
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Année académique
                </label>
                <select
                  value={form.academic_year_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, academic_year_id: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner</option>
                  {Array.isArray(years) &&
                    years.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={form.is_recurring}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, is_recurring: event.target.checked }))
                  }
                />
                Récurrent
              </label>
              <button
                type="button"
                onClick={handleCreate}
                className="w-full rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
              >
                Ajouter
              </button>
            </div>
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
