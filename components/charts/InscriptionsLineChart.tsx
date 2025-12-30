"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Sept", value: 2450 },
  { month: "Oct", value: 2580 },
  { month: "Nov", value: 2720 },
  { month: "Déc", value: 1680 },
  { month: "Jan", value: 2790 },
  { month: "Fév", value: 3860 },
];

export default function InscriptionsLineChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
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
