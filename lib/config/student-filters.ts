import { FilterField } from '@/types/filters';

export const studentFilterFields: FilterField[] = [
  {
    id: 'name',
    label: 'Nom complet',
    type: 'text',
    placeholder: 'Nom ou prénom...',
  },
  {
    id: 'studentId',
    label: "Numéro d'étudiant",
    type: 'text',
    placeholder: 'Ex: 2024001',
  },
  {
    id: 'email',
    label: 'Email',
    type:'text',
    placeholder: 'email@example.com',
  },
  {
   id: 'level',
   label: 'Niveau',
   type: 'multiselect',
   options: [
    { value: 'L1', label: 'Licence 1' },
    { value: 'L2', label: 'Licence 2' },
    { value: 'L3', label: 'Licence 3' },
    { value: 'M1', label: 'Master 1' },
    { value: 'M2', label: 'Master 2' },
   ],
  },
  {
   id: 'department',
   label: 'Département',
   type: 'multiselect',
   options: [
    { value: 'info', label: 'Informatique' },
    { value: 'math', label: 'Mathématiques' },
    { value: 'physics', label: 'Physique' },
    { value: 'chemistry', label: 'Chimie' },
   ],
  },
  {
   id: 'status',
   label: 'Statut',
   type: 'select',
   options: [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'graduated', label: 'Diplômé' },
    { value: 'suspended', label: 'Suspendu' },
   ],
  },
  {
   id: 'enrollmentDate',
   label: "Date d'inscription",
   type: 'daterange',
  },
  {
   id: 'gpa',
   label: 'Moyenne minimum',
   type: 'number',
   placeholder: '0.00',
  },
  {
   id: 'hasScholarship',
   label: 'Boursier uniquement',
   type: 'checkbox',
  },
];