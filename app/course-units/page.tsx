import React, { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';
import CourseUnitTable from '@/components/course-units/course-unit-table';
import { useCourseUnits, useDeleteCourseUnit } from '@/hooks/use-course-units';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CourseUnitForm from '@/components/course-units/course-unit-form';
import { CourseUnit } from '@/types/course-unit';
import { toast } from 'sonner';

const CourseUnitsPage = () => {
  const { data: courseUnits, isLoading } = useCourseUnits();
  const deleteMutation = useDeleteCourseUnit();
  const [editingCourseUnit, setEditingCourseUnit] = useState<CourseUnit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (courseUnit: CourseUnit) => {
    setEditingCourseUnit(courseUnit);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette unité d\'enseignement ?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Unité d\'enseignement supprimée avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingCourseUnit(null);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Unités d'Enseignement">
          <div className="p-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Unités d'Enseignement">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Unités d'Enseignement</h1>
            <Link href="/course-units/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Unité d'Enseignement
              </Button>
            </Link>
          </div>

          <CourseUnitTable
            courseUnits={courseUnits || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Modifier l'Unité d'Enseignement</DialogTitle>
              </DialogHeader>
              {editingCourseUnit && (
                <CourseUnitForm
                  courseUnit={editingCourseUnit}
                  onSuccess={handleEditSuccess}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CourseUnitsPage;