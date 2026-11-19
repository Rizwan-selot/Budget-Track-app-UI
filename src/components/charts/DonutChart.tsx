import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { ReactNode } from "react";

export interface DonutSlice { key: string; value: number; color: string }

export function DonutChart({ data, active, onSelect, children }: { data: DonutSlice[]; active?: string | null | undefined; onSelect?: (k: string | null) => void; children?: ReactNode | undefined }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="key" innerRadius="66%" outerRadius="96%" paddingAngle={2.5} cornerRadius={10} stroke="none" startAngle={90} endAngle={-270} isAnimationActive onClick={(d: { key?: string | undefined }) => onSelect?.(active === d.key ? null : (d.key ?? null))}>
            {data.map((d) => (
              <Cell key={d.key} fill={d.color} opacity={active && active !== d.key ? 0.28 : 1} className="cursor-pointer outline-none transition-opacity" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
