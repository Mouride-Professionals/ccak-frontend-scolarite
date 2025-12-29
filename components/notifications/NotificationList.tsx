"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notificationsApi, type Notification } from "@/lib/api/notifications";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationsApi.getNotifications({
          per_page: 5,
          is_read: false, // Only unread notifications
        });
        setNotifications(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Impossible de charger les notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100 w-80">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100 w-80">
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100 w-80">
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Aucune notification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100 w-80">
      {notifications.map((notif, index) => (
        <div
          key={notif.id}
          className={`py-3 ${index !== notifications.length - 1 ? "border-b border-gray-100" : ""}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {notif.title}
                </h3>
                {!notif.is_read && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {notif.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {format(new Date(notif.created_at), "dd/MM/yy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
            <button
              onClick={() => handleMarkAsRead(notif.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              title="Marquer comme lu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      <div className="mt-4 text-center">
        <Link
          href="/dashboard/notifications"
          className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
        >
          Voir plus
        </Link>
      </div>
    </div>
  );
};

export default NotificationList;
