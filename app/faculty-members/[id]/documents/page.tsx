"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Toast from "@/components/ui/toast";
import {
  useFacultyDocuments,
  useCreateFacultyDocument,
} from "@/hooks/use-faculty-members-management";
import { FacultyDocumentStatus, FacultyDocumentType, type FacultyDocument } from "@/types/academic";

const statusStyles: Record<FacultyDocumentStatus, string> = {
  [FacultyDocumentStatus.PENDING]: "bg-amber-100 text-amber-800",
  [FacultyDocumentStatus.APPROVED]: "bg-green-100 text-green-800",
  [FacultyDocumentStatus.REJECTED]: "bg-red-100 text-red-800",
};

export default function FacultyDocumentsPage() {
  const params = useSafeParams<{ id: string }>();
  const router = useRouter();
  const facultyId = params?.id as string;
  const { data: documentsData = [], isLoading: loadingDocuments } = useFacultyDocuments(
    facultyId,
    !!facultyId
  );
  const createDocumentMutation = useCreateFacultyDocument();

  const [selectedType, setSelectedType] = useState<FacultyDocumentType>(FacultyDocumentType.CV);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const canUpload = useMemo(() => selectedFile !== null, [selectedFile]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setToast({
        isOpen: true,
        message: "Veuillez sélectionner un fichier.",
        type: "error",
      });
      return;
    }

    try {
      await createDocumentMutation.mutateAsync({
        facultyId,
        input: {
          type: selectedType,
          document: selectedFile,
        },
      });
      setSelectedFile(null);
      setToast({
        isOpen: true,
        message: "Document ajouté avec succès.",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading faculty document:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de l'ajout du document.",
        type: "error",
      });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Documents enseignant">
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => router.push(`/faculty-members/${facultyId}`)}
            className="text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
          >
            ← Retour au profil
          </button>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#00365F]">Documents enregistrés</h2>
              {loadingDocuments ? (
                <div className="mt-4 text-sm text-zinc-500">Chargement des documents...</div>
              ) : documentsData.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
                  Aucun document disponible.
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-[#00365F]/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Statut
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Date
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#00365F]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {documentsData.map((doc: FacultyDocument) => (
                        <tr key={doc.id}>
                          <td className="px-4 py-3 text-sm text-zinc-700">{doc.type}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[doc.status]}`}
                            >
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-600">
                            {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-zinc-500">
                            <button className="text-[#00365F] hover:text-[#008D36]">
                              Télécharger
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#00365F]">Ajouter un document</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Type</label>
                  <select
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value as FacultyDocumentType)}
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                  >
                    {Object.values(FacultyDocumentType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Fichier</label>
                  <input
                    type="file"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                    className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                  />
                  <p className="mt-2 text-xs text-zinc-500">Formats acceptés: PDF, DOC.</p>
                </div>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!canUpload || createDocumentMutation.isPending}
                  className="w-full rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#007A2E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createDocumentMutation.isPending ? "Téléchargement..." : "Télécharger"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isOpen: false })}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
