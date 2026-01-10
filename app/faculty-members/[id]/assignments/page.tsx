"use client";

import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import TeachingAssignmentsTable from "@/components/teaching-assignments/teaching-assignments-table";
import Pagination from "@/components/ui/pagination";
import type { TeachingAssignment } from "@/types/teaching-assignment";

export default function FacultyAssignmentsPage() {
  const params = useParams();
  const router = useRouter();
  const facultyId = params?.id as string;

  const assignments: TeachingAssignment[] = [];

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

          <TeachingAssignmentsTable assignments={assignments} />
          <Pagination
            page={1}
            totalPages={1}
            totalItems={assignments.length}
            perPage={10}
            itemLabel="affectations"
            onPageChange={() => {}}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
