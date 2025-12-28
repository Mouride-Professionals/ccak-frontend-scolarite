'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Types
export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  level: string;
  department: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  gpa: number;
  hasScholarship: boolean;
}

interface StudentsTableProps {
  students: Student[];
  isLoading?: boolean;
  selectedStudents: string[];
  onSelectionChange: (selected: string[]) => void;
}

// Configuration des couleurs de statut
const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  graduated: 'bg-blue-100 text-blue-800 border-blue-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
};

// Labels de statut
const statusLabels = {
  active: 'Actif',
  inactive: 'Inactif',
  graduated: 'Diplômé',
  suspended: 'Suspendu',
};

export function StudentsTable({
  students,
  isLoading = false,
  selectedStudents,
  onSelectionChange,
}: StudentsTableProps) {
  // Gestion de la sélection
  const isAllSelected = students.length > 0 && selectedStudents.length === students.length;
  const isSomeSelected = selectedStudents.length > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(students.map(s => s.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedStudents.includes(id)) {
      onSelectionChange(selectedStudents.filter(s => s !== id));
    } else {
      onSelectionChange([...selectedStudents, id]);
    }
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 border rounded-lg bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Chargement des résultats...</span>
      </div>
    );
  }

  // Aucun résultat
  if (students.length === 0) {
    return (
      <div className="text-center p-12 border rounded-lg bg-gray-50">
        <p className="text-gray-600 text-lg mb-2">Aucun étudiant trouvé</p>
        <p className="text-gray-500 text-sm">
          Essayez d'ajuster vos critères de recherche
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>N° Étudiant</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Niveau</TableHead>
            <TableHead>Département</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Moyenne</TableHead>
            <TableHead className="text-center">Bourse</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <Checkbox
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={() => handleSelectOne(student.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{student.studentId}</TableCell>
              <TableCell>
                {student.firstName} {student.lastName}
              </TableCell>
              <TableCell className="text-gray-600">{student.email}</TableCell>
              <TableCell>{student.level}</TableCell>
              <TableCell>{student.department}</TableCell>
              <TableCell>
                <Badge className={statusColors[student.status]}>
                  {statusLabels[student.status]}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{student.gpa.toFixed(2)}</TableCell>
              <TableCell className="text-center">
                {student.hasScholarship ? (
                  <span className="text-green-600 font-semibold">✓</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}