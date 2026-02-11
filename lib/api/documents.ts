/**
 * Documents API Service
 * Handles all API calls related to student documents
 */

import { api } from "@/lib/api-client";
import { toPaginated, unwrapData } from "@/lib/api/api-response";
import type { Document, CreateDocumentInput, UpdateDocumentInput } from "@/types/student";

/**
 * Get all documents for a student
 */
export async function getDocuments(studentId: string): Promise<Document[]> {
  const response = await api.get(`/documents/student/${studentId}`);
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
  formData.append("document_file", input.document);
  formData.append("type", input.type);
  formData.append("student_id", input.student_id);
  if (input.notes) formData.append("notes", input.notes);

  const response = await api.post(`/documents`, formData, {
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
  const response = await api.post(`/documents/${id}/approve`, {
    notes: notes ?? null,
  });
  return unwrapData<Document>(response);
}

/**
 * Reject a document
 */
export async function rejectDocument(
  id: string,
  reason: string,
  notes?: string
): Promise<Document> {
  const response = await api.post(`/documents/${id}/reject`, {
    reason,
    notes: notes ?? null,
  });
  return unwrapData<Document>(response);
}
