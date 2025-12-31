/**
 * Documents API Service
 * Handles all API calls related to student documents
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type {
  Document,
  DocumentsResponse,
  CreateDocumentInput,
  UpdateDocumentInput,
} from "@/types/student";
import { DocumentStatus } from "@/types/student";

/**
 * Get all documents for a student
 */
export async function getDocuments(studentId: string): Promise<Document[]> {
  const response = await api.get(`/students/${studentId}/documents`);
  return toPaginated<Document>(response).data;
}

/**
 * Get a single document by ID
 */
export async function getDocument(id: string): Promise<Document> {
  const response = await api.get(`/documents/${id}`);
  return unwrapData<Document>(response);
}

/**
 * Create a new document
 */
export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const formData = new FormData();
  formData.append("document", input.document);
  formData.append("type", input.type);

  const response = await api.post(`/students/${input.student_id}/documents`, formData, {
    headers: {},
  });
  return unwrapData<Document>(response);
}

/**
 * Update an existing document
 */
export async function updateDocument(id: string, input: UpdateDocumentInput): Promise<Document> {
  const response = await api.put(`/documents/${id}`, input);
  return unwrapData<Document>(response);
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
  return api.del<void>(`/documents/${id}`);
}

/**
 * Approve a document
 */
export async function approveDocument(id: string, notes?: string): Promise<Document> {
  const response = await api.put(`/documents/${id}/review`, {
    status: DocumentStatus.APPROVED,
    notes: notes ?? null,
  });
  return unwrapData<Document>(response);
}

/**
 * Reject a document
 */
export async function rejectDocument(id: string, notes: string): Promise<Document> {
  const response = await api.put(`/documents/${id}/review`, {
    status: DocumentStatus.REJECTED,
    notes,
  });
  return unwrapData<Document>(response);
}
