"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useSafeParams } from "@/hooks/use-safe-params";
import { useStudent } from "@/hooks/use-students";
import { useStudentDeliberationHistory } from "@/hooks/use-deliberations";
import { DeliberationDecision, HonorLevel } from "@/types/deliberation";

const decisionLabel = (decision: DeliberationDecision | null) => {
  if (!decision) return "En attente";
  const labels: Record<DeliberationDecision, string> = {
    [DeliberationDecision.ADMITTED]: "Admis",
    [DeliberationDecision.ADMITTED_COMPENSATION]: "Admis avec compensation",
    [DeliberationDecision.RESIT]: "Rattrapage",
    [DeliberationDecision.FAILED]: "Ajourné",
    [DeliberationDecision.EXCLUDED]: "Exclu",
  };
  return labels[decision];
};

const honorLabel = (honor: HonorLevel | null) => {
  if (!honor) return "Sans mention";
  const labels: Record<HonorLevel, string> = {
    [HonorLevel.PASSABLE]: "Passable",
    [HonorLevel.ASSEZ_BIEN]: "Assez Bien",
    [HonorLevel.BIEN]: "Bien",
    [HonorLevel.TRES_BIEN]: "Très Bien",
  };
  return labels[honor];
};

const csvValue = (value: string | number | null | undefined) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function StudentDeliberationHistoryPage() {
  const params = useSafeParams<{ id: string }>();
  const studentId = params.id as string;
  const { data: student } = useStudent(studentId, !!studentId);
  const { data, isLoading } = useStudentDeliberationHistory(studentId, !!studentId);

  const history = data?.data ?? [];

  const handleDownload = () => {
    const header = [
      "Session",
      "Date",
      "Programme",
      "Semestre",
      "Décision",
      "Mention",
      "Moyenne",
      "Crédits obtenus",
      "Crédits inscrits",
      "Remarques",
    ];
    const rows = history.map((item) => [
      csvValue(item.session_name),
      csvValue(new Date(item.session_date).toLocaleDateString("fr-FR")),
      csvValue(item.academic_program_name ?? "-"),
      csvValue(item.semester),
      csvValue(decisionLabel(item.decision)),
      csvValue(item.is_with_honors ? honorLabel(item.honor_level) : "Sans mention"),
      csvValue(item.semester_average ?? "-"),
      csvValue(item.total_credits_earned ?? "-"),
      csvValue(item.total_credits_enrolled ?? "-"),
      csvValue(item.jury_remarks ?? ""),
    ]);
    const csv = [header.map(csvValue).join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `historique-deliberations-${student?.student_number ?? studentId}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Historique des délibérations">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href={`/students/${studentId}`}
              className="text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
            >
              ← Retour à la fiche étudiant
            </Link>
            <h2 className="mt-3 text-2xl font-semibold text-zinc-900">
              Historique des délibérations
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              {student?.full_name ?? "Étudiant"} ({student?.student_number ?? studentId})
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={history.length === 0}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Télécharger l&apos;historique (CSV)
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-zinc-200 bg-white">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement de l&apos;historique...</p>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Aucun historique de délibération disponible pour cet étudiant.
          </div>
        ) : (
          <div className="relative space-y-6">
            <div className="absolute bottom-0 left-[17px] top-0 w-0.5 bg-zinc-200"></div>
            {history.map((item) => (
              <div key={item.id} className="relative rounded-lg border border-zinc-200 bg-white p-5">
                <div className="absolute left-3 top-6 h-3 w-3 rounded-full bg-[#008D36]"></div>
                <div className="ml-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900">{item.session_name}</h3>
                    <span className="text-xs text-zinc-500">
                      {new Date(item.session_date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-600">
                    {item.academic_program_name ?? "Programme"} • Semestre {item.semester}
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-zinc-500">Décision</p>
                      <p className="font-medium text-zinc-900">{decisionLabel(item.decision)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Mention</p>
                      <p className="font-medium text-zinc-900">
                        {item.is_with_honors ? honorLabel(item.honor_level) : "Sans mention"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Moyenne</p>
                      <p className="font-medium text-zinc-900">{item.semester_average ?? "-"} / 20</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Crédits</p>
                      <p className="font-medium text-zinc-900">
                        {item.total_credits_earned ?? "-"} / {item.total_credits_enrolled ?? "-"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-zinc-600">
                    Remarques jury: {item.jury_remarks || "Aucune"}
                  </p>
                  <Link
                    href={`/deliberations/${item.deliberation_session_id}/results`}
                    className="mt-3 inline-flex text-xs font-medium text-[#00365F] hover:text-[#008D36]"
                  >
                    Ouvrir la session →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
