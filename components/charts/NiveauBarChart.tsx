"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { niveau: "L1", licence: 220 },
  { niveau: "L2", licence: 490 },
  { niveau: "L3", licence: 180 },
  { niveau: "M1", master: 430 },
  { niveau: "M2", master: 120 },
];

export default function NiveauBarChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        barCategoryGap={10} // ⬅️ réduit l’espace entre catégories
        barGap={2} // ⬅️ barres plus épaisses
      >
        <XAxis dataKey="niveau" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend align="right" verticalAlign="top" iconType="circle" />

        <Bar
          dataKey="licence"
          fill="#083B66"
          radius={[6, 6, 0, 0]}
          barSize={40} // ⬅️ LARGEUR EXACTE DES BARRES
        />
        <Bar dataKey="master" fill="#0A8F3D" radius={[6, 6, 0, 0]} barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
