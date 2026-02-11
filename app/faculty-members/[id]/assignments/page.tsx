"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import TeachingAssignmentsTable from "@/components/teaching-assignments/teaching-assignments-table";
import Pagination from "@/components/ui/pagination";
import {
  useDeleteTeachingAssignment,
  useTeachingAssignments,
} from "@/hooks/use-teaching-assignments";

export default function FacultyAssignmentsPage() {
  const params = useSafeParams<{ id: string }>();
  const router = useRouter();
  const facultyId = params?.id as string;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading } = useTeachingAssignments({
    page,
    limit,
    faculty_member_id: facultyId,
  });
  const deleteMutation = useDeleteTeachingAssignment();
  const assignments = data?.data ?? [];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Affectations enseignant">
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => router.push(`/faculty-members/${facultyId}`)}
            className="text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
          >
            ← Retour au profil
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#00365F]">Affectations en cours</h2>
              <p className="text-sm text-zinc-500">Liste des cours assignés à cet enseignant.</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/teaching-assignments/new")}
              className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
            >
              Ajouter une affectation
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
              Chargement des affectations...
            </div>
          ) : (
            <TeachingAssignmentsTable
              assignments={assignments}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          )}
          <Pagination
            page={data?.page ?? 1}
            totalPages={data?.total_pages ?? 1}
            totalItems={data?.total ?? assignments.length}
            perPage={data?.limit ?? limit}
            itemLabel="affectations"
            onPageChange={(nextPage) => setPage(nextPage)}
            onPerPageChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
