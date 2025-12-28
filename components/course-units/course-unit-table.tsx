import React from 'react';
import { CourseUnit } from '@/types/course-unit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface CourseUnitTableProps {
  courseUnits: CourseUnit[];
  onEdit: (courseUnit: CourseUnit) => void;
  onDelete: (id: string) => void;
}

const CourseUnitTable: React.FC<CourseUnitTableProps> = ({
  courseUnits,
  onEdit,
  onDelete,
}) => {
  if (courseUnits.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune unité d'enseignement trouvée.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Programme</TableHead>
            <TableHead>Semestre</TableHead>
            <TableHead>Crédits</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courseUnits.map((courseUnit) => (
            <TableRow key={courseUnit.id}>
              <TableCell className="font-medium">{courseUnit.code}</TableCell>
              <TableCell>{courseUnit.name}</TableCell>
              <TableCell>{courseUnit.academicProgram?.name || 'N/A'}</TableCell>
              <TableCell>Semestre {courseUnit.semesterNumber}</TableCell>
              <TableCell>{courseUnit.credits}</TableCell>
              <TableCell>
                <Badge variant={courseUnit.type === 'OBLIGATOIRE' ? 'default' : 'secondary'}>
                  {courseUnit.type === 'OBLIGATOIRE' ? 'Obligatoire' : 'Optionnel'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={courseUnit.isActive ? 'default' : 'destructive'}>
                  {courseUnit.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Link href={`/course-units/${courseUnit.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(courseUnit)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(courseUnit.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseUnitTable;