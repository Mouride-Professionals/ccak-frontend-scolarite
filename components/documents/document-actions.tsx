"use client";

import { useState } from "react";
import type { GeneratedDocument, DocumentStatus } from "@/types/document";
import DocumentStatusBadge from "./document-status-badge";
import ConfirmDialog from "@/components/ui/confirm-dialog";

interface DocumentActionsProps {
  document: GeneratedDocument;
  onDownload?: (documentId: string) => void;
  onPreview?: (documentId: string) => void;
  onIssue?: (documentId: string) => void;
  onRevoke?: (documentId: string, reason?: string) => void;
  canIssue?: boolean; // Admin only
  canRevoke?: boolean; // Admin only
}

export default function DocumentActions({
  document,
  onDownload,
  onPreview,
  onIssue,
  onRevoke,
  canIssue = false,
  canRevoke = false,
}: DocumentActionsProps) {
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");

  const handleRevoke = () => {
    if (onRevoke) {
      onRevoke(document.id, revokeReason || undefined);
      setShowRevokeDialog(false);
      setRevokeReason("");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Status Badge */}
        <DocumentStatusBadge status={document.status} />

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Preview (only if ISSUED) */}
          {document.status === "ISSUED" && onPreview && (
            <button
              onClick={() => onPreview(document.id)}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#00365F]"
              title="Prévisualiser"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          )}

          {/* Download (only if ISSUED) */}
          {document.status === "ISSUED" && onDownload && (
            <button
              onClick={() => onDownload(document.id)}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#00365F]"
              title="Télécharger"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          )}

          {/* Issue (only if DRAFT and admin) */}
          {document.status === "DRAFT" && canIssue && onIssue && (
            <button
              onClick={() => onIssue(document.id)}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-green-50 hover:text-green-600"
              title="Émettre"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          )}

          {/* Revoke (only if ISSUED and admin) */}
          {document.status === "ISSUED" && canRevoke && onRevoke && (
            <button
              onClick={() => setShowRevokeDialog(true)}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Révoquer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          )}

          {/* Verify (public link) */}
          <a
            href={`/documents/verify/${document.document_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#00365F]"
            title="Vérifier"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Revoke Confirmation Dialog - Custom implementation */}
      {showRevokeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowRevokeDialog(false);
              setRevokeReason("");
            }}
          />
          <div className="relative w-full max-w-md rounded-lg border border-zinc-200 bg-white shadow-xl">
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">Révoquer le document</h3>
              <p className="mb-4 text-sm text-zinc-600">
                Êtes-vous sûr de vouloir révoquer ce document ? Cette action est irréversible.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Raison de la révocation (optionnel)
                </label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
                  rows={3}
                  placeholder="Ex: Document perdu, erreur dans les informations..."
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRevokeDialog(false);
                    setRevokeReason("");
                  }}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRevoke}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Révoquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
