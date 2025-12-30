"use client";

import type { GeneratedDocument } from "@/types/document";
import DocumentTypeBadge from "./document-type-badge";
import DocumentActions from "./document-actions";
import DateFormatter from "./date-formatter";

interface DocumentTableProps {
  documents: GeneratedDocument[];
  onDownload?: (documentId: string) => void;
  onPreview?: (documentId: string) => void;
  onIssue?: (documentId: string) => void;
  onRevoke?: (documentId: string, reason?: string) => void;
  canIssue?: boolean; // Admin only
  canRevoke?: boolean; // Admin only
  showStudent?: boolean; // Show student column when viewing all documents
}

export default function DocumentTable({
  documents,
  onDownload,
  onPreview,
  onIssue,
  onRevoke,
  canIssue = false,
  canRevoke = false,
  showStudent = false,
}: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
        <p className="text-sm text-zinc-500">Aucun document trouvé.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 bg-[#00365F]/10">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Numéro
              </th>
              {showStudent && (
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                  Étudiant
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Date de génération
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Date d&apos;émission
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {documents.map((document) => (
              <tr key={document.id} className="bg-white transition-colors hover:bg-zinc-50/50">
                <td className="px-6 py-5">
                  <DocumentTypeBadge type={document.type} />
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm font-mono font-medium text-zinc-900">
                    {document.document_number}
                  </div>
                </td>
                {showStudent && (
                  <td className="px-6 py-5 text-sm text-zinc-600">
                    <div>
                      <div className="font-medium text-zinc-900">
                        {document.student?.full_name || "N/A"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {document.student?.student_number || ""}
                      </div>
                    </div>
                  </td>
                )}
                <td className="px-6 py-5 text-sm text-zinc-600">
                  <DateFormatter date={document.generated_at} format="datetime" />
                </td>
                <td className="px-6 py-5 text-sm text-zinc-600">
                  {document.issued_at ? (
                    <DateFormatter date={document.issued_at} format="short" />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end">
                    <DocumentActions
                      document={document}
                      onDownload={onDownload}
                      onPreview={onPreview}
                      onIssue={onIssue}
                      onRevoke={onRevoke}
                      canIssue={canIssue}
                      canRevoke={canRevoke}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
