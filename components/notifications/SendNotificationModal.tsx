"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SendNotificationPayload } from "@/lib/api/notifications";
import { templatesApi } from "@/lib/api/templates";
import Portal from "@/components/ui/Portal";

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (payload: SendNotificationPayload) => void;
  isLoading?: boolean;
}

const notificationTypes = [
  { value: "system", label: "Système" },
  { value: "grade_published", label: "Note publiée" },
  { value: "enrollment_confirmed", label: "Inscription confirmée" },
  { value: "document_ready", label: "Document disponible" },
  { value: "password_reset", label: "Réinitialisation mot de passe" },
  { value: "welcome", label: "Bienvenue" },
];

export default function SendNotificationModal({
  isOpen,
  onClose,
  onSend,
  isLoading,
}: SendNotificationModalProps) {
  const [formData, setFormData] = useState({
    recipient_ids: "",
    title: "",
    message: "",
    type: "system",
    channels: ["in_app"],
  });

  const { data: templates } = useQuery({
    queryKey: ["email-templates"],
    queryFn: () => templatesApi.getTemplates(),
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        recipient_ids: "",
        title: "",
        message: "",
        type: "system",
        channels: ["in_app"],
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipientIds = formData.recipient_ids
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    onSend({
      recipient_ids: recipientIds,
      title: formData.title,
      message: formData.message,
      type: formData.type,
      channels: formData.channels,
    });
  };

  const toggleChannel = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
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

          {/* Center the modal */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>

          <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
            <form onSubmit={handleSubmit}>
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Envoyer une notification
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Créer et envoyer une notification aux utilisateurs
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Recipient IDs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      IDs des destinataires (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.recipient_ids}
                      onChange={(e) => setFormData({ ...formData, recipient_ids: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-[#00365F]"
                      placeholder="1, 2, 3"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type de notification
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-[#00365F]"
                    >
                      {notificationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-[#00365F]"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-[#00365F]"
                    />
                  </div>

                  {/* Channels */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Canaux d'envoi
                    </label>
                    <div className="space-y-2">
                      <label className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes("in_app")}
                          onChange={() => toggleChannel("in_app")}
                          className="rounded border-gray-300 text-[#00365F] focus:ring-[#00365F]"
                        />
                        <span className="ml-2 text-sm text-gray-700">In-App</span>
                      </label>
                      <label className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes("email")}
                          onChange={() => toggleChannel("email")}
                          className="rounded border-gray-300 text-[#00365F] focus:ring-[#00365F]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Email</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes("sms")}
                          onChange={() => toggleChannel("sms")}
                          className="rounded border-gray-300 text-[#00365F] focus:ring-[#00365F]"
                        />
                        <span className="ml-2 text-sm text-gray-700">SMS</span>
                      </label>
                    </div>
                  </div>

                  {/* Template info */}
                  {formData.channels.includes("email") && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-700">
                        L'email utilisera le template correspondant au type sélectionné
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Template:{" "}
                        {templates?.find((t) => t.name === formData.type)?.display_name ||
                          "Notification générique"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full justify-center rounded-md bg-[#00365F] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#00365F]/90 focus:outline-none focus:ring-2 focus:ring-[#00365F] focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto"
                >
                  {isLoading ? "Envoi..." : "Envoyer"}
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
