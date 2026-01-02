"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import FacultyMembersTable from "@/components/faculty-members/faculty-members-table";
import ListHeader from "@/components/ui/list-header";
import Pagination from "@/components/ui/pagination";
import { useDepartments } from "@/hooks/use-departments";
import { useFacultyMembersList } from "@/hooks/use-faculty-members-management";
import { FacultyContractType, FacultyRank } from "@/types/academic";
import type { FacultyMemberFilters } from "@/types/academic";

const rankOptions = [
  { value: FacultyRank.PROFESSEUR, label: "Professeur" },
  { value: FacultyRank.MAITRE_CONF, label: "Maître Conf." },
  { value: FacultyRank.MAITRE_ASS, label: "Maître Ass." },
  { value: FacultyRank.ASSISTANT, label: "Assistant" },
  { value: FacultyRank.VACATAIRE, label: "Vacataire" },
];

const contractOptions = [
  { value: FacultyContractType.PERMANENT, label: "Permanent" },
  { value: FacultyContractType.TEMPORARY, label: "Temporaire" },
  { value: FacultyContractType.VACATAIRE, label: "Vacataire" },
];

export default function FacultyMembersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FacultyMemberFilters>({
    page: 1,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useFacultyMembersList({
    ...filters,
    search: searchQuery || undefined,
    is_active: statusFilter === "" ? undefined : statusFilter === "true",
  });
  const { data: departmentsData } = useDepartments({ page: 1, limit: 50 });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }));
  };

  const handleFilterChange = (key: keyof FacultyMemberFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setFilters({ page: 1, limit: filters.limit ?? 10 });
  };

  const handleExport = () => {
    // Placeholder: wire export when API is available.
    console.info("Export faculty members", filters);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Enseignants">
        <ListHeader
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          searchPlaceholder="Rechercher par nom ou matricule..."
          onToggleFilters={() => setShowFilters(!showFilters)}
          isFiltersOpen={showFilters}
          filtersCount={[
            filters.department_id,
            filters.rank,
            filters.contract_type,
            statusFilter !== "" ? "status" : "",
          ].filter(Boolean).length}
          rightSlot={
            <>
              <button
                type="button"
                onClick={handleExport}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 sm:w-auto"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2"
                  />
                </svg>
                Exporter
              </button>
              <button
                type="button"
                onClick={() => router.push("/faculty-members/new")}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E] sm:w-auto"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nouvel enseignant
              </button>
            </>
          }
        />

        {showFilters && (
          <div className="mb-6 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#00365F]">Filtres avancés</h3>
              <button
                onClick={handleClearFilters}
                className="text-sm text-zinc-500 transition-colors hover:text-[#008D36]"
              >
                Réinitialiser tout
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="department" className="mb-2 block text-sm font-medium text-zinc-700">
                  Département
                </label>
                <select
                  id="department"
                  value={filters.department_id ?? ""}
                  onChange={(event) => handleFilterChange("department_id", event.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les départements</option>
                  {departmentsData?.data?.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rank" className="mb-2 block text-sm font-medium text-zinc-700">
                  Rang
                </label>
                <select
                  id="rank"
                  value={filters.rank ?? ""}
                  onChange={(event) => handleFilterChange("rank", event.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les rangs</option>
                  {rankOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="contract" className="mb-2 block text-sm font-medium text-zinc-700">
                  Contrat
                </label>
                <select
                  id="contract"
                  value={filters.contract_type ?? ""}
                  onChange={(event) => handleFilterChange("contract_type", event.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les contrats</option>
                  {contractOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-zinc-700">
                  Statut
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous</option>
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-zinc-200 bg-white">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]" />
              <p className="mt-3 text-sm text-zinc-500">Chargement des enseignants...</p>
            </div>
          </div>
        ) : (
          <>
            <FacultyMembersTable
              facultyMembers={data?.data ?? []}
              onEdit={(id) => router.push(`/faculty-members/${id}/edit`)}
            />
            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.total_pages ?? 1}
              totalItems={data?.total ?? 0}
              perPage={data?.limit ?? filters.limit ?? 10}
              itemLabel="enseignants"
              onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
              onPerPageChange={(nextLimit) =>
                setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }))
              }
            />
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
