/**
 * Documents API Service
 * Handles all API calls related to student documents
 */

import { api } from "@/lib/api-client";
import type {
  Document,
  DocumentsResponse,
  CreateDocumentInput,
  UpdateDocumentInput,
} from "@/types/student";
import { DocumentStatus } from "@/types/student";
import { mockDocuments } from "./mock-data";

// Flag to toggle between mock data and real API
const USE_MOCK_DATA = true;

/**
 * Simulate API delay for realistic testing
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all documents for a student
 */
export async function getDocuments(studentId: string): Promise<Document[]> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const documents = mockDocuments.filter((d) => d.student_id === studentId);
    return documents;
  }

  return api.get<Document[]>(`/students/${studentId}/documents`);
}

/**
 * Get a single document by ID
 */
export async function getDocument(id: string): Promise<Document> {
  if (USE_MOCK_DATA) {
    await delay(200);

    const document = mockDocuments.find((d) => d.id === id);
    if (!document) {
      throw new Error(`Document not found: ${id}`);
    }
    return document;
  }

  return api.get<Document>(`/documents/${id}`);
}

/**
 * Create a new document
 */
export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  if (USE_MOCK_DATA) {
    await delay(600);

    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      ...input,
      status: DocumentStatus.PENDING,
      uploaded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to mock data (in-memory only)
    mockDocuments.push(newDocument);

    return newDocument;
  }

  return api.post<Document>("/documents", input);
}

/**
 * Update an existing document
 */
export async function updateDocument(id: string, input: UpdateDocumentInput): Promise<Document> {
  if (USE_MOCK_DATA) {
    await delay(400);

    const index = mockDocuments.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Document not found: ${id}`);
    }

    const updated: Document = {
      ...mockDocuments[index],
      ...input,
      reviewed_at: input.status && input.status !== "PENDING" ? new Date().toISOString() : mockDocuments[index].reviewed_at,
      updated_at: new Date().toISOString(),
    };

    mockDocuments[index] = updated;
    return updated;
  }

  return api.put<Document>(`/documents/${id}`, input);
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(300);

    const index = mockDocuments.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Document not found: ${id}`);
    }

    mockDocuments.splice(index, 1);
    return;
  }

  return api.del<void>(`/documents/${id}`);
}

/**
 * Approve a document
 */
export async function approveDocument(id: string, reviewedBy: string, notes?: string): Promise<Document> {
  return updateDocument(id, {
    status: DocumentStatus.APPROVED,
    reviewed_by: reviewedBy,
    notes,
  } as UpdateDocumentInput);
}

/**
 * Reject a document
 */
export async function rejectDocument(id: string, reviewedBy: string, notes: string): Promise<Document> {
  return updateDocument(id, {
    status: DocumentStatus.REJECTED,
    reviewed_by: reviewedBy,
    notes,
  } as UpdateDocumentInput);
}