"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import Toast from "@/components/ui/toast";
import { useCreateRoom, useDeleteRoom, useRooms, useUpdateRoom } from "@/hooks/use-calendar";

const equipmentOptions = [
  "Projecteur",
  "Tableau interactif",
  "Ordinateurs",
  "Climatisation",
  "Sonorisation",
  "Laboratoire",
];

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
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
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
    equipment: [] as string[],
    is_available: true,
  });

  const toggleEquipment = (item: string) => {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((entry) => entry !== item)
        : [...prev.equipment, item],
    }));
  };

  const handleCreateOrUpdate = async () => {
    if (!form.name || !form.type || !form.capacity) {
      setToast({
        isOpen: true,
        message: "Nom, type et capacité sont requis.",
        type: "error",
      });
      return;
    }

    const payload = {
      name: form.name,
      building: form.building,
      capacity: Number(form.capacity || 0),
      type: form.type,
      equipment: form.equipment,
      is_available: form.is_available,
    };

    try {
      if (editingRoomId) {
        await updateRoom.mutateAsync({ id: editingRoomId, input: payload });
        setToast({ isOpen: true, message: "Salle modifiée.", type: "success" });
      } else {
        await createRoom.mutateAsync(payload);
        setToast({ isOpen: true, message: "Salle ajoutée.", type: "success" });
      }

      setEditingRoomId(null);
      setForm({
        name: "",
        building: "",
        capacity: "",
        type: "",
        equipment: [],
        is_available: true,
      });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'enregistrement.", type: "error" });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Salles">
        <ListHeader
          searchValue={filters.search}
          onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
          searchPlaceholder="Rechercher une salle..."
          rightSlot={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filters.is_available === undefined ? "" : String(filters.is_available)}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    is_available:
                      event.target.value === ""
                        ? undefined
                        : event.target.value === "true",
                    page: 1,
                  }))
                }
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Toutes</option>
                <option value="true">Disponibles</option>
                <option value="false">Indisponibles</option>
              </select>
            </div>
          }
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
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Équipements
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Disponibilité
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {(data?.data ?? []).map((room) => (
                      <tr key={room.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-800">{room.name}</div>
                          <div className="text-xs text-zinc-500">{room.type}</div>
                        </td>
                        <td className="px-4 py-3">{room.building || "—"}</td>
                        <td className="px-4 py-3">{room.capacity}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(room.equipment || []).slice(0, 3).map((item) => (
                              <span
                                key={`${room.id}-${item}`}
                                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                              >
                                {item}
                              </span>
                            ))}
                            {(room.equipment || []).length > 3 && (
                              <span className="text-xs text-zinc-500">+{(room.equipment || []).length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              room.is_available
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            <span
                              className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
                                room.is_available ? "bg-emerald-600" : "bg-rose-600"
                              }`}
                            />
                            {room.is_available ? "Disponible" : "Indisponible"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRoomId(room.id);
                                setForm({
                                  name: room.name,
                                  building: room.building || "",
                                  capacity: String(room.capacity),
                                  type: room.type,
                                  equipment: room.equipment || [],
                                  is_available: room.is_available,
                                });
                              }}
                              className="text-sm font-medium text-[#00365F]"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRoom.mutate(room.id)}
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
              itemLabel="salles"
              onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
              onPerPageChange={(nextLimit) =>
                setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
              }
            />
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">
              {editingRoomId ? "Modifier la salle" : "Ajouter une salle"}
            </h2>
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

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Équipements</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {equipmentOptions.map((item) => (
                    <label key={item} className="flex items-center gap-2 text-sm text-zinc-700">
                      <input
                        type="checkbox"
                        checked={form.equipment.includes(item)}
                        onChange={() => toggleEquipment(item)}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

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

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateOrUpdate}
                  className="flex-1 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white"
                >
                  {editingRoomId ? "Enregistrer" : "Ajouter"}
                </button>
                {editingRoomId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoomId(null);
                      setForm({
                        name: "",
                        building: "",
                        capacity: "",
                        type: "",
                        equipment: [],
                        is_available: true,
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
