"use client";

import { useMutation } from "@tanstack/react-query";
import * as ficheApi from "@/lib/api/fiche-de-note";
import type { GradeSheetContext } from "@/types/fiche-de-note";

export function useDownloadGradeSheetPdf(ctx: GradeSheetContext) {
  return useMutation({
    mutationFn: () => ficheApi.downloadGradeSheetPdf(ctx.type, ctx.id),
  });
}

export function useDownloadGradeSheetExcel(ctx: GradeSheetContext) {
  return useMutation({
    mutationFn: () => ficheApi.downloadGradeSheetExcel(ctx.type, ctx.id),
  });
}

export function useImportGradeSheet(ctx: GradeSheetContext) {
  return useMutation({
    mutationFn: (file: File) => ficheApi.importGradeSheet(ctx.type, ctx.id, file),
  });
}
