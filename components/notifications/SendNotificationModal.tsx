"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import type { SendNotificationPayload } from "@/lib/api/notifications";
import { templatesApi } from "@/lib/api/templates";
import Portal from "@/components/ui/Portal";
import { zodErrorToFieldErrors, type FieldErrors } from "@/lib/validations/zod-errors";

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (payload: SendNotificationPayload) => void;
  isLoading?: boolean;
}

const NOTIFICATION_TYPE_VALUES = [
  "system",
  "grade_published",
  "enrollment_confirmed",
  "document_ready",
  "password_reset",
  "welcome",
] as const;
const CHANNEL_VALUES = ["in_app", "email", "sms"] as const;

const notificationTypes = [
  { value: "system", label: "Système" },
  { value: "grade_published", label: "Note publiée" },
  { value: "enrollment_confirmed", label: "Inscription confirmée" },
  { value: "document_ready", label: "Document disponible" },
  { value: "password_reset", label: "Réinitialisation mot de passe" },
  { value: "welcome", label: "Bienvenue" },
];

const parseRecipientIds = (rawRecipientIds: string) =>
  rawRecipientIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

const SendNotificationFormSchema = z.object({
  recipient_ids: z
    .string()
    .trim()
    .min(1, "Ajoutez au moins un destinataire")
    .refine((value) => parseRecipientIds(value).length > 0, {
      message: "Ajoutez au moins un destinataire valide",
    }),
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(120, "Le titre ne peut pas dépasser 120 caractères"),
  message: z
    .string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
  type: z.enum(NOTIFICATION_TYPE_VALUES),
  channels: z.array(z.enum(CHANNEL_VALUES)).min(1, "Sélectionnez au moins un canal d'envoi"),
});

type SendNotificationFormData = z.infer<typeof SendNotificationFormSchema>;

export default function SendNotificationModal({
  isOpen,
  onClose,
  onSend,
  isLoading,
}: SendNotificationModalProps) {
  const [formData, setFormData] = useState<SendNotificationFormData>({
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
  const [errors, setErrors] = useState<FieldErrors>({});
  const canSubmit =
    formData.recipient_ids.trim().length > 0 &&
    formData.title.trim().length > 0 &&
    formData.message.trim().length > 0 &&
    formData.channels.length > 0;
  const getErrorId = (field: keyof SendNotificationFormData) => `${field}-error`;

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        recipient_ids: "",
        title: "",
        message: "",
        type: "system",
        channels: ["in_app"],
      });
      setErrors({});
    }
  }, [isOpen]);

  const updateField = <K extends keyof SendNotificationFormData>(
    field: K,
    value: SendNotificationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const fieldKey = String(field);
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = SendNotificationFormSchema.safeParse(formData);
    if (!parsed.success) {
      setErrors(zodErrorToFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    const recipientIds = parseRecipientIds(parsed.data.recipient_ids);

    onSend({
      recipient_ids: recipientIds,
      title: parsed.data.title,
      message: parsed.data.message,
      type: parsed.data.type,
      channels: parsed.data.channels,
    });
  };

  const toggleChannel = (channel: (typeof CHANNEL_VALUES)[number]) => {
    const nextChannels = formData.channels.includes(channel)
      ? formData.channels.filter((c) => c !== channel)
      : [...formData.channels, channel];
    updateField("channels", nextChannels);
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
                  <h3 className="text-lg font-semibold leading-6 text-zinc-900">
                    Envoyer une notification
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Créer et envoyer une notification aux utilisateurs
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Recipient IDs */}
                  <div>
                    <label
                      htmlFor="recipient_ids"
                      className="block text-sm font-medium text-zinc-800"
                    >
                      IDs des destinataires (séparés par des virgules)
                    </label>
                    <input
                      id="recipient_ids"
                      type="text"
                      value={formData.recipient_ids}
                      onChange={(e) => updateField("recipient_ids", e.target.value)}
                      className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                        errors.recipient_ids ? "border-red-300" : "border-zinc-300"
                      }`}
                      placeholder="1, 2, 3"
                      aria-invalid={Boolean(errors.recipient_ids)}
                      aria-describedby={
                        errors.recipient_ids ? getErrorId("recipient_ids") : undefined
                      }
                    />
                    {errors.recipient_ids && (
                      <p id={getErrorId("recipient_ids")} className="mt-1 text-xs text-red-600">
                        {errors.recipient_ids}
                      </p>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <label
                      htmlFor="notification_type"
                      className="block text-sm font-medium text-zinc-800"
                    >
                      Type de notification
                    </label>
                    <select
                      id="notification_type"
                      value={formData.type}
                      onChange={(e) =>
                        updateField(
                          "type",
                          e.target.value as (typeof NOTIFICATION_TYPE_VALUES)[number]
                        )
                      }
                      className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                        errors.type ? "border-red-300" : "border-zinc-300"
                      }`}
                      aria-invalid={Boolean(errors.type)}
                      aria-describedby={errors.type ? getErrorId("type") : undefined}
                    >
                      {notificationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p id={getErrorId("type")} className="mt-1 text-xs text-red-600">
                        {errors.type}
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label
                      htmlFor="notification_title"
                      className="block text-sm font-medium text-zinc-800"
                    >
                      Titre
                    </label>
                    <input
                      id="notification_title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                        errors.title ? "border-red-300" : "border-zinc-300"
                      }`}
                      aria-invalid={Boolean(errors.title)}
                      aria-describedby={errors.title ? getErrorId("title") : undefined}
                    />
                    {errors.title && (
                      <p id={getErrorId("title")} className="mt-1 text-xs text-red-600">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="notification_message"
                      className="block text-sm font-medium text-zinc-800"
                    >
                      Message
                    </label>
                    <textarea
                      id="notification_message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                        errors.message ? "border-red-300" : "border-zinc-300"
                      }`}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? getErrorId("message") : undefined}
                    />
                    {errors.message && (
                      <p id={getErrorId("message")} className="mt-1 text-xs text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Channels */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Canaux d&apos;envoi
                    </label>
                    <div className="space-y-2">
                      <label className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes("in_app")}
                          onChange={() => toggleChannel("in_app")}
                          className="rounded border-zinc-300 text-[#00365F] focus:ring-[#00365F]"
                        />
                        <span className="ml-2 text-sm text-zinc-700">In-App</span>
                      </label>
                      <label className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes("email")}
                          onChange={() => toggleChannel("email")}
                          className="rounded border-zinc-300 text-[#00365F] focus:ring-[#00365F]"
                        />
                        <span className="ml-2 text-sm text-zinc-700">Email</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes("sms")}
                          onChange={() => toggleChannel("sms")}
                          className="rounded border-zinc-300 text-[#00365F] focus:ring-[#00365F]"
                        />
                        <span className="ml-2 text-sm text-zinc-700">SMS</span>
                      </label>
                    </div>
                    {errors.channels && (
                      <p id={getErrorId("channels")} className="mt-1 text-xs text-red-600">
                        {errors.channels}
                      </p>
                    )}
                  </div>

                  {/* Template info */}
                  {formData.channels.includes("email") && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-700">
                        L&apos;email utilisera le template correspondant au type sélectionné
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

              <div className="bg-zinc-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  disabled={isLoading || !canSubmit}
                  className="inline-flex w-full justify-center rounded-md bg-[#00365F] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#00365F]/90 focus:outline-none focus:ring-2 focus:ring-[#00365F] focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto"
                >
                  {isLoading ? "Envoi..." : "Envoyer"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00365F] focus:ring-offset-2 sm:mt-0 sm:w-auto"
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
