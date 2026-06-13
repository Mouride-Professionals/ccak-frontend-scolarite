"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { DashboardEnrollmentsTrendPoint } from "@/types/dashboard";

interface InscriptionsLineChartProps {
  data?: DashboardEnrollmentsTrendPoint[];
  isLoading?: boolean;
}

export default function InscriptionsLineChart({
  data = [],
  isLoading = false,
}: InscriptionsLineChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-zinc-500">
        Chargement...
      </div>
    );
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
      <LineChart data={data}>
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#334155", fontWeight: 500 }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#475569" }} />
        <Tooltip />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#083B66"
          strokeWidth={2}
          dot={{ r: 4, fill: "#083B66" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
