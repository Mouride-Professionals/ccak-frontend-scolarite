'use client';

import { useState } from 'react';
import { StudentsTable, Student } from '@/components/students/StudentsTable';
import { Button } from '@/components/ui/button';

// Données de test
const mockStudents: Student[] = [
  {
    id: '1',
    studentId: '2024001',
    firstName: 'Amadou',
    lastName: 'Diallo',
    email: 'amadou.diallo@ucak.edu',
    level: 'L3',
    department: 'Informatique',
    status: 'active',
    gpa: 15.5,
    hasScholarship: true,
  },
  {
    id: '2',
    studentId: '2024002',
    firstName: 'Fatou',
    lastName: 'Sow',
    email: 'fatou.sow@ucak.edu',
    level: 'M1',
    department: 'Mathématiques',
    status: 'active',
    gpa: 16.8,
    hasScholarship: true,
  },
  {
    id: '3',
    studentId: '2024003',
    firstName: 'Ousmane',
    lastName: 'Ba',
    email: 'ousmane.ba@ucak.edu',
    level: 'L2',
    department: 'Physique',
    status: 'inactive',
    gpa: 12.3,
    hasScholarship: false,
  },
  {
    id: '4',
    studentId: '2024004',
    firstName: 'Aïssatou',
    lastName: 'Ndiaye',
    email: 'aissatou.ndiaye@ucak.edu',
    level: 'M2',
    department: 'Informatique',
    status: 'graduated',
    gpa: 17.2,
    hasScholarship: true,
  },
  {
    id: '5',
    studentId: '2024005',
    firstName: 'Ibrahima',
    lastName: 'Sarr',
    email: 'ibrahima.sarr@ucak.edu',
    level: 'L1',
    department: 'Chimie',
    status: 'suspended',
    gpa: 8.5,
    hasScholarship: false,
  },
];

export default function StudentsSearchPage() {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleClearSelection = () => {
    setSelectedStudents([]);
  };

  const handleExport = () => {
    console.log('Exporter les étudiants sélectionnés:', selectedStudents);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Recherche Avancée d'Étudiants
          </h1>
          <p className="text-gray-600 mt-1">
            {mockStudents.length} étudiant(s) trouvé(s)
          </p>
        </div>
      </div>

      {/* Actions sur la sélection */}
      {selectedStudents.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-900 font-medium">
            {selectedStudents.length} étudiant(s) sélectionné(s)
          </span>
          <div className="flex gap-2">
            <Button onClick={handleExport} size="sm" variant="outline">
              Exporter la sélection
            </Button>
            <Button 
              onClick={handleClearSelection} 
              size="sm" 
              variant="ghost"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Tableau */}
      <StudentsTable
        students={mockStudents}
        isLoading={isLoading}
        selectedStudents={selectedStudents}
        onSelectionChange={setSelectedStudents}
      />
    </div>
  );
}