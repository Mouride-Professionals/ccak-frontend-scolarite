"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useExamGradeSheet, useCreateExamGrade, useUpdateExamGrade } from "@/hooks/use-exam-grades";
import { useDownloadGradeSheetPdf, useDownloadGradeSheetExcel, useImportGradeSheet } from "@/hooks/use-fiche-de-note";
import type { GradeSheetStudentRow } from "@/types/fiche-de-note";
import type { ImportGradesResult } from "@/types/fiche-de-note";

export default function ExamGradeSheetPage() {
  const params = useSafeParams<{ examScheduleId: string }>();
  const examScheduleId = params?.examScheduleId as string;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, refetch } = useExamGradeSheet(examScheduleId);
  const createGrade = useCreateExamGrade(examScheduleId);
  const updateGrade = useUpdateExamGrade(examScheduleId);

  const ctx = { type: "exam_schedule" as const, id: examScheduleId };
  const downloadPdf   = useDownloadGradeSheetPdf(ctx);
  const downloadExcel = useDownloadGradeSheetExcel(ctx);
  const importGrades  = useImportGradeSheet(ctx);

  const [scores, setScores] = useState<Record<string, string>>({});
  const [savingRow, setSavingRow] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportGradesResult | null>(null);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const schedule   = data?.exam_schedule;
  const students   = data?.students ?? [];
  const useAnonyma = schedule?.use_exam_number ?? false;

  // scores keyed by student_id always (even in anonyma mode)
  const getScore = (row: GradeSheetStudentRow) =>
    scores[row.student_id] !== undefined
      ? scores[row.student_id]
      : row.score !== null && row.score !== undefined
      ? String(row.score)
      : "";

  const handleScoreChange = (studentId: string, value: string) => {
    setScores((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSaveRow = useCallback(
    async (row: GradeSheetStudentRow) => {
      const rawScore = scores[row.student_id];
      if (rawScore === undefined || rawScore === "") return;

      const score = Number(rawScore);
      if (Number.isNaN(score) || score < 0 || score > (row.max_score ?? 20)) return;

      setSavingRow(row.student_id);
      try {
        const payload = {
          course_enrollment_id: row.course_enrollment_id,
          score,
          max_score: row.max_score ?? 20,
        };

        if (row.grade_id) {
          await updateGrade.mutateAsync(payload);
        } else {
          await createGrade.mutateAsync(payload);
        }

        await refetch();
        setScores((prev) => {
          const next = { ...prev };
          delete next[row.student_id];
          return next;
        });
      } catch {
        setToast({ isOpen: true, message: "Erreur lors de l'enregistrement.", type: "error" });
      } finally {
        setSavingRow(null);
      }
    },
    [scores, createGrade, updateGrade, refetch]
  );

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importGrades.mutateAsync(file);
      setImportResult(result);
      await refetch();
      setToast({ isOpen: true, message: `${result.imported} note(s) importée(s).`, type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Échec de l'import.", type: "error" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const gradedCount = students.filter((s) => s.grade_id).length;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Saisie des notes d'examen">
        <div className="space-y-6">
          {/* Back */}
          <button
            type="button"
            onClick={() => router.push("/exam-grades")}
            className="text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
          >
            ← Retour aux fiches de notes
          </button>

          {isLoading ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
              Chargement...
            </div>
          ) : !schedule ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
              Épreuve introuvable.
            </div>
          ) : (
            <>
              {/* Header card */}
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-[#00365F]">
                        {schedule.course_code} — {schedule.course_name}
                      </h2>
                      {useAnonyma && (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Anonymat
                        </span>
                      )}
                    </div>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="text-zinc-400">Session</dt>
                        <dd className="font-medium text-zinc-700">{schedule.session_name}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-400">Date</dt>
                        <dd className="font-medium text-zinc-700">
                          {new Date(schedule.date).toLocaleDateString("fr-FR")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-400">Horaire</dt>
                        <dd className="font-medium text-zinc-700">
                          {schedule.start_time} – {schedule.end_time}
                        </dd>
                      </div>
                      {schedule.room && (
                        <div>
                          <dt className="text-zinc-400">Salle</dt>
                          <dd className="font-medium text-zinc-700">{schedule.room}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-zinc-400">Semestre</dt>
                        <dd className="font-medium text-zinc-700">S{schedule.semester_number}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Grade sheet */}
              <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-zinc-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-[#00365F]">Saisie des notes</h3>
                    <p className="text-sm text-zinc-500">
                      {gradedCount} / {students.length} étudiants notés
                    </p>
                  </div>

                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={downloadPdf.isPending}
                      onClick={() => downloadPdf.mutate()}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                    >
                      {downloadPdf.isPending ? "..." : "PDF"}
                    </button>
                    <button
                      type="button"
                      disabled={downloadExcel.isPending}
                      onClick={() => downloadExcel.mutate()}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                    >
                      {downloadExcel.isPending ? "..." : "Excel ↓"}
                    </button>
                    <button
                      type="button"
                      disabled={importGrades.isPending}
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg border border-[#008D36] bg-white px-3 py-1.5 text-xs font-medium text-[#008D36] transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {importGrades.isPending ? "Import..." : "Excel ↑"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={handleImportFile}
                    />
                  </div>
                </div>

                {/* Import result */}
                {importResult && (
                  <div className="mx-6 mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
                    <p className="font-medium text-zinc-700">
                      Import terminé — {importResult.imported} importée(s), {importResult.skipped} ignorée(s)
                    </p>
                    {importResult.errors.length > 0 && (
                      <ul className="mt-1 list-inside list-disc text-xs text-red-600">
                        {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    )}
                  </div>
                )}

                {students.length === 0 ? (
                  <div className="p-10 text-center text-sm text-zinc-500">
                    Aucun étudiant inscrit à cette épreuve.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">N°</TableHead>
                        {useAnonyma ? (
                          <TableHead>Code anonymat</TableHead>
                        ) : (
                          <>
                            <TableHead>Nom &amp; Prénom</TableHead>
                            <TableHead>N° Carte</TableHead>
                          </>
                        )}
                        <TableHead>Note / {students[0]?.max_score ?? 20}</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((row, idx) => {
                        const isSaving = savingRow === row.student_id;
                        const scoreVal = getScore(row);
                        const isDirty  = scores[row.student_id] !== undefined;

                        return (
                          <TableRow key={row.student_id}>
                            <TableCell className="text-zinc-400">{idx + 1}</TableCell>
                            {useAnonyma ? (
                              <TableCell className="font-mono font-medium text-zinc-800">
                                {row.exam_number ?? "—"}
                              </TableCell>
                            ) : (
                              <>
                                <TableCell className="font-medium text-zinc-800">
                                  {row.full_name ?? "—"}
                                </TableCell>
                                <TableCell className="font-mono text-zinc-500">
                                  {row.student_number ?? "—"}
                                </TableCell>
                              </>
                            )}
                            <TableCell>
                              <input
                                type="number"
                                min={0}
                                max={row.max_score ?? 20}
                                step={0.25}
                                value={scoreVal}
                                disabled={isSaving}
                                onChange={(e) => handleScoreChange(row.student_id, e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveRow(row)}
                                className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] disabled:bg-zinc-50 disabled:text-zinc-400"
                              />
                            </TableCell>
                            <TableCell>
                              {row.grade_id ? (
                                <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                                  Saisie
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-400">
                                  En attente
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {isDirty && (
                                <button
                                  type="button"
                                  onClick={() => handleSaveRow(row)}
                                  disabled={isSaving}
                                  className="text-sm font-medium text-[#008D36] transition-colors hover:text-[#007A2E] disabled:opacity-50"
                                >
                                  {isSaving ? "..." : "Enregistrer"}
                                </button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
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
