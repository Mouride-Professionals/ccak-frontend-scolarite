"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DocumentTable from "@/components/documents/document-table";
import Toast from "@/components/ui/toast";
import {
  useStudentDocuments,
  useDownloadDocument,
  useIssueDocument,
  useRevokeDocument,
} from "@/hooks/use-documents-generate";
import type { DocumentFilters } from "@/types/document";

export default function StudentDocumentsPage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const [filters, setFilters] = useState<DocumentFilters>({
    page: 1,
    limit: 10,
  });
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const { data: documents, isLoading, error } = useStudentDocuments(studentId, filters);
  const downloadMutation = useDownloadDocument();
  const issueMutation = useIssueDocument();
  const revokeMutation = useRevokeDocument();

  const handleDownload = async (documentId: string) => {
    try {
      await downloadMutation.mutateAsync(documentId);
      setToast({
        isOpen: true,
        message: "Téléchargement démarré",
        type: "success",
      });
    } catch (err) {
      console.error("Error downloading document:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors du téléchargement",
        type: "error",
      });
    }
  };

  const handleIssue = async (documentId: string) => {
    try {
      await issueMutation.mutateAsync(documentId);
      setToast({
        isOpen: true,
        message: "Document émis avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error issuing document:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de l'émission du document",
        type: "error",
      });
    }
  };

  const handleRevoke = async (documentId: string, reason?: string) => {
    try {
      await revokeMutation.mutateAsync({ documentId, reason });
      setToast({
        isOpen: true,
        message: "Document révoqué avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error revoking document:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la révocation du document",
        type: "error",
      });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Documents de l'étudiant">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#00365F]">Documents de l'étudiant</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Liste de tous les documents générés pour cet étudiant
              </p>
            </div>
          </div>

          {/* Documents Table */}
          {isLoading ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00365F] border-r-transparent"></div>
              <p className="mt-4 text-sm text-zinc-500">Chargement des documents...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-700">
                Erreur lors du chargement des documents. Veuillez réessayer.
              </p>
            </div>
          ) : (
            <DocumentTable
              documents={documents || []}
              onDownload={handleDownload}
              onIssue={handleIssue}
              onRevoke={handleRevoke}
              canIssue={true} // TODO: Check user permissions
              canRevoke={true} // TODO: Check user permissions
            />
          )}

          {/* Toast */}
          <Toast
            isOpen={toast.isOpen}
            onClose={() => setToast({ ...toast, isOpen: false })}
            message={toast.message}
            type={toast.type}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
