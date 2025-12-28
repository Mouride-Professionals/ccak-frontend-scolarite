"use client";

/**
 * React Query hooks for Document Generation
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GeneratedDocument,
  DocumentFilters,
  GenerateTranscriptInput,
  GenerateCertificateInput,
  GenerateIdCardInput,
  GenerateDiplomaInput,
  GenerateAttestationInput,
  DocumentVerificationResponse,
} from "@/types/document";
import * as documentsApi from "@/lib/api/documents-genarate";

// =====================
// QUERY KEYS
// =====================

export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (studentId: string, filters?: DocumentFilters) =>
    [...documentKeys.lists(), studentId, filters] as const,
  allDocuments: (filters?: DocumentFilters & { student_id?: string }) =>
    [...documentKeys.all, "all", filters] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  verification: () => [...documentKeys.all, "verification"] as const,
  verificationDetail: (documentNumber: string, studentId?: string) =>
    [...documentKeys.verification(), documentNumber, studentId] as const,
};

// =====================
// QUERIES
// =====================

/**
 * Get all documents for a student
 */
export function useStudentDocuments(studentId: string, filters?: DocumentFilters) {
  return useQuery({
    queryKey: documentKeys.list(studentId, filters),
    queryFn: () => documentsApi.getStudentDocuments(studentId, filters),
    enabled: !!studentId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get all documents (admin view)
 */
export function useAllDocuments(filters?: DocumentFilters & { student_id?: string }) {
  return useQuery({
    queryKey: documentKeys.allDocuments(filters),
    queryFn: () => documentsApi.getAllDocuments(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Verify a document (public endpoint)
 */
export function useVerifyDocument(
  documentNumber: string,
  studentId?: string,
  enabled = true
) {
  return useQuery({
    queryKey: documentKeys.verificationDetail(documentNumber, studentId),
    queryFn: () => documentsApi.verifyDocument(documentNumber, studentId),
    enabled: enabled && !!documentNumber,
    staleTime: 60000, // 1 minute (verification doesn't change often)
  });
}

// =====================
// MUTATIONS - GENERATION
// =====================

/**
 * Generate a transcript document
 */
export function useGenerateTranscript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateTranscriptInput) => documentsApi.generateTranscript(input),
    onSuccess: (data) => {
      // Invalidate student documents list
      queryClient.invalidateQueries({
        queryKey: documentKeys.list(data.student_id),
      });
    },
  });
}

/**
 * Generate a certificate document
 */
export function useGenerateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateCertificateInput) => documentsApi.generateCertificate(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.list(data.student_id),
      });
    },
  });
}

/**
 * Generate an ID card document
 */
export function useGenerateIdCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateIdCardInput) => documentsApi.generateIdCard(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.list(data.student_id),
      });
    },
  });
}

/**
 * Generate a diploma document
 */
export function useGenerateDiploma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateDiplomaInput) => documentsApi.generateDiploma(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.list(data.student_id),
      });
    },
  });
}

/**
 * Generate an attestation document
 */
export function useGenerateAttestation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateAttestationInput) => documentsApi.generateAttestation(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.list(data.student_id),
      });
    },
  });
}

// =====================
// MUTATIONS - MANAGEMENT
// =====================

/**
 * Download a document as PDF
 */
export function useDownloadDocument() {
  return useMutation({
    mutationFn: (documentId: string) => documentsApi.downloadDocument(documentId),
    onSuccess: (blob, documentId) => {
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `document-${documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

/**
 * Issue a document (change status from DRAFT to ISSUED)
 */
export function useIssueDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => documentsApi.issueDocument(documentId),
    onSuccess: (data) => {
      // Update the specific document in cache
      queryClient.setQueryData(documentKeys.detail(data.id), data);
      // Invalidate student documents list
      queryClient.invalidateQueries({
        queryKey: documentKeys.list(data.student_id),
      });
    },
  });
}

/**
 * Revoke a document (change status to REVOKED)
 */
export function useRevokeDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, reason }: { documentId: string; reason?: string }) =>
      documentsApi.revokeDocument(documentId, reason),
    onSuccess: (data) => {
      // Update the specific document in cache
      queryClient.setQueryData(documentKeys.detail(data.id), data);
      // Invalidate student documents list
      queryClient.invalidateQueries({
        queryKey: documentKeys.list(data.student_id),
      });
    },
  });
}

