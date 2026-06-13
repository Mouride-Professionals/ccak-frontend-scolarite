"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, type Notification } from "@/lib/api/notifications";
import {
  notificationsKeys,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/hooks/use-notifications-polling";
import { toUserError } from "@/lib/error-handler";
import Toast from "@/components/ui/toast";

interface NotificationListInfiniteProps {
  unreadOnly?: boolean;
  onSelectNotification?: (notification: Notification) => void;
}

export default function NotificationListInfinite({
  unreadOnly = false,
  onSelectNotification,
}: NotificationListInfiniteProps) {
  const queryClient = useQueryClient();
  const [onlyUnread, setOnlyUnread] = useState(unreadOnly);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [...notificationsKeys.all, "infinite", onlyUnread],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      notificationsApi.getNotifications({
        page: pageParam,
        per_page: 20,
        is_read: onlyUnread ? false : undefined,
      }),
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    staleTime: 30000,
  });

  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages]
  );

  const handleOpen = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await markReadMutation.mutateAsync(notification.id);
      }
      onSelectNotification?.(notification);
    } catch (error) {
      setToast({
        isOpen: true,
        message: toUserError(error).message,
        type: "error",
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      setToast({
        isOpen: true,
        message: "Toutes les notifications ont été marquées comme lues.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    } catch (error) {
      setToast({
        isOpen: true,
        message: toUserError(error).message,
        type: "error",
      });
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#083B66]">Notifications</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyUnread((prev) => !prev)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              onlyUnread
                ? "border-[#083B66] bg-[#083B66]/10 text-[#083B66]"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {onlyUnread ? "Vue: non lues" : "Afficher non lues"}
          </button>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-[#083B66] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markAllReadMutation.isPending ? "Traitement..." : "Tout marquer lu"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500">
          Chargement des notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500">
          Aucune notification.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleOpen(notification)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  notification.is_read
                    ? "border-zinc-200 bg-white hover:bg-zinc-50"
                    : "border-[#0A8F3D]/30 bg-[#0A8F3D]/5 hover:bg-[#0A8F3D]/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#083B66]">{notification.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#E11D48]" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mt-4 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-[#083B66] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetchingNextPage ? "Chargement..." : "Charger plus"}
            </button>
          )}
        </>
      )}

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
