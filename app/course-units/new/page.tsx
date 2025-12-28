import React from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';
import CourseUnitForm from '@/components/course-units/course-unit-form';

const NewCourseUnitPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout title="Créer une Unité d'Enseignement">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Créer une Unité d'Enseignement</h1>
          <CourseUnitForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default NewCourseUnitPage;