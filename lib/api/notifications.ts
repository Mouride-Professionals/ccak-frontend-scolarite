import { authFetch } from "./auth-fetch";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SendNotificationPayload {
  recipient_ids: string[];
  title: string;
  message: string;
  type: string;
  channels?: string[];
  metadata?: Record<string, any>;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export const notificationsApi = {
  // Get user notifications
  getNotifications: async (params?: {
    type?: string;
    is_read?: boolean;
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<NotificationListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append("type", params.type);
    if (params?.is_read !== undefined)
      queryParams.append("is_read", params.is_read.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page)
      queryParams.append("per_page", params.per_page.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `/notifications${queryParams.toString() ? `?${queryParams}` : ""}`;
    const response = await authFetch(url);
    return response.json();
  },

  // Send notification (admin only)
  sendNotification: async (
    payload: SendNotificationPayload
  ): Promise<{ message: string; count: number }> => {
    const response = await authFetch("/notifications", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Mark as read
  markAsRead: async (
    id: string
  ): Promise<{ message: string; notification: Notification }> => {
    const response = await authFetch(`/notifications/${id}/read`, {
      method: "PUT",
    });
    return response.json();
  },

  // Mark all as read
  markAllAsRead: async (): Promise<{ message: string; count: number }> => {
    const response = await authFetch("/notifications/read-all", {
      method: "POST",
    });
    return response.json();
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await authFetch("/notifications/unread-count");
    return response.json();
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<{ message: string }> => {
    const response = await authFetch(`/notifications/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },
};
