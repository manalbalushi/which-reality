"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RiskDistributionChart({
  data,
}: {
  data: { rating: string; count: number; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
        <XAxis dataKey="rating" tickLine={false} axisLine={{ stroke: "#c3c2b7" }} tick={{ fill: "#52514e", fontSize: 12 }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#898781", fontSize: 11 }} width={28} />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.03)" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #e4e7ec", fontSize: 12 }}
          formatter={(value) => [`${value} risks`, ""]}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
          {data.map((d) => (
            <Cell key={d.rating} fill={d.color} />
          ))}
          <LabelList dataKey="count" position="top" style={{ fill: "#344054", fontSize: 12, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
