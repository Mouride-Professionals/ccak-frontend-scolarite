"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { notificationsApi, type SendNotificationPayload } from "@/lib/api/notifications";
import SendNotificationModal from "@/components/notifications/SendNotificationModal";
import NotificationList from "@/components/notifications/NotificationListAdmin";

interface NotificationFilters {
  type?: string;
  is_read?: boolean;
  page?: number;
  per_page?: number;
  search?: string;
}

export default function NotificationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    per_page: 15,
  });
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["admin-notifications", filters],
    queryFn: () => notificationsApi.getNotifications(filters),
  });

  const sendMutation = useMutation({
    mutationFn: (payload: SendNotificationPayload) => notificationsApi.sendNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setIsModalOpen(false);
    },
  });

  const handleFilterChange = (key: keyof NotificationFilters, value: string | boolean) => {
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

  return (
    <DashboardLayout title="Gestion des Notifications">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
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
                placeholder="Rechercher une notification..."
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
              {(filters.type || filters.is_read !== undefined) && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00365F] text-xs font-semibold text-white">
                  {[filters.type, filters.is_read !== undefined].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
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
            Nouvelle notification
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
              {/* Type Filter */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Type de notification
                </label>
                <select
                  id="type"
                  value={filters.type ?? ""}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
                >
                  <option value="">Tous les types</option>
                  <option value="system">Système</option>
                  <option value="grade_published">Note publiée</option>
                  <option value="enrollment_confirmed">Inscription confirmée</option>
                  <option value="document_ready">Document prêt</option>
                  <option value="welcome">Bienvenue</option>
                  <option value="password_reset">Réinitialisation mot de passe</option>
                </select>
              </div>

              {/* Read Status Filter */}
              <div>
                <label
                  htmlFor="is_read"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Statut de lecture
                </label>
                <select
                  id="is_read"
                  value={filters.is_read === undefined ? "" : filters.is_read.toString()}
                  onChange={(e) => handleFilterChange("is_read", e.target.value === "true")}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
                >
                  <option value="">Tous</option>
                  <option value="false">Non lues</option>
                  <option value="true">Lues</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
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
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total envoyées</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {notifications?.meta?.total || 0}
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Lues</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {notifications?.data?.filter((n) => n.is_read).length || 0}
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
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Non lues</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {notifications?.data?.filter((n) => !n.is_read).length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Historique des notifications
            </h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00365F]"></div>
              </div>
            ) : (
              <NotificationList notifications={notifications?.data || []} />
            )}
          </div>
        </div>

        {/* Pagination */}
        {notifications && notifications.meta.total > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4 rounded-lg">
            <p className="text-sm text-zinc-500">
              Affichage de {((notifications.meta.current_page - 1) * notifications.meta.per_page) + 1} à {Math.min(notifications.meta.current_page * notifications.meta.per_page, notifications.meta.total)} sur {notifications.meta.total} notifications
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
                disabled={notifications.meta.current_page === 1}
                className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Précédent
              </button>
              <button className="rounded-lg bg-[#00365F] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                {notifications.meta.current_page}
              </button>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                disabled={notifications.meta.current_page >= notifications.meta.last_page}
                className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Send Notification Modal */}
        <SendNotificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSend={(payload) => sendMutation.mutate(payload)}
          isLoading={sendMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
