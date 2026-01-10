"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import Toast from "@/components/ui/toast";
import { useCreateRoom, useDeleteRoom, useRooms } from "@/hooks/use-calendar";

export default function RoomsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    building: "",
    type: "",
    search: "",
    is_available: undefined as boolean | undefined,
  });
  const { data, isLoading } = useRooms(filters);
  const createRoom = useCreateRoom();
  const deleteRoom = useDeleteRoom();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [form, setForm] = useState({
    name: "",
    building: "",
    capacity: "",
    type: "",
    equipment: "",
    is_available: true,
  });

  const handleCreate = async () => {
    try {
      await createRoom.mutateAsync({
        name: form.name,
        building: form.building,
        capacity: Number(form.capacity || 0),
        type: form.type,
        equipment: form.equipment ? form.equipment.split(",").map((item) => item.trim()) : [],
        is_available: form.is_available,
      });
      setToast({ isOpen: true, message: "Salle ajoutée.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'ajout.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Salles">
        <ListHeader
          searchValue={filters.search}
          onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
          searchPlaceholder="Rechercher une salle..."
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
                        Salle
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Bâtiment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Capacité
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {(data?.data ?? []).map((room) => (
                      <tr key={room.id}>
                        <td className="px-4 py-3">{room.name}</td>
                        <td className="px-4 py-3">{room.building || "—"}</td>
                        <td className="px-4 py-3">{room.capacity}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteRoom.mutate(room.id)}
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
              itemLabel="salles"
              onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
              onPerPageChange={(nextLimit) =>
                setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
              }
            />
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Ajouter une salle</h2>
            <div className="mt-4 space-y-4">
              <input
                placeholder="Nom de la salle"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Bâtiment"
                value={form.building}
                onChange={(event) => setForm((prev) => ({ ...prev, building: event.target.value }))}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Capacité"
                value={form.capacity}
                onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Type (amphi, TD, labo)"
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Équipement (csv)"
                value={form.equipment}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, equipment: event.target.value }))
                }
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, is_available: event.target.checked }))
                  }
                />
                Disponible
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
