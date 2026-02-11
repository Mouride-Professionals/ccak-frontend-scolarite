"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import { useVerifyDocument } from "@/hooks/use-documents-generate";
import DocumentTypeBadge from "@/components/documents/document-type-badge";
import DocumentStatusBadge from "@/components/documents/document-status-badge";

export default function VerifyDocumentPage() {
  const params = useSafeParams<{ documentNumber: string }>();
  const router = useRouter();
  const routeDocumentNumber = (params.documentNumber as string) || "";

  const [documentNumberInput, setDocumentNumberInput] = useState(routeDocumentNumber);
  const [submittedDocumentNumber, setSubmittedDocumentNumber] = useState(routeDocumentNumber);
  const [studentId, setStudentId] = useState<string>("");

  const { data: verification, isLoading, error } = useVerifyDocument(
    submittedDocumentNumber,
    studentId || undefined,
    !!submittedDocumentNumber
  );

  const handleVerify = () => {
    const normalized = documentNumberInput.trim();
    if (!normalized) return;
    setSubmittedDocumentNumber(normalized);
    router.replace(`/documents/verify/${encodeURIComponent(normalized)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00365F] to-[#005A8F] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Vérification de Document</h1>
          <p className="mt-2 text-white/80">Vérifiez l&apos;authenticité d&apos;un document UCAK</p>
        </div>

        <div className="rounded-lg bg-white shadow-xl">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-[#00365F]">Vérification publique</h2>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <label htmlFor="documentNumber" className="mb-2 block text-sm font-medium text-zinc-700">
                Numéro du document
              </label>
              <div className="flex gap-2">
                <input
                  id="documentNumber"
                  type="text"
                  value={documentNumberInput}
                  onChange={(e) => setDocumentNumberInput(e.target.value)}
                  placeholder="Ex: TRS-2026-ABCD-EF"
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  className="rounded-lg bg-[#00365F] px-4 py-2 text-sm font-medium text-white"
                >
                  Vérifier
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="studentId" className="mb-2 block text-sm font-medium text-zinc-700">
                ID Étudiant (optionnel)
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Entrez l'ID de l'étudiant"
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#00365F] focus:outline-none focus:ring-1 focus:ring-[#00365F]"
              />
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00365F] border-r-transparent"></div>
                <p className="ml-3 text-sm text-zinc-600">Vérification en cours...</p>
              </div>
            )}

            {error && !isLoading && submittedDocumentNumber && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                <h3 className="text-lg font-semibold text-red-900">Document invalide</h3>
                <p className="mt-2 text-sm text-red-700">Ce document n&apos;existe pas ou n&apos;est pas valide.</p>
              </div>
            )}

            {verification && verification.valid && verification.document && (
              <div className="space-y-6">
                <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
                  <h3 className="text-xl font-bold text-green-900">Document Valide</h3>
                  <p className="mt-2 text-sm text-green-700">{verification.message}</p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-[#00365F]">Informations du Document</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-zinc-500">Type</dt>
                      <dd className="mt-1">
                        <DocumentTypeBadge type={verification.document.type} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-zinc-500">Statut</dt>
                      <dd className="mt-1">
                        <DocumentStatusBadge status={verification.document.status} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-zinc-500">Numéro</dt>
                      <dd className="mt-1 font-mono text-sm font-medium text-zinc-900">
                        {verification.document.document_number}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-zinc-500">Date de génération</dt>
                      <dd className="mt-1 text-sm text-zinc-900">
                        {new Date(verification.document.generated_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </dd>
                    </div>
                    {verification.document.student && (
                      <div>
                        <dt className="text-sm font-medium text-zinc-500">Étudiant</dt>
                        <dd className="mt-1 text-sm text-zinc-900">
                          {verification.document.student.full_name || verification.document.student.email}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/80">Système de vérification de documents UCAK</p>
        </div>
      </div>
    </div>
  );
}
