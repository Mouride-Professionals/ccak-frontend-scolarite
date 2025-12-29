"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatCard from "@/components/cards/StatCard";
import NiveauBarChart from '@/components/charts/NiveauBarChart';
import QuickActions from '@/components/cards/QuickActions';
import InscriptionsLineChart from '@/components/charts/InscriptionsLineChart';
import ValidationGauge from '@/components/charts/ValidationGauge';
import RecentActivitiesTable from '@/components/tables/RecentActivitiesTable';
import Card from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout title="Tableau de bord">
        {/* En-tête simple sans cloche (car elle est dans la Navbar) */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Bienvenue sur CCAK - Back Office
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Gestion académique et administrative
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">Total Étudiants</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">2,400</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">Inscriptions</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">342</p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">Délibérations</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">12</p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">En attente</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">23</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3">
                <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>



        <div className="mt-8 grid grid-cols-12 gap-6">


          {/* Ligne 1 */}
          <div className="col-span-8">
            <Card title="Répartition par Niveau">
              <NiveauBarChart />
            </Card>
          </div>

          <div className="col-span-4">
            <QuickActions />
          </div>

          {/* Ligne 2 */}
          <div className="col-span-6">
            <Card title="Évolution des inscriptions" rightSlot={
              <select className="text-xs border border-slate-400 rounded-md px-2 py-1">
                <option className="text-slate-800" selected>6 derniers mois</option>
              </select>
            }>
              <InscriptionsLineChart />
            </Card>
          </div>

          <div className="col-span-6">
            <ValidationGauge />
          </div>

        </div>

        <div className="mt-8">
          <RecentActivitiesTable />
        </div>

      </DashboardLayout>
    </ProtectedRoute>
  );
}