"use client";

import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/use-safe-params";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StudentStatusBadge from "@/components/students/student-status-badge";
import StudentStatusChanger from "@/components/students/student-status-changer";
import DocumentUploader from "@/components/students/document-uploader";
import DocumentApproval from "@/components/students/document-approval";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { useStudent, useDeleteStudent, useUpdateStudentStatus } from "@/hooks/use-students";
import {
  useGuardians,
  useCreateGuardian,
  useUpdateGuardian,
  useDeleteGuardian,
} from "@/hooks/use-guardians";
import {
  useDocuments,
  useCreateDocument,
  useApproveDocument,
  useRejectDocument,
} from "@/hooks/use-documents";
import { useCreatePriorDiploma, useDeletePriorDiploma } from "@/hooks/use-prior-diplomas";
import { DocumentType } from "@/types/student";

type TabType = "info" | "guardians" | "diplomas" | "documents" | "status";

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useSafeParams<{ id: string }>();
  const studentId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const { data: student, isLoading, error } = useStudent(studentId);
  const deleteMutation = useDeleteStudent();
  const updateStatusMutation = useUpdateStudentStatus();

  // Guardians
  const { data: guardians = [], isLoading: loadingGuardians } = useGuardians(studentId);
  const createGuardianMutation = useCreateGuardian();
  const updateGuardianMutation = useUpdateGuardian();
  const deleteGuardianMutation = useDeleteGuardian();

  // Documents
  const { data: documents = [], isLoading: loadingDocuments } = useDocuments(studentId);
  const createDocumentMutation = useCreateDocument();
  const approveDocumentMutation = useApproveDocument();
  const rejectDocumentMutation = useRejectDocument();

  // Prior Diplomas — loaded from student detail response
  const priorDiplomas = student?.prior_diplomas ?? [];
  const loadingDiplomas = isLoading;
  const createDiplomaMutation = useCreatePriorDiploma();
  const deleteDiplomaMutation = useDeletePriorDiploma();
  const [showDiplomaForm, setShowDiplomaForm] = useState(false);
  const [diplomaForm, setDiplomaForm] = useState({
    name: "",
    year: "",
    mention: "",
    institution: "",
  });

  // Redirect if error
  useEffect(() => {
    if (error) {
      setToast({
        isOpen: true,
        message: "Étudiant introuvable",
        type: "error",
      });
      setTimeout(() => {
        router.push("/students");
      }, 2000);
    }
  }, [error, router]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(studentId);
      setToast({
        isOpen: true,
        message: "Étudiant supprimé avec succès",
        type: "success",
      });
      setTimeout(() => {
        router.push("/students");
      }, 1500);
    } catch (error) {
      console.error("Error deleting student:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la suppression de l'étudiant",
        type: "error",
      });
      setDeleteConfirm(false);
    }
  };

  const handleStatusChange = async (studentId: string, newStatus: any, reason?: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: studentId, status: newStatus });
      setToast({
        isOpen: true,
        message: "Statut de l'étudiant modifié avec succès",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating student status:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de la modification du statut",
        type: "error",
      });
    }
  };

  const handleDocumentUpload = async (files: File[], type: DocumentType) => {
    try {
      for (const file of files) {
        await createDocumentMutation.mutateAsync({
          student_id: studentId,
          type,
          document: file,
        });
      }
      setToast({
        isOpen: true,
        message: "Documents téléchargés avec succès",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading documents:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors du téléchargement des documents",
        type: "error",
      });
    }
  };

  const handleApproveDocument = async (documentId: string, notes?: string) => {
    try {
      await approveDocumentMutation.mutateAsync({
        id: documentId,
        notes,
      });
      setToast({
        isOpen: true,
        message: "Document approuvé avec succès",
        type: "success",
      });
    } catch (error) {
      console.error("Error approving document:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors de l'approbation du document",
        type: "error",
      });
    }
  };

  const handleRejectDocument = async (documentId: string, reason: string) => {
    try {
      await rejectDocumentMutation.mutateAsync({
        id: documentId,
        reason,
      });
      setToast({
        isOpen: true,
        message: "Document rejeté",
        type: "success",
      });
    } catch (error) {
      console.error("Error rejecting document:", error);
      setToast({
        isOpen: true,
        message: "Erreur lors du rejet du document",
        type: "error",
      });
    }
  };

  const handleAddDiploma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diplomaForm.name.trim()) return;
    try {
      await createDiplomaMutation.mutateAsync({
        student_id: studentId,
        name: diplomaForm.name,
        year: diplomaForm.year ? parseInt(diplomaForm.year) : null,
        mention: diplomaForm.mention || null,
        institution: diplomaForm.institution || null,
      });
      setDiplomaForm({ name: "", year: "", mention: "", institution: "" });
      setShowDiplomaForm(false);
      setToast({ isOpen: true, message: "Diplôme ajouté avec succès", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de l'ajout du diplôme", type: "error" });
    }
  };

  const handleDeleteDiploma = async (id: string) => {
    try {
      await deleteDiplomaMutation.mutateAsync({ studentId, id });
      setToast({ isOpen: true, message: "Diplôme supprimé", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Erreur lors de la suppression", type: "error" });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Détails de l'Étudiant">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#008D36]"></div>
              <p className="mt-3 text-sm text-zinc-500">Chargement de l'étudiant...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!student) {
    return null;
  }

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: "info", label: "Informations" },
    { id: "guardians", label: "Tuteurs", count: guardians.length },
    { id: "diplomas", label: "Diplômes antérieurs", count: priorDiplomas.length },
    { id: "documents", label: "Documents", count: documents.length },
    { id: "status", label: "Statut" },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Détails de l'Étudiant">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">{student.full_name}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {student.student_number} • Créé le{" "}
              {new Date(student.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StudentStatusBadge status={student.status} />
            <Link
              href={`/students/${studentId}/deliberations`}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50"
            >
              Historique délibérations
            </Link>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Supprimer
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-[#008D36] text-[#008D36]"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-[#008D36]/10 text-[#008D36]"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Info Tab */}
          {activeTab === "info" && (
            <>
              {/* Personal Info */}
              <div className="rounded-lg border border-zinc-200 bg-white p-6">
                <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Numéro étudiant</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {student.student_number ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">INE</p>
                    <p className="mt-1 text-sm text-zinc-900">{student.ine ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Numéro d'inscription</p>
                    <p className="mt-1 text-sm text-zinc-900">
                      {student.registration_number ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Genre</p>
                    <p className="mt-1 text-sm text-zinc-900">
                      {student.gender === "M"
                        ? "Masculin"
                        : student.gender === "F"
                          ? "Féminin"
                          : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Date de naissance</p>
                    <p className="mt-1 text-sm text-zinc-900">
                      {student.date_of_birth
                        ? new Date(student.date_of_birth).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Lieu de naissance</p>
                    <p className="mt-1 text-sm text-zinc-900">{student.place_of_birth ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Nationalité</p>
                    <p className="mt-1 text-sm text-zinc-900">{student.nationality ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Provenance</p>
                    <p className="mt-1 text-sm text-zinc-900">
                      {student.provenance === "ETAT"
                        ? "État"
                        : student.provenance === "PLATEFORME"
                          ? "Plateforme"
                          : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Identity Document */}
              {(student.type_of_id || student.id_details) && (
                <div className="rounded-lg border border-zinc-200 bg-white p-6">
                  <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                    Pièce d'identité
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-zinc-500">Type</p>
                      <p className="mt-1 text-sm text-zinc-900">{student.type_of_id ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-500">Référence</p>
                      <p className="mt-1 text-sm text-zinc-900">{student.id_details ?? "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="rounded-lg border border-zinc-200 bg-white p-6">
                <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                  Informations de contact
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Téléphone</p>
                    <p className="mt-1 text-sm text-zinc-900">{student.phone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Téléphone 2</p>
                    <p className="mt-1 text-sm text-zinc-900">{student.phone_2 ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Email personnel</p>
                    <p className="mt-1 text-sm text-zinc-900">{student.email ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Email universitaire</p>
                    <p className="mt-1 text-sm text-zinc-900">{student.email_university ?? "—"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-zinc-500">Adresse</p>
                    <p className="mt-1 text-sm text-zinc-900 whitespace-pre-line">
                      {student.address ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="rounded-lg border border-zinc-200 bg-white p-6">
                <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                  Contact d'urgence
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Nom du contact</p>
                    <p className="mt-1 text-sm text-zinc-900">
                      {student.emergency_contact_name ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Téléphone du contact</p>
                    <p className="mt-1 text-sm text-zinc-900">
                      {student.emergency_contact_phone ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sync Info */}
              {student.synced_from && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs text-zinc-500">
                    Synchronisé depuis{" "}
                    <span className="font-semibold text-zinc-700">{student.synced_from}</span>
                    {student.last_synced_at && (
                      <> · {new Date(student.last_synced_at).toLocaleString("fr-FR")}</>
                    )}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Guardians Tab */}
          {activeTab === "guardians" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-zinc-900">Tuteurs légaux</h3>
                <button className="px-4 py-2 text-sm font-medium text-white bg-[#008D36] border border-transparent rounded-md hover:bg-[#007A2E]">
                  Ajouter un tuteur
                </button>
              </div>

              {loadingGuardians ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008D36]"></div>
                </div>
              ) : guardians.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  Aucun tuteur enregistré pour cet étudiant.
                </div>
              ) : (
                <div className="space-y-4">
                  {guardians.map((guardian) => (
                    <div
                      key={guardian.id}
                      className="border border-zinc-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-zinc-900">
                            {guardian.full_name}
                          </h4>
                          <p className="text-xs text-zinc-500 mt-1">
                            {guardian.relationship === "FATHER"
                              ? "Père"
                              : guardian.relationship === "MOTHER"
                                ? "Mère"
                                : "Tuteur"}
                          </p>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-zinc-500">Téléphone:</span> {guardian.phone}
                            </div>
                            <div>
                              <span className="text-zinc-500">Email:</span> {guardian.email}
                            </div>
                            <div className="sm:col-span-2">
                              <span className="text-zinc-500">Profession:</span>{" "}
                              {guardian.occupation}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-zinc-400 hover:text-zinc-600">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button className="text-zinc-400 hover:text-red-600">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Diplomas Tab */}
          {activeTab === "diplomas" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-zinc-900">Diplômes antérieurs</h3>
                {!showDiplomaForm && (
                  <button
                    onClick={() => setShowDiplomaForm(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#008D36] border border-transparent rounded-md hover:bg-[#007A2E]"
                  >
                    Ajouter un diplôme
                  </button>
                )}
              </div>

              {showDiplomaForm && (
                <form
                  onSubmit={handleAddDiploma}
                  className="rounded-lg border border-zinc-200 bg-white p-6 space-y-4"
                >
                  <h4 className="text-sm font-semibold text-zinc-900">Nouveau diplôme</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Nom du diplôme <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={diplomaForm.name}
                        onChange={(e) => setDiplomaForm({ ...diplomaForm, name: e.target.value })}
                        placeholder="ex: Licence en Informatique"
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Année</label>
                      <input
                        type="number"
                        value={diplomaForm.year}
                        onChange={(e) => setDiplomaForm({ ...diplomaForm, year: e.target.value })}
                        placeholder="ex: 2022"
                        min="1950"
                        max={new Date().getFullYear()}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Mention
                      </label>
                      <input
                        type="text"
                        value={diplomaForm.mention}
                        onChange={(e) =>
                          setDiplomaForm({ ...diplomaForm, mention: e.target.value })
                        }
                        placeholder="ex: Bien"
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Établissement
                      </label>
                      <input
                        type="text"
                        value={diplomaForm.institution}
                        onChange={(e) =>
                          setDiplomaForm({ ...diplomaForm, institution: e.target.value })
                        }
                        placeholder="ex: Université Cheikh Anta Diop"
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDiplomaForm(false);
                        setDiplomaForm({ name: "", year: "", mention: "", institution: "" });
                      }}
                      className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={createDiplomaMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#008D36] border border-transparent rounded-md hover:bg-[#007A2E] disabled:opacity-50"
                    >
                      {createDiplomaMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  </div>
                </form>
              )}

              {loadingDiplomas ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008D36]"></div>
                </div>
              ) : priorDiplomas.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  Aucun diplôme antérieur enregistré pour cet étudiant.
                </div>
              ) : (
                <div className="space-y-3">
                  {priorDiplomas.map((diploma) => (
                    <div
                      key={diploma.id}
                      className="flex items-start justify-between rounded-lg border border-zinc-200 bg-white p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{diploma.name}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                          {diploma.year && <span>Année : {diploma.year}</span>}
                          {diploma.mention && <span>Mention : {diploma.mention}</span>}
                          {diploma.institution && (
                            <span>Établissement : {diploma.institution}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDiploma(diploma.id)}
                        disabled={deleteDiplomaMutation.isPending}
                        className="ml-4 text-zinc-400 hover:text-red-600 disabled:opacity-50"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              {/* Document Uploader */}
              <div className="rounded-lg border border-zinc-200 bg-white p-6">
                <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                  Télécharger des documents
                </h3>
                <DocumentUploader
                  studentId={studentId}
                  onUpload={handleDocumentUpload}
                  isLoading={createDocumentMutation.isPending}
                />
              </div>

              {/* Documents List */}
              <div>
                <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-zinc-900">
                  Documents soumis ({documents.length})
                </h3>

                {loadingDocuments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008D36]"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    Aucun document soumis pour cet étudiant.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((document) => (
                      <DocumentApproval
                        key={document.id}
                        document={document}
                        onApprove={handleApproveDocument}
                        onReject={handleRejectDocument}
                        isLoading={
                          approveDocumentMutation.isPending || rejectDocumentMutation.isPending
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Tab */}
          {activeTab === "status" && (
            <div className="space-y-6">
              <StudentStatusChanger
                student={student}
                onStatusChange={handleStatusChange}
                isLoading={updateStatusMutation.isPending}
              />
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-start">
            <Link
              href="/students"
              className="flex items-center gap-2 text-sm font-medium text-[#00365F] transition-colors hover:text-[#008D36]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Retour à la liste
            </Link>
          </div>
        </div>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteConfirm}
          onClose={() => setDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Supprimer l'étudiant"
          message="Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible."
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        {/* Toast Notifications */}
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
