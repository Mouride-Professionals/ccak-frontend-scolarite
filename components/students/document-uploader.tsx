"use client";

import { useState, useCallback, useRef } from "react";
import { DocumentType } from "@/types/student";

interface DocumentUploaderProps {
  studentId?: string;
  onUpload: (files: File[], type: DocumentType) => void;
  isLoading?: boolean;
  acceptedTypes?: string;
}

export default function DocumentUploader({
  studentId,
  onUpload,
  isLoading = false,
  acceptedTypes = ".pdf,.jpg,.jpeg,.png",
}: DocumentUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedType, setSelectedType] = useState<DocumentType>(DocumentType.CNI);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles, selectedType);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [selectedFiles, selectedType, onUpload]);

  const handleCancel = useCallback(() => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      {/* Document Type Selector */}
      <div>
        <label htmlFor="document-type" className="block text-sm font-medium text-zinc-900 mb-2">
          Type de document
        </label>
        <select
          id="document-type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as DocumentType)}
          className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
          disabled={isLoading}
        >
          <option value="CNI">Carte Nationale d'Identité (CNI)</option>
          <option value="BIRTH_CERT">Certificat de Naissance</option>
          <option value="BAC_DIPLOMA">Diplôme du BAC</option>
          <option value="TRANSCRIPT">Relevé de Notes</option>
          <option value="PHOTO">Photo d'Identité</option>
          <option value="MEDICAL">Certificat Médical</option>
          <option value="OTHER">Autre</option>
        </select>
      </div>

      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? "border-[#008D36] bg-[#008D36]/5"
            : "border-zinc-300 hover:border-zinc-400"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 text-zinc-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-900">
              Déposez vos fichiers ici ou{" "}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-[#008D36] hover:text-[#007A2E] font-medium"
                disabled={isLoading}
              >
                parcourez
              </button>
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Formats acceptés: PDF, JPG, PNG (max 10MB par fichier)
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-zinc-900">
            Fichiers sélectionnés ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-zinc-200 rounded flex items-center justify-center">
                    <svg className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{file.name}</p>
                    <p className="text-xs text-zinc-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                  className="text-zinc-400 hover:text-red-600 transition-colors"
                  disabled={isLoading}
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
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#008D36] border border-transparent rounded-lg hover:bg-[#007A2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Téléchargement..." : "Télécharger"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}