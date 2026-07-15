"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAcademicPrograms, useAcademicYears } from "@/hooks/use-enrollments";
import {
  useCourseEnrollmentMatrix,
  useSaveCourseEnrollmentMatrix,
} from "@/hooks/use-course-enrollments";
import { useSelectedYear } from "@/hooks/use-selected-year";
import { RegistrationStatus } from "@/types/enrollment";
import type { CourseEnrollmentMatrixCell } from "@/types/course-enrollment";
import { toUserError } from "@/lib/error-handler";

const cellKey = (enrollmentId: string, courseId: string) => `${enrollmentId}|${courseId}`;

export default function CourseEnrollmentMatrixPage() {
  const { selectedYear } = useSelectedYear();
  const { data: years = [] } = useAcademicYears();
  const { data: programs = [] } = useAcademicPrograms();

  const [programId, setProgramId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [semester, setSemester] = useState(1);
  const [status, setStatus] = useState<string>(RegistrationStatus.VALIDATED);
  const [search, setSearch] = useState("");
  const [overridesState, setOverridesState] = useState<{
    scopeKey: string;
    values: Record<string, boolean>;
  }>({
    scopeKey: "",
    values: {},
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const effectiveAcademicYearId = academicYearId || selectedYear?.id || "";
  const effectiveProgramId = programId || programs[0]?.id || "";
  const scopeKey = `${effectiveProgramId}|${effectiveAcademicYearId}|${semester}|${status}|${search}`;
  const overrides = useMemo(
    () => (overridesState.scopeKey === scopeKey ? overridesState.values : {}),
    [overridesState.scopeKey, overridesState.values, scopeKey]
  );

  const matrixFilters = useMemo(
    () => ({
      academic_year_id: effectiveAcademicYearId,
      semester,
      status: status || undefined,
      search: search || undefined,
    }),
    [effectiveAcademicYearId, search, semester, status]
  );

  const matrixQuery = useCourseEnrollmentMatrix(
    effectiveProgramId,
    matrixFilters,
    Boolean(effectiveProgramId && effectiveAcademicYearId && semester)
  );
  const matrix = matrixQuery.data;
  const saveMutation = useSaveCourseEnrollmentMatrix(effectiveProgramId);

  const cellsByKey = useMemo(() => {
    const map = new Map<string, CourseEnrollmentMatrixCell>();
    for (const cell of matrix?.cells ?? []) {
      map.set(cellKey(cell.enrollment_id, cell.course_id), cell);
    }
    return map;
  }, [matrix?.cells]);

  const checkedFor = (enrollmentId: string, courseId: string) => {
    const key = cellKey(enrollmentId, courseId);
    return overrides[key] ?? Boolean(cellsByKey.get(key)?.checked);
  };

  const setCellChecked = (enrollmentId: string, courseId: string, checked: boolean) => {
    const key = cellKey(enrollmentId, courseId);
    const cell = cellsByKey.get(key);
    if (!cell || cell.locked || matrix?.is_read_only) return;

    setOverridesState((current) => {
      const currentValues = current.scopeKey === scopeKey ? current.values : {};
      const nextValues = { ...currentValues };
      if (cell.checked === checked) {
        delete nextValues[key];
      } else {
        nextValues[key] = checked;
      }
      return { scopeKey, values: nextValues };
    });
  };

  const setRowChecked = (enrollmentId: string, checked: boolean) => {
    for (const course of matrix?.courses ?? []) {
      setCellChecked(enrollmentId, course.id, checked);
    }
  };

  const setColumnChecked = (courseId: string, checked: boolean) => {
    for (const enrollment of matrix?.enrollments ?? []) {
      setCellChecked(enrollment.id, courseId, checked);
    }
  };

  const setAllChecked = (checked: boolean) => {
    for (const enrollment of matrix?.enrollments ?? []) {
      for (const course of matrix?.courses ?? []) {
        setCellChecked(enrollment.id, course.id, checked);
      }
    }
  };

  const changes = useMemo(() => {
    const creates: Array<{ enrollment_id: string; course_id: string }> = [];
    const drops: Array<{ course_enrollment_id: string }> = [];

    for (const [key, checked] of Object.entries(overrides)) {
      const cell = cellsByKey.get(key);
      if (!cell || cell.locked) continue;

      if (!cell.checked && checked) {
        creates.push({ enrollment_id: cell.enrollment_id, course_id: cell.course_id });
      }

      if (cell.checked && !checked && cell.course_enrollment_id) {
        drops.push({ course_enrollment_id: cell.course_enrollment_id });
      }
    }

    return { creates, drops };
  }, [cellsByKey, overrides]);

  const existingCheckedCount = useMemo(
    () => (matrix?.cells ?? []).filter((cell) => cell.checked).length,
    [matrix?.cells]
  );

  const changedCount = changes.creates.length + changes.drops.length;
  const isReadOnly = Boolean(matrix?.is_read_only);

  const handleSave = async () => {
    if (!matrix || changedCount === 0) {
      setConfirmOpen(false);
      return;
    }

    try {
      const result = await saveMutation.mutateAsync({
        academic_year_id: effectiveAcademicYearId,
        semester,
        enrollment_date: new Date().toISOString().split("T")[0],
        creates: changes.creates,
        drops: changes.drops,
      });

      setConfirmOpen(false);
      setOverridesState({ scopeKey, values: {} });
      setToast({
        isOpen: true,
        type: result.errors.length > 0 ? "warning" : "success",
        message: `${result.created + result.reactivated} ajoutée(s), ${result.dropped} retirée(s), ${result.skipped} ignorée(s).`,
      });
    } catch (error) {
      setToast({
        isOpen: true,
        type: "error",
        message: toUserError(error).message,
      });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Matrice des inscriptions aux cours">
        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_0.7fr_0.9fr_1fr]">
              <div>
                <label
                  htmlFor="academic_year_id"
                  className="mb-1 block text-xs font-medium text-zinc-600"
                >
                  Année académique
                </label>
                <select
                  id="academic_year_id"
                  value={effectiveAcademicYearId}
                  onChange={(event) => setAcademicYearId(event.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-[#00365F]"
                >
                  <option value="">Sélectionner</option>
                  {years.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="program_id"
                  className="mb-1 block text-xs font-medium text-zinc-600"
                >
                  Programme
                </label>
                <select
                  id="program_id"
                  value={effectiveProgramId}
                  onChange={(event) => setProgramId(event.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-[#00365F]"
                >
                  <option value="">Sélectionner</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="semester" className="mb-1 block text-xs font-medium text-zinc-600">
                  Semestre
                </label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(event) => setSemester(Number.parseInt(event.target.value, 10))}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-[#00365F]"
                >
                  {[1, 2, 3, 4, 5, 6].map((value) => (
                    <option key={value} value={value}>
                      Semestre {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="mb-1 block text-xs font-medium text-zinc-600">
                  Statut inscription
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-[#00365F]"
                >
                  <option value="">Tous</option>
                  <option value={RegistrationStatus.VALIDATED}>Validée</option>
                  <option value={RegistrationStatus.PENDING_VALIDATION}>En attente</option>
                  <option value={RegistrationStatus.SUSPENDED}>Suspendue</option>
                </select>
              </div>

              <div>
                <label htmlFor="search" className="mb-1 block text-xs font-medium text-zinc-600">
                  Recherche étudiant
                </label>
                <input
                  id="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nom ou matricule"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-zinc-600">
              {matrix ? (
                <>
                  {matrix.enrollments.length} étudiant(s), {matrix.courses.length} cours,{" "}
                  {existingCheckedCount} inscription(s) existante(s)
                </>
              ) : (
                "Sélectionnez une année, un programme et un semestre."
              )}
              {matrix?.read_only_reason && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">
                  {matrix.read_only_reason}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!matrix || isReadOnly}
                onClick={() => setAllChecked(true)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tout cocher
              </button>
              <button
                type="button"
                disabled={!matrix || isReadOnly}
                onClick={() => setAllChecked(false)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tout décocher
              </button>
              <button
                type="button"
                disabled={!matrix || changedCount === 0 || isReadOnly}
                onClick={() => setConfirmOpen(true)}
                className="rounded-md bg-[#008D36] px-4 py-2 text-sm font-medium text-white hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enregistrer ({changedCount})
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white">
            {matrixQuery.isLoading ? (
              <div className="flex min-h-[320px] items-center justify-center text-sm text-zinc-500">
                Chargement de la matrice...
              </div>
            ) : !matrix ? (
              <div className="p-10 text-center text-sm text-zinc-500">Aucun périmètre chargé.</div>
            ) : matrix.courses.length === 0 || matrix.enrollments.length === 0 ? (
              <div className="p-10 text-center text-sm text-zinc-500">
                Aucun étudiant ou cours trouvé pour ce programme et ce semestre.
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-auto">
                <Table className="min-w-full border-separate border-spacing-0">
                  <TableHeader className="sticky top-0 z-20 bg-[#00365F] text-white [&_tr]:border-0">
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableHead className="sticky left-0 z-30 h-auto min-w-64 border-r border-white/20 bg-[#00365F] px-3 py-3 text-left font-semibold text-white">
                        Étudiant
                      </TableHead>
                      {matrix.courses.map((course) => {
                        const columnCells = matrix.enrollments
                          .map((enrollment) => cellsByKey.get(cellKey(enrollment.id, course.id)))
                          .filter(Boolean) as CourseEnrollmentMatrixCell[];
                        const editableCells = columnCells.filter(
                          (cell) => !cell.locked && !isReadOnly
                        );
                        const allChecked =
                          editableCells.length > 0 &&
                          editableCells.every((cell) =>
                            checkedFor(cell.enrollment_id, cell.course_id)
                          );

                        return (
                          <TableHead
                            key={course.id}
                            className="h-auto min-w-44 border-r border-white/20 px-3 py-3 text-left align-bottom text-white"
                          >
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-xs font-medium">
                                <input
                                  type="checkbox"
                                  checked={allChecked}
                                  disabled={editableCells.length === 0}
                                  onChange={(event) =>
                                    setColumnChecked(course.id, event.target.checked)
                                  }
                                  className="h-4 w-4 rounded border-zinc-300"
                                />
                                <span className="truncate">{course.code}</span>
                              </label>
                              <div className="line-clamp-2 text-xs font-normal text-white/80">
                                {course.name}
                              </div>
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matrix.enrollments.map((enrollment) => {
                      const rowCells = matrix.courses
                        .map((course) => cellsByKey.get(cellKey(enrollment.id, course.id)))
                        .filter(Boolean) as CourseEnrollmentMatrixCell[];
                      const editableCells = rowCells.filter((cell) => !cell.locked && !isReadOnly);
                      const allChecked =
                        editableCells.length > 0 &&
                        editableCells.every((cell) =>
                          checkedFor(cell.enrollment_id, cell.course_id)
                        );

                      return (
                        <TableRow
                          key={enrollment.id}
                          className="border-0 odd:bg-white even:bg-zinc-50"
                        >
                          <TableHead className="sticky left-0 z-10 h-auto min-w-64 border-r border-t border-zinc-200 bg-inherit px-3 py-3 text-left font-normal">
                            <label className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={allChecked}
                                disabled={editableCells.length === 0}
                                onChange={(event) =>
                                  setRowChecked(enrollment.id, event.target.checked)
                                }
                                className="mt-1 h-4 w-4 rounded border-zinc-300"
                              />
                              <span>
                                <span className="block font-semibold text-zinc-900">
                                  {enrollment.student_name ?? "Étudiant"}
                                </span>
                                <span className="block text-xs font-normal text-zinc-500">
                                  {enrollment.student_number ?? "Sans matricule"}
                                </span>
                              </span>
                            </label>
                          </TableHead>
                          {matrix.courses.map((course) => {
                            const cell = cellsByKey.get(cellKey(enrollment.id, course.id));
                            const checked = checkedFor(enrollment.id, course.id);

                            return (
                              <TableCell
                                key={course.id}
                                className="border-r border-t border-zinc-200 px-3 py-3 text-center"
                              >
                                <label
                                  title={cell?.lock_reason ?? undefined}
                                  className="inline-flex items-center justify-center"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={!cell || cell.locked || isReadOnly}
                                    onChange={(event) =>
                                      setCellChecked(enrollment.id, course.id, event.target.checked)
                                    }
                                    className="h-5 w-5 rounded border-zinc-300 text-[#008D36]"
                                  />
                                </label>
                                {cell?.locked && (
                                  <div className="mt-1 text-[11px] text-amber-700">Verrouillé</div>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleSave}
          title="Enregistrer la matrice"
          message={`Créer/réactiver ${changes.creates.length} inscription(s) et retirer ${changes.drops.length} inscription(s) pour le semestre ${semester}.`}
          confirmText="Enregistrer"
          variant="info"
          isLoading={saveMutation.isPending}
        />

        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((current) => ({ ...current, isOpen: false }))}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
