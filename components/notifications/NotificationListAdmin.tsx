"use client";

import type { Notification } from "@/lib/api/notifications";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface NotificationListProps {
  notifications: Notification[];
}

const typeLabels: Record<string, string> = {
  system: "Système",
  grade_published: "Note publiée",
  enrollment_confirmed: "Inscription confirmée",
  document_ready: "Document disponible",
  password_reset: "Mot de passe",
  welcome: "Bienvenue",
};

const typeColors: Record<string, string> = {
  system: "bg-gray-100 text-gray-800",
  grade_published: "bg-blue-100 text-blue-800",
  enrollment_confirmed: "bg-green-100 text-green-800",
  document_ready: "bg-purple-100 text-purple-800",
  password_reset: "bg-yellow-100 text-yellow-800",
  welcome: "bg-pink-100 text-pink-800",
};

export default function NotificationList({
  notifications,
}: NotificationListProps) {
  if (!notifications.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune notification
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Titre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Canaux
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notifications.map((notification) => (
            <tr key={notification.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    typeColors[notification.type] || typeColors.system
                  }`}
                >
                  {typeLabels[notification.type] || notification.type}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {notification.title}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {notification.message}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-1">
                  {notification.channel === "in_app" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      App
                    </span>
                  )}
                  {notification.channel === "email" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Email
                    </span>
                  )}
                  {notification.channel === "sms" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      SMS
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {notification.is_read ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Lue
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Non lue
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(
                  new Date(notification.created_at),
                  "dd MMM yyyy HH:mm",
                  { locale: fr }
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
