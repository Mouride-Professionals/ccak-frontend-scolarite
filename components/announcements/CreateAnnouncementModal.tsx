"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import type { CreateAnnouncementPayload, Announcement } from "@/lib/api/announcements";
import Portal from "@/components/ui/Portal";
import RichTextEditor from "@/components/shared/rich-text-editor";
import { sanitizeHtml } from "@/lib/sanitize";
import { zodErrorToFieldErrors, type FieldErrors } from "@/lib/validations/zod-errors";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAnnouncementPayload) => void;
  announcement?: Announcement | null;
  isLoading?: boolean;
}

const priorities = [
  { value: "low", label: "Basse", color: "text-zinc-700" },
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

const PRIORITY_VALUES = ["low", "medium", "high", "critical"] as const;
const ROLE_VALUES = ["STUDENT", "FACULTY", "ADMIN", "STAFF"] as const;
type AudienceRole = (typeof ROLE_VALUES)[number];

const isAudienceRole = (value: string): value is AudienceRole =>
  ROLE_VALUES.includes(value as AudienceRole);

const toOptionalTrimmedString = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const htmlToText = (content: string) =>
  content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const optionalDateTimeSchema = z.preprocess(
  toOptionalTrimmedString,
  z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Date invalide")
    .optional()
);

const AnnouncementFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Le titre doit contenir au moins 5 caractères")
      .max(160, "Le titre ne peut pas dépasser 160 caractères"),
    content: z
      .string()
      .trim()
      .min(1, "Le contenu est requis")
      .max(20000, "Le contenu est trop long"),
    priority: z.enum(PRIORITY_VALUES),
    target_audience: z
      .object({
        roles: z.array(z.enum(ROLE_VALUES)).optional(),
      })
      .optional(),
    publish_at: optionalDateTimeSchema,
    expire_at: optionalDateTimeSchema,
    is_draft: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (htmlToText(data.content).length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Le contenu doit contenir au moins 10 caractères lisibles",
      });
    }

    if (data.publish_at && data.expire_at) {
      const publishDate = new Date(data.publish_at);
      const expireDate = new Date(data.expire_at);
      if (expireDate <= publishDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expire_at"],
          message: "La date d'expiration doit être postérieure à la date de publication",
        });
      }
    }
  });

type AnnouncementFormData = z.infer<typeof AnnouncementFormSchema>;

export default function CreateAnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  announcement,
  isLoading,
}: CreateAnnouncementModalProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    content: "",
    priority: "medium",
    target_audience: { roles: [] },
    is_draft: true,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const canSubmit = formData.title.trim().length > 0 && htmlToText(formData.content).length > 0;
  const getErrorId = (field: keyof AnnouncementFormData) => `${field}-error`;

  const updateField = <K extends keyof AnnouncementFormData>(
    field: K,
    value: AnnouncementFormData[K]
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

  useEffect(() => {
    if (announcement) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        target_audience: {
          roles: (announcement.target_audience?.roles || []).filter(isAudienceRole),
        },
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
      setErrors({});
    }
  }, [announcement, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = AnnouncementFormSchema.safeParse(formData);
    if (!parsed.success) {
      setErrors(zodErrorToFieldErrors(parsed.error));
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  };

  const toggleRole = (role: (typeof ROLE_VALUES)[number]) => {
    const currentRoles = formData.target_audience?.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    updateField("target_audience", {
      ...formData.target_audience,
      roles: newRoles,
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
                  <h3 className="text-lg font-semibold leading-6 text-zinc-900">
                    {announcement ? "Modifier l'annonce" : "Créer une annonce"}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    {announcement
                      ? "Modifier les détails de l'annonce"
                      : "Créer une nouvelle annonce pour les utilisateurs"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="announcement_title"
                      className="block text-sm font-medium text-zinc-800"
                    >
                      Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="announcement_title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
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

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-zinc-800">
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
                        onChange={(value) => updateField("content", value)}
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
                    {errors.content && (
                      <p id={getErrorId("content")} className="mt-1 text-xs text-red-600">
                        {errors.content}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="announcement_priority"
                        className="block text-sm font-medium text-zinc-800"
                      >
                        Priorité
                      </label>
                      <select
                        id="announcement_priority"
                        value={formData.priority}
                        onChange={(e) =>
                          updateField(
                            "priority",
                            e.target.value as (typeof PRIORITY_VALUES)[number]
                          )
                        }
                        className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                          errors.priority ? "border-red-300" : "border-zinc-300"
                        }`}
                        aria-invalid={Boolean(errors.priority)}
                        aria-describedby={errors.priority ? getErrorId("priority") : undefined}
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                      {errors.priority && (
                        <p id={getErrorId("priority")} className="mt-1 text-xs text-red-600">
                          {errors.priority}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-800">Statut</label>
                      <select
                        value={formData.is_draft ? "draft" : "published"}
                        onChange={(e) => updateField("is_draft", e.target.value === "draft")}
                        className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="published">Publiée</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Public cible (laisser vide pour tous)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map((role) => (
                        <label key={role.value} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.target_audience?.roles?.includes(role.value)}
                            onChange={() => toggleRole(role.value)}
                            className="rounded border-zinc-300 text-[#00365F] focus:ring-[#00365F]"
                          />
                          <span className="ml-2 text-sm text-zinc-700">{role.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="announcement_publish_at"
                        className="block text-sm font-medium text-zinc-800"
                      >
                        Date de publication
                      </label>
                      <input
                        id="announcement_publish_at"
                        type="datetime-local"
                        value={formData.publish_at || ""}
                        onChange={(e) => updateField("publish_at", e.target.value)}
                        className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                          errors.publish_at ? "border-red-300" : "border-zinc-300"
                        }`}
                        aria-invalid={Boolean(errors.publish_at)}
                        aria-describedby={errors.publish_at ? getErrorId("publish_at") : undefined}
                      />
                      {errors.publish_at && (
                        <p id={getErrorId("publish_at")} className="mt-1 text-xs text-red-600">
                          {errors.publish_at}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="announcement_expire_at"
                        className="block text-sm font-medium text-zinc-800"
                      >
                        Date d&apos;expiration
                      </label>
                      <input
                        id="announcement_expire_at"
                        type="datetime-local"
                        value={formData.expire_at || ""}
                        onChange={(e) => updateField("expire_at", e.target.value)}
                        className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F] ${
                          errors.expire_at ? "border-red-300" : "border-zinc-300"
                        }`}
                        aria-invalid={Boolean(errors.expire_at)}
                        aria-describedby={errors.expire_at ? getErrorId("expire_at") : undefined}
                      />
                      {errors.expire_at && (
                        <p id={getErrorId("expire_at")} className="mt-1 text-xs text-red-600">
                          {errors.expire_at}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  disabled={isLoading || !canSubmit}
                  className="inline-flex w-full justify-center rounded-md bg-[#00365F] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#00365F]/90 focus:outline-none focus:ring-2 focus:ring-[#00365F] focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto"
                >
                  {isLoading ? "Enregistrement..." : announcement ? "Modifier" : "Créer"}
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
