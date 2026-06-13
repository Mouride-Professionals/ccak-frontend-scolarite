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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-[#00365F]/10">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Numéro
              </th>
              {showStudent && (
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 lg:table-cell">
                  Étudiant
                </th>
              )}
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 md:table-cell">
                Date de génération
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4 xl:table-cell">
                Date d&apos;émission
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F] sm:px-6 sm:py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {documents.map((document, index) => (
              <tr
                key={`${document.id ?? document.document_number ?? "document"}-${index}`}
                className="bg-white transition-colors hover:bg-zinc-50/50"
              >
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <DocumentTypeBadge type={document.type} />
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="text-sm font-mono font-medium text-zinc-900">
                    {document.document_number}
                  </div>
                  {showStudent && (
                    <div className="mt-1 text-xs text-zinc-500 lg:hidden">
                      {document.student?.full_name || "N/A"}
                    </div>
                  )}
                </td>
                {showStudent && (
                  <td className="hidden px-4 py-4 text-sm text-zinc-600 sm:px-6 sm:py-5 lg:table-cell">
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
                <td className="hidden px-4 py-4 text-sm text-zinc-600 sm:px-6 sm:py-5 md:table-cell">
                  <DateFormatter date={document.generated_at} format="datetime" />
                </td>
                <td className="hidden px-4 py-4 text-sm text-zinc-600 sm:px-6 sm:py-5 xl:table-cell">
                  {document.issued_at ? (
                    <DateFormatter date={document.issued_at} format="short" />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5">
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
