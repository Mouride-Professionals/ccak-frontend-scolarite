"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useVerifyDocument } from "@/hooks/use-documents-generate";
import DocumentTypeBadge from "@/components/documents/document-type-badge";
import DocumentStatusBadge from "@/components/documents/document-status-badge";

export default function VerifyDocumentPage() {
  const params = useParams();
  const documentNumber = params.documentNumber as string;
  const [studentId, setStudentId] = useState<string>("");

  const {
    data: verification,
    isLoading,
    error,
  } = useVerifyDocument(documentNumber, studentId || undefined, !!documentNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00365F] to-[#005A8F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <svg
              className="h-8 w-8 text-white"
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
          </div>
          <h1 className="text-3xl font-bold text-white">Vérification de Document</h1>
          <p className="mt-2 text-white/80">Vérifiez l'authenticité d'un document UCAK</p>
        </div>

        {/* Verification Card */}
        <div className="rounded-lg bg-white shadow-xl">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-[#00365F]">
              Numéro de document : {documentNumber}
            </h2>
          </div>

          <div className="p-6">
            {/* Optional Student ID Input */}
            <div className="mb-6">
              <label htmlFor="studentId" className="block text-sm font-medium text-zinc-700 mb-2">
                ID Étudiant (optionnel - pour vérification renforcée)
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

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00365F] border-r-transparent"></div>
                <p className="ml-3 text-sm text-zinc-600">Vérification en cours...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-900">Document invalide</h3>
                <p className="mt-2 text-sm text-red-700">
                  Ce document n'existe pas ou n'est pas valide.
                </p>
              </div>
            )}

            {/* Success State */}
            {verification && verification.valid && verification.document && (
              <div className="space-y-6">
                {/* Valid Badge */}
                <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-8 w-8 text-green-600"
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
                  </div>
                  <h3 className="text-xl font-bold text-green-900">Document Valide</h3>
                  <p className="mt-2 text-sm text-green-700">{verification.message}</p>
                </div>

                {/* Document Details */}
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-[#00365F]">
                    Informations du Document
                  </h3>
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
                    {verification.document.issued_at && (
                      <div>
                        <dt className="text-sm font-medium text-zinc-500">Date d'émission</dt>
                        <dd className="mt-1 text-sm text-zinc-900">
                          {new Date(verification.document.issued_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </dd>
                      </div>
                    )}
                    {verification.document.student && (
                      <div>
                        <dt className="text-sm font-medium text-zinc-500">Étudiant</dt>
                        <dd className="mt-1 text-sm text-zinc-900">
                          {verification.document.student.full_name ||
                            verification.document.student.email}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Security Notice */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 text-amber-600 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-900">Note de sécurité</p>
                      <p className="mt-1 text-xs text-amber-700">
                        Cette vérification confirme l'authenticité du document dans notre système.
                        Pour une vérification complète, contactez directement l'administration UCAK.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/80">Système de vérification de documents UCAK</p>
          <a
            href="/"
            className="mt-2 inline-block text-sm text-white underline hover:text-white/80"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
