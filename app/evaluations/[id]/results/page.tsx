"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSafeParams } from "@/hooks/use-safe-params";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useEvaluation, useEvaluationResults } from "@/hooks/use-evaluations";

const PIE_COLORS = ["#00365F", "#0A8F3D", "#2E7CFF", "#F59E0B", "#E11D48", "#14B8A6"];
const WORD_STOPLIST = new Set([
  "de",
  "la",
  "le",
  "les",
  "des",
  "du",
  "et",
  "en",
  "dans",
  "un",
  "une",
  "pour",
  "sur",
  "avec",
  "plus",
  "très",
  "tres",
  "que",
  "qui",
  "est",
  "au",
  "aux",
  "ce",
  "cette",
  "ces",
  "ne",
  "pas",
  "par",
]);

const normalizeToken = (token: string) =>
  token
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

export default function EvaluationResultsPage() {
  const params = useSafeParams<{ id: string }>();
  const evaluationId = typeof params.id === "string" ? params.id : "";
  const { data: evaluation } = useEvaluation(evaluationId, !!evaluationId);
  const { data: results, isLoading } = useEvaluationResults(evaluationId);

  const ratingDetails = useMemo(() => results?.ratings ?? [], [results?.ratings]);
  const comments = useMemo(
    () => (results?.comments ?? []).filter((comment) => comment.trim().length > 0),
    [results?.comments]
  );

  const responseRate = Number(results?.response_rate ?? 0);
  const averageRating = Number(
    results?.average_rating ??
      (ratingDetails.length
        ? ratingDetails.reduce((sum, item) => sum + Number(item.average || 0), 0) /
          ratingDetails.length
        : 0)
  );
  const benchmarkAverage = Number(results?.benchmark_average ?? 3.5);

  const ratingsChartData = useMemo(
    () =>
      ratingDetails.map((rating, index) => ({
        key: `Q${index + 1}`,
        question: rating.question,
        average: Number(rating.average || 0),
      })),
    [ratingDetails]
  );

  const comparisonData = useMemo(
    () =>
      ratingsChartData.map((item) => ({
        ...item,
        delta: Number((item.average - averageRating).toFixed(2)),
      })),
    [averageRating, ratingsChartData]
  );

  const topWords = useMemo(() => {
    const frequency = new Map<string, number>();

    comments.forEach((comment) => {
      comment
        .split(/\s+/)
        .map(normalizeToken)
        .filter((token) => token.length >= 3)
        .filter((token) => !WORD_STOPLIST.has(token))
        .forEach((token) => {
          frequency.set(token, (frequency.get(token) || 0) + 1);
        });
    });

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 36)
      .map(([text, value]) => ({ text, value }));
  }, [comments]);

  const ratingCeiling = Math.max(5, Number(evaluation?.rating_scale_max ?? 5));

  const exportPdf = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Rapport d'évaluation enseignement", 14, 16);

    doc.setFontSize(11);
    doc.text(`Cours: ${evaluation?.course?.name ?? evaluation?.course_id ?? "-"}`, 14, 25);
    doc.text(
      `Enseignant: ${evaluation?.faculty_member?.full_name ?? evaluation?.faculty_member_id ?? "-"}`,
      14,
      31
    );
    doc.text(`Taux de réponse: ${responseRate.toFixed(1)}%`, 14, 37);
    doc.text(`Note moyenne: ${averageRating.toFixed(2)}/5`, 14, 43);

    autoTable(doc, {
      startY: 50,
      head: [["Question", "Moyenne", "Ecart vs moyenne"]],
      body: comparisonData.map((item) => [
        item.question,
        item.average.toFixed(2),
        item.delta >= 0 ? `+${item.delta.toFixed(2)}` : item.delta.toFixed(2),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 54, 95] },
    });

    const lastY =
      (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 60;
    doc.text("Commentaires marquants", 14, lastY + 10);

    const commentPreview = comments.length
      ? comments.slice(0, 8)
      : ["Aucun commentaire disponible."];
    autoTable(doc, {
      startY: lastY + 14,
      head: [["Commentaire"]],
      body: commentPreview.map((comment) => [comment]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [10, 143, 61] },
    });

    doc.save(`evaluation-${evaluationId}-rapport.pdf`);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Résultats d'évaluation">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={exportPdf}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F]"
          >
            Export PDF
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs text-zinc-500">Taux de réponse</p>
            <p className="mt-2 text-3xl font-semibold text-[#00365F]">{responseRate.toFixed(1)}%</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-[#0A8F3D]"
                style={{ width: `${Math.min(100, Math.max(0, responseRate))}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs text-zinc-500">Note moyenne</p>
            <p className="mt-2 text-3xl font-semibold text-[#00365F]">
              {averageRating.toFixed(2)}/5
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Comparatif attendu: {benchmarkAverage.toFixed(2)}/5
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs text-zinc-500">Commentaires collectés</p>
            <p className="mt-2 text-3xl font-semibold text-[#00365F]">{comments.length}</p>
            <p className="mt-2 text-xs text-zinc-500">
              Cours: {evaluation?.course?.name ?? evaluation?.course_id ?? "-"}
            </p>
            <p className="text-xs text-zinc-500">
              Enseignant:{" "}
              {evaluation?.faculty_member?.full_name ?? evaluation?.faculty_member_id ?? "-"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Moyenne par question</h2>
            {isLoading ? (
              <p className="mt-4 text-sm text-zinc-500">Chargement...</p>
            ) : ratingsChartData.length > 0 ? (
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingsChartData} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="key" />
                    <YAxis domain={[0, ratingCeiling]} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(2)} / 5`, "Moyenne"]}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.question || "Question"}
                    />
                    <ReferenceLine
                      y={averageRating}
                      stroke="#E11D48"
                      strokeDasharray="4 4"
                      label="Moyenne globale"
                    />
                    <Bar dataKey="average" fill="#00365F" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">Aucune note disponible.</p>
            )}
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#00365F]">Répartition des scores</h2>
            {ratingsChartData.length > 0 ? (
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ratingsChartData}
                      dataKey="average"
                      nameKey="key"
                      innerRadius={52}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {ratingsChartData.map((item, index) => (
                        <Cell key={item.key} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toFixed(2)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">Aucune répartition disponible.</p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#00365F]">Analyse comparative</h2>
          {comparisonData.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-[#00365F]/10">
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Question
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Moyenne
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                      Écart vs moyenne globale
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item) => (
                    <tr key={item.key} className="border-b border-zinc-100">
                      <td className="px-3 py-2 text-zinc-700">{item.question}</td>
                      <td className="px-3 py-2 text-zinc-700">{item.average.toFixed(2)}</td>
                      <td
                        className={`px-3 py-2 font-medium ${
                          item.delta >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {item.delta >= 0 ? "+" : ""}
                        {item.delta.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Aucune donnée comparative disponible.</p>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#00365F]">Nuage de mots (commentaires)</h2>
          {topWords.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {topWords.map((word, index) => {
                const ratio = Math.min(1.8, 0.8 + word.value * 0.18);
                return (
                  <span
                    key={`${word.text}-${index}`}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700"
                    style={{
                      fontSize: `${ratio}rem`,
                      lineHeight: 1.1,
                    }}
                  >
                    {word.text}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Aucun commentaire exploitable pour le nuage de mots.
            </p>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
