/**
 * Documents API Service
 * Handles all API calls related to document generation and management
 */

import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";
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
import { DocumentType, DocumentStatus } from "@/types/document";

const buildDocumentNumber = (prefix: string) => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const checksum = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `${prefix}-${year}-${random}-${checksum}`;
};

const buildFilePath = (type: DocumentType, documentNumber: string) => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  return `documents/${type}/${year}/${month}/${documentNumber}.pdf`;
};

const normalizeMetadata = (metadata?: Record<string, unknown>) => {
  if (!metadata) return null;
  return Object.entries(metadata).map(([key, value]) => `${key}:${String(value)}`);
};

const resolveGeneratedBy = async (): Promise<string> => {
  try {
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    const userId = (session?.user as { id?: string })?.id;
    return userId || session?.user?.email || "system";
  } catch {
    return "system";
  }
};

const createGeneratedDocument = async (
  input: {
    student_id: string;
    type: DocumentType;
    metadata?: Record<string, unknown>;
  },
  prefix: string
): Promise<GeneratedDocument> => {
  const documentNumber = buildDocumentNumber(prefix);
  const generatedBy = await resolveGeneratedBy();

  const payload = {
    student_id: input.student_id,
    type: input.type,
    document_number: documentNumber,
    file_path: buildFilePath(input.type, documentNumber),
    generated_by: generatedBy,
    metadata: normalizeMetadata(input.metadata),
    generated_at: new Date().toISOString(),
    status: DocumentStatus.DRAFT,
  };

  const response = await api.post("/generated-documents", payload);
  return unwrapData<GeneratedDocument>(response);
};

// =====================
// GENERATION ENDPOINTS
// =====================

export async function generateTranscript(
  input: GenerateTranscriptInput
): Promise<GeneratedDocument> {
  return createGeneratedDocument(
    {
      student_id: input.student_id,
      type: DocumentType.TRANSCRIPT,
      metadata: {
        academic_year: input.academic_year ?? null,
        include_all_semesters: input.include_all ?? true,
      },
    },
    "TRS"
  );
}

export async function generateCertificate(
  input: GenerateCertificateInput
): Promise<GeneratedDocument> {
  return createGeneratedDocument(
    {
      student_id: input.student_id,
      type: DocumentType.CERTIFICATE,
      metadata: {
        purpose: input.purpose ?? null,
        academic_year: input.academic_year ?? null,
      },
    },
    "CER"
  );
}

export async function generateIdCard(input: GenerateIdCardInput): Promise<GeneratedDocument> {
  return createGeneratedDocument(
    {
      student_id: input.student_id,
      type: DocumentType.ID_CARD,
    },
    "IDC"
  );
}

export async function generateDiploma(input: GenerateDiplomaInput): Promise<GeneratedDocument> {
  return createGeneratedDocument(
    {
      student_id: input.student_id,
      type: DocumentType.DIPLOMA,
      metadata: {
        degree: input.degree ?? null,
        graduation_date: input.graduation_date ?? null,
        honors: input.honors ?? null,
      },
    },
    "DIP"
  );
}

export async function generateAttestation(
  input: GenerateAttestationInput
): Promise<GeneratedDocument> {
  return createGeneratedDocument(
    {
      student_id: input.student_id,
      type: DocumentType.ATTESTATION,
      metadata: {
        custom_text: input.custom_text,
      },
    },
    "ATT"
  );
}

// =====================
// MANAGEMENT ENDPOINTS
// =====================

export async function getStudentDocuments(
  studentId: string,
  filters?: DocumentFilters
): Promise<GeneratedDocument[]> {
  const response = await api.get("/generated-documents");
  const payload = unwrapData<{ data: GeneratedDocument[] }>(response);
  let documents = Array.isArray(payload?.data) ? payload.data : [];

  documents = documents.filter((doc) => doc.student_id === studentId);

  if (filters?.type) {
    documents = documents.filter((doc) => doc.type === filters.type);
  }
  if (filters?.status) {
    documents = documents.filter((doc) => doc.status === filters.status);
  }
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    documents = documents.filter(
      (doc) =>
        doc.document_number.toLowerCase().includes(searchLower) ||
        doc.student?.full_name?.toLowerCase().includes(searchLower) ||
        doc.student?.student_number?.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.page && filters?.limit) {
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    documents = documents.slice(start, end);
  }

  return documents;
}

export async function getAllDocuments(
  filters?: DocumentFilters & { student_id?: string }
): Promise<GeneratedDocument[]> {
  const response = await api.get("/generated-documents");
  const payload = unwrapData<{ data: GeneratedDocument[] }>(response);
  let documents = Array.isArray(payload?.data) ? payload.data : [];

  if (filters?.student_id) {
    documents = documents.filter((doc) => doc.student_id === filters.student_id);
  }
  if (filters?.type) {
    documents = documents.filter((doc) => doc.type === filters.type);
  }
  if (filters?.status) {
    documents = documents.filter((doc) => doc.status === filters.status);
  }
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    documents = documents.filter(
      (doc) =>
        doc.document_number.toLowerCase().includes(searchLower) ||
        doc.student?.full_name?.toLowerCase().includes(searchLower) ||
        doc.student?.student_number?.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.page && filters?.limit) {
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    documents = documents.slice(start, end);
  }

  return documents;
}

export async function downloadDocument(documentId: string): Promise<Blob> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "");

  if (!baseUrl) {
    throw new Error("API base URL is not configured");
  }

  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  const authToken = session?.accessToken;

  const response = await fetch(`${baseUrl}/api/v1/documents/${documentId}/download`, {
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download document: ${response.statusText}`);
  }

  return response.blob();
}

export async function issueDocument(documentId: string): Promise<GeneratedDocument> {
  const response = await api.put(`/generated-documents/${documentId}`, {
    status: DocumentStatus.ISSUED,
    issued_at: new Date().toISOString(),
  });
  return unwrapData<GeneratedDocument>(response);
}

export async function revokeDocument(
  documentId: string,
  reason?: string
): Promise<GeneratedDocument> {
  const response = await api.put(`/generated-documents/${documentId}`, {
    status: DocumentStatus.REVOKED,
    metadata: normalizeMetadata({ reason: reason ?? "revoked" }),
  });
  return unwrapData<GeneratedDocument>(response);
}

// =====================
// VERIFICATION (PUBLIC)
// =====================

export async function verifyDocument(
  documentNumber: string,
  _studentId?: string
): Promise<DocumentVerificationResponse> {
  const response = await api.get(`/generated-documents/verify/${documentNumber}`, {
    headers: {},
  });
  return response as DocumentVerificationResponse;
}
