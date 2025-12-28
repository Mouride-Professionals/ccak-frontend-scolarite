"use client";

import type { EmailTemplate } from "@/lib/api/templates";

interface TemplateCardProps {
  template: EmailTemplate;
  onPreview: (template: EmailTemplate) => void;
}

export default function TemplateCard({
  template,
  onPreview,
}: TemplateCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {template.display_name}
            </h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
          <div className="ml-2">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Template Name */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Nom du template:</p>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-800">
            {template.name}
          </code>
        </div>

        {/* Path */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Chemin:</p>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-800 block truncate">
            {template.path}
          </code>
        </div>

        {/* Variables */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">
            Variables disponibles ({template.variables.length}):
          </p>
          <div className="flex gap-1 flex-wrap">
            {template.variables.map((variable) => (
              <span
                key={variable}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-blue-100 text-blue-800"
              >
                {variable}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onPreview(template)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#00365F] rounded hover:bg-[#00365F]/90"
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Aperçu
          </button>
          <a
            href={`https://github.com/yourrepo/blob/main/resources/views/${template.path.replace(/\./g, "/")}.blade.php`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Voir sur GitHub"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
