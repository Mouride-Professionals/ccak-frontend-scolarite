"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface PdfViewerProps {
  url: string;
  documentId: string;
  documentNumber?: string;
  onDownload?: () => void;
  onClose?: () => void;
}

const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

export default function PdfViewer({
  url,
  documentId,
  documentNumber,
  onDownload,
  onClose,
}: PdfViewerProps) {
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [totalPages, setTotalPages] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentZoomIndex = zoomLevels.findIndex((z) => z === scale) || 0;

  useEffect(() => {
    let cancelled = false;

    const loadPdfMeta = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.296/pdf.worker.min.mjs";

        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;

        if (!cancelled) {
          setTotalPages(pdf.numPages || 1);
          setCurrentPage(1);
          setPageInput("1");
        }

        await pdf.destroy();
      } catch {
        if (!cancelled) {
          setTotalPages(1);
          setCurrentPage(1);
          setPageInput("1");
        }
      }
    };

    void loadPdfMeta();
    return () => {
      cancelled = true;
    };
  }, [url]);

  const viewerUrl = useMemo(
    () => `${url}#page=${currentPage}&zoom=${Math.round(scale * 100)}`,
    [currentPage, scale, url]
  );

  const handleZoomIn = () => {
    const nextIndex = Math.min(currentZoomIndex + 1, zoomLevels.length - 1);
    setScale(zoomLevels[nextIndex]);
  };

  const handleZoomOut = () => {
    const prevIndex = Math.max(currentZoomIndex - 1, 0);
    setScale(zoomLevels[prevIndex]);
  };

  const handleZoomFit = () => {
    setScale(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const next = currentPage - 1;
      setCurrentPage(next);
      setPageInput(String(next));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      setPageInput(String(next));
    }
  };

  const handlePageSubmit = () => {
    const parsed = Number(pageInput);
    if (!Number.isFinite(parsed)) return;
    const nextPage = Math.min(Math.max(1, Math.floor(parsed)), totalPages);
    setCurrentPage(nextPage);
    setPageInput(String(nextPage));
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = `${documentNumber || documentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full flex-col bg-zinc-50">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">
            {documentNumber || "Document PDF"}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-2 py-1">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              title="Page précédente"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <input
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
              onBlur={handlePageSubmit}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handlePageSubmit();
                }
              }}
              className="w-10 rounded border border-zinc-200 px-1 py-0.5 text-center text-sm"
            />
            <span className="text-sm text-zinc-700">/ {totalPages}</span>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              title="Page suivante"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2 py-1">
            <button
              onClick={handleZoomOut}
              disabled={currentZoomIndex === 0}
              className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              title="Zoom arrière"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>
            <select
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="border-0 bg-transparent text-sm text-zinc-700 focus:outline-none"
            >
              {zoomLevels.map((level) => (
                <option key={level} value={level}>
                  {Math.round(level * 100)}%
                </option>
              ))}
            </select>
            <button
              onClick={handleZoomIn}
              disabled={currentZoomIndex === zoomLevels.length - 1}
              className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              title="Zoom avant"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
            </button>
            <button
              onClick={handleZoomFit}
              className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-100"
              title="Ajuster à 100%"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
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
              Télécharger
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              title="Imprimer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Imprimer
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                title="Fermer"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-zinc-200 p-4" style={{ position: "relative" }}>
        <iframe
          ref={iframeRef}
          src={viewerUrl}
          className="h-[100vh] w-full border-0 shadow-lg"
          title="PDF Viewer"
        />
      </div>
    </div>
  );
}
