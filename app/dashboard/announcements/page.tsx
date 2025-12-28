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

export default function AnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: () => announcementsApi.getAnnouncements({ per_page: 50 }),
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
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateAnnouncementPayload>;
    }) => announcementsApi.updateAnnouncement(id, payload),
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

  const publishedCount =
    announcements?.data?.filter((a) => !a.is_draft).length || 0;
  const draftCount =
    announcements?.data?.filter((a) => a.is_draft).length || 0;

  return (
    <DashboardLayout title="Gestion des Annonces">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des Annonces
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Créer et gérer les annonces pour les utilisateurs
            </p>
          </div>
          <button
            onClick={handleNewClick}
            className="inline-flex items-center gap-2 rounded-lg bg-[#00365F] px-4 py-2 text-sm font-medium text-white hover:bg-[#00365F]/90 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total
                    </dt>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Publiées
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {publishedCount}
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
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Brouillons
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {draftCount}
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
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Critiques
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {announcements?.data?.filter((a) => a.priority === "critical")
                        .length || 0}
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
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Liste des annonces
            </h3>
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
