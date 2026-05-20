"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useMaquette } from "@/hooks/use-maquette";
import type { MaquetteProgram, MaquetteSemester, MaquetteUE, MaquetteCourse } from "@/types/maquette";
import { getAcademicPrograms } from "@/lib/api/course-units";
import { useQuery } from "@tanstack/react-query";
import { exportMaquetteCsv } from "@/lib/csv/maquette-export";

export default function MaquettePage() {
  const [programId, setProgramId] = useState<string>("");
  const [exporting, setExporting] = useState<"pdf" | "excel" | "csv" | null>(null);

  const { data: programs } = useQuery({
    queryKey: ["academic-programs-all"],
    queryFn: () => getAcademicPrograms(),
    staleTime: 60_000,
  });

  const { data: maquette = [], isLoading, error } = useMaquette(
    programId ? { program_id: programId } : undefined
  );

  const canExport = !isLoading && maquette.length > 0;

  async function handleExportPdf() {
    setExporting("pdf");
    try {
      const { exportMaquettePdf } = await import("@/lib/pdf/maquette-export");
      await exportMaquettePdf(maquette);
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
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {canExport && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                disabled={exporting !== null}
                title="Télécharger CSV"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                <DownloadIcon />
                CSV
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exporting !== null}
                title="Télécharger Excel"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                {exporting === "excel" ? <Spinner /> : <TableIcon />}
                Excel
              </button>
              <button
                onClick={handleExportPdf}
                disabled={exporting !== null}
                title="Télécharger PDF"
                className="flex items-center gap-1.5 rounded-lg bg-[#00365F] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00365F]/90 disabled:opacity-50"
              >
                {exporting === "pdf" ? <Spinner white /> : <PdfIcon />}
                PDF
              </button>
            </div>
          )}
        </div>

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
        ) : (
          <div className="space-y-10">
            {maquette.map((prog) => (
              <ProgramBlock key={prog.program_id} prog={prog} />
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
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
      {/* Programme header */}
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

      {/* Semesters */}
      <div className="space-y-4">
        {prog.semesters.map((s) => (
          <SemesterSection key={`${prog.program_id}-${s.semester}`} data={s} />
        ))}
      </div>
    </div>
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

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

// ─── Semester / UE / Course (unchanged logic) ─────────────────────────────────

function SemesterSection({ data }: { data: MaquetteSemester }) {
  const [open, setOpen] = useState(true);
  const totalCredits = data.course_units.reduce((sum, u) => sum + (u.credits ?? 0), 0);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-[#00365F]/10 px-5 py-3 text-left hover:bg-[#00365F]/15 transition-colors"
      >
        <span className="text-sm font-bold text-[#00365F]">Semestre {data.semester}</span>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#00365F]/10 px-2.5 py-0.5 text-xs font-medium text-[#00365F]">
            {totalCredits} crédits
          </span>
          <svg
            className={`h-4 w-4 text-[#00365F] transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
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

function UEBlock({ unit }: { unit: MaquetteUE }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 bg-zinc-50 px-5 py-3 text-left hover:bg-zinc-100 transition-colors"
      >
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="w-24 shrink-0 text-xs font-mono text-zinc-500">{unit.code}</span>
        <span className="flex-1 text-sm font-semibold text-zinc-800">{unit.name}</span>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span><span className="font-medium text-zinc-700">{unit.credits}</span> crédits UE</span>
          {unit.coefficient != null && (
            <span>Coef <span className="font-medium text-zinc-700">{unit.coefficient}</span></span>
          )}
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
            unit.type === "OBLIGATOIRE" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
          }`}>
            {unit.type === "OBLIGATOIRE" ? "Obligatoire" : "Optionnel"}
          </span>
        </div>
      </button>

      {open && (unit.courses ?? []).length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-white">
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Code ECUE</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Intitulé</th>
                <th className="px-4 py-2 text-right font-medium text-zinc-400">CM</th>
                <th className="px-4 py-2 text-right font-medium text-zinc-400">TD</th>
                <th className="px-4 py-2 text-right font-medium text-zinc-400">TPE</th>
                <th className="px-4 py-2 text-right font-medium text-zinc-400">VHT</th>
                <th className="px-4 py-2 text-right font-medium text-zinc-400">Crédits EC</th>
                <th className="px-4 py-2 text-right font-medium text-zinc-400">Crédits UE</th>
                <th className="px-4 py-2 text-right font-medium text-zinc-400">Coef EC</th>
                <th className="px-4 py-2 text-right font-medium text-zinc-400">Coef UE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {(unit.courses ?? []).map((course) => (
                <CourseRow key={course.id} course={course} unit={unit} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && (unit.courses ?? []).length === 0 && (
        <p className="px-5 py-3 text-xs text-zinc-400">Aucun cours dans cette UE</p>
      )}
    </div>
  );
}

function CourseRow({ course, unit }: { course: MaquetteCourse; unit: MaquetteUE }) {
  const vht = course.vht ?? (course.hours_lecture + course.hours_td + (course.hours_tpe ?? 0));
  return (
    <tr className="hover:bg-zinc-50 transition-colors">
      <td className="px-4 py-2 font-mono text-zinc-500">{course.code}</td>
      <td className="px-4 py-2 text-zinc-800">{course.name}</td>
      <td className="px-4 py-2 text-right text-zinc-600">{course.hours_lecture}</td>
      <td className="px-4 py-2 text-right text-zinc-600">{course.hours_td}</td>
      <td className="px-4 py-2 text-right text-zinc-600">{course.hours_tpe ?? 0}</td>
      <td className="px-4 py-2 text-right font-medium text-zinc-700">{vht}</td>
      <td className="px-4 py-2 text-right text-zinc-600">{course.credits}</td>
      <td className="px-4 py-2 text-right text-zinc-400">{unit.credits}</td>
      <td className="px-4 py-2 text-right text-zinc-600">{course.coefficient}</td>
      <td className="px-4 py-2 text-right text-zinc-400">{unit.coefficient ?? "—"}</td>
    </tr>
  );
}
