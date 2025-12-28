"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PdfViewer from "@/components/documents/pdf-viewer";
import * as documentsApi from "@/lib/api/documents";

export default function DocumentPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;
  
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentNumber, setDocumentNumber] = useState<string>("N/A");

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the PDF blob from the API
        const blob = await documentsApi.downloadDocument(documentId);
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        
        // Set document number from document ID (you can enhance this if needed)
        setDocumentNumber(documentId);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Échec du chargement du document PDF");
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      loadPdf();
    }

    // Cleanup: revoke the object URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId, pdfUrl]);

  const handleClose = () => {
    router.back();
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;

    try {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `document-${documentNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading PDF:", err);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined" && pdfUrl) {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">
              {documentNumber}
            </h1>
            <p className="text-sm text-zinc-600">
              Document PDF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Télécharger
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Imprimer
          </button>
        </div>
      </div>

      {/* PDF Viewer Content */}
      <div className="flex-1 overflow-hidden bg-zinc-100">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-[#008D36] border-r-transparent mb-4"></div>
              <p className="text-zinc-600">Chargement du document...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                Erreur
              </h2>
              <p className="text-zinc-600">{error}</p>
              <button
                onClick={handleClose}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#008D36] rounded-lg hover:bg-[#007A2E] transition-colors"
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
            onDownload={handleDownload}
          />
        )}
      </div>
    </div>
  );
}

