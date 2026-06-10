import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import type { ImportGradesResult } from "@/types/fiche-de-note";

async function blobDownload(path: string, filename: string, accept: string): Promise<void> {
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

  const res = await fetch(`${base}${path}`, {
    headers: {
      Accept: accept,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error("Échec du téléchargement.");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadGradeSheetPdf(
  type: "assessment" | "exam_schedule",
  id: string
): Promise<void> {
  await blobDownload(
    `/grade-sheets/${type}/${id}/pdf`,
    `fiche-de-note-${id}.pdf`,
    "application/pdf"
  );
}

export async function downloadGradeSheetExcel(
  type: "assessment" | "exam_schedule",
  id: string
): Promise<void> {
  await blobDownload(
    `/grade-sheets/${type}/${id}/excel`,
    `fiche-de-note-${id}.xlsx`,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}

export async function importGradeSheet(
  type: "assessment" | "exam_schedule",
  id: string,
  file: File
): Promise<ImportGradesResult> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(
    `/grade-sheets/${type}/${id}/import`,
    formData as unknown as Record<string, unknown>
  );
  return unwrapData<ImportGradesResult>(response);
}
