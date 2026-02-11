"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Portal from "@/components/ui/Portal";
import type { Notification } from "@/lib/api/notifications";

interface NotificationDetailModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
}: NotificationDetailModalProps) {
  if (!isOpen || !notification) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center">
        <div className="w-full max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
          <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-[#083B66]">{notification.title}</h3>
              <p className="mt-1 text-xs text-zinc-500">
                {format(new Date(notification.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-3 px-5 py-4">
            <div className="text-sm text-zinc-600">Type: {notification.type}</div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-800">
              {notification.message}
            </p>
          </div>
          <div className="border-t border-zinc-200 px-5 py-3 text-right">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#083B66] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0A8F3D]"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
