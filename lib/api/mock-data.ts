/**
 * Mock Data for Development
 * This file contains static data for testing while backend is being developed
 */

import type { AcademicYear, AcademicProgram, FacultyMember, Department } from "@/types/academic";
import { AcademicLevel, FacultyRank } from "@/types/academic";
import type { DeliberationSession } from "@/types/deliberation";
import { DeliberationStatus } from "@/types/deliberation";
import type { Student, Guardian, Document, Admin } from "@/types/student";
import { Gender, StudentStatus, GuardianRelationship, DocumentType, DocumentStatus } from "@/types/student";
import type { Faculty } from "@/types/faculty";
import type { Department as DepartmentType } from "@/types/department";

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
// FACULTIES
// =====================

export const mockFaculties: Faculty[] = [
  {
    id: "fac-1",
    name: "Faculté des Sciences et Technologies",
    code: "FST",
    dean_id: "user-1",
    dean: {
      id: "user-1",
      name: "Dr. Mamadou Diallo",
      email: "mamadou.diallo@ucak.sn",
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "fac-2",
    name: "Faculté des Lettres et Sciences Humaines",
    code: "FLSH",
    dean_id: "user-2",
    dean: {
      id: "user-2",
      name: "Dr. Aminata Sow",
      email: "aminata.sow@ucak.sn",
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "fac-3",
    name: "Faculté de Droit et des Sciences Juridiques",
    code: "FDSJ",
    dean_id: null,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// =====================
// DEPARTMENTS
// =====================

export const mockDepartments: DepartmentType[] = [
  {
    id: "dept-1",
    faculty_id: "fac-1",
    faculty: {
      id: "fac-1",
      name: "Faculté des Sciences et Technologies",
      code: "FST",
    },
    name: "Informatique",
    code: "INFO",
    head_id: "user-1",
    head: {
      id: "user-1",
      name: "Dr. Mamadou Diallo",
      email: "mamadou.diallo@ucak.sn",
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dept-2",
    faculty_id: "fac-1",
    faculty: {
      id: "fac-1",
      name: "Faculté des Sciences et Technologies",
      code: "FST",
    },
    name: "Mathématiques",
    code: "MATH",
    head_id: null,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dept-3",
    faculty_id: "fac-1",
    faculty: {
      id: "fac-1",
      name: "Faculté des Sciences et Technologies",
      code: "FST",
    },
    name: "Physique",
    code: "PHYS",
    head_id: "user-2",
    head: {
      id: "user-2",
      name: "Dr. Aminata Sow",
      email: "aminata.sow@ucak.sn",
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dept-4",
    faculty_id: "fac-2",
    faculty: {
      id: "fac-2",
      name: "Faculté des Lettres et Sciences Humaines",
      code: "FLSH",
    },
    name: "Littérature Française",
    code: "LITT",
    head_id: null,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
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

// =====================
// ADMINS
// =====================

export const mockAdmins: Admin[] = [
  {
    id: "admin-1",
    full_name: "Dr. Marie Diop",
  },
  {
    id: "admin-2",
    full_name: "M. Jean-Pierre Niang",
  },
];

// =====================
// GUARDIANS
// =====================

export const mockGuardians: Guardian[] = [
  {
    id: "guardian-1",
    student_id: "stud-1",
    full_name: "Mamadou Diallo Sr.",
    relationship: GuardianRelationship.FATHER,
    phone: "+221771234560",
    email: "mamadou.diallo.sr@email.com",
    address: "123 Rue de la Paix, Dakar, Sénégal",
    occupation: "Ingénieur",
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-09-01T00:00:00Z",
  },
  {
    id: "guardian-2",
    student_id: "stud-1",
    full_name: "Fatou Diallo",
    relationship: GuardianRelationship.MOTHER,
    phone: "+221772345671",
    email: "fatou.diallo@email.com",
    address: "123 Rue de la Paix, Dakar, Sénégal",
    occupation: "Enseignante",
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-09-01T00:00:00Z",
  },
  {
    id: "guardian-3",
    student_id: "stud-2",
    full_name: "Moussa Sow",
    relationship: GuardianRelationship.FATHER,
    phone: "+221773456782",
    email: "moussa.sow@email.com",
    address: "456 Avenue Léopold Sédar Senghor, Saint-Louis, Sénégal",
    occupation: "Commerçant",
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-09-01T00:00:00Z",
  },
  {
    id: "guardian-4",
    student_id: "stud-3",
    full_name: "Marie Ndiaye",
    relationship: GuardianRelationship.MOTHER,
    phone: "+221774567893",
    email: "marie.ndiaye@email.com",
    address: "789 Boulevard Général de Gaulle, Thiès, Sénégal",
    occupation: "Médecin",
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-09-01T00:00:00Z",
  },
];

// =====================
// DOCUMENTS
// =====================

export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    student_id: "stud-1",
    type: DocumentType.CNI,
    file_path: "/uploads/students/stud-1/cni.pdf",
    file_name: "cni_mamadou_diallo.pdf",
    status: DocumentStatus.APPROVED,
    reviewed_by: "admin-1",
    notes: "Document valide",
    uploaded_at: "2024-09-01T10:00:00Z",
    reviewed_at: "2024-09-02T14:30:00Z",
    created_at: "2024-09-01T10:00:00Z",
    updated_at: "2024-09-02T14:30:00Z",
    reviewer: {
      id: "admin-1",
      full_name: "Dr. Marie Diop",
    },
  },
  {
    id: "doc-2",
    student_id: "stud-1",
    type: DocumentType.BIRTH_CERT,
    file_path: "/uploads/students/stud-1/birth_cert.pdf",
    file_name: "acte_naissance_mamadou_diallo.pdf",
    status: DocumentStatus.APPROVED,
    reviewed_by: "admin-1",
    notes: "Certificat de naissance authentique",
    uploaded_at: "2024-09-01T10:15:00Z",
    reviewed_at: "2024-09-02T14:35:00Z",
    created_at: "2024-09-01T10:15:00Z",
    updated_at: "2024-09-02T14:35:00Z",
    reviewer: {
      id: "admin-1",
      full_name: "Dr. Marie Diop",
    },
  },
  {
    id: "doc-3",
    student_id: "stud-1",
    type: DocumentType.PHOTO,
    file_path: "/uploads/students/stud-1/photo.jpg",
    file_name: "photo_mamadou_diallo.jpg",
    status: DocumentStatus.PENDING,
    uploaded_at: "2024-09-01T10:30:00Z",
    created_at: "2024-09-01T10:30:00Z",
    updated_at: "2024-09-01T10:30:00Z",
  },
  {
    id: "doc-4",
    student_id: "stud-2",
    type: DocumentType.CNI,
    file_path: "/uploads/students/stud-2/cni.pdf",
    file_name: "cni_amidata_sow.pdf",
    status: DocumentStatus.REJECTED,
    reviewed_by: "admin-2",
    notes: "Document expiré - Veuillez fournir une CNI valide",
    uploaded_at: "2024-09-01T11:00:00Z",
    reviewed_at: "2024-09-03T09:15:00Z",
    created_at: "2024-09-01T11:00:00Z",
    updated_at: "2024-09-03T09:15:00Z",
    reviewer: {
      id: "admin-2",
      full_name: "M. Jean-Pierre Niang",
    },
  },
  {
    id: "doc-5",
    student_id: "stud-2",
    type: DocumentType.BAC_DIPLOMA,
    file_path: "/uploads/students/stud-2/bac.pdf",
    file_name: "bac_amidata_sow.pdf",
    status: DocumentStatus.APPROVED,
    reviewed_by: "admin-1",
    notes: "Diplôme du BAC validé",
    uploaded_at: "2024-09-01T11:15:00Z",
    reviewed_at: "2024-09-02T16:00:00Z",
    created_at: "2024-09-01T11:15:00Z",
    updated_at: "2024-09-02T16:00:00Z",
    reviewer: {
      id: "admin-1",
      full_name: "Dr. Marie Diop",
    },
  },
];

// =====================
// STUDENTS
// =====================

export const mockStudents: Student[] = [
  {
    id: "stud-1",
    user_id: "user-stud-1",
    student_number: "UCAK2024001",
    full_name: "Mamadou Diallo",
    gender: Gender.M,
    date_of_birth: "2000-05-15",
    place_of_birth: "Dakar",
    nationality: "Sénégalaise",
    phone: "+221771234567",
    emergency_contact_name: "Fatou Diallo",
    emergency_contact_phone: "+221772345678",
    address: "123 Rue de la Paix, Dakar, Sénégal",
    photo_url: null,
    status: StudentStatus.ACTIVE,
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-09-01T00:00:00Z",
  },
  {
    id: "stud-2",
    user_id: "user-stud-2",
    student_number: "UCAK2024002",
    full_name: "Aminata Sow",
    gender: Gender.F,
    date_of_birth: "2001-03-22",
    place_of_birth: "Saint-Louis",
    nationality: "Sénégalaise",
    phone: "+221772345678",
    emergency_contact_name: "Moussa Sow",
    emergency_contact_phone: "+221773456789",
    address: "456 Avenue Léopold Sédar Senghor, Saint-Louis, Sénégal",
    photo_url: null,
    status: StudentStatus.ACTIVE,
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-09-01T00:00:00Z",
  },
  {
    id: "stud-3",
    user_id: "user-stud-3",
    student_number: "UCAK2024003",
    full_name: "Ousmane Ndiaye",
    gender: Gender.M,
    date_of_birth: "1999-11-08",
    place_of_birth: "Thiès",
    nationality: "Sénégalaise",
    phone: "+221773456789",
    emergency_contact_name: "Marie Ndiaye",
    emergency_contact_phone: "+221774567890",
    address: "789 Boulevard Général de Gaulle, Thiès, Sénégal",
    photo_url: null,
    status: StudentStatus.ACTIVE,
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-09-01T00:00:00Z",
  },
  {
    id: "stud-4",
    user_id: "user-stud-4",
    student_number: "UCAK2024004",
    full_name: "Fatou Ba",
    gender: Gender.F,
    date_of_birth: "2002-07-30",
    place_of_birth: "Ziguinchor",
    nationality: "Sénégalaise",
    phone: "+221774567890",
    emergency_contact_name: "Ibrahima Ba",
    emergency_contact_phone: "+221775678901",
    address: "321 Rue de l'Indépendance, Ziguinchor, Sénégal",
    photo_url: null,
    status: StudentStatus.ACTIVE,
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-09-01T00:00:00Z",
  },
  {
    id: "stud-5",
    user_id: "user-stud-5",
    student_number: "UCAK2024005",
    full_name: "Cheikh Faye",
    gender: Gender.M,
    date_of_birth: "2000-12-12",
    place_of_birth: "Kaolack",
    nationality: "Sénégalaise",
    phone: "+221775678901",
    emergency_contact_name: "Aïssatou Faye",
    emergency_contact_phone: "+221776789012",
    address: "654 Avenue Cheikh Anta Diop, Kaolack, Sénégal",
    photo_url: null,
    status: StudentStatus.SUSPENDED,
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-11-15T00:00:00Z",
  },
  {
    id: "stud-6",
    user_id: "user-stud-6",
    student_number: "UCAK2023006",
    full_name: "Sokhna Diop",
    gender: Gender.F,
    date_of_birth: "1998-09-05",
    place_of_birth: "Dakar",
    nationality: "Sénégalaise",
    phone: "+221776789012",
    emergency_contact_name: "Papa Diop",
    emergency_contact_phone: "+221777890123",
    address: "987 Rue Félix Faure, Dakar, Sénégal",
    photo_url: null,
    status: StudentStatus.GRADUATED,
    created_at: "2023-09-01T00:00:00Z",
    updated_at: "2024-06-30T00:00:00Z",
  },
  {
    id: "stud-7",
    user_id: "user-stud-7",
    student_number: "UCAK2022007",
    full_name: "Abdoulaye Thiam",
    gender: Gender.M,
    date_of_birth: "1997-01-18",
    place_of_birth: "Louga",
    nationality: "Sénégalaise",
    phone: "+221777890123",
    emergency_contact_name: "Ndeye Thiam",
    emergency_contact_phone: "+221778901234",
    address: "147 Boulevard de la République, Louga, Sénégal",
    photo_url: null,
    status: StudentStatus.WITHDRAWN,
    created_at: "2022-09-01T00:00:00Z",
    updated_at: "2023-12-15T00:00:00Z",
  },
  {
    id: "stud-8",
    user_id: "user-stud-8",
    student_number: "UCAK2021008",
    full_name: "Mariama Cissé",
    gender: Gender.F,
    date_of_birth: "1996-04-25",
    place_of_birth: "Matam",
    nationality: "Sénégalaise",
    phone: "+221778901234",
    emergency_contact_name: "Mamadou Cissé",
    emergency_contact_phone: "+221779012345",
    address: "258 Rue de la Gare, Matam, Sénégal",
    photo_url: null,
    status: StudentStatus.EXPELLED,
    created_at: "2021-09-01T00:00:00Z",
    updated_at: "2022-03-20T00:00:00Z",
  },
];

// Debug log for mock data loading
console.log("Mock data loaded:", {
  mockAcademicPrograms: mockAcademicPrograms.length,
  mockDepartments: mockDepartments.length,
  mockAcademicYears: mockAcademicYears.length,
  mockFacultyMembers: mockFacultyMembers.length,
  mockDeliberationSessions: mockDeliberationSessions.length
});
