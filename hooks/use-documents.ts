"use client";

/**
 * React Query hooks for Documents
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateDocumentInput, UpdateDocumentInput } from "@/types/student";
import * as documentsApi from "@/lib/api/documents";

// =====================
// QUERY KEYS
// =====================

export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (studentId: string) => [...documentKeys.lists(), studentId] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

// =====================
// QUERIES
// =====================

/**
 * Get all documents for a student
 */
export function useDocuments(studentId: string, enabled = true) {
  return useQuery({
    queryKey: documentKeys.list(studentId),
    queryFn: () => documentsApi.getDocuments(studentId),
    enabled: enabled && !!studentId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get a single document by ID
 */
export function useDocument(id: string, enabled = true) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentsApi.getDocument(id),
    enabled: enabled && !!id,
    staleTime: 30000,
  });
}

// =====================
// MUTATIONS
// =====================

/**
 * Create a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDocumentInput) => documentsApi.createDocument(input),
    onSuccess: (data) => {
      // Invalidate the student's documents list
      queryClient.invalidateQueries({ queryKey: documentKeys.list(data.student_id) });
    },
  });
}

/**
 * Update an existing document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDocumentInput }) =>
      documentsApi.updateDocument(id, input),
    onSuccess: (data) => {
      // Update the specific document in cache
      queryClient.setQueryData(documentKeys.detail(data.id), data);
      // Invalidate the student's documents list
      queryClient.invalidateQueries({ queryKey: documentKeys.list(data.student_id) });
    },
  });
}

/**
 * Delete a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: documentKeys.detail(id) });
      // Invalidate all lists (we don't know which student this document belonged to)
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

/**
 * Approve a document
 */
export function useApproveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      documentsApi.approveDocument(id, notes),
    onSuccess: (data) => {
      queryClient.setQueryData(documentKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: documentKeys.list(data.student_id) });
    },
  });
}

/**
 * Reject a document
 */
export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason, notes }: { id: string; reason: string; notes?: string }) =>
      documentsApi.rejectDocument(id, reason, notes),
    onSuccess: (data) => {
      queryClient.setQueryData(documentKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: documentKeys.list(data.student_id) });
    },
  });
}
