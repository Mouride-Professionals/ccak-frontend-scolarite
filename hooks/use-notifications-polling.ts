"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";

export const notificationsKeys = {
  all: ["notifications"] as const,
  polling: (userId?: string) => [...notificationsKeys.all, "polling", userId] as const,
};

export function useNotificationsPolling(userId?: string, enabled = true) {
  const { data, isLoading } = useQuery({
    queryKey: notificationsKeys.polling(userId),
    queryFn: () =>
      notificationsApi.getNotifications({
        page: 1,
        per_page: 10,
        is_read: false,
      }),
    enabled,
    refetchInterval: 30000,
    staleTime: 20000,
  });

  const notifications = Array.isArray(data?.data) ? data.data : [];
  const unreadCount =
    typeof data?.meta?.total === "number" ? data.meta.total : notifications.length;

  return {
    notifications,
    unreadCount,
    isLoading,
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}
