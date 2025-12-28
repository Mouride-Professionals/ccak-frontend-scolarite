"use client";

import { useState, useEffect, useRef } from "react";

interface PdfViewerProps {
  url: string;
  documentId: string;
  documentNumber?: string;
  onDownload?: () => void;
  onClose?: () => void;
}

export default function PdfViewer({
  url,
  documentId,
  documentNumber,
  onDownload,
  onClose,
}: PdfViewerProps) {
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom levels
  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
  const currentZoomIndex = zoomLevels.findIndex((z) => z === scale) || 3;

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
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Fallback: download the PDF directly
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentNumber || documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Update iframe scale
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.style.transform = `scale(${scale})`;
      iframeRef.current.style.transformOrigin = "top left";
    }
  }, [scale]);

  return (
    <div className="flex h-full flex-col bg-zinc-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">
            {documentNumber || "Document PDF"}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Page Navigation */}
          <div className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-2 py-1">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span className="text-sm text-zinc-700 min-w-[80px] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2 py-1">
            <button
              onClick={handleZoomOut}
              disabled={currentZoomIndex === 0}
              className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
              title="Ajuster à la page"
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

          {/* Action Buttons */}
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
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-zinc-200 p-4"
        style={{ position: "relative" }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease",
          }}
          className="mx-auto"
        >
          <iframe
            ref={iframeRef}
            src={url}
            className="h-[100vh] w-full border-0 shadow-lg"
            title="PDF Viewer"
            style={{
              width: `${100 / scale}%`,
              height: `${100 / scale}%`,
            }}
            onLoad={() => {
              // Try to get total pages from iframe (if PDF.js is used)
              // For now, we'll use a default value
              // In production, you might want to use PDF.js to get actual page count
              setTotalPages(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}

