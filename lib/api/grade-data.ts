/**
 * Mock Data for Grades Development
 */

import type { Grade, Student, Course, EvaluationTypeOption } from "@/types/grade";
import { GradeStatus, EvaluationType } from "@/types/grade";

// =====================
// STUDENTS
// =====================

export const mockStudents: Student[] = [
  {
    id: "std-1",
    student_number: "2024001",
    full_name: "Amadou Diallo",
    email: "amadou.diallo@university.sn",
    phone: "+221771234567",
    program_id: "prog-1",
    current_semester: 1,
    enrollment_date: "2024-09-01",
    is_active: true,
    program: {
      id: "prog-1",
      name: "Licence Informatique",
      level: "LICENCE",
    },
  },
  {
    id: "std-2",
    student_number: "2024002",
    full_name: "Fatou Sow",
    email: "fatou.sow@university.sn",
    phone: "+221772345678",
    program_id: "prog-1",
    current_semester: 1,
    enrollment_date: "2024-09-01",
    is_active: true,
    program: {
      id: "prog-1",
      name: "Licence Informatique",
      level: "LICENCE",
    },
  },
  {
    id: "std-3",
    student_number: "2024003",
    full_name: "Moussa Ba",
    email: "moussa.ba@university.sn",
    phone: "+221773456789",
    program_id: "prog-2",
    current_semester: 1,
    enrollment_date: "2024-09-01",
    is_active: true,
    program: {
      id: "prog-2",
      name: "Licence Mathématiques",
      level: "LICENCE",
    },
  },
  {
    id: "std-4",
    student_number: "2023045",
    full_name: "Aïssatou Ndiaye",
    email: "aissatou.ndiaye@university.sn",
    phone: "+221774567890",
    program_id: "prog-1",
    current_semester: 3,
    enrollment_date: "2023-09-01",
    is_active: true,
    program: {
      id: "prog-1",
      name: "Licence Informatique",
      level: "LICENCE",
    },
  },
  {
    id: "std-5",
    student_number: "2023046",
    full_name: "Cheikh Sy",
    email: "cheikh.sy@university.sn",
    phone: "+221775678901",
    program_id: "prog-3",
    current_semester: 2,
    enrollment_date: "2023-09-01",
    is_active: true,
    program: {
      id: "prog-3",
      name: "Master Génie Logiciel",
      level: "MASTER",
    },
  },
];

// =====================
// COURSES
// =====================

export const mockCourses: Course[] = [
  {
    id: "course-1",
    code: "INF101",
    name: "Introduction à la Programmation",
    credits: 6,
    semester: 1,
    program_id: "prog-1",
    is_active: true,
    program: {
      id: "prog-1",
      name: "Licence Informatique",
    },
  },
  {
    id: "course-2",
    code: "INF102",
    name: "Algorithmique et Structures de Données",
    credits: 6,
    semester: 1,
    program_id: "prog-1",
    is_active: true,
    program: {
      id: "prog-1",
      name: "Licence Informatique",
    },
  },
  {
    id: "course-3",
    code: "MATH101",
    name: "Mathématiques Discrètes",
    credits: 5,
    semester: 1,
    program_id: "prog-1",
    is_active: true,
    program: {
      id: "prog-1",
      name: "Licence Informatique",
    },
  },
  {
    id: "course-4",
    code: "INF201",
    name: "Bases de Données",
    credits: 6,
    semester: 3,
    program_id: "prog-1",
    is_active: true,
    program: {
      id: "prog-1",
      name: "Licence Informatique",
    },
  },
  {
    id: "course-5",
    code: "INF301",
    name: "Développement Web Avancé",
    credits: 6,
    semester: 2,
    program_id: "prog-3",
    is_active: true,
    program: {
      id: "prog-3",
      name: "Master Génie Logiciel",
    },
  },
];

// =====================
// EVALUATION TYPES
// =====================

export const mockEvaluationTypes: EvaluationTypeOption[] = [
  {
    id: "eval-1",
    name: "Examen Final",
    code: EvaluationType.FINAL,
    description: "Évaluation finale du cours",
    default_weight: 0.4,
  },
  {
    id: "eval-2",
    name: "Examen Partiel",
    code: EvaluationType.MIDTERM,
    description: "Évaluation à mi-parcours",
    default_weight: 0.3,
  },
  {
    id: "eval-3",
    name: "Quiz",
    code: EvaluationType.QUIZ,
    description: "Évaluation rapide",
    default_weight: 0.1,
  },
  {
    id: "eval-4",
    name: "Devoir",
    code: EvaluationType.HOMEWORK,
    description: "Travail à rendre",
    default_weight: 0.1,
  },
  {
    id: "eval-5",
    name: "Projet",
    code: EvaluationType.PROJECT,
    description: "Projet de groupe ou individuel",
    default_weight: 0.3,
  },
  {
    id: "eval-6",
    name: "Travaux Pratiques",
    code: EvaluationType.LAB,
    description: "Séances de TP",
    default_weight: 0.2,
  },
];

// =====================
// GRADES
// =====================

export const mockGrades: Grade[] = [
  {
    id: "grade-1",
    student_id: "std-1",
    course_id: "course-1",
    type: EvaluationType.MIDTERM,
    score: 15,
    max_score: 20,
    weight: 0.3,
    entered_by: "prof-1",
    status: GradeStatus.VALIDATED,
    entered_at: "2024-11-15T10:30:00Z",
    validated_at: "2024-11-16T14:20:00Z",
    validated_by: "admin-1",
    comments: "Bon travail",
    created_at: "2024-11-15T10:30:00Z",
    updated_at: "2024-11-16T14:20:00Z",
    student: {
      id: "std-1",
      student_number: "2024001",
      full_name: "Amadou Diallo",
    },
    course: {
      id: "course-1",
      code: "INF101",
      name: "Introduction à la Programmation",
    },
    entered_by_user: {
      id: "prof-1",
      full_name: "Dr. Mamadou Diallo",
    },
  },
  {
    id: "grade-2",
    student_id: "std-1",
    course_id: "course-1",
    type: EvaluationType.FINAL,
    score: 17,
    max_score: 20,
    weight: 0.4,
    entered_by: "prof-1",
    status: GradeStatus.VALIDATED,
    entered_at: "2024-12-20T09:15:00Z",
    validated_at: "2024-12-21T11:30:00Z",
    validated_by: "admin-1",
    comments: "Excellent",
    created_at: "2024-12-20T09:15:00Z",
    updated_at: "2024-12-21T11:30:00Z",
    student: {
      id: "std-1",
      student_number: "2024001",
      full_name: "Amadou Diallo",
    },
    course: {
      id: "course-1",
      code: "INF101",
      name: "Introduction à la Programmation",
    },
    entered_by_user: {
      id: "prof-1",
      full_name: "Dr. Mamadou Diallo",
    },
  },
  {
    id: "grade-3",
    student_id: "std-2",
    course_id: "course-1",
    type: EvaluationType.MIDTERM,
    score: 12,
    max_score: 20,
    weight: 0.3,
    entered_by: "prof-1",
    status: GradeStatus.PENDING,
    entered_at: "2024-11-15T10:35:00Z",
    validated_at: null,
    comments: null,
    created_at: "2024-11-15T10:35:00Z",
    updated_at: "2024-11-15T10:35:00Z",
    student: {
      id: "std-2",
      student_number: "2024002",
      full_name: "Fatou Sow",
    },
    course: {
      id: "course-1",
      code: "INF101",
      name: "Introduction à la Programmation",
    },
    entered_by_user: {
      id: "prof-1",
      full_name: "Dr. Mamadou Diallo",
    },
  },
  {
    id: "grade-4",
    student_id: "std-2",
    course_id: "course-2",
    type: EvaluationType.PROJECT,
    score: 16,
    max_score: 20,
    weight: 0.3,
    entered_by: "prof-2",
    status: GradeStatus.VALIDATED,
    entered_at: "2024-12-10T14:00:00Z",
    validated_at: "2024-12-11T09:00:00Z",
    validated_by: "admin-1",
    comments: "Très bon projet",
    created_at: "2024-12-10T14:00:00Z",
    updated_at: "2024-12-11T09:00:00Z",
    student: {
      id: "std-2",
      student_number: "2024002",
      full_name: "Fatou Sow",
    },
    course: {
      id: "course-2",
      code: "INF102",
      name: "Algorithmique et Structures de Données",
    },
    entered_by_user: {
      id: "prof-2",
      full_name: "Dr. Aminata Sow",
    },
  },
  {
    id: "grade-5",
    student_id: "std-4",
    course_id: "course-4",
    type: EvaluationType.LAB,
    score: 18,
    max_score: 20,
    weight: 0.2,
    entered_by: "prof-1",
    status: GradeStatus.VALIDATED,
    entered_at: "2024-12-05T16:30:00Z",
    validated_at: "2024-12-06T10:00:00Z",
    validated_by: "admin-1",
    comments: "Excellent TP",
    created_at: "2024-12-05T16:30:00Z",
    updated_at: "2024-12-06T10:00:00Z",
    student: {
      id: "std-4",
      student_number: "2023045",
      full_name: "Aïssatou Ndiaye",
    },
    course: {
      id: "course-4",
      code: "INF201",
      name: "Bases de Données",
    },
    entered_by_user: {
      id: "prof-1",
      full_name: "Dr. Mamadou Diallo",
    },
  },
  {
    id: "grade-6",
    student_id: "std-5",
    course_id: "course-5",
    type: EvaluationType.QUIZ,
    score: 14,
    max_score: 20,
    weight: 0.1,
    entered_by: "prof-2",
    status: GradeStatus.DRAFT,
    entered_at: "2024-12-28T08:00:00Z",
    validated_at: null,
    comments: "À vérifier",
    created_at: "2024-12-28T08:00:00Z",
    updated_at: "2024-12-28T08:00:00Z",
    student: {
      id: "std-5",
      student_number: "2023046",
      full_name: "Cheikh Sy",
    },
    course: {
      id: "course-5",
      code: "INF301",
      name: "Développement Web Avancé",
    },
    entered_by_user: {
      id: "prof-2",
      full_name: "Dr. Aminata Sow",
    },
  },
  {
    id: "grade-7",
    student_id: "std-1",
    course_id: "course-3",
    type: EvaluationType.HOMEWORK,
    score: 13,
    max_score: 20,
    weight: 0.1,
    entered_by: "prof-3",
    status: GradeStatus.VALIDATED,
    entered_at: "2024-11-20T11:00:00Z",
    validated_at: "2024-11-21T09:30:00Z",
    validated_by: "admin-1",
    comments: null,
    created_at: "2024-11-20T11:00:00Z",
    updated_at: "2024-11-21T09:30:00Z",
    student: {
      id: "std-1",
      student_number: "2024001",
      full_name: "Amadou Diallo",
    },
    course: {
      id: "course-3",
      code: "MATH101",
      name: "Mathématiques Discrètes",
    },
    entered_by_user: {
      id: "prof-3",
      full_name: "Dr. Ousmane Ndiaye",
    },
  },
];