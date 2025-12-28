/**
 * Mock Data for Development
 * This file contains static data for testing while backend is being developed
 */

import type { AcademicYear, AcademicProgram, FacultyMember } from "@/types/academic";
import { AcademicLevel, FacultyRank } from "@/types/academic";
import type { DeliberationSession } from "@/types/deliberation";
import { DeliberationStatus } from "@/types/deliberation";
import type { GeneratedDocument } from "@/types/document";
import { DocumentType, DocumentStatus } from "@/types/document";

// =====================
// ACADEMIC YEARS
// =====================

export const mockAcademicYears: AcademicYear[] = [
  {
    id: "ay-1",
    name: "2024-2025",
    start_date: "2024-09-01",
    end_date: "2025-06-30",
    is_current: true,
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
  {
    id: "ay-2",
    name: "2023-2024",
    start_date: "2023-09-01",
    end_date: "2024-06-30",
    is_current: false,
    created_at: "2023-06-01T00:00:00Z",
    updated_at: "2023-06-01T00:00:00Z",
  },
];

// =====================
// ACADEMIC PROGRAMS
// =====================

export const mockAcademicPrograms: AcademicProgram[] = [
  {
    id: "prog-1",
    department_id: "dept-1",
    name: "Licence Informatique",
    level: AcademicLevel.LICENCE,
    duration_semesters: 6,
    total_credits_required: 180,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    department: {
      id: "dept-1",
      faculty_id: "fac-1",
      name: "Informatique",
      code: "INFO",
      head_id: null,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "prog-2",
    department_id: "dept-2",
    name: "Licence Mathématiques",
    level: AcademicLevel.LICENCE,
    duration_semesters: 6,
    total_credits_required: 180,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    department: {
      id: "dept-2",
      faculty_id: "fac-1",
      name: "Mathématiques",
      code: "MATH",
      head_id: null,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "prog-3",
    department_id: "dept-1",
    name: "Master Génie Logiciel",
    level: AcademicLevel.MASTER,
    duration_semesters: 4,
    total_credits_required: 120,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    department: {
      id: "dept-1",
      faculty_id: "fac-1",
      name: "Informatique",
      code: "INFO",
      head_id: null,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
];

// =====================
// FACULTY MEMBERS
// =====================

export const mockFacultyMembers: FacultyMember[] = [
  {
    id: "fac-mem-1",
    user_id: "user-1",
    staff_number: "PROF001",
    full_name: "Dr. Mamadou Diallo",
    phone: "+221771234567",
    address: "Dakar, Sénégal",
    department_id: "dept-1",
    rank: FacultyRank.PROFESSEUR,
    contract_type: "PERMANENT",
    hire_date: "2015-09-01",
    is_active: true,
    created_at: "2015-09-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "fac-mem-2",
    user_id: "user-2",
    staff_number: "PROF002",
    full_name: "Dr. Aminata Sow",
    phone: "+221772345678",
    address: "Dakar, Sénégal",
    department_id: "dept-1",
    rank: FacultyRank.MAITRE_CONF,
    contract_type: "PERMANENT",
    hire_date: "2018-09-01",
    is_active: true,
    created_at: "2018-09-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "fac-mem-3",
    user_id: "user-3",
    staff_number: "PROF003",
    full_name: "Dr. Ousmane Ndiaye",
    phone: "+221773456789",
    address: "Dakar, Sénégal",
    department_id: "dept-2",
    rank: FacultyRank.MAITRE_ASS,
    contract_type: "PERMANENT",
    hire_date: "2020-09-01",
    is_active: true,
    created_at: "2020-09-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "fac-mem-4",
    user_id: "user-4",
    staff_number: "PROF004",
    full_name: "Dr. Fatou Ba",
    phone: "+221774567890",
    address: "Dakar, Sénégal",
    department_id: "dept-1",
    rank: FacultyRank.ASSISTANT,
    contract_type: "PERMANENT",
    hire_date: "2022-09-01",
    is_active: true,
    created_at: "2022-09-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// =====================
// GENERATED DOCUMENTS
// =====================

export const mockGeneratedDocuments: GeneratedDocument[] = [
  {
    id: "doc-1",
    student_id: "student-1",
    type: DocumentType.TRANSCRIPT,
    document_number: "TRS-2025-1234-AB",
    file_path: "documents/TRANSCRIPT/2025/12/TRS-2025-1234-AB.pdf",
    status: DocumentStatus.ISSUED,
    generated_at: "2025-12-15T10:30:00Z",
    issued_at: "2025-12-15T10:35:00Z",
    metadata: {
      academic_year: "2024-2025",
      include_all_semesters: true,
      with_watermark: true,
      with_qr_code: true,
    },
    student: {
      id: "student-1",
      email: "student1@ucak.sn",
      full_name: "Amadou Diallo",
      student_number: "STU-2024-001",
    },
    generated_by: {
      id: "staff-1",
      email: "staff@ucak.sn",
      full_name: "Admin Staff",
    },
  },
  {
    id: "doc-2",
    student_id: "student-1",
    type: DocumentType.CERTIFICATE,
    document_number: "CER-2025-5678-CD",
    file_path: "documents/CERTIFICATE/2025/12/CER-2025-5678-CD.pdf",
    status: DocumentStatus.ISSUED,
    generated_at: "2025-12-10T14:20:00Z",
    issued_at: "2025-12-10T14:25:00Z",
    metadata: {
      purpose: "Inscription à un concours",
      academic_year: "2024-2025",
      with_watermark: true,
      with_qr_code: true,
    },
    student: {
      id: "student-1",
      email: "student1@ucak.sn",
      full_name: "Amadou Diallo",
      student_number: "STU-2024-001",
    },
    generated_by: {
      id: "staff-1",
      email: "staff@ucak.sn",
      full_name: "Admin Staff",
    },
  },
  {
    id: "doc-3",
    student_id: "student-1",
    type: DocumentType.ID_CARD,
    document_number: "IDC-2025-9012-EF",
    file_path: "documents/ID_CARD/2025/12/IDC-2025-9012-EF.pdf",
    status: DocumentStatus.ISSUED,
    generated_at: "2025-12-01T09:00:00Z",
    issued_at: "2025-12-01T09:05:00Z",
    metadata: {
      with_watermark: false,
      with_qr_code: true,
    },
    student: {
      id: "student-1",
      email: "student1@ucak.sn",
      full_name: "Amadou Diallo",
      student_number: "STU-2024-001",
    },
    generated_by: {
      id: "staff-1",
      email: "staff@ucak.sn",
      full_name: "Admin Staff",
    },
  },
  {
    id: "doc-4",
    student_id: "student-2",
    type: DocumentType.TRANSCRIPT,
    document_number: "TRS-2025-3456-GH",
    file_path: "documents/TRANSCRIPT/2025/12/TRS-2025-3456-GH.pdf",
    status: DocumentStatus.DRAFT,
    generated_at: "2025-12-20T11:00:00Z",
    metadata: {
      academic_year: "2024-2025",
      include_all_semesters: false,
      with_watermark: true,
      with_qr_code: true,
    },
    student: {
      id: "student-2",
      email: "student2@ucak.sn",
      full_name: "Fatou Ndiaye",
      student_number: "STU-2024-002",
    },
    generated_by: {
      id: "staff-1",
      email: "staff@ucak.sn",
      full_name: "Admin Staff",
    },
  },
  {
    id: "doc-5",
    student_id: "student-2",
    type: DocumentType.DIPLOMA,
    document_number: "DIP-2025-7890-IJ",
    file_path: "documents/DIPLOMA/2025/12/DIP-2025-7890-IJ.pdf",
    status: DocumentStatus.ISSUED,
    generated_at: "2025-12-18T15:30:00Z",
    issued_at: "2025-12-18T15:35:00Z",
    metadata: {
      degree: "Licence",
      graduation_date: "2025-06-30",
      honors: "BIEN",
      with_watermark: true,
      with_qr_code: true,
    },
    student: {
      id: "student-2",
      email: "student2@ucak.sn",
      full_name: "Fatou Ndiaye",
      student_number: "STU-2024-002",
    },
    generated_by: {
      id: "staff-1",
      email: "staff@ucak.sn",
      full_name: "Admin Staff",
    },
  },
  {
    id: "doc-6",
    student_id: "student-3",
    type: DocumentType.ATTESTATION,
    document_number: "ATT-2025-2468-KL",
    file_path: "documents/ATTESTATION/2025/12/ATT-2025-2468-KL.pdf",
    status: DocumentStatus.ISSUED,
    generated_at: "2025-12-12T13:45:00Z",
    issued_at: "2025-12-12T13:50:00Z",
    metadata: {
      custom_text: "Je soussigné(e), certifie que l'étudiant(e) est régulièrement inscrit(e) à l'UCAK pour l'année académique 2024-2025.",
      with_watermark: true,
      with_qr_code: true,
    },
    student: {
      id: "student-3",
      email: "student3@ucak.sn",
      full_name: "Ibrahima Sarr",
      student_number: "STU-2024-003",
    },
    generated_by: {
      id: "staff-1",
      email: "staff@ucak.sn",
      full_name: "Admin Staff",
    },
  },
  {
    id: "doc-7",
    student_id: "student-1",
    type: DocumentType.ATTESTATION,
    document_number: "ATT-2025-1357-MN",
    file_path: "documents/ATTESTATION/2025/11/ATT-2025-1357-MN.pdf",
    status: DocumentStatus.REVOKED,
    generated_at: "2025-11-20T10:00:00Z",
    issued_at: "2025-11-20T10:05:00Z",
    revoked_at: "2025-12-05T14:00:00Z",
    metadata: {
      custom_text: "Attestation de scolarité",
      revocation_reason: "Document perdu, nouvelle émission demandée",
      revoked_by: "staff-1",
      with_watermark: true,
      with_qr_code: true,
    },
    student: {
      id: "student-1",
      email: "student1@ucak.sn",
      full_name: "Amadou Diallo",
      student_number: "STU-2024-001",
    },
    generated_by: {
      id: "staff-1",
      email: "staff@ucak.sn",
      full_name: "Admin Staff",
    },
  },
  {
    id: "doc-8",
    student_id: "student-3",
    type: DocumentType.CERTIFICATE,
    document_number: "CER-2025-3691-OP",
    file_path: "documents/CERTIFICATE/2025/12/CER-2025-3691-OP.pdf",
    status: DocumentStatus.DRAFT,
    generated_at: "2025-12-22T16:00:00Z",
    metadata: {
      purpose: "Demande de bourse",
      academic_year: "2024-2025",
      with_watermark: true,
      with_qr_code: true,
    },
    student: {
      id: "student-3",
      email: "student3@ucak.sn",
      full_name: "Ibrahima Sarr",
      student_number: "STU-2024-003",
    },
    generated_by: {
      id: "staff-1",
      email: "staff@ucak.sn",
      full_name: "Admin Staff",
    },
  },
];

// =====================
// DELIBERATION SESSIONS
// =====================

export const mockDeliberationSessions: DeliberationSession[] = [
  {
    id: "delib-1",
    academic_program_id: "prog-1",
    academic_year_id: "ay-1",
    semester: 1,
    session_name: "Jury L1 Informatique S1 - Session Normale",
    session_date: "2025-01-15",
    status: DeliberationStatus.SCHEDULED,
    presided_by: "fac-mem-1",
    jury_members: ["fac-mem-2", "fac-mem-4"],
    created_at: "2024-12-01T00:00:00Z",
    updated_at: "2024-12-01T00:00:00Z",
    academic_program: {
      id: "prog-1",
      name: "Licence Informatique",
      level: "LICENCE",
    },
    academic_year: {
      id: "ay-1",
      name: "2024-2025",
    },
    president: {
      id: "fac-mem-1",
      full_name: "Dr. Mamadou Diallo",
      rank: "PROFESSEUR",
    },
    jury: [
      {
        id: "fac-mem-2",
        full_name: "Dr. Aminata Sow",
        rank: "MAITRE_CONF",
      },
      {
        id: "fac-mem-4",
        full_name: "Dr. Fatou Ba",
        rank: "ASSISTANT",
      },
    ],
    stats: {
      total_students: 45,
      results_count: 0,
    },
  },
  {
    id: "delib-2",
    academic_program_id: "prog-1",
    academic_year_id: "ay-1",
    semester: 2,
    session_name: "Jury L1 Informatique S2 - Session Normale",
    session_date: "2025-06-20",
    status: DeliberationStatus.SCHEDULED,
    presided_by: "fac-mem-1",
    jury_members: ["fac-mem-2", "fac-mem-4"],
    created_at: "2024-12-15T00:00:00Z",
    updated_at: "2024-12-15T00:00:00Z",
    academic_program: {
      id: "prog-1",
      name: "Licence Informatique",
      level: "LICENCE",
    },
    academic_year: {
      id: "ay-1",
      name: "2024-2025",
    },
    president: {
      id: "fac-mem-1",
      full_name: "Dr. Mamadou Diallo",
      rank: "PROFESSEUR",
    },
    jury: [
      {
        id: "fac-mem-2",
        full_name: "Dr. Aminata Sow",
        rank: "MAITRE_CONF",
      },
      {
        id: "fac-mem-4",
        full_name: "Dr. Fatou Ba",
        rank: "ASSISTANT",
      },
    ],
    stats: {
      total_students: 42,
      results_count: 0,
    },
  },
  {
    id: "delib-3",
    academic_program_id: "prog-2",
    academic_year_id: "ay-1",
    semester: 1,
    session_name: "Jury L1 Mathématiques S1 - Session Normale",
    session_date: "2025-01-18",
    status: DeliberationStatus.IN_PROGRESS,
    presided_by: "fac-mem-3",
    jury_members: ["fac-mem-1"],
    created_at: "2024-12-01T00:00:00Z",
    updated_at: "2025-01-18T00:00:00Z",
    academic_program: {
      id: "prog-2",
      name: "Licence Mathématiques",
      level: "LICENCE",
    },
    academic_year: {
      id: "ay-1",
      name: "2024-2025",
    },
    president: {
      id: "fac-mem-3",
      full_name: "Dr. Ousmane Ndiaye",
      rank: "MAITRE_ASS",
    },
    jury: [
      {
        id: "fac-mem-1",
        full_name: "Dr. Mamadou Diallo",
        rank: "PROFESSEUR",
      },
    ],
    stats: {
      total_students: 38,
      results_count: 15,
    },
  },
  {
    id: "delib-4",
    academic_program_id: "prog-3",
    academic_year_id: "ay-2",
    semester: 4,
    session_name: "Jury Master GL S4 - Session Normale",
    session_date: "2024-06-25",
    status: DeliberationStatus.COMPLETED,
    presided_by: "fac-mem-1",
    jury_members: ["fac-mem-2", "fac-mem-4"],
    created_at: "2024-05-01T00:00:00Z",
    updated_at: "2024-06-26T00:00:00Z",
    academic_program: {
      id: "prog-3",
      name: "Master Génie Logiciel",
      level: "MASTER",
    },
    academic_year: {
      id: "ay-2",
      name: "2023-2024",
    },
    president: {
      id: "fac-mem-1",
      full_name: "Dr. Mamadou Diallo",
      rank: "PROFESSEUR",
    },
    jury: [
      {
        id: "fac-mem-2",
        full_name: "Dr. Aminata Sow",
        rank: "MAITRE_CONF",
      },
      {
        id: "fac-mem-4",
        full_name: "Dr. Fatou Ba",
        rank: "ASSISTANT",
      },
    ],
    stats: {
      total_students: 25,
      results_count: 25,
    },
  },
  {
    id: "delib-5",
    academic_program_id: "prog-1",
    academic_year_id: "ay-2",
    semester: 6,
    session_name: "Jury L3 Informatique S6 - Session Rattrapage",
    session_date: "2024-09-10",
    status: DeliberationStatus.CLOSED,
    presided_by: "fac-mem-1",
    jury_members: ["fac-mem-2"],
    created_at: "2024-08-01T00:00:00Z",
    updated_at: "2024-09-12T00:00:00Z",
    academic_program: {
      id: "prog-1",
      name: "Licence Informatique",
      level: "LICENCE",
    },
    academic_year: {
      id: "ay-2",
      name: "2023-2024",
    },
    president: {
      id: "fac-mem-1",
      full_name: "Dr. Mamadou Diallo",
      rank: "PROFESSEUR",
    },
    jury: [
      {
        id: "fac-mem-2",
        full_name: "Dr. Aminata Sow",
        rank: "MAITRE_CONF",
      },
    ],
    stats: {
      total_students: 12,
      results_count: 12,
    },
  },
];
