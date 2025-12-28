"use client";

import type { Announcement } from "@/lib/api/announcements";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AnnouncementCardProps {
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800 border-gray-200",
  medium: "bg-blue-100 text-blue-800 border-blue-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

const priorityLabels: Record<string, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  critical: "Critique",
};

export default function AnnouncementCard({
  announcement,
  onEdit,
  onDelete,
  onPublish,
}: AnnouncementCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {announcement.title}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                  priorityColors[announcement.priority]
                }`}
              >
                {priorityLabels[announcement.priority]}
              </span>
              {announcement.is_draft ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Brouillon
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  Publiée
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {announcement.content}
        </p>

        {/* Target Audience */}
        {announcement.target_audience?.roles &&
          announcement.target_audience.roles.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Public cible:</p>
              <div className="flex gap-1 flex-wrap">
                {announcement.target_audience.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Dates */}
        <div className="text-xs text-gray-500 space-y-1 mb-3">
          <div>
            Créée le{" "}
            {format(new Date(announcement.created_at), "dd MMM yyyy", {
              locale: fr,
            })}
          </div>
          {announcement.publish_at && (
            <div>
              Publication:{" "}
              {format(new Date(announcement.publish_at), "dd MMM yyyy HH:mm", {
                locale: fr,
              })}
            </div>
          )}
          {announcement.expire_at && (
            <div>
              Expiration:{" "}
              {format(new Date(announcement.expire_at), "dd MMM yyyy", {
                locale: fr,
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onEdit(announcement)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Modifier
          </button>

          {announcement.is_draft && (
            <button
              onClick={() => onPublish(announcement.id)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
            >
              <svg
                className="w-4 h-4"
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
              Publier
            </button>
          )}

          <button
            onClick={() => {
              if (confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
                onDelete(announcement.id);
              }
            }}
            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded hover:bg-red-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
