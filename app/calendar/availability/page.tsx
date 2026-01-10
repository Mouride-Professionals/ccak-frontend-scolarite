"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import FacultySearch from "@/components/faculty-members/faculty-search";
import { useRooms } from "@/hooks/use-calendar";
import { useCheckAvailability } from "@/hooks/use-calendar";
import type { AvailabilityResponse } from "@/types/calendar";

export default function AvailabilityPage() {
  const { data: rooms } = useRooms({ page: 1, limit: 50 });
  const checkAvailability = useCheckAvailability();
  const [result, setResult] = useState<AvailabilityResponse | null>(null);

  const [form, setForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    room_id: "",
    faculty_member_id: "",
    faculty_name: "",
  });

  const handleCheck = async () => {
    if (!form.date || !form.start_time || !form.end_time) return;
    try {
      const response = await checkAvailability.mutateAsync({
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        room_id: form.room_id || undefined,
        faculty_member_id: form.faculty_member_id || undefined,
      });
      setResult(response);
    } catch {
      setResult({
        available: false,
        conflicts: [{ id: "error", type: "room", message: "Erreur lors de la vérification." }],
      });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Disponibilités">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Vérifier un créneau</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <label className="mb-2 block text-sm font-medium text-zinc-700">Salle</label>
                <select
                  value={form.room_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, room_id: event.target.value }))
                  }
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="">Toutes les salles</option>
                  {(rooms?.data ?? []).map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Enseignant (optionnel)
                </label>
                <FacultySearch
                  value={form.faculty_name}
                  onSelect={(faculty) =>
                    setForm((prev) => ({
                      ...prev,
                      faculty_member_id: faculty.id,
                      faculty_name: faculty.full_name,
                    }))
                  }
                  placeholder="Rechercher un enseignant..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Début</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, start_time: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Fin</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, end_time: event.target.value }))
                    }
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheck}
              className="mt-6 rounded-lg bg-[#00365F] px-4 py-2 text-sm font-semibold text-white"
            >
              Vérifier la disponibilité
            </button>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Résultat</h2>
            {!result ? (
              <p className="mt-4 text-sm text-zinc-500">
                Lancez une vérification pour voir les disponibilités.
              </p>
            ) : result.available ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                Créneau disponible.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  Conflits détectés.
                </div>
                <ul className="space-y-2 text-sm text-zinc-600">
                  {result.conflicts.map((conflict) => (
                    <li key={conflict.id} className="rounded-md border border-zinc-200 p-3">
                      {conflict.message}
                    </li>
                  ))}
                </ul>
                {result.suggestions && result.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#00365F]">
                      Suggestions disponibles
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.suggestions.map((suggestion, index) => (
                        <span
                          key={`${suggestion.start_time}-${suggestion.end_time}-${index}`}
                          className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600"
                        >
                          {suggestion.start_time} - {suggestion.end_time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
