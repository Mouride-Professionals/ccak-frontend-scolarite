/**
 * Document Generation Module Types
 * Based on backend DocumentController and Generated_Document model
 */

// =====================
// ENUMS
// =====================

export enum DocumentType {
  TRANSCRIPT = "TRANSCRIPT",
  CERTIFICATE = "CERTIFICATE",
  ID_CARD = "ID_CARD",
  DIPLOMA = "DIPLOMA",
  ATTESTATION = "ATTESTATION",
}

export enum DocumentStatus {
  DRAFT = "DRAFT",
  ISSUED = "ISSUED",
  REVOKED = "REVOKED",
}

// =====================
// INTERFACES
// =====================

/**
 * Generated Document
 * Represents a generated academic document (transcript, certificate, etc.)
 */
export interface GeneratedDocument {
  id: string;
  student_id: string;
  type: DocumentType;
  document_number: string;
  file_path: string;
  status: DocumentStatus;
  generated_at: string; // ISO date string
  issued_at?: string; // ISO date string
  revoked_at?: string; // ISO date string
  metadata?: Record<string, unknown> | string[] | null; // Additional document metadata

  // Populated relations (optional, for joined queries)
  student?: {
    id: string;
    email: string;
    full_name?: string;
    student_number?: string;
  };
  generated_by?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

// =====================
// FORM TYPES
// =====================

/**
 * Input for generating a transcript
 */
export interface GenerateTranscriptInput {
  student_id: string;
  academic_year?: string;
  include_all?: boolean;
}

/**
 * Input for generating a certificate
 */
export interface GenerateCertificateInput {
  student_id: string;
  purpose?: string;
  academic_year?: string;
}

/**
 * Input for generating an ID card
 */
export interface GenerateIdCardInput {
  student_id: string;
}

/**
 * Input for generating a diploma
 */
export interface GenerateDiplomaInput {
  student_id: string;
  degree?: string;
  graduation_date?: string;
  honors?: "PASSABLE" | "ASSEZ_BIEN" | "BIEN" | "TRES_BIEN";
}

/**
 * Input for generating an attestation
 */
export interface GenerateAttestationInput {
  student_id: string;
  custom_text: string;
}

/**
 * Input for revoking a document
 */
export interface RevokeDocumentInput {
  reason?: string;
}

// =====================
// FILTERS & QUERIES
// =====================

/**
 * Filters for querying documents
 */
export interface DocumentFilters {
  type?: DocumentType;
  status?: DocumentStatus;
  page?: number;
  limit?: number;
  search?: string;
}

// =====================
// API RESPONSES
// =====================

/**
 * Response for document verification (public endpoint)
 */
export interface DocumentVerificationResponse {
  valid: boolean;
  document?: GeneratedDocument;
  message: string;
}

/**
 * Response for listing documents
 */
export interface DocumentsResponse {
  data: GeneratedDocument[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}
