import { authFetch } from "./auth-fetch";

export interface Announcement {
  id: string;
  creator_id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "critical";
  target_audience: {
    roles?: string[];
    classes?: number[];
    user_ids?: string[];
  } | null;
  publish_at: string | null;
  expire_at: string | null;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  priority?: "low" | "medium" | "high" | "critical";
  target_audience?: {
    roles?: string[];
    classes?: number[];
    user_ids?: string[];
  };
  publish_at?: string;
  expire_at?: string;
  is_draft?: boolean;
}

export interface AnnouncementListResponse {
  data: Announcement[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export const announcementsApi = {
  // Get announcements
  getAnnouncements: async (params?: {
    priority?: string;
    is_draft?: boolean;
    dismissed?: boolean;
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<AnnouncementListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.priority) queryParams.append("priority", params.priority);
    if (params?.is_draft !== undefined)
      queryParams.append("is_draft", params.is_draft.toString());
    if (params?.dismissed !== undefined)
      queryParams.append("dismissed", params.dismissed.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page)
      queryParams.append("per_page", params.per_page.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `/announcements${queryParams.toString() ? `?${queryParams}` : ""}`;
    const response = await authFetch(url);
    return response.json();
  },

  // Get single announcement
  getAnnouncement: async (id: string): Promise<{ data: Announcement }> => {
    const response = await authFetch(`/announcements/${id}`);
    return response.json();
  },

  // Create announcement (admin only)
  createAnnouncement: async (
    payload: CreateAnnouncementPayload
  ): Promise<{ data: Announcement }> => {
    const response = await authFetch("/announcements", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Update announcement (admin only)
  updateAnnouncement: async (
    id: string,
    payload: Partial<CreateAnnouncementPayload>
  ): Promise<{ data: Announcement }> => {
    const response = await authFetch(`/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Delete announcement (admin only)
  deleteAnnouncement: async (id: string): Promise<{ message: string }> => {
    const response = await authFetch(`/announcements/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Dismiss announcement
  dismissAnnouncement: async (id: string): Promise<{ message: string }> => {
    const response = await authFetch(`/announcements/${id}/dismiss`, {
      method: "POST",
    });
    return response.json();
  },

  // Publish announcement (admin only)
  publishAnnouncement: async (id: string): Promise<{ data: Announcement }> => {
    const response = await authFetch(`/announcements/${id}/publish`, {
      method: "POST",
    });
    return response.json();
  },
};
