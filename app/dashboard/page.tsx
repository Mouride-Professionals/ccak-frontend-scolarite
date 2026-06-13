"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";
import NiveauBarChart from "@/components/charts/NiveauBarChart";
import QuickActions from "@/components/cards/QuickActions";
import InscriptionsLineChart from "@/components/charts/InscriptionsLineChart";
import ValidationGauge from "@/components/charts/ValidationGauge";
import RecentActivitiesTable from "@/components/tables/RecentActivitiesTable";
import { Card } from "@/components/ui/card";
import {
  useDashboardEnrollmentsTrend,
  useDashboardOverview,
  useDashboardRecentActivities,
  useDashboardStudentsByLevel,
  useDashboardValidationRate,
} from "@/hooks/use-dashboard";
import type { DashboardTrendPeriod } from "@/types/dashboard";
import { toUserError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [trendPeriod, setTrendPeriod] = useState<DashboardTrendPeriod>("6m");

  const overviewQuery = useDashboardOverview();
  const levelsQuery = useDashboardStudentsByLevel();
  const trendQuery = useDashboardEnrollmentsTrend(trendPeriod);
  const validationQuery = useDashboardValidationRate();
  const activitiesQuery = useDashboardRecentActivities(10);

  const globalError = useMemo(() => {
    const firstError =
      overviewQuery.error ??
      levelsQuery.error ??
      trendQuery.error ??
      validationQuery.error ??
      activitiesQuery.error;
    return firstError
      ? toUserError(firstError, "Erreur de chargement du tableau de bord.").message
      : null;
  }, [
    overviewQuery.error,
    levelsQuery.error,
    trendQuery.error,
    validationQuery.error,
    activitiesQuery.error,
  ]);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Tableau de bord">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-950">Bienvenue sur CCAK - Back Office</h2>
          <p className="mt-2 text-sm text-zinc-700">Gestion académique et administrative</p>
        </div>

        {globalError && (
          <div
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {globalError}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-700">Total Étudiants</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  {overviewQuery.isLoading
                    ? "..."
                    : (overviewQuery.data?.total_students ?? 0).toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-700">Inscriptions</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  {overviewQuery.isLoading
                    ? "..."
                    : (overviewQuery.data?.total_enrollments ?? 0).toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-700">Délibérations</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  {overviewQuery.isLoading
                    ? "..."
                    : (overviewQuery.data?.total_deliberations ?? 0).toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-700">En attente</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  {overviewQuery.isLoading
                    ? "..."
                    : (overviewQuery.data?.pending_items ?? 0).toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3">
                <svg
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <Card title="Répartition par Niveau">
              <NiveauBarChart data={levelsQuery.data} isLoading={levelsQuery.isLoading} />
            </Card>
          </div>

          <div className="col-span-4">
            <QuickActions />
          </div>

          <div className="col-span-6">
            <Card
              title="Évolution des inscriptions"
              rightSlot={
                <select
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-800"
                  value={trendPeriod}
                  onChange={(event) => setTrendPeriod(event.target.value as DashboardTrendPeriod)}
                >
                  <option value="6m">6 derniers mois</option>
                  <option value="12m">12 derniers mois</option>
                  <option value="24m">24 derniers mois</option>
                </select>
              }
            >
              <InscriptionsLineChart data={trendQuery.data} isLoading={trendQuery.isLoading} />
            </Card>
          </div>

          <div className="col-span-6">
            <ValidationGauge data={validationQuery.data} isLoading={validationQuery.isLoading} />
          </div>
        </div>

        <div className="mt-8">
          <RecentActivitiesTable
            activities={activitiesQuery.data}
            isLoading={activitiesQuery.isLoading}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
