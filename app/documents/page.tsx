"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DocumentTable from "@/components/documents/document-table";
import GenerateDocumentForm from "@/components/documents/generate-document-form";
import StudentSearch from "@/components/students/student-search";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Modal from "@/components/ui/modal";
import Toast from "@/components/ui/toast";
import Pagination from "@/components/ui/pagination";
import {
  useAllDocuments,
  useDownloadDocument,
  useIssueDocument,
  useRevokeDocument,
  useGenerateTranscript,
  useGenerateCertificate,
  useGenerateIdCard,
  useGenerateDiploma,
  useGenerateAttestation,
} from "@/hooks/use-documents-generate";
import { useStudents } from "@/hooks/use-students";
import type {
  DocumentFilters,
  DocumentType,
  DocumentStatus,
  GenerateTranscriptInput,
  GenerateCertificateInput,
  GenerateIdCardInput,
  GenerateDiplomaInput,
  GenerateAttestationInput,
  GeneratedDocument,
} from "@/types/document";
import { DocumentType as DocType, DocumentStatus as DocStatus } from "@/types/document";

const requestableTypes: DocumentType[] = [
  DocType.TRANSCRIPT,
  DocType.CERTIFICATE,
  DocType.ID_CARD,
  DocType.DIPLOMA,
];

type GeneratePayload = {
  student_id: string;
} & Record<string, unknown>;

export default function DocumentsPage() {
  const router = useRouter();

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudentLabel, setSelectedStudentLabel] = useState<string>("");
  const [filters, setFilters] = useState<DocumentFilters>({
    page: 1,
    limit: 10,
  });

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isBulkGenerateModalOpen, setIsBulkGenerateModalOpen] = useState(false);
  const [isGenerateConfirmOpen, setIsGenerateConfirmOpen] = useState(false);
  const [isRequestConfirmOpen, setIsRequestConfirmOpen] = useState(false);

  const [generateType, setGenerateType] = useState<DocumentType | null>(null);
  const [pendingGenerateData, setPendingGenerateData] = useState<GeneratePayload | null>(null);
  const [requestType, setRequestType] = useState<DocumentType>(DocType.TRANSCRIPT);

  const [bulkType, setBulkType] = useState<DocumentType>(DocType.TRANSCRIPT);
  const [bulkStudentSearch, setBulkStudentSearch] = useState("");
  const [bulkSelectedStudentIds, setBulkSelectedStudentIds] = useState<string[]>([]);

  const [lastGeneratedDocument, setLastGeneratedDocument] = useState<GeneratedDocument | null>(
    null
  );

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const {
    data: documents,
    isLoading,
    error,
  } = useAllDocuments({
    ...filters,
    student_id: selectedStudentId || undefined,
  });

  const { data: bulkStudentsData, isLoading: bulkStudentsLoading } = useStudents({
    page: 1,
    limit: 30,
    search: bulkStudentSearch || undefined,
  });

  const documentRows = documents?.data ?? [];
  const bulkStudents = useMemo(() => bulkStudentsData?.data ?? [], [bulkStudentsData?.data]);

  const downloadMutation = useDownloadDocument();
  const issueMutation = useIssueDocument();
  const revokeMutation = useRevokeDocument();
  const generateTranscriptMutation = useGenerateTranscript();
  const generateCertificateMutation = useGenerateCertificate();
  const generateIdCardMutation = useGenerateIdCard();
  const generateDiplomaMutation = useGenerateDiploma();
  const generateAttestationMutation = useGenerateAttestation();

  const isGenerating =
    generateTranscriptMutation.isPending ||
    generateCertificateMutation.isPending ||
    generateIdCardMutation.isPending ||
    generateDiplomaMutation.isPending ||
    generateAttestationMutation.isPending;

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

  const generateDocumentByType = async (
    type: DocumentType,
    payload: GeneratePayload
  ): Promise<GeneratedDocument> => {
    switch (type) {
      case DocType.TRANSCRIPT:
        return generateTranscriptMutation.mutateAsync(payload as GenerateTranscriptInput);
      case DocType.CERTIFICATE:
        return generateCertificateMutation.mutateAsync(payload as GenerateCertificateInput);
      case DocType.ID_CARD:
        return generateIdCardMutation.mutateAsync(payload as GenerateIdCardInput);
      case DocType.DIPLOMA:
        return generateDiplomaMutation.mutateAsync(payload as GenerateDiplomaInput);
      case DocType.ATTESTATION:
        return generateAttestationMutation.mutateAsync({
          student_id: payload.student_id,
          custom_text:
            typeof payload.custom_text === "string" ? payload.custom_text : "Attestation",
        });
      default:
        throw new Error("Type de document non supporté");
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      await downloadMutation.mutateAsync(documentId);
      setToast({ isOpen: true, message: "Téléchargement démarré", type: "success" });
    } catch (err) {
      console.error("Error downloading document:", err);
      setToast({ isOpen: true, message: "Erreur lors du téléchargement", type: "error" });
    }
  };

  const handlePreview = (documentId: string) => {
    router.push(`/documents/preview/${documentId}`);
  };

  const handleIssue = async (documentId: string) => {
    try {
      await issueMutation.mutateAsync(documentId);
      setToast({ isOpen: true, message: "Document émis avec succès", type: "success" });
    } catch (err) {
      console.error("Error issuing document:", err);
      setToast({ isOpen: true, message: "Erreur lors de l'émission du document", type: "error" });
    }
  };

  const handleRevoke = async (documentId: string, reason?: string) => {
    try {
      await revokeMutation.mutateAsync({ documentId, reason });
      setToast({ isOpen: true, message: "Document révoqué avec succès", type: "success" });
    } catch (err) {
      console.error("Error revoking document:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la révocation du document",
        type: "error",
      });
    }
  };

  const handleFilterChange = (key: keyof DocumentFilters, value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: key === "page" ? Number(value) || 1 : 1,
    }));
  };

  const handleGenerateClick = (type: DocumentType) => {
    if (!selectedStudentId) {
      setToast({
        isOpen: true,
        message: "Sélectionnez d'abord un étudiant.",
        type: "error",
      });
      return;
    }

    setGenerateType(type);
    setPendingGenerateData(null);
    setIsGenerateModalOpen(true);
  };

  const handleGenerateSubmit = async (data: Record<string, unknown>) => {
    if (!selectedStudentId) {
      setToast({
        isOpen: true,
        message: "Sélectionnez d'abord un étudiant.",
        type: "error",
      });
      return;
    }
    setPendingGenerateData({
      ...data,
      student_id: selectedStudentId,
    });
    setIsGenerateConfirmOpen(true);
  };

  const confirmGenerate = async () => {
    if (!generateType || !pendingGenerateData) return;

    try {
      const generated = await generateDocumentByType(generateType, pendingGenerateData);
      setLastGeneratedDocument(generated);
      setToast({ isOpen: true, message: "Document généré avec succès", type: "success" });
      setIsGenerateModalOpen(false);
      setIsGenerateConfirmOpen(false);
      setGenerateType(null);
      setPendingGenerateData(null);
    } catch (err) {
      console.error("Error generating document:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors de la génération du document",
        type: "error",
      });
    }
  };

  const confirmRequestWorkflow = async () => {
    if (!selectedStudentId) return;

    try {
      const generated = await generateDocumentByType(requestType, {
        student_id: selectedStudentId,
      });
      setLastGeneratedDocument(generated);
      setToast({
        isOpen: true,
        message: "Demande traitée et document généré. Vous pouvez le télécharger.",
        type: "success",
      });
    } catch (err) {
      console.error("Error processing request:", err);
      setToast({
        isOpen: true,
        message: "Erreur lors du traitement de la demande.",
        type: "error",
      });
    } finally {
      setIsRequestConfirmOpen(false);
    }
  };

  const visibleBulkStudentIds = useMemo(
    () => bulkStudents.map((student) => student.id),
    [bulkStudents]
  );

  const toggleBulkStudent = (studentId: string) => {
    setBulkSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAllBulk = () => {
    const allSelected = visibleBulkStudentIds.every((id) => bulkSelectedStudentIds.includes(id));
    setBulkSelectedStudentIds(allSelected ? [] : visibleBulkStudentIds);
  };

  const executeBulkGeneration = async () => {
    if (bulkSelectedStudentIds.length === 0) {
      setToast({ isOpen: true, message: "Aucun étudiant sélectionné.", type: "error" });
      return;
    }

    let successCount = 0;
    for (const studentId of bulkSelectedStudentIds) {
      try {
        await generateDocumentByType(bulkType, { student_id: studentId });
        successCount += 1;
      } catch {
        // Continue batch even if one generation fails
      }
    }

    setToast({
      isOpen: true,
      message: `Génération terminée: ${successCount}/${bulkSelectedStudentIds.length} document(s).`,
      type: successCount > 0 ? "success" : "error",
    });

    setIsBulkGenerateModalOpen(false);
    setBulkSelectedStudentIds([]);
    setBulkStudentSearch("");
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Documents">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#00365F]">Documents</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Gérez les documents académiques des étudiants
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedStudentId && (
                <button
                  onClick={() => handleGenerateClick(DocType.TRANSCRIPT)}
                  className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
                >
                  Générer un document
                </button>
              )}
              <button
                onClick={() => setIsBulkGenerateModalOpen(true)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F]"
              >
                Génération en lot
              </button>
            </div>
          </div>

          {selectedStudentId && (
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[#00365F]">Demande de document étudiant</h2>
              <p className="mt-1 text-xs text-zinc-500">Étudiant: {selectedStudentLabel}</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                <select
                  value={requestType}
                  onChange={(event) => setRequestType(event.target.value as DocumentType)}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  {requestableTypes.map((type) => (
                    <option key={type} value={type}>
                      {getDocumentTypeLabel(type)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsRequestConfirmOpen(true)}
                  className="rounded-lg bg-[#00365F] px-4 py-2 text-sm font-medium text-white"
                >
                  Confirmer la demande
                </button>
              </div>
            </div>
          )}

          {lastGeneratedDocument && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">
                Document prêt: {lastGeneratedDocument.document_number}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(lastGeneratedDocument.id)}
                  className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-800"
                >
                  Télécharger maintenant
                </button>
                <button
                  type="button"
                  onClick={() => handlePreview(lastGeneratedDocument.id)}
                  className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-800"
                >
                  Prévisualiser
                </button>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">Étudiant</label>
                <StudentSearch
                  value={selectedStudentLabel}
                  onSelect={(student) => {
                    setSelectedStudentId(student.id);
                    setSelectedStudentLabel(`${student.full_name} · ${student.student_number}`);
                    setFilters((prev) => ({ ...prev, page: 1 }));
                  }}
                  onClear={() => {
                    setSelectedStudentId("");
                    setSelectedStudentLabel("");
                    setFilters((prev) => ({ ...prev, page: 1 }));
                  }}
                  placeholder="Filtrer par étudiant..."
                />
              </div>

              <div>
                <label htmlFor="type" className="mb-2 block text-sm font-medium text-zinc-700">
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

              <div>
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-zinc-700">
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

              <div>
                <label htmlFor="search" className="mb-2 block text-sm font-medium text-zinc-700">
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
              documents={documentRows}
              onDownload={handleDownload}
              onPreview={handlePreview}
              onIssue={handleIssue}
              onRevoke={handleRevoke}
              canIssue
              canRevoke
              showStudent={!selectedStudentId}
            />
          )}

          <Pagination
            page={documents?.page ?? 1}
            totalPages={documents?.total_pages ?? 1}
            totalItems={documents?.total ?? 0}
            perPage={documents?.limit ?? filters.limit ?? 10}
            itemLabel="documents"
            onPageChange={(nextPage) => handleFilterChange("page", nextPage)}
            onPerPageChange={(nextLimit) => handleFilterChange("limit", nextLimit)}
          />

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
                key={`${generateType}-${selectedStudentId}`}
                type={generateType}
                studentId={selectedStudentId}
                onSubmit={handleGenerateSubmit}
                onCancel={() => {
                  setIsGenerateModalOpen(false);
                  setGenerateType(null);
                }}
                isLoading={isGenerating}
              />
            </Modal>
          )}

          <Modal
            isOpen={isBulkGenerateModalOpen}
            onClose={() => setIsBulkGenerateModalOpen(false)}
            title="Génération en lot"
            subtitle="Sélectionnez les étudiants et le type de document"
            size="md"
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Type de document
                </label>
                <select
                  value={bulkType}
                  onChange={(event) => setBulkType(event.target.value as DocumentType)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  {requestableTypes.map((type) => (
                    <option key={type} value={type}>
                      {getDocumentTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Rechercher un étudiant
                </label>
                <input
                  type="text"
                  value={bulkStudentSearch}
                  onChange={(event) => setBulkStudentSearch(event.target.value)}
                  placeholder="Nom ou matricule..."
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="max-h-60 overflow-y-auto rounded-lg border border-zinc-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-zinc-500">Sélectionnez les étudiants</p>
                  <button
                    type="button"
                    onClick={handleSelectAllBulk}
                    className="text-xs font-medium text-[#00365F]"
                  >
                    Tout sélectionner
                  </button>
                </div>
                {bulkStudentsLoading ? (
                  <p className="text-sm text-zinc-500">Chargement...</p>
                ) : bulkStudents.length === 0 ? (
                  <p className="text-sm text-zinc-500">Aucun étudiant trouvé.</p>
                ) : (
                  <div className="space-y-2">
                    {bulkStudents.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center gap-2 text-sm text-zinc-700"
                      >
                        <input
                          type="checkbox"
                          checked={bulkSelectedStudentIds.includes(student.id)}
                          onChange={() => toggleBulkStudent(student.id)}
                        />
                        {student.full_name} · {student.student_number}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkGenerateModalOpen(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={executeBulkGeneration}
                  disabled={isGenerating}
                  className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Lancer la génération
                </button>
              </div>
            </div>
          </Modal>

          <ConfirmDialog
            isOpen={isGenerateConfirmOpen}
            onClose={() => setIsGenerateConfirmOpen(false)}
            onConfirm={confirmGenerate}
            title="Confirmer la génération"
            message="Voulez-vous générer ce document maintenant ?"
            confirmText="Générer"
            cancelText="Annuler"
            variant="info"
            isLoading={isGenerating}
          />

          <ConfirmDialog
            isOpen={isRequestConfirmOpen}
            onClose={() => setIsRequestConfirmOpen(false)}
            onConfirm={confirmRequestWorkflow}
            title="Confirmer la demande"
            message={`Créer ${getDocumentTypeLabel(requestType)} pour l'étudiant sélectionné ?`}
            confirmText="Confirmer"
            cancelText="Annuler"
            variant="info"
            isLoading={isGenerating}
          />

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
