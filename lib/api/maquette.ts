import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
import type { MaquetteFilters, MaquetteResponse } from "@/types/maquette";

export async function getMaquette(filters?: MaquetteFilters): Promise<MaquetteResponse> {
  const params = new URLSearchParams();
  if (filters?.program_id) params.append("filter[program_id]", filters.program_id);
  const response = await api.get(`/maquette${params.toString() ? `?${params}` : ""}`);
  return unwrapData<MaquetteResponse>(response);
}

export interface ImportMaquetteParams {
  program_id: string;
  dry_run?: boolean;
}

export interface ImportMaquetteResult {
  dry_run: boolean;
  program_id: string | null;
  programs_found: number;
  units_created: number;
  units_skipped: number;
  courses_created: number;
  courses_skipped: number;
  warnings: string[];
  errors: string[];
}

export async function importMaquette(
  file: File,
  params: ImportMaquetteParams
): Promise<ImportMaquetteResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("program_id", params.program_id);
  if (params.dry_run != null) form.append("dry_run", params.dry_run ? "1" : "0");

  const response = await api.post("/maquette/import", form as unknown as Record<string, unknown>);
  return unwrapData<ImportMaquetteResult>(response);
}

export async function downloadTemplate(): Promise<void> {
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  const token = session?.accessToken;

  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  const res = await fetch(`${base}/maquette/template`, {
    headers: {
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error("Échec du téléchargement du modèle.");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modele-maquette-lmd.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}
