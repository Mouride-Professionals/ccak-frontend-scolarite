/**
 * Documents API Service
 * Handles all API calls related to document generation and management
 */

import { api } from "@/lib/api-client";
import type {
  GeneratedDocument,
  GenerateTranscriptInput,
  GenerateCertificateInput,
  GenerateIdCardInput,
  GenerateDiplomaInput,
  GenerateAttestationInput,
  DocumentFilters,
  DocumentVerificationResponse,
} from "@/types/document";
import { mockGeneratedDocuments } from "./mock-data";
import { DocumentType, DocumentStatus } from "@/types/document";

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true; // Set to true for development with mock data

/**
 * Simulate API delay for realistic testing
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// =====================
// GENERATION ENDPOINTS
// =====================

/**
 * Generate a transcript document
 */
export async function generateTranscript(
  input: GenerateTranscriptInput
): Promise<GeneratedDocument> {
  if (USE_MOCK_DATA) {
    await delay(1000); // Simulate PDF generation delay

    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const checksum = Math.random().toString(36).substring(2, 4).toUpperCase();
    const documentNumber = `TRS-${year}-${random}-${checksum}`;

    const mockDocument: GeneratedDocument = {
      id: `doc-${Date.now()}`,
      student_id: input.student_id,
      type: DocumentType.TRANSCRIPT,
      document_number: documentNumber,
      file_path: `documents/TRANSCRIPT/${year}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${documentNumber}.pdf`,
      status: DocumentStatus.DRAFT,
      generated_at: new Date().toISOString(),
      metadata: {
        academic_year: input.academic_year,
        include_all_semesters: input.include_all ?? true,
        with_watermark: true,
        with_qr_code: true,
      },
      student: {
        id: input.student_id,
        email: "student@ucak.sn",
        full_name: "Étudiant Test",
        student_number: "STU-2024-001",
      },
    };

    // Add to mock data (in-memory only)
    mockGeneratedDocuments.unshift(mockDocument);

    return mockDocument;
  }

  const response = await api.post<{
    data: GeneratedDocument;
    message: string;
  }>("/documents/transcript", input as unknown as Record<string, unknown>);

  // Backend returns { data: {...}, message: "..." }
  return response.data || response;
}

/**
 * Generate a certificate document
 */
export async function generateCertificate(
  input: GenerateCertificateInput
): Promise<GeneratedDocument> {
  if (USE_MOCK_DATA) {
    await delay(1000);

    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const checksum = Math.random().toString(36).substring(2, 4).toUpperCase();
    const documentNumber = `CER-${year}-${random}-${checksum}`;

    const mockDocument: GeneratedDocument = {
      id: `doc-${Date.now()}`,
      student_id: input.student_id,
      type: DocumentType.CERTIFICATE,
      document_number: documentNumber,
      file_path: `documents/CERTIFICATE/${year}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${documentNumber}.pdf`,
      status: DocumentStatus.DRAFT,
      generated_at: new Date().toISOString(),
      metadata: {
        purpose: input.purpose,
        academic_year: input.academic_year,
        with_watermark: true,
        with_qr_code: true,
      },
      student: {
        id: input.student_id,
        email: "student@ucak.sn",
        full_name: "Étudiant Test",
        student_number: "STU-2024-001",
      },
    };

    mockGeneratedDocuments.unshift(mockDocument);
    return mockDocument;
  }

  const response = await api.post<{
    data: GeneratedDocument;
    message: string;
  }>("/documents/certificate", input as unknown as Record<string, unknown>);

  return response.data || response;
}

/**
 * Generate an ID card document
 */
export async function generateIdCard(input: GenerateIdCardInput): Promise<GeneratedDocument> {
  if (USE_MOCK_DATA) {
    await delay(800);

    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const checksum = Math.random().toString(36).substring(2, 4).toUpperCase();
    const documentNumber = `IDC-${year}-${random}-${checksum}`;

    const mockDocument: GeneratedDocument = {
      id: `doc-${Date.now()}`,
      student_id: input.student_id,
      type: DocumentType.ID_CARD,
      document_number: documentNumber,
      file_path: `documents/ID_CARD/${year}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${documentNumber}.pdf`,
      status: DocumentStatus.DRAFT,
      generated_at: new Date().toISOString(),
      metadata: {
        with_watermark: false,
        with_qr_code: true,
      },
      student: {
        id: input.student_id,
        email: "student@ucak.sn",
        full_name: "Étudiant Test",
        student_number: "STU-2024-001",
      },
    };

    mockGeneratedDocuments.unshift(mockDocument);
    return mockDocument;
  }

  const response = await api.post<{
    data: GeneratedDocument;
    message: string;
  }>("/documents/id-card", input as unknown as Record<string, unknown>);

  return response.data || response;
}

/**
 * Generate a diploma document
 */
export async function generateDiploma(input: GenerateDiplomaInput): Promise<GeneratedDocument> {
  if (USE_MOCK_DATA) {
    await delay(1200);

    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const checksum = Math.random().toString(36).substring(2, 4).toUpperCase();
    const documentNumber = `DIP-${year}-${random}-${checksum}`;

    const mockDocument: GeneratedDocument = {
      id: `doc-${Date.now()}`,
      student_id: input.student_id,
      type: DocumentType.DIPLOMA,
      document_number: documentNumber,
      file_path: `documents/DIPLOMA/${year}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${documentNumber}.pdf`,
      status: DocumentStatus.DRAFT,
      generated_at: new Date().toISOString(),
      metadata: {
        degree: input.degree,
        graduation_date: input.graduation_date,
        honors: input.honors,
        with_watermark: true,
        with_qr_code: true,
      },
      student: {
        id: input.student_id,
        email: "student@ucak.sn",
        full_name: "Étudiant Test",
        student_number: "STU-2024-001",
      },
    };

    mockGeneratedDocuments.unshift(mockDocument);
    return mockDocument;
  }

  const response = await api.post<{
    data: GeneratedDocument;
    message: string;
  }>("/documents/diploma", input as unknown as Record<string, unknown>);

  return response.data || response;
}

/**
 * Generate an attestation document
 */
export async function generateAttestation(
  input: GenerateAttestationInput
): Promise<GeneratedDocument> {
  if (USE_MOCK_DATA) {
    await delay(800);

    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const checksum = Math.random().toString(36).substring(2, 4).toUpperCase();
    const documentNumber = `ATT-${year}-${random}-${checksum}`;

    const mockDocument: GeneratedDocument = {
      id: `doc-${Date.now()}`,
      student_id: input.student_id,
      type: DocumentType.ATTESTATION,
      document_number: documentNumber,
      file_path: `documents/ATTESTATION/${year}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${documentNumber}.pdf`,
      status: DocumentStatus.DRAFT,
      generated_at: new Date().toISOString(),
      metadata: {
        custom_text: input.custom_text,
        with_watermark: true,
        with_qr_code: true,
      },
      student: {
        id: input.student_id,
        email: "student@ucak.sn",
        full_name: "Étudiant Test",
        student_number: "STU-2024-001",
      },
    };

    mockGeneratedDocuments.unshift(mockDocument);
    return mockDocument;
  }

  const response = await api.post<{
    data: GeneratedDocument;
    message: string;
  }>("/documents/attestation", input as unknown as Record<string, unknown>);

  return response.data || response;
}

// =====================
// MANAGEMENT ENDPOINTS
// =====================

/**
 * Get all documents for a student
 */
export async function getStudentDocuments(
  studentId: string,
  filters?: DocumentFilters
): Promise<GeneratedDocument[]> {
  if (USE_MOCK_DATA) {
    await delay(500);

    let filtered = mockGeneratedDocuments.filter((doc) => doc.student_id === studentId);

    // Apply filters
    if (filters?.type) {
      filtered = filtered.filter((doc) => doc.type === filters.type);
    }
    if (filters?.status) {
      filtered = filtered.filter((doc) => doc.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.document_number.toLowerCase().includes(searchLower) ||
          doc.student?.full_name?.toLowerCase().includes(searchLower) ||
          doc.student?.student_number?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    if (filters?.page && filters?.limit) {
      const page = filters.page;
      const limit = filters.limit;
      const start = (page - 1) * limit;
      const end = start + limit;
      filtered = filtered.slice(start, end);
    }

    return filtered;
  }

  // Build query params
  const queryParams = new URLSearchParams();
  if (filters?.type) queryParams.set("filter[type]", filters.type);
  if (filters?.status) queryParams.set("filter[status]", filters.status);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  const queryString = queryParams.toString();
  const url = `/documents/students/${studentId}${queryString ? `?${queryString}` : ""}`;

  const response = await api.get<{
    data: GeneratedDocument[];
    message?: string;
  }>(url);

  // Backend returns { data: [...], message: "..." }
  return response.data || response;
}

/**
 * Get all documents (admin view - not filtered by student)
 */
export async function getAllDocuments(
  filters?: DocumentFilters & { student_id?: string }
): Promise<GeneratedDocument[]> {
  if (USE_MOCK_DATA) {
    await delay(500);

    let filtered = [...mockGeneratedDocuments];

    // Filter by student if provided
    if (filters?.student_id) {
      filtered = filtered.filter((doc: GeneratedDocument) => doc.student_id === filters.student_id);
    }

    // Apply filters
    if (filters?.type) {
      filtered = filtered.filter((doc: GeneratedDocument) => doc.type === filters.type);
    }
    if (filters?.status) {
      filtered = filtered.filter((doc: GeneratedDocument) => doc.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (doc: GeneratedDocument) =>
          doc.document_number.toLowerCase().includes(searchLower) ||
          doc.student?.full_name?.toLowerCase().includes(searchLower) ||
          doc.student?.student_number?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    if (filters?.page && filters?.limit) {
      const page = filters.page;
      const limit = filters.limit;
      const start = (page - 1) * limit;
      const end = start + limit;
      filtered = filtered.slice(start, end);
    }

    return filtered;
  }

  // Build query params
  const queryParams = new URLSearchParams();
  if (filters?.student_id) queryParams.set("filter[student_id]", filters.student_id);
  if (filters?.type) queryParams.set("filter[type]", filters.type);
  if (filters?.status) queryParams.set("filter[status]", filters.status);
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.page) queryParams.set("page", filters.page.toString());
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  const queryString = queryParams.toString();
  const url = `/documents${queryString ? `?${queryString}` : ""}`;

  const response = await api.get<{
    data: GeneratedDocument[];
    total?: number;
    page?: number;
    limit?: number;
    total_pages?: number;
  }>(url);

  return response.data || [];
}

/**
 * Download a document as PDF blob
 */
export async function downloadDocument(documentId: string): Promise<Blob> {
  if (USE_MOCK_DATA) {
    await delay(500);

    // For mock mode, fetch a real PDF from the public folder
    const document = mockGeneratedDocuments.find((doc) => doc.id === documentId);

    // Use different PDFs based on document type
    let pdfPath = "/pdf/cert d'inscription.pdf"; // Default certificate

    if (document) {
      switch (document.type) {
        case DocumentType.CERTIFICATE:
          pdfPath = "/pdf/cert d'inscription.pdf";
          break;
        case DocumentType.ATTESTATION:
          pdfPath = "/pdf/NDEYE_ARAME_BEYE_attestation.pdf";
          break;
        case DocumentType.TRANSCRIPT:
          pdfPath = "/pdf/cert d'inscription.pdf"; // Use certificate as fallback
          break;
        default:
          pdfPath = "/pdf/cert d'inscription.pdf";
      }
    }

    try {
      const response = await fetch(pdfPath);
      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Error fetching mock PDF:", error);
      // Fallback to a simple PDF if files are not found
      const fallbackPdf =
        "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n4 0 obj\n<< /Length 80 >>\nstream\nBT\n/F1 18 Tf\n50 700 Td\n(Document non disponible en mode test) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000015 00000 n\n0000000068 00000 n\n0000000131 00000 n\n0000000329 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n459\n%%EOF";
      return new Blob([fallbackPdf], { type: "application/pdf" });
    }
  }

  // Use apiFetch directly for blob download (expectJson: false)
  // This function is only called client-side, so we can safely use window
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "");

  if (!BASE_URL) {
    throw new Error("API base URL is not configured");
  }

  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  const authToken = session?.accessToken;

  const response = await fetch(`${BASE_URL}/api/v1/documents/${documentId}/download`, {
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download document: ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Issue a document (change status from DRAFT to ISSUED)
 */
export async function issueDocument(documentId: string): Promise<GeneratedDocument> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const document = mockGeneratedDocuments.find((doc: GeneratedDocument) => doc.id === documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Update document status
    document.status = DocumentStatus.ISSUED;
    document.issued_at = new Date().toISOString();

    return { ...document };
  }

  const response = await api.post<{
    data: GeneratedDocument;
    message: string;
  }>(`/documents/${documentId}/issue`);

  return response.data || response;
}

/**
 * Revoke a document (change status to REVOKED)
 */
export async function revokeDocument(
  documentId: string,
  reason?: string
): Promise<GeneratedDocument> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const document = mockGeneratedDocuments.find((doc: GeneratedDocument) => doc.id === documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Update document status
    document.status = DocumentStatus.REVOKED;
    document.revoked_at = new Date().toISOString();
    document.metadata = {
      ...document.metadata,
      revocation_reason: reason,
      revoked_at: new Date().toISOString(),
    };

    return { ...document };
  }

  const response = await api.post<{
    data: GeneratedDocument;
    message: string;
  }>(`/documents/${documentId}/revoke`, { reason });

  return response.data || response;
}

// =====================
// VERIFICATION (PUBLIC)
// =====================

/**
 * Verify a document (public endpoint, no auth required)
 */
export async function verifyDocument(
  documentNumber: string,
  studentId?: string
): Promise<DocumentVerificationResponse> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const document = mockGeneratedDocuments.find(
      (doc: GeneratedDocument) =>
        doc.document_number === documentNumber && doc.status === DocumentStatus.ISSUED
    );

    if (!document) {
      return {
        valid: false,
        message: "Document not found or not valid",
      };
    }

    // If studentId is provided, verify it matches
    if (studentId && document.student_id !== studentId) {
      return {
        valid: false,
        message: "Document does not belong to this student",
      };
    }

    return {
      valid: true,
      document: {
        ...document,
        // Remove sensitive data for public verification
        file_path: "", // Don't expose file path
        metadata: undefined, // Don't expose metadata
      },
      message: "Document is valid",
    };
  }

  const queryParams = new URLSearchParams();
  if (studentId) queryParams.set("student_id", studentId);

  const queryString = queryParams.toString();
  const url = `/documents/verify/${documentNumber}${queryString ? `?${queryString}` : ""}`;

  // Public endpoint - no auth token needed
  const response = await api.get<DocumentVerificationResponse>(url, {
    // Override to not send auth token for public endpoint
    headers: {},
  });

  return response;
}
