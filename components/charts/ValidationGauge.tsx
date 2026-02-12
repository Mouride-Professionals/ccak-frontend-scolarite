"use client";

import { PieChart, Pie, Cell } from "recharts";
import Card from "../ui/card";
import type { DashboardValidationRateData } from "@/types/dashboard";

const COLORS = ["#0A8F3D", "#E11D48"];

interface ValidationGaugeProps {
  data?: DashboardValidationRateData | null;
  isLoading?: boolean;
}

export default function ValidationGauge({ data, isLoading = false }: ValidationGaugeProps) {
  const validated = Math.max(0, Math.min(100, data?.validated_percent ?? 0));
  const failed = Math.max(0, Math.min(100, data?.failed_percent ?? Math.max(0, 100 - validated)));
  const chartData = [
    { name: "Validé", value: validated },
    { name: "Ajourné", value: failed },
  ];

  return (
    <Card title="Taux de validation">
      <div className="flex flex-col items-center justify-center h-[260px] relative">
        {isLoading ? (
          <div className="text-sm text-zinc-500">Chargement...</div>
        ) : (
          <PieChart width={220} height={220}>
            <Pie
              data={chartData}
              innerRadius={70}
              outerRadius={95}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              paddingAngle={2}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        )}

        <div className="absolute text-center">
          <p className="text-xl font-bold text-zinc-900">{Math.round(validated)} %</p>
        </div>

        <div className="mt-3 flex gap-6 text-xs text-zinc-700">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-3 h-3 bg-green-600 rounded-sm" />
            Validé
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-3 h-3 bg-red-600 rounded-sm" />
            Ajourné
          </span>
        </div>
      </div>
    </Card>
  );
}
