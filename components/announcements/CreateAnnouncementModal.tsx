"use client";

import { useState, useEffect } from "react";
import type { CreateAnnouncementPayload, Announcement } from "@/lib/api/announcements";
import Portal from "@/components/ui/Portal";
import RichTextEditor from "@/components/shared/rich-text-editor";
import { sanitizeHtml } from "@/lib/sanitize";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAnnouncementPayload) => void;
  announcement?: Announcement | null;
  isLoading?: boolean;
}

const priorities = [
  { value: "low", label: "Basse", color: "text-gray-600" },
  { value: "medium", label: "Moyenne", color: "text-blue-600" },
  { value: "high", label: "Haute", color: "text-orange-600" },
  { value: "critical", label: "Critique", color: "text-red-600" },
] as const;

const roles = [
  { value: "STUDENT", label: "Étudiants" },
  { value: "FACULTY", label: "Enseignants" },
  { value: "ADMIN", label: "Administrateurs" },
  { value: "STAFF", label: "Personnel" },
] as const;

export default function CreateAnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  announcement,
  isLoading,
}: CreateAnnouncementModalProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<CreateAnnouncementPayload>({
    title: "",
    content: "",
    priority: "medium",
    target_audience: { roles: [] },
    is_draft: true,
  });

  useEffect(() => {
    if (announcement) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        target_audience: announcement.target_audience || { roles: [] },
        publish_at: announcement.publish_at || undefined,
        expire_at: announcement.expire_at || undefined,
        is_draft: announcement.is_draft,
      });
    } else if (!isOpen) {
      setFormData({
        title: "",
        content: "",
        priority: "medium",
        target_audience: { roles: [] },
        is_draft: true,
      });
    }

    if (!isOpen) {
      setShowPreview(false);
    }
  }, [announcement, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleRole = (role: string) => {
    const currentRoles = formData.target_audience?.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    setFormData({
      ...formData,
      target_audience: {
        ...formData.target_audience,
        roles: newRoles,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>

          <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
            <form onSubmit={handleSubmit}>
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {announcement ? "Modifier l'annonce" : "Créer une annonce"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {announcement
                      ? "Modifier les détails de l'annonce"
                      : "Créer une nouvelle annonce pour les utilisateurs"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-[#00365F]"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Contenu <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPreview((prev) => !prev)}
                        className="text-xs font-medium text-[#00365F] transition-colors hover:text-[#0A8F3D]"
                      >
                        {showPreview ? "Modifier" : "Prévisualiser"}
                      </button>
                    </div>

                    {!showPreview ? (
                      <RichTextEditor
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                        placeholder="Rédigez le contenu de l'annonce..."
                        minHeightClassName="min-h-[220px]"
                      />
                    ) : (
                      <div className="min-h-[220px] rounded-lg border border-zinc-300 bg-white p-3 text-sm">
                        {formData.content.trim().length === 0 ? (
                          <p className="text-zinc-500">Aucun contenu à prévisualiser.</p>
                        ) : (
                          <div
                            className="text-zinc-800"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(formData.content) }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priorité</label>
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: e.target.value as "low" | "medium" | "high" | "critical",
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-[#00365F]"
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      <select
                        value={formData.is_draft ? "draft" : "published"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_draft: e.target.value === "draft",
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-[#00365F]"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="published">Publiée</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Public cible (laisser vide pour tous)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map((role) => (
                        <label key={role.value} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.target_audience?.roles?.includes(role.value)}
                            onChange={() => toggleRole(role.value)}
                            className="rounded border-gray-300 text-[#00365F] focus:ring-[#00365F]"
                          />
                          <span className="ml-2 text-sm text-gray-700">{role.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date de publication
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.publish_at || ""}
                        onChange={(e) => setFormData({ ...formData, publish_at: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-[#00365F]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date d&apos;expiration
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.expire_at || ""}
                        onChange={(e) => setFormData({ ...formData, expire_at: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-[#00365F]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full justify-center rounded-md bg-[#00365F] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#00365F]/90 focus:outline-none focus:ring-2 focus:ring-[#00365F] focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto"
                >
                  {isLoading ? "Enregistrement..." : announcement ? "Modifier" : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00365F] focus:ring-offset-2 sm:mt-0 sm:w-auto"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
}
