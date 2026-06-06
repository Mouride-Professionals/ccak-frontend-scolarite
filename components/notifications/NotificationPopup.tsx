"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Toast from "@/components/ui/toast";
import NotificationDetailModal from "@/components/notifications/notification-detail-modal";
import {
  useMarkNotificationRead,
  useNotificationsPolling,
} from "@/hooks/use-notifications-polling";
import type { Notification } from "@/lib/api/notifications";
import { toUserError } from "@/lib/error-handler";

const popupId = "notification-popup";

export default function NotificationPopup() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, isLoading } = useNotificationsPolling(
    session?.user?.id,
    true
  );
  const markReadMutation = useMarkNotificationRead();

  const topNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleOpenNotification = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await markReadMutation.mutateAsync(notification.id);
      }
      setSelectedNotification(notification);
    } catch (error) {
      setToast({
        isOpen: true,
        message: toUserError(error).message,
        type: "error",
      });
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={popupId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-[#00365F] transition-colors hover:bg-zinc-100"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E11D48] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer les notifications"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          />
          <div
            id={popupId}
            className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:mt-2 sm:w-96 sm:p-0"
          >
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl sm:rounded-lg">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-[#083B66]">Notifications</h3>
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-medium text-[#083B66] hover:text-[#0A8F3D]"
                >
                  Voir tout
                </Link>
              </div>

              <div className="max-h-[28rem] overflow-y-auto p-2">
                {isLoading ? (
                  <div className="px-3 py-6 text-center text-sm text-zinc-500">Chargement...</div>
                ) : topNotifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-zinc-500">
                    Aucune nouvelle notification.
                  </div>
                ) : (
                  topNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleOpenNotification(notification)}
                      className={`mb-2 w-full rounded-lg border p-3 text-left transition-colors ${
                        notification.is_read
                          ? "border-zinc-200 bg-white hover:bg-zinc-50"
                          : "border-[#0A8F3D]/30 bg-[#0A8F3D]/5 hover:bg-[#0A8F3D]/10"
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#083B66]">{notification.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-600">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-[11px] text-zinc-500">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
      />
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
