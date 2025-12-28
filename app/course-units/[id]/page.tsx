import React from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useCourseUnit } from '@/hooks/use-course-units';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

const CourseUnitDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  const { data: courseUnit, isLoading } = useCourseUnit(id);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Unité d'Enseignement">
          <div className="p-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!courseUnit) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Unité d'Enseignement non trouvée">
          <div className="p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Unité d'Enseignement non trouvée</h1>
              <Link href="/course-units">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux Unités d'Enseignement
                </Button>
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title={courseUnit.name}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Link href="/course-units">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{courseUnit.name}</h1>
            </div>
            <Link href={`/course-units/${courseUnit.id}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Code</label>
                  <p className="text-lg font-semibold">{courseUnit.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nom</label>
                  <p className="text-lg">{courseUnit.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Programme Académique</label>
                  <p className="text-lg">{courseUnit.academicProgram?.name || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Détails Académiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Semestre</label>
                  <p className="text-lg">Semestre {courseUnit.semesterNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Crédits</label>
                  <p className="text-lg">{courseUnit.credits} crédits</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <Badge variant={courseUnit.type === 'OBLIGATOIRE' ? 'default' : 'secondary'}>
                    {courseUnit.type === 'OBLIGATOIRE' ? 'Obligatoire' : 'Optionnel'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Statut</label>
                  <Badge variant={courseUnit.isActive ? 'default' : 'destructive'}>
                    {courseUnit.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informations Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Créé le</label>
                  <p className="text-sm">{new Date(courseUnit.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Modifié le</label>
                  <p className="text-sm">{new Date(courseUnit.updatedAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CourseUnitDetailPage;