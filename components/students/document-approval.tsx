"use client";

import { useState } from "react";
import type { Document, DocumentStatus } from "@/types/student";

interface DocumentApprovalProps {
  document: Document;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes: string) => void;
  isLoading?: boolean;
}

export default function DocumentApproval({
  document,
  onApprove,
  onReject,
  isLoading = false,
}: DocumentApprovalProps) {
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    onApprove(document.id, notes.trim() || undefined);
    setShowApprovalForm(false);
    setNotes("");
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(document.id, rejectReason.trim());
      setShowRejectForm(false);
      setRejectReason("");
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case "APPROVED":
        return "Approuvé";
      case "REJECTED":
        return "Rejeté";
      case "PENDING":
      default:
        return "En attente";
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "CNI":
        return "Carte Nationale d'Identité";
      case "BIRTH_CERT":
        return "Certificat de Naissance";
      case "BAC_DIPLOMA":
        return "Diplôme du BAC";
      case "TRANSCRIPT":
        return "Relevé de Notes";
      case "PHOTO":
        return "Photo d'Identité";
      case "MEDICAL":
        return "Certificat Médical";
      default:
        return type;
    }
  };

  return (
    <div className="border border-zinc-200 rounded-lg p-4 bg-white">
      {/* Document Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-zinc-900">
            {getDocumentTypeLabel(document.type)}
          </h4>
          <p className="text-xs text-zinc-500 mt-1">
            Téléchargé le {new Date(document.uploaded_at).toLocaleDateString("fr-FR")}
          </p>
          {document.reviewed_at && (
            <p className="text-xs text-zinc-500">
              Révisé le {new Date(document.reviewed_at).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
            document.status
          )}`}
        >
          {getStatusLabel(document.status)}
        </span>
      </div>

      {/* Document Info */}
      <div className="mb-4">
        <p className="text-sm text-zinc-600">
          <span className="font-medium">Fichier:</span> {document.file_name}
        </p>
        {document.reviewer && (
          <p className="text-sm text-zinc-600">
            <span className="font-medium">Révisé par:</span> {document.reviewer.full_name}
          </p>
        )}
        {document.notes && (
          <div className="mt-2 p-3 bg-zinc-50 rounded-md">
            <p className="text-sm font-medium text-zinc-700 mb-1">Notes:</p>
            <p className="text-sm text-zinc-600">{document.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {document.status === "PENDING" && (
        <div className="flex items-center gap-2">
          {!showApprovalForm && !showRejectForm && (
            <>
              <button
                onClick={() => setShowApprovalForm(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Approuver
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Rejeter
              </button>
            </>
          )}

          {/* Approval Form */}
          {showApprovalForm && (
            <div className="w-full space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes optionnelles..."
                rows={3}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                disabled={isLoading}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Approbation..." : "Confirmer l'approbation"}
                </button>
                <button
                  onClick={() => {
                    setShowApprovalForm(false);
                    setNotes("");
                  }}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="w-full space-y-3">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Raison du rejet (obligatoire)..."
                rows={3}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                disabled={isLoading}
                required
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReject}
                  disabled={isLoading || !rejectReason.trim()}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Rejet..." : "Confirmer le rejet"}
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason("");
                  }}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Document Button */}
      <div className="mt-4">
        <button
          onClick={() => window.open(document.file_path, "_blank")}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#00365F] bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors"
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
          Voir le document
        </button>
      </div>
    </div>
  );
}
