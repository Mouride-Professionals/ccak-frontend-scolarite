"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  announcementsApi,
  type CreateAnnouncementPayload,
  type Announcement,
} from "@/lib/api/announcements";
import CreateAnnouncementModal from "@/components/announcements/CreateAnnouncementModal";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";

interface AnnouncementFilters {
  priority?: string;
  is_draft?: boolean;
  page?: number;
  per_page?: number;
  search?: string;
}

export default function AnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<AnnouncementFilters>({
    page: 1,
    per_page: 15,
  });
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin-announcements", filters],
    queryFn: () => announcementsApi.getAnnouncements(filters),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAnnouncementPayload) =>
      announcementsApi.createAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setIsModalOpen(false);
      setEditingAnnouncement(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateAnnouncementPayload> }) =>
      announcementsApi.updateAnnouncement(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setIsModalOpen(false);
      setEditingAnnouncement(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.publishAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
  });

  const handleCreate = (payload: CreateAnnouncementPayload) => {
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleNewClick = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleFilterChange = (key: keyof AnnouncementFilters, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({ page: 1, per_page: 15 });
  };

  const publishedCount =
    announcements?.data?.filter((a) => !a.is_draft).length || 0;
  const draftCount =
    announcements?.data?.filter((a) => a.is_draft).length || 0;

  return (
    <DashboardLayout title="Gestion des Annonces">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Annonces</h1>
            <p className="mt-1 text-sm text-gray-500">
              Créer et gérer les annonces pour les utilisateurs
            </p>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher une annonce..."
                className="block w-80 rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                showFilters
                  ? "border-[#00365F] bg-[#00365F]/10 text-[#00365F]"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtres
              {(filters.priority || filters.is_draft !== undefined) && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00365F] text-xs font-semibold text-white">
                  {[filters.priority, filters.is_draft !== undefined].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={handleNewClick}
            className="flex items-center gap-2 rounded-lg bg-[#00365F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00365F]/90"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouvelle annonce
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 animate-in slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#00365F]">Filtres avancés</h3>
              <button
                onClick={handleClearFilters}
                className="text-sm text-zinc-500 hover:text-[#00365F] transition-colors"
              >
                Réinitialiser tout
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Priority Filter */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Priorité
                </label>
                <select
                  id="priority"
                  value={filters.priority ?? ""}
                  onChange={(e) => handleFilterChange("priority", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
                >
                  <option value="">Toutes les priorités</option>
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="critical">Critique</option>
                </select>
              </div>

              {/* Draft Status Filter */}
              <div>
                <label
                  htmlFor="is_draft"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Statut de publication
                </label>
                <select
                  id="is_draft"
                  value={filters.is_draft === undefined ? "" : filters.is_draft.toString()}
                  onChange={(e) => handleFilterChange("is_draft", e.target.value === "true")}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
                >
                  <option value="">Toutes</option>
                  <option value="true">Brouillons</option>
                  <option value="false">Publiées</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {announcements?.meta?.total || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-400"
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
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Publiées</dt>
                    <dd className="text-lg font-semibold text-gray-900">{publishedCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Brouillons</dt>
                    <dd className="text-lg font-semibold text-gray-900">{draftCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Critiques</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {announcements?.data?.filter((a) => a.priority === "critical").length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Grid */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Liste des annonces</h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00365F]"></div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {announcements?.data?.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onEdit={handleEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onPublish={(id) => publishMutation.mutate(id)}
                  />
                ))}
                {announcements?.data?.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Aucune annonce pour le moment
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {announcements && announcements.meta.total > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4 rounded-lg">
            <p className="text-sm text-zinc-500">
              Affichage de {((announcements.meta.current_page - 1) * announcements.meta.per_page) + 1} à {Math.min(announcements.meta.current_page * announcements.meta.per_page, announcements.meta.total)} sur {announcements.meta.total} annonces
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
                disabled={announcements.meta.current_page === 1}
                className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Précédent
              </button>
              <button className="rounded-lg bg-[#00365F] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                {announcements.meta.current_page}
              </button>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                disabled={announcements.meta.current_page >= announcements.meta.last_page}
                className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Announcement Modal */}
        <CreateAnnouncementModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAnnouncement(null);
          }}
          onSubmit={handleCreate}
          announcement={editingAnnouncement}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
