"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DocumentTable from "@/components/documents/document-table";
import GenerateDocumentForm from "@/components/documents/generate-document-form";
import Modal from "@/components/ui/modal";
import Toast from "@/components/ui/toast";
import {
  useStudentDocuments,
  useAllDocuments,
  useDownloadDocument,
  useIssueDocument,
  useRevokeDocument,
  useGenerateTranscript,
  useGenerateCertificate,
  useGenerateIdCard,
  useGenerateDiploma,
  useGenerateAttestation,
} from "@/hooks/use-documents";
import type { 
  DocumentFilters, 
  DocumentType, 
  DocumentStatus,
  GenerateTranscriptInput,
  GenerateCertificateInput,
  GenerateIdCardInput,
  GenerateDiplomaInput,
  GenerateAttestationInput,
} from "@/types/document";
import { DocumentType as DocType, DocumentStatus as DocStatus } from "@/types/document";

export default function DocumentsPage() {
  const router = useRouter();
  // View mode: "all" for admin (all documents) or "student" for specific student
  const [viewMode, setViewMode] = useState<"all" | "student">("all");
  // For testing with mock data, use one of: "student-1", "student-2", "student-3"
  // TODO: Get from auth context or URL params when student module is available
  const [studentId, setStudentId] = useState<string>(""); // Empty = all documents
  const [filters, setFilters] = useState<DocumentFilters & { student_id?: string }>({
    page: 1,
    limit: 10,
  });
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isBulkGenerateModalOpen, setIsBulkGenerateModalOpen] = useState(false);
  const [generateType, setGenerateType] = useState<DocumentType | null>(null);
  const [generateStudentId, setGenerateStudentId] = useState<string>("");
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Use appropriate query based on view mode
  const studentDocumentsQuery = useStudentDocuments(studentId, filters);
  const allDocumentsQuery = useAllDocuments(filters);
  
  const { data: documents, isLoading, error } = viewMode === "all" ? allDocumentsQuery : studentDocumentsQuery;
  const downloadMutation = useDownloadDocument();
  const issueMutation = useIssueDocument();
  const revokeMutation = useRevokeDocument();
  const generateTranscriptMutation = useGenerateTranscript();
  const generateCertificateMutation = useGenerateCertificate();
  const generateIdCardMutation = useGenerateIdCard();
  const generateDiplomaMutation = useGenerateDiploma();
  const generateAttestationMutation = useGenerateAttestation();

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

  const handlePreview = (documentId: string) => {
    // Navigate to the dedicated preview page
    router.push(`/documents/preview/${documentId}`);
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

  const handleFilterChange = (key: keyof (DocumentFilters & { student_id?: string }), value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page when filter changes
    }));
    
    // Update studentId when filtering by student
    if (key === "student_id") {
      setStudentId(value as string || "");
      setViewMode(value ? "student" : "all");
    }
  };

  const handleGenerateClick = (type: DocumentType) => {
    setGenerateType(type);
    setGenerateStudentId(studentId || "");
    setIsGenerateModalOpen(true);
  };

  const handleGenerateSubmit = async (data: Record<string, unknown>) => {
    if (!generateType) return;

    try {
      switch (generateType) {
        case DocType.TRANSCRIPT:
          await generateTranscriptMutation.mutateAsync(data as unknown as GenerateTranscriptInput);
          break;
        case DocType.CERTIFICATE:
          await generateCertificateMutation.mutateAsync(data as unknown as GenerateCertificateInput);
          break;
        case DocType.ID_CARD:
          await generateIdCardMutation.mutateAsync(data as unknown as GenerateIdCardInput);
          break;
        case DocType.DIPLOMA:
          await generateDiplomaMutation.mutateAsync(data as unknown as GenerateDiplomaInput);
          break;
        case DocType.ATTESTATION:
          await generateAttestationMutation.mutateAsync(data as unknown as GenerateAttestationInput);
          break;
        default:
          return;
      }
      setIsGenerateModalOpen(false);
      setGenerateType(null);
      setToast({
        isOpen: true,
        message: "Document généré avec succès",
        type: "success",
      });
    } catch (err) {
      console.error("Error generating document:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la génération du document",
        type: "error",
      });
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels = {
      [DocType.TRANSCRIPT]: "Relevé de notes",
      [DocType.CERTIFICATE]: "Certificat",
      [DocType.ID_CARD]: "Carte étudiante",
      [DocType.DIPLOMA]: "Diplôme",
      [DocType.ATTESTATION]: "Attestation",
    };
    return labels[type];
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Documents">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#00365F]">Documents</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Gérez les documents académiques des étudiants
              </p>
            </div>
            {studentId && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateClick(DocType.TRANSCRIPT)}
                  className="flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Générer un document
                </button>
              </div>
            )}
          
          </div>

          {/* Filters */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Student Filter */}
              <div>
                <label
                  htmlFor="student"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Étudiant
                </label>
                <select
                  id="student"
                  value={filters.student_id ?? ""}
                  onChange={(e) => handleFilterChange("student_id", e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les étudiants</option>
                  <option value="student-1">Amadou Diallo (STU-2024-001)</option>
                  <option value="student-2">Fatou Ndiaye (STU-2024-002)</option>
                  <option value="student-3">Ibrahima Sarr (STU-2024-003)</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Type
                </label>
                <select
                  id="type"
                  value={filters.type ?? ""}
                  onChange={(e) => handleFilterChange("type", e.target.value as DocumentType)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les types</option>
                  <option value={DocType.TRANSCRIPT}>Relevé de notes</option>
                  <option value={DocType.CERTIFICATE}>Certificat</option>
                  <option value={DocType.ID_CARD}>Carte étudiante</option>
                  <option value={DocType.DIPLOMA}>Diplôme</option>
                  <option value={DocType.ATTESTATION}>Attestation</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Statut
                </label>
                <select
                  id="status"
                  value={filters.status ?? ""}
                  onChange={(e) => handleFilterChange("status", e.target.value as DocumentStatus)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les statuts</option>
                  <option value={DocStatus.DRAFT}>Brouillon</option>
                  <option value={DocStatus.ISSUED}>Émis</option>
                  <option value={DocStatus.REVOKED}>Révoqué</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Recherche
                </label>
                <input
                  id="search"
                  type="text"
                  value={filters.search ?? ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Numéro de document..."
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                />
              </div>
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
              onPreview={handlePreview}
              onIssue={handleIssue}
              onRevoke={handleRevoke}
              canIssue={true} // TODO: Check user permissions
              canRevoke={true} // TODO: Check user permissions
              showStudent={viewMode === "all"}
            />
          )}

          {/* Generate Document Modal */}
          {generateType && (
            <Modal
              isOpen={isGenerateModalOpen}
              onClose={() => {
                setIsGenerateModalOpen(false);
                setGenerateType(null);
              }}
              title={`Générer un ${getDocumentTypeLabel(generateType)}`}
              subtitle="Remplissez les informations nécessaires pour générer le document"
              size="md"
            >
              <GenerateDocumentForm
                type={generateType}
                studentId={generateStudentId}
                onSubmit={handleGenerateSubmit}
                onCancel={() => {
                  setIsGenerateModalOpen(false);
                  setGenerateType(null);
                }}
                isLoading={
                  generateTranscriptMutation.isPending ||
                  generateCertificateMutation.isPending ||
                  generateIdCardMutation.isPending ||
                  generateDiplomaMutation.isPending ||
                  generateAttestationMutation.isPending
                }
              />
            </Modal>
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

