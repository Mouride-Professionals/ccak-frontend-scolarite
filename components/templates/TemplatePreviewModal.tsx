"use client";

import { useState } from "react";
import type { EmailTemplate } from "@/lib/api/templates";
import Portal from "@/components/ui/Portal";

interface TemplatePreviewModalProps {
  template: EmailTemplate;
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
}: TemplatePreviewModalProps) {
  const [sampleData, setSampleData] = useState<Record<string, string>>({});

  const generateSampleData = () => {
    const data: Record<string, string> = {};
    template.variables.forEach((variable) => {
      if (variable.includes("name")) {
        data[variable] = "Yacine Gueye";
      } else if (variable.includes("url")) {
        data[variable] = "https://example.com";
      } else if (variable.includes("score")) {
        data[variable] = "85/100";
      } else if (variable.includes("subject")) {
        data[variable] = "Mathématiques";
      } else if (variable.includes("course")) {
        data[variable] = "Licence Informatique";
      } else if (variable.includes("document")) {
        data[variable] = "Certificat de scolarité";
      } else {
        data[variable] = `Exemple ${variable}`;
      }
    });
    setSampleData(data);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Center the modal */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>

          <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Aperçu du template: {template.display_name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                </div>
                <button onClick={onClose} className="rounded-md text-gray-400 hover:text-gray-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Template Info */}
              <div className="mb-4 space-y-2 rounded-md bg-gray-50 p-4">
                <div>
                  <span className="text-xs font-medium text-gray-500">Nom: </span>
                  <code className="text-xs text-gray-800">{template.name}</code>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Chemin: </span>
                  <code className="text-xs text-gray-800">{template.path}</code>
                </div>
              </div>

              {/* Sample Data Generator */}
              <div className="mb-4">
                <button
                  onClick={generateSampleData}
                  className="inline-flex items-center gap-2 rounded-md bg-[#00365F] px-4 py-2 text-sm font-medium text-white hover:bg-[#00365F]/90"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Générer des données d'exemple
                </button>
              </div>

              {/* Variables */}
              {template.variables.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-900">Variables disponibles:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {template.variables.map((variable) => (
                      <div key={variable} className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-800">
                          {variable}
                        </code>
                        {sampleData[variable] && (
                          <span className="text-xs text-gray-500">= "{sampleData[variable]}"</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Area */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium text-gray-900">Aperçu de l'email:</h4>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                  <div className="rounded-md bg-white p-6 shadow-sm">
                    <div className="mb-4 rounded-t-md bg-gradient-to-r from-[#667eea] to-[#764ba2] p-6 text-center">
                      <img src="/logo.svg" alt="UCAK" className="mx-auto h-16" />
                    </div>
                    <div className="p-6">
                      <h2 className="mb-4 text-xl font-semibold">
                        {sampleData["title"] || template.display_name}
                      </h2>
                      <p className="mb-2">Bonjour {sampleData["user.name"] || "Utilisateur"},</p>
                      <p className="mb-4 text-gray-700">
                        {sampleData["message"] ||
                          "Ceci est un exemple de message pour ce template."}
                      </p>
                      {template.name === "grade_published" && (
                        <div className="mb-4">
                          <p>
                            Votre note pour {sampleData["grade.subject"] || "Mathématiques"} a été
                            publiée.
                          </p>
                          <p className="mt-2 text-lg font-semibold">
                            Note: {sampleData["grade.score"] || "85/100"}
                          </p>
                        </div>
                      )}
                      {template.name === "enrollment_confirmed" && (
                        <div className="mb-4">
                          <p>
                            Votre inscription à{" "}
                            {sampleData["course.name"] || "Licence Informatique"} a été confirmée.
                          </p>
                        </div>
                      )}
                      <a
                        href="#"
                        className="inline-block rounded-md bg-[#667eea] px-6 py-3 text-white no-underline"
                      >
                        Voir les détails
                      </a>
                    </div>
                    <div className="bg-gray-50 p-4 text-center text-xs text-gray-600">
                      <p>&copy; 2025 UCAK. Tous droits réservés.</p>
                      <p>
                        <a href="#" className="text-[#667eea]">
                          Visiter notre site
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Info */}
              <div className="rounded-md bg-blue-50 p-4">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Pour modifier ce template, éditez le fichier{" "}
                  <code className="rounded bg-blue-100 px-1 font-mono">
                    resources/views/{template.path.replace(/\./g, "/")}.blade.php
                  </code>{" "}
                  dans le backend Laravel.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                onClick={onClose}
                className="inline-flex w-full justify-center rounded-md bg-[#00365F] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#00365F]/90 sm:ml-3 sm:w-auto"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
