"use client";

import { useRef, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useMaquette, useImportMaquette } from "@/hooks/use-maquette";
import type {
  MaquetteProgram,
  MaquetteSemester,
  MaquetteUE,
  MaquetteCourse,
} from "@/types/maquette";
import { getAcademicPrograms } from "@/lib/api/course-units";
import { getDepartments } from "@/lib/api/departments";
import { downloadTemplate } from "@/lib/api/maquette";
import type { ImportMaquetteResult } from "@/lib/api/maquette";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { exportMaquetteCsv } from "@/lib/csv/maquette-export";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function MaquettePage() {
  const [programId, setProgramId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const [exporting, setExporting] = useState<"pdf" | "excel" | "csv" | null>(null);

  // Import dialog state
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importDeptId, setImportDeptId] = useState("");
  const [importProgramName, setImportProgramName] = useState("");
  const [importLevel, setImportLevel] = useState<"LICENCE" | "MASTER" | "DOCTORAT">("LICENCE");
  const [importDryRun, setImportDryRun] = useState(true);
  const [importResult, setImportResult] = useState<ImportMaquetteResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const importMutation = useImportMaquette();
  const queryClient = useQueryClient();

  const { data: departments } = useQuery({
    queryKey: ["departments-all"],
    queryFn: () => getDepartments({ limit: 200 }),
    staleTime: 60_000,
  });

  const { data: programs } = useQuery({
    queryKey: ["academic-programs-all"],
    queryFn: () => getAcademicPrograms(),
    staleTime: 60_000,
  });

  const {
    data: maquette = [],
    isLoading,
    error,
  } = useMaquette(programId ? { program_id: programId } : undefined);

  const canExport = !isLoading && maquette.length > 0;

  function resetImportDialog() {
    setImportFile(null);
    setImportDeptId("");
    setImportProgramName("");
    setImportLevel("LICENCE");
    setImportDryRun(true);
    setImportResult(null);
    setImportError(null);
  }

  async function handleImport() {
    if (!importFile || !importDeptId) return;
    setImportError(null);
    setImportResult(null);
    try {
      const result = await importMutation.mutateAsync({
        file: importFile,
        params: {
          department_id: importDeptId,
          program_name: importProgramName || undefined,
          program_level: importLevel,
          dry_run: importDryRun,
        },
      });
      setImportResult(result);
      if (!importDryRun && result.errors.length === 0) {
        await queryClient.invalidateQueries({ queryKey: ["academic-programs-all"] });
        await queryClient.invalidateQueries({ queryKey: ["maquette"] });
      }
    } catch (err: unknown) {
      const msg =
        (err as { body?: { message?: string } })?.body?.message ?? "Erreur lors de l'import.";
      setImportError(msg);
    }
  }

  function handleViewImported(id: string) {
    setProgramId(id);
    setImportOpen(false);
    resetImportDialog();
  }

  async function handleDownloadTemplate() {
    setDownloadingTemplate(true);
    try {
      await downloadTemplate();
    } finally {
      setDownloadingTemplate(false);
    }
  }

  async function handleExportPdf() {
    setExporting("pdf");
    try {
      if (viewMode === "table") {
        const { exportMaquettePdfClassic } = await import("@/lib/pdf/maquette-export");
        await exportMaquettePdfClassic(maquette);
      } else {
        const { exportMaquettePdf } = await import("@/lib/pdf/maquette-export");
        await exportMaquettePdf(maquette);
      }
    } finally {
      setExporting(null);
    }
  }

  async function handleExportExcel() {
    setExporting("excel");
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const token = (session as { accessToken?: string } | null)?.accessToken;
      const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
      const params = programId ? `?filter[program_id]=${encodeURIComponent(programId)}` : "";
      const res = await fetch(`${base}/maquette/export${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const single = maquette.length === 1 ? maquette[0].program_name : null;
      const slug = single ? `-${single.toLowerCase().replace(/\s+/g, "-")}` : "";
      a.download = `maquette${slug}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  function handleExportCsv() {
    setExporting("csv");
    exportMaquetteCsv(maquette);
    setExporting(null);
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Maquette pédagogique">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-zinc-700">Programme</label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            >
              <option value="">Tous les programmes</option>
              {(programs ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="flex overflow-hidden rounded-lg border border-zinc-300">
            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${viewMode === "tree" ? "bg-[#00365F] text-white" : "bg-white text-zinc-600 hover:bg-zinc-50"}`}
            >
              <TreeViewIcon />
              Arborescence
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 border-l border-zinc-300 px-3 py-2 text-sm font-medium transition-colors ${viewMode === "table" ? "bg-[#00365F] text-white" : "bg-white text-zinc-600 hover:bg-zinc-50"}`}
            >
              <ClassicTableIcon />
              Tableau classique
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetImportDialog();
                setImportOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#008D36] bg-white px-3 py-2 text-sm font-medium text-[#008D36] transition-colors hover:bg-[#008D36]/5"
            >
              <UploadIcon />
              Importer
            </button>

            {canExport && (
              <>
                <button
                  onClick={handleExportCsv}
                  disabled={exporting !== null}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                >
                  <DownloadIcon />
                  CSV
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={exporting !== null}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                >
                  {exporting === "excel" ? <Spinner /> : <TableIcon />}
                  Excel
                </button>
                <button
                  onClick={handleExportPdf}
                  disabled={exporting !== null}
                  className="flex items-center gap-1.5 rounded-lg bg-[#00365F] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00365F]/90 disabled:opacity-50"
                >
                  {exporting === "pdf" ? <Spinner white /> : <PdfIcon />}
                  PDF
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main content */}
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">Erreur lors du chargement.</p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]" />
          </div>
        ) : maquette.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white">
            <p className="text-sm text-zinc-400">Aucune maquette disponible</p>
          </div>
        ) : viewMode === "tree" ? (
          <div className="space-y-10">
            {maquette.map((prog) => (
              <ProgramBlock key={prog.program_id} prog={prog} />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {maquette.map((prog) => (
              <MaquetteTableView key={prog.program_id} prog={prog} />
            ))}
          </div>
        )}

        {/* Import Dialog */}
        {importOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                <h2 className="text-base font-semibold text-zinc-900">Importer une maquette</h2>
                <button
                  onClick={() => setImportOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto space-y-4 px-6 py-5">
                {/* Template download */}
                <div className="flex items-center justify-between rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3">
                  <p className="text-xs text-zinc-500">
                    Les fichiers UFR SATA sont acceptés directement. Utilisez le modèle CAMES pour
                    les autres formats.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    disabled={downloadingTemplate}
                    className="ml-3 shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {downloadingTemplate ? "..." : "Modèle CAMES"}
                  </button>
                </div>

                {/* File drop zone */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Fichier Excel (.xlsx) *
                  </label>
                  <FileDropZone file={importFile} onChange={setImportFile} />
                </div>

                {/* Department */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Département *
                  </label>
                  <select
                    value={importDeptId}
                    onChange={(e) => setImportDeptId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  >
                    <option value="">Sélectionner un département</option>
                    {(departments?.data ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Program name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Nom du programme
                    <span className="ml-1 text-xs font-normal text-zinc-400">
                      (requis si absent du fichier)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={importProgramName}
                    onChange={(e) => setImportProgramName(e.target.value)}
                    placeholder="Ex: Licence en Agronomie-Productions Végétales"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  />
                </div>

                {/* Level + dry run */}
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Niveau</label>
                    <select
                      value={importLevel}
                      onChange={(e) =>
                        setImportLevel(e.target.value as "LICENCE" | "MASTER" | "DOCTORAT")
                      }
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                    >
                      <option value="LICENCE">Licence</option>
                      <option value="MASTER">Master</option>
                      <option value="DOCTORAT">Doctorat</option>
                    </select>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 pb-2">
                    <input
                      type="checkbox"
                      checked={importDryRun}
                      onChange={(e) => setImportDryRun(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-zinc-700">Simulation</span>
                  </label>
                </div>

                {/* Error */}
                {importError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {importError}
                  </div>
                )}

                {/* Result */}
                {importResult && (
                  <ImportResultCard
                    result={importResult}
                    onViewProgram={
                      !importResult.dry_run &&
                      importResult.errors.length === 0 &&
                      importResult.program_id
                        ? () => handleViewImported(importResult.program_id!)
                        : undefined
                    }
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
                <button
                  onClick={() => setImportOpen(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Fermer
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || !importDeptId || importMutation.isPending}
                  className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white hover:bg-[#008D36]/90 disabled:opacity-50"
                >
                  {importMutation.isPending ? "En cours..." : importDryRun ? "Simuler" : "Importer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// ─── File drop zone ────────────────────────────────────────────────────────────

function FileDropZone({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
        dragging
          ? "border-[#008D36] bg-[#008D36]/5"
          : file
            ? "border-[#008D36]/40 bg-[#008D36]/5"
            : "border-zinc-300 bg-zinc-50 hover:border-zinc-400"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <>
          <svg
            className="h-6 w-6 text-[#008D36]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-zinc-800">{file.name}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="text-xs text-zinc-400 hover:text-red-500"
          >
            Supprimer
          </button>
        </>
      ) : (
        <>
          <UploadIcon />
          <p className="text-sm text-zinc-600">
            Glissez un fichier ici ou <span className="font-medium text-[#008D36]">parcourir</span>
          </p>
          <p className="text-xs text-zinc-400">.xlsx / .xls</p>
        </>
      )}
    </div>
  );
}

// ─── Import result card ────────────────────────────────────────────────────────

function ImportResultCard({
  result,
  onViewProgram,
}: {
  result: ImportMaquetteResult;
  onViewProgram?: () => void;
}) {
  const hasErrors = result.errors.length > 0;
  const isDry = result.dry_run;

  const borderColor = hasErrors
    ? "border-red-200 bg-red-50"
    : isDry
      ? "border-amber-200 bg-amber-50"
      : "border-green-200 bg-green-50";

  const stats = [
    { label: "Programmes créés", value: result.programs_created },
    { label: "Programmes trouvés", value: result.programs_found },
    { label: "UE créées", value: result.units_created },
    { label: "UE mises à jour / ignorées", value: result.units_skipped },
    { label: "ECUE créées", value: result.courses_created },
    { label: "ECUE mises à jour / ignorées", value: result.courses_skipped },
  ];

  return (
    <div className={`rounded-lg border p-4 text-sm ${borderColor}`}>
      <p className="mb-3 font-semibold text-zinc-800">
        {hasErrors ? "Erreurs détectées" : isDry ? "Résultat de la simulation" : "Import réussi"}
      </p>

      {!hasErrors && (
        <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-zinc-700">
          {stats.map(({ label, value }) => (
            <div key={label} className="contents">
              <span className="text-zinc-500">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}

      {result.errors.length > 0 && (
        <ul className="space-y-1 text-sm text-red-700">
          {result.errors.map((e, i) => (
            <li key={i}>• {e}</li>
          ))}
        </ul>
      )}

      {result.warnings.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-amber-700">
            {result.warnings.length} avertissement{result.warnings.length > 1 ? "s" : ""}
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-amber-700">
            {result.warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      )}

      {onViewProgram && (
        <button
          onClick={onViewProgram}
          className="mt-3 flex items-center gap-1.5 rounded-md bg-[#008D36] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#008D36]/90"
        >
          Voir le programme importé →
        </button>
      )}
    </div>
  );
}

// ─── Program block ─────────────────────────────────────────────────────────────

function ProgramBlock({ prog }: { prog: MaquetteProgram }) {
  const totalCredits = prog.semesters.reduce(
    (sum, s) => sum + s.course_units.reduce((s2, u) => s2 + (u.credits ?? 0), 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg shadow-sm">
        <div className="flex items-center justify-between bg-[#00365F] px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
              Maquette pédagogique
            </p>
            <p className="mt-0.5 text-lg font-bold text-white">{prog.program_name}</p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
            {totalCredits} crédits
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {prog.semesters.map((s) => (
          <SemesterSection key={`${prog.program_id}-${s.semester}`} data={s} />
        ))}
      </div>
    </div>
  );
}

// ─── Semester section ──────────────────────────────────────────────────────────

function SemesterSection({ data }: { data: MaquetteSemester }) {
  const [open, setOpen] = useState(true);
  const totalCredits = data.course_units.reduce((sum, u) => sum + (u.credits ?? 0), 0);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-[#00365F]/10 px-5 py-3 text-left transition-colors hover:bg-[#00365F]/15"
      >
        <span className="text-sm font-bold text-[#00365F]">Semestre {data.semester}</span>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#00365F]/10 px-2.5 py-0.5 text-xs font-medium text-[#00365F]">
            {totalCredits} crédits
          </span>
          <svg
            className={`h-4 w-4 text-[#00365F] transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="divide-y divide-zinc-100">
          {data.course_units.map((unit) => (
            <UEBlock key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── UE block ─────────────────────────────────────────────────────────────────

function UEBlock({ unit }: { unit: MaquetteUE }) {
  const [open, setOpen] = useState(true);
  const hasCoef = unit.courses?.some((c) => c.coefficient != null && c.coefficient > 0);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 bg-zinc-50 px-5 py-3 text-left transition-colors hover:bg-zinc-100"
      >
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="w-24 shrink-0 font-mono text-xs text-zinc-500">{unit.code}</span>
        <span className="flex-1 text-sm font-semibold text-zinc-800">{unit.name}</span>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          {unit.credits != null && unit.credits > 0 && (
            <span>
              <span className="font-medium text-zinc-700">{unit.credits}</span> crédits
            </span>
          )}
          {unit.coefficient != null && unit.coefficient > 0 && (
            <span>
              Coef <span className="font-medium text-zinc-700">{unit.coefficient}</span>
            </span>
          )}
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-medium ${
              unit.type === "OBLIGATOIRE"
                ? "bg-blue-50 text-blue-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {unit.type === "OBLIGATOIRE" ? "Obligatoire" : "Optionnel"}
          </span>
        </div>
      </button>

      {open && (unit.courses ?? []).length > 0 && (
        <CoursesTable courses={unit.courses ?? []} showCoef={!!hasCoef} />
      )}

      {open && (unit.courses ?? []).length === 0 && (
        <p className="px-5 py-3 text-xs text-zinc-400">Aucun cours dans cette UE</p>
      )}
    </div>
  );
}

// ─── Courses table ─────────────────────────────────────────────────────────────

function CoursesTable({ courses, showCoef }: { courses: MaquetteCourse[]; showCoef: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-zinc-100 bg-white">
          <TableHead className="w-28 py-2 text-xs font-medium text-zinc-400">Code ECUE</TableHead>
          <TableHead className="py-2 text-xs font-medium text-zinc-400">Intitulé</TableHead>
          <TableHead className="w-14 whitespace-nowrap py-2 text-right text-xs font-medium text-zinc-400">
            CM
          </TableHead>
          <TableHead className="w-14 whitespace-nowrap py-2 text-right text-xs font-medium text-zinc-400">
            TD
          </TableHead>
          <TableHead className="w-14 whitespace-nowrap py-2 text-right text-xs font-medium text-zinc-400">
            TP
          </TableHead>
          <TableHead className="w-14 whitespace-nowrap py-2 text-right text-xs font-medium text-zinc-400">
            TPE
          </TableHead>
          <TableHead className="w-16 whitespace-nowrap py-2 text-right text-xs font-medium text-zinc-400">
            VHT
          </TableHead>
          {showCoef && (
            <TableHead className="w-16 whitespace-nowrap py-2 text-right text-xs font-medium text-zinc-400">
              Coef
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-zinc-50">
        {courses.map((course) => (
          <CourseRow key={course.id} course={course} showCoef={showCoef} />
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Course row ────────────────────────────────────────────────────────────────

function CourseRow({ course, showCoef }: { course: MaquetteCourse; showCoef: boolean }) {
  const cm = course.hours_lecture ?? 0;
  const td = course.hours_td ?? 0;
  const tp = course.hours_tp ?? 0;
  const tpe = course.hours_tpe ?? 0;
  const vht = course.vht && course.vht > 0 ? course.vht : cm + td + tp + tpe;

  const fmt = (v: number) => (v === 0 ? <span className="text-zinc-300">—</span> : v);

  return (
    <TableRow className="transition-colors hover:bg-zinc-50">
      <TableCell className="py-2 font-mono text-xs text-zinc-500">{course.code}</TableCell>
      <TableCell className="py-2 text-xs text-zinc-800">{course.name}</TableCell>
      <TableCell className="py-2 text-right text-xs text-zinc-600">{fmt(cm)}</TableCell>
      <TableCell className="py-2 text-right text-xs text-zinc-600">{fmt(td)}</TableCell>
      <TableCell className="py-2 text-right text-xs text-zinc-600">{fmt(tp)}</TableCell>
      <TableCell className="py-2 text-right text-xs text-zinc-600">{fmt(tpe)}</TableCell>
      <TableCell className="py-2 text-right text-xs font-medium text-zinc-700">
        {fmt(vht)}
      </TableCell>
      {showCoef && (
        <TableCell className="py-2 text-right text-xs text-zinc-600">
          {course.coefficient != null && course.coefficient > 0 ? (
            course.coefficient
          ) : (
            <span className="text-zinc-300">—</span>
          )}
        </TableCell>
      )}
    </TableRow>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function Spinner({ white }: { white?: boolean }) {
  return (
    <div
      className={`h-4 w-4 animate-spin rounded-full border-2 ${
        white ? "border-white/30 border-t-white" : "border-zinc-300 border-t-zinc-700"
      }`}
    />
  );
}

function UploadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function TreeViewIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  );
}

function ClassicTableIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9h18M3 15h18M9 3v18M15 3v18"
      />
    </svg>
  );
}

// ─── Classic table view ────────────────────────────────────────────────────────

function MaquetteTableView({ prog }: { prog: MaquetteProgram }) {
  return (
    <div className="space-y-8">
      {prog.semesters.map((s) => (
        <SemesterClassicTable key={s.semester} prog={prog} semester={s} />
      ))}
    </div>
  );
}

function SemesterClassicTable({
  prog,
  semester,
}: {
  prog: MaquetteProgram;
  semester: MaquetteSemester;
}) {
  const totalVHT = semester.course_units
    .flatMap((u) => u.courses ?? [])
    .reduce((sum, c) => {
      const cm = c.hours_lecture ?? 0;
      const td = c.hours_td ?? 0;
      const tp = c.hours_tp ?? 0;
      const tpe = c.hours_tpe ?? 0;
      return sum + (c.vht && c.vht > 0 ? c.vht : cm + td + tp + tpe);
    }, 0);
  const totalCredits = semester.course_units.reduce((sum, u) => sum + (u.credits ?? 0), 0);

  const th = "border border-zinc-400 px-2 py-1 text-xs font-semibold text-center";
  const td = "border border-zinc-400 px-2 py-1 text-xs";
  const num = `${td} text-center`;
  const fmt = (v: number) => (v === 0 ? "" : String(v));

  return (
    <div className="overflow-x-auto">
      <Table className="w-full border-collapse">
        <TableHeader>
          {/* Program title */}
          <TableRow>
            <TableHead
              colSpan={11}
              className={`${th} bg-white text-center text-sm font-bold text-zinc-900`}
            >
              {prog.program_name}
            </TableHead>
          </TableRow>
          {/* Semester + ME/CT grouping */}
          <TableRow>
            <TableHead colSpan={3} className={`${th} bg-[#00365F] text-white`}>
              SEMESTRE {semester.semester}
            </TableHead>
            <TableHead className={`border border-zinc-400 bg-[#00365F]`} />
            <TableHead colSpan={3} className={`${th} bg-zinc-200 text-zinc-700`}>
              ME
            </TableHead>
            <TableHead colSpan={4} className={`${th} bg-zinc-300 text-zinc-700`}>
              CT
            </TableHead>
          </TableRow>
          {/* Column headers */}
          <TableRow>
            <TableHead className={`${th} w-32 text-zinc-700`}>{"Unités d'Enseignement"}</TableHead>
            <TableHead className={`${th} w-20 text-zinc-700`}>{"Code de l'UE"}</TableHead>
            <TableHead className={`${th} text-zinc-700`}>Éléments Constitutifs</TableHead>
            <TableHead className={`${th} w-24 text-zinc-700`}>{"Code de l'EC"}</TableHead>
            <TableHead className={`${th} w-12 text-zinc-700`}>CM</TableHead>
            <TableHead className={`${th} w-12 text-zinc-700`}>TD</TableHead>
            <TableHead className={`${th} w-12 text-zinc-700`}>TP</TableHead>
            <TableHead className={`${th} w-12 text-zinc-700`}>TPE</TableHead>
            <TableHead className={`${th} w-14 text-zinc-700`}>VHT</TableHead>
            <TableHead className={`${th} w-14 text-zinc-700`}>Coeff</TableHead>
            <TableHead className={`${th} w-16 text-zinc-700`}>Crédits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {semester.course_units.flatMap((unit) => {
            const courses = unit.courses ?? [];
            if (courses.length === 0) {
              return [
                <TableRow key={unit.id}>
                  <TableCell className={`${td} bg-zinc-50 font-semibold text-center`}>
                    {unit.name}
                  </TableCell>
                  <TableCell className={`${num} bg-zinc-50 font-mono font-semibold`}>
                    {unit.code}
                  </TableCell>
                  <TableCell colSpan={8} className={`${td} text-zinc-400`}>
                    —
                  </TableCell>
                  <TableCell className={`${num} bg-zinc-50 font-bold`}>
                    {unit.credits ?? ""}
                  </TableCell>
                </TableRow>,
              ];
            }
            const n = courses.length;
            return courses.map((course, i) => {
              const cm = course.hours_lecture ?? 0;
              const tdh = course.hours_td ?? 0;
              const tp = course.hours_tp ?? 0;
              const tpe = course.hours_tpe ?? 0;
              const vht = course.vht && course.vht > 0 ? course.vht : cm + tdh + tp + tpe;
              return (
                <TableRow key={course.id}>
                  {i === 0 && (
                    <>
                      <TableCell
                        rowSpan={n}
                        className={`${td} bg-zinc-50 font-semibold text-center align-middle`}
                      >
                        {unit.name}
                      </TableCell>
                      <TableCell
                        rowSpan={n}
                        className={`${num} bg-zinc-50 font-mono font-semibold align-middle`}
                      >
                        {unit.code}
                      </TableCell>
                    </>
                  )}
                  <TableCell className={td}>{course.name}</TableCell>
                  <TableCell className={`${num} font-mono`}>{course.code}</TableCell>
                  <TableCell className={num}>{fmt(cm)}</TableCell>
                  <TableCell className={num}>{fmt(tdh)}</TableCell>
                  <TableCell className={num}>{fmt(tp)}</TableCell>
                  <TableCell className={num}>{fmt(tpe)}</TableCell>
                  <TableCell className={num}>{fmt(vht)}</TableCell>
                  <TableCell className={num}>
                    {course.coefficient && course.coefficient > 0 ? course.coefficient : ""}
                  </TableCell>
                  {i === 0 && (
                    <TableCell rowSpan={n} className={`${num} bg-zinc-50 font-bold align-middle`}>
                      {unit.credits ?? ""}
                    </TableCell>
                  )}
                </TableRow>
              );
            });
          })}
          {/* Semester total */}
          <TableRow>
            <TableCell
              colSpan={8}
              className={`${td} bg-zinc-50 text-center font-semibold text-zinc-700`}
            >
              Total des enseignements du semestre {semester.semester}
            </TableCell>
            <TableCell className={`${num} bg-zinc-50 font-bold text-zinc-900`}>
              {totalVHT || ""}
            </TableCell>
            <TableCell className={`${num} bg-zinc-50`} />
            <TableCell className={`${num} bg-zinc-50 font-bold text-zinc-900`}>
              {totalCredits || ""}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
