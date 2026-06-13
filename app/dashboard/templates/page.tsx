"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { templatesApi, type EmailTemplate } from "@/lib/api/templates";
import TemplateCard from "@/components/templates/TemplateCard";
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";
import { toUserError } from "@/lib/error-handler";

export default function TemplatesPage() {
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const {
    data: templates,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["email-templates"],
    queryFn: () => templatesApi.getTemplates(),
  });

  return (
    <DashboardLayout title="Templates d'Emails">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Templates d&apos;Emails</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérer les templates d&apos;emails utilisés pour les notifications
          </p>
        </div>

        {/* Template Info */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Les templates sont des fichiers .blade.php situés dans le backend Laravel. Vous
                pouvez les modifier directement dans le répertoire{" "}
                <code className="font-mono bg-blue-100 px-1 rounded">
                  resources/views/emails/notifications/
                </code>
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {toUserError(error, "Erreur lors du chargement des templates.").message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Templates disponibles
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {templates?.length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Templates actifs</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {templates?.length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Variables totales
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {templates?.reduce((acc, t) => acc + t.variables.length, 0) || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Liste des templates
            </h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00365F]"></div>
              </div>
            ) : (templates?.length ?? 0) === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">Aucun template disponible.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates?.map((template) => (
                  <TemplateCard
                    key={template.name}
                    template={template}
                    onPreview={setPreviewTemplate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <TemplatePreviewModal
            template={previewTemplate}
            isOpen={!!previewTemplate}
            onClose={() => setPreviewTemplate(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
