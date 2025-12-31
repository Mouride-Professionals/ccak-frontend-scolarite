"use client";

import { PieChart, Pie, Cell } from "recharts";
import Card from "../ui/card";

const data = [
  { name: "Validé", value: 82 },
  { name: "Ajourné", value: 18 },
];

const COLORS = ["#0A8F3D", "#E11D48"];

export default function ValidationGauge() {
  return (
    <Card title="Taux de validation">
      <div className="flex flex-col items-center justify-center h-[260px] relative">
        <PieChart width={220} height={220}>
          <Pie
            data={data}
            innerRadius={70}
            outerRadius={95}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
        </PieChart>

        {/* Texte centré */}
        <div className="absolute text-center">
          <p className="text-xl font-bold text-slate-800">82 %</p>
        </div>

        {/* Légende */}
        <div className="flex gap-6 mt-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-600 rounded-sm" />
            Validé
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-600 rounded-sm" />
            Ajourné
          </span>
        </div>
      </div>
    </Card>
  );
}
