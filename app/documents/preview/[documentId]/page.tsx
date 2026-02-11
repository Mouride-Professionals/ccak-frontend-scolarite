"use client";

import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import { useEffect, useState } from "react";
import PdfViewer from "@/components/documents/pdf-viewer";
import * as documentsApi from "@/lib/api/documents-genarate";

export default function DocumentPreviewPage() {
  const params = useSafeParams<{ documentId: string }>();
  const router = useRouter();
  const documentId = params.documentId as string;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentNumber, setDocumentNumber] = useState<string>("N/A");

  useEffect(() => {
    let isMounted = true;
    let currentPdfUrl: string | null = null;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const blob = await documentsApi.downloadDocument(documentId);
        const url = URL.createObjectURL(blob);
        currentPdfUrl = url;

        if (isMounted) {
          setPdfUrl(url);
          setDocumentNumber(documentId);
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
        if (isMounted) {
          setError("Échec du chargement du document PDF");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (documentId) {
      void loadPdf();
    }

    return () => {
      isMounted = false;
      if (currentPdfUrl) {
        URL.revokeObjectURL(currentPdfUrl);
      }
    };
  }, [documentId]);

  const handleClose = () => {
    router.back();
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `document-${documentNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#008D36] border-r-transparent"></div>
            <p className="text-zinc-600">Chargement du document...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md text-center">
            <svg className="mx-auto mb-4 h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mb-2 text-xl font-semibold text-zinc-900">Erreur</h2>
            <p className="text-zinc-600">{error}</p>
            <button
              onClick={handleClose}
              className="mt-4 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
            >
              Retour
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && pdfUrl && (
        <PdfViewer
          url={pdfUrl}
          documentId={documentId}
          documentNumber={documentNumber}
          onClose={handleClose}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
