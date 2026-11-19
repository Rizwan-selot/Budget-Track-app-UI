import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { compactINR, formatINR } from "@/lib/finance";

export function BarTrend({ data, highlight, height = 150 }: { data: { label: string; amount: number }[]; highlight?: number | undefined; height?: number | undefined }) {
  const max = Math.max(...data.map((d) => d.amount));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" tick={{ fontSize: 11, fill: "var(--subtle)" }} />
          <Tooltip cursor={{ fill: "var(--muted)", radius: 8 }} formatter={(v: number) => [formatINR(v), "Spent"]} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} labelFormatter={(l) => String(l)} />
          <Bar dataKey="amount" radius={[6, 6, 6, 6]} maxBarSize={28}>
            {data.map((d, i) => (
              <Cell key={i} fill={(highlight ?? -1) === i || (highlight === undefined && d.amount === max) ? "var(--primary)" : "var(--primary-soft)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <span className="sr-only">Highest: {compactINR(max)}</span>
    </div>
  );
}

export function CompareBars({ data }: { data: { label: string; income: number; expenses: number }[] }) {
  return (
    <div style={{ height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={4}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
          <Tooltip cursor={{ fill: "var(--muted)", radius: 8 }} formatter={(v: number, n: string) => [formatINR(v), n === "income" ? "Income" : "Expenses"]} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
          <Bar dataKey="income" fill="var(--income)" radius={[6, 6, 6, 6]} maxBarSize={22} />
          <Bar dataKey="expenses" fill="var(--expense)" radius={[6, 6, 6, 6]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
