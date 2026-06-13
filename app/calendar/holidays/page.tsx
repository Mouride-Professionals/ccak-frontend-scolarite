"use client";

import { useMemo, useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import Toast from "@/components/ui/toast";
import { useAcademicYears } from "@/hooks/use-enrollments";
import { useCurrentAcademicYear } from "@/hooks/use-academic-years";
import {
  useCreateHoliday,
  useDeleteHoliday,
  useHolidays,
  useUpdateHoliday,
} from "@/hooks/use-calendar";

const dayHeaders = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const toMonthInput = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
};

const toIsoDate = (value: string) => value.slice(0, 10);

export default function HolidaysPage() {
  const { data: years } = useAcademicYears();
  const { data: currentYear } = useCurrentAcademicYear();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
    academic_year_id: "",
    type: "",
    search: "",
  });
  const { data, isLoading } = useHolidays(filters);
  const createHoliday = useCreateHoliday();
  const updateHoliday = useUpdateHoliday();
  const deleteHoliday = useDeleteHoliday();

  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [deleteHolidayId, setDeleteHolidayId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(toMonthInput());

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

  useEffect(() => {
    if (currentYear) setForm((prev) => ({ ...prev, academic_year_id: currentYear.id }));
  }, [currentYear]);

  const monthGrid = useMemo(() => {
    const [yearValue, monthValue] = selectedMonth.split("-").map(Number);
    if (!yearValue || !monthValue) return [] as Array<{ day: number | null; key: string }>;

    const firstDay = new Date(yearValue, monthValue - 1, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(yearValue, monthValue, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const day = index - startOffset + 1;
      const value = day > 0 && day <= daysInMonth ? day : null;
      return { day: value, key: `cell-${index}` };
    });
  }, [selectedMonth]);

  const holidaysByDay = useMemo(() => {
    const map = new Map<number, Array<{ id: string; name: string; type: string }>>();
    const [yearValue, monthValue] = selectedMonth.split("-").map(Number);

    (data?.data ?? []).forEach((holiday) => {
      const holidayDate = new Date(holiday.date);
      if (holidayDate.getFullYear() !== yearValue || holidayDate.getMonth() + 1 !== monthValue) {
        return;
      }
      const day = holidayDate.getDate();
      const list = map.get(day) || [];
      list.push({ id: holiday.id, name: holiday.name, type: holiday.type });
      map.set(day, list);
    });

    return map;
  }, [data?.data, selectedMonth]);

  const handleCreateOrUpdate = async () => {
    const payload = {
      ...form,
      date: form.date ? new Date(`${form.date}T00:00:00`).toISOString() : "",
      academic_year_id: form.academic_year_id || filters.academic_year_id,
    };

    if (!payload.name || !payload.date || !payload.type || !payload.academic_year_id) {
      setToast({
        isOpen: true,
        message: "Nom, date, type et année académique sont requis.",
        type: "error",
      });
      return;
    }

    try {
      if (editingHolidayId) {
        await updateHoliday.mutateAsync({ id: editingHolidayId, input: payload });
        setToast({ isOpen: true, message: "Jour férié modifié.", type: "success" });
      } else {
        await createHoliday.mutateAsync(payload);
        setToast({ isOpen: true, message: "Jour férié ajouté.", type: "success" });
      }

      setEditingHolidayId(null);
      setForm({
        name: "",
        date: "",
        type: "",
        is_recurring: false,
        academic_year_id: payload.academic_year_id,
      });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'enregistrement.", type: "error" });
    }
  };

  const handleEdit = (holiday: {
    id: string;
    name: string;
    date: string;
    type: string;
    is_recurring: boolean;
    academic_year_id: string;
  }) => {
    setEditingHolidayId(holiday.id);
    setForm({
      name: holiday.name,
      date: toIsoDate(holiday.date),
      type: holiday.type,
      is_recurring: holiday.is_recurring,
      academic_year_id: holiday.academic_year_id,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteHolidayId) return;

    try {
      await deleteHoliday.mutateAsync(deleteHolidayId);
      setToast({ isOpen: true, message: "Jour férié supprimé.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la suppression.", type: "error" });
    } finally {
      setDeleteHolidayId(null);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Jours fériés">
        <ListHeader
          searchValue={filters.search}
          onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
          searchPlaceholder="Rechercher un jour férié..."
          rightSlot={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filters.academic_year_id}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    academic_year_id: event.target.value,
                    page: 1,
                  }))
                }
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Toutes les années</option>
                {Array.isArray(years) &&
                  years.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
              </select>
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          }
        />

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.75fr]">
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
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(holiday)}
                              className="text-sm font-medium text-[#00365F]"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteHolidayId(holiday.id)}
                              className="text-sm font-medium text-red-500"
                            >
                              Supprimer
                            </button>
                          </div>
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
            <h2 className="text-sm font-semibold text-[#00365F]">
              {editingHolidayId ? "Modifier le jour férié" : "Ajouter un jour férié"}
            </h2>
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
                  placeholder="Ex: NATIONAL, RELIGIEUX"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Année académique
                </label>
                <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                  {currentYear?.name ?? "Chargement..."}
                </p>
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

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateOrUpdate}
                  className="flex-1 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
                >
                  {editingHolidayId ? "Enregistrer" : "Ajouter"}
                </button>
                {editingHolidayId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHolidayId(null);
                      setForm({
                        name: "",
                        date: "",
                        type: "",
                        is_recurring: false,
                        academic_year_id: "",
                      });
                    }}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#00365F]">Vue calendrier mensuelle</h2>
          <div className="mt-4 grid grid-cols-7 gap-2 text-xs">
            {dayHeaders.map((header) => (
              <div
                key={header}
                className="rounded bg-zinc-100 px-2 py-1 text-center font-semibold text-zinc-600"
              >
                {header}
              </div>
            ))}
            {monthGrid.map((cell) => {
              const dayEntries = cell.day ? holidaysByDay.get(cell.day) || [] : [];
              return (
                <div
                  key={cell.key}
                  className={`min-h-20 rounded border p-2 ${
                    cell.day ? "border-zinc-200 bg-white" : "border-transparent bg-zinc-50"
                  }`}
                >
                  <div className="text-xs font-medium text-zinc-600">{cell.day || ""}</div>
                  <div className="mt-1 space-y-1">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-800"
                        title={entry.type}
                      >
                        {entry.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <ConfirmDialog
          isOpen={!!deleteHolidayId}
          onClose={() => setDeleteHolidayId(null)}
          onConfirm={handleDeleteConfirm}
          title="Supprimer ce jour férié"
          message="Cette action est irréversible. Continuer ?"
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
        />

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
