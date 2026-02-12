"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DashboardStudentsByLevelPoint } from "@/types/dashboard";

interface NiveauBarChartProps {
  data?: DashboardStudentsByLevelPoint[];
  isLoading?: boolean;
}

export default function NiveauBarChart({ data = [], isLoading = false }: NiveauBarChartProps) {
  if (isLoading) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-zinc-500">Chargement...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-zinc-500">
        Aucune donnée disponible.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap={10} barGap={2}>
        <XAxis
          dataKey="niveau"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#334155", fontWeight: 500 }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#475569" }} />
        <Tooltip />
        <Legend align="right" verticalAlign="top" iconType="circle" />

        <Bar dataKey="licence" fill="#083B66" radius={[6, 6, 0, 0]} barSize={40} />
        <Bar dataKey="master" fill="#0A8F3D" radius={[6, 6, 0, 0]} barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
