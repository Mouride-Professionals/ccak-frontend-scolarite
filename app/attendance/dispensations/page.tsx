"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ListHeader from "@/components/ui/list-header";
import Toast from "@/components/ui/toast";
import StudentSearch from "@/components/students/student-search";
import { useStudentDispensations } from "@/hooks/use-attendance";
import { notificationsApi } from "@/lib/api/notifications";
import { toUserError } from "@/lib/error-handler";
import type { Student } from "@/types/student";

export default function DispensationsPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState("");
  const [threshold, setThreshold] = useState(3);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const { data: dispensations, isLoading, dataUpdatedAt } = useStudentDispensations(
    selectedStudent?.id || "",
    { refetchInterval: 30_000 }
  );

  const notifyMutation = useMutation({
    mutationFn: (message: string) => {
      if (!selectedStudent?.user_id) throw new Error("Étudiant introuvable");
      return notificationsApi.sendNotification({
        recipient_ids: [selectedStudent.user_id],
        title: "Alerte assiduité",
        message,
        type: "attendance_alert",
        channels: ["in_app", "email"],
      });
    },
  });

  const alerts = useMemo(() => {
    return (dispensations ?? []).filter((item) => (item.absence_count ?? 0) >= threshold);
  }, [dispensations, threshold]);

  const handleNotifyStudent = async () => {
    if (!selectedStudent) return;
    try {
      const message =
        alerts.length > 0
          ? `Vous avez ${alerts.length} cours avec risque de dispensation. Merci de contacter la scolarité.`
          : "Votre assiduité est surveillée. Merci de vérifier vos absences avec la scolarité.";

      await notifyMutation.mutateAsync(message);
      setToast({
        isOpen: true,
        message: "Notification envoyée à l'étudiant.",
        type: "success",
      });
    } catch (error) {
      setToast({
        isOpen: true,
        message: toUserError(error).message,
        type: "error",
      });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Dispensations d'examen">
        <ListHeader
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher un étudiant..."
        />

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Étudiant</label>
              <StudentSearch
                value={selectedStudent ? `${selectedStudent.full_name} · ${selectedStudent.student_number}` : ""}
                onSelect={(student) => setSelectedStudent(student)}
                onClear={() => setSelectedStudent(null)}
                placeholder="Rechercher et sélectionner..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Seuil d&apos;alerte
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value) || 1)}
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleNotifyStudent}
                disabled={!selectedStudent || notifyMutation.isPending}
                className="w-full rounded-lg bg-[#00365F] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {notifyMutation.isPending ? "Envoi..." : "Notifier l&apos;étudiant"}
              </button>
            </div>
          </div>

          {selectedStudent && (
            <p className="mt-3 text-xs text-zinc-500">
              Dernière actualisation:{" "}
              {dataUpdatedAt
                ? new Date(dataUpdatedAt).toLocaleTimeString("fr-FR")
                : "n/a"}
            </p>
          )}

          <div className="mt-6">
            {selectedStudent ? (
              isLoading ? (
                <p className="text-sm text-zinc-500">Chargement...</p>
              ) : (dispensations ?? []).length === 0 ? (
                <p className="text-sm text-zinc-500">Aucune dispensation détectée.</p>
              ) : (
                <div className="space-y-3">
                  {alerts.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      {alerts.length} alerte(s) détectée(s) au-dessus du seuil de {threshold} absences.
                    </div>
                  )}

                  {(dispensations ?? []).map((dispensation) => {
                    const count = dispensation.absence_count ?? 0;
                    const isAlert = count >= threshold;
                    return (
                      <div
                        key={dispensation.course_id}
                        className={`rounded-lg border p-4 ${
                          isAlert ? "border-amber-200 bg-amber-50" : "border-zinc-200"
                        }`}
                      >
                        <div className="text-sm font-semibold text-[#00365F]">
                          {dispensation.course_name ?? dispensation.course_id}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">Absences: {count}</div>
                        <div className="mt-2 flex items-center gap-2">
                          {dispensation.dispensed ? (
                            <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                              Dispensé de l&apos;examen
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              Pas de dispensation
                            </span>
                          )}
                          {isAlert && (
                            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                              Alerte assiduité
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <p className="text-sm text-zinc-500">Sélectionnez un étudiant.</p>
            )}
          </div>
        </div>

        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
