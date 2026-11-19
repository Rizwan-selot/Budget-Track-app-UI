import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChartPie, Lightbulb, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { BarTrend, CompareBars } from "@/components/charts/BarTrend";
import { DonutChart } from "@/components/charts/DonutChart";
import { CategoryIcon } from "@/components/common/CategoryIcon";
import { EmptyState } from "@/components/common/EmptyState";
import { Money } from "@/components/common/Money";
import { MonthSelector } from "@/components/common/MonthSelector";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Segmented } from "@/components/forms/fields";
import { CATEGORIES } from "@/data/categories";
import { DEMO_MONTHS } from "@/data/mock";
import { buildInsights, categoryBreakdown, dailySpend, methodBreakdown, monthLabel, monthTotals, topMerchants, weekdaySpend, weeklySpend } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { useFinance } from "@/store/finance-store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights · Paisa money tracker" },
      { name: "description", content: "Category breakdowns, spending trends, top merchants and income versus expenses." },
      { property: "og:title", content: "Insights · Paisa money tracker" },
      { property: "og:description", content: "Category breakdowns, spending trends, top merchants and income versus expenses." },
    ],
  }),
  component: Insights,
});

function Insights() {
  const { state } = useFinance();
  const { transactions: txs, month } = state;
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [period, setPeriod] = useState<"daily" | "weekly" | "weekday">("daily");
  const [active, setActive] = useState<string | null>(null);

  const slices = categoryBreakdown(txs, month, kind);
  const total = slices.reduce((s, x) => s + x.amount, 0);
  const activeSlice = slices.find((s) => s.categoryId === active);
  const insights = buildInsights(txs, state.budgets, month);
  const daily = dailySpend(txs, month);
  const lastDay = month === "2026-11" ? 18 : daily.length;
  const trend =
    period === "daily" ? daily.slice(0, lastDay).map((d) => ({ label: String(d.day), amount: d.amount }))
    : period === "weekly" ? weeklySpend(txs, month)
    : weekdaySpend(txs, month);
  const compare = DEMO_MONTHS.map((m) => ({ label: monthLabel(m, "short").split(" ")[0] ?? m, ...monthTotals(txs, m) })).filter((m) => m.income || m.expenses);
  const merchants = topMerchants(txs, month);
  const methods = methodBreakdown(txs, month);

  return (
    <div>
      <ScreenHeader title="Insights" right={<MonthSelector />} />
      <div className="space-y-5 px-4">
        <Segmented options={[{ value: "expense", label: "Expenses" }, { value: "income", label: "Income" }]} value={kind} onChange={(v) => { setKind(v); setActive(null); }} />

        {slices.length === 0 ? (
          <div className="surface"><EmptyState icon={ChartPie} title="No data for this month" text={`There are no recorded ${kind === "expense" ? "expenses" : "income"} in ${monthLabel(month)}.`} /></div>
        ) : (
          <>
            <section className="surface p-4">
              <h2 className="text-[15px] font-bold">{kind === "expense" ? "Where your money went" : "Where your money came from"}</h2>
              <p className="text-[12.5px] text-muted-foreground">Tap a slice or category to focus it</p>
              <div className="py-4">
                <DonutChart data={slices.map((s) => ({ key: s.categoryId, value: s.amount, color: CATEGORIES[s.categoryId].color }))} active={active} onSelect={setActive}>
                  <span className="text-[12.5px] text-muted-foreground">{activeSlice ? CATEGORIES[activeSlice.categoryId].name : kind === "expense" ? "Total expenses" : "Total income"}</span>
                  <Money value={activeSlice?.amount ?? total} className="mt-0.5 text-[26px] font-extrabold" />
                  {activeSlice && <span className="num mt-0.5 text-[13px] font-bold text-primary">{activeSlice.pct.toFixed(1)}%</span>}
                </DonutChart>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
                {slices.map((s) => (
                  <span key={s.categoryId} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <span className="size-2 rounded-full" style={{ backgroundColor: CATEGORIES[s.categoryId].color }} />{CATEGORIES[s.categoryId].name}
                  </span>
                ))}
              </div>
            </section>

            <section className="surface divide-y overflow-hidden">
              {slices.map((s) => {
                const c = CATEGORIES[s.categoryId];
                const up = (s.change ?? 0) > 0;
                const good = kind === "expense" ? !up : up;
                return (
                  <button key={s.categoryId} onClick={() => setActive(active === s.categoryId ? null : s.categoryId)} className={cn("block w-full px-4 py-3.5 text-left transition-colors", active === s.categoryId ? "bg-primary-surface" : "hover:bg-muted/50")}>
                    <div className="flex items-center gap-3">
                      <CategoryIcon id={s.categoryId} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[15px] font-semibold">{c.name}</span>
                          <Money value={s.amount} className="text-[15px] font-bold" />
                        </div>
                        <div className="mt-0.5 flex items-center justify-between text-[12.5px] text-muted-foreground">
                          <span>{s.pct.toFixed(1)}% · {s.count} txn{s.count === 1 ? "" : "s"}</span>
                          {s.change === null ? <span className="text-subtle">New this month</span> : (
                            <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold", good ? "bg-income-soft text-income" : "bg-expense-soft text-expense")}>
                              {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}{Math.abs(Math.round(s.change))}% vs last month
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ProgressBar value={s.pct} color={c.color} className="mt-2.5 h-1.5" />
                  </button>
                );
              })}
            </section>
          </>
        )}

        {kind === "expense" && insights.length > 0 && (
          <section className="rounded-[18px] bg-ink p-4 text-ink-foreground">
            <div className="mb-2 flex items-center gap-2 text-[14px] font-bold"><Lightbulb className="size-4 text-warning" />What stands out</div>
            <ul className="space-y-2">
              {insights.map((i, k) => (
                <li key={k} className="flex gap-2 text-[13.5px] leading-snug opacity-90">
                  {i.tone === "warn" ? <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" /> : <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", i.tone === "good" ? "bg-income" : "bg-primary-soft")} />}
                  {i.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        {kind === "expense" && slices.length > 0 && (
          <>
            <section className="surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[15px] font-bold">Spending trend</h2>
                <div className="flex rounded-full bg-muted p-0.5 text-[12px] font-semibold">
                  {(["daily", "weekly", "weekday"] as const).map((p) => (
                    <button key={p} onClick={() => setPeriod(p)} className={cn("rounded-full px-2.5 py-1 capitalize", period === p ? "bg-card shadow-card" : "text-muted-foreground")}>{p === "weekday" ? "By day" : p}</button>
                  ))}
                </div>
              </div>
              <BarTrend data={trend} />
            </section>

            <section className="surface p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold">Income vs expenses</h2>
                <div className="flex gap-3 text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-income" />Income</span>
                  <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-expense" />Expenses</span>
                </div>
              </div>
              <CompareBars data={compare} />
            </section>

            <section className="surface p-4">
              <h2 className="mb-3 text-[15px] font-bold">Top merchants</h2>
              <ol className="space-y-3">
                {merchants.map((m, i) => (
                  <li key={m.title} className="flex items-center gap-3">
                    <span className="num w-4 text-[13px] font-bold text-subtle">{i + 1}</span>
                    <CategoryIcon id={m.categoryId} size="sm" />
                    <span className="flex-1"><span className="block text-[14.5px] font-semibold">{m.title}</span><span className="text-[12px] text-muted-foreground">{m.count} payment{m.count > 1 ? "s" : ""}</span></span>
                    <Money value={m.amount} className="text-[14.5px] font-bold" />
                  </li>
                ))}
              </ol>
            </section>

            <section className="surface p-4">
              <h2 className="mb-3 text-[15px] font-bold">How you paid</h2>
              <div className="mb-4 flex h-3 overflow-hidden rounded-full">
                {methods.map((m, i) => <div key={m.method} style={{ width: `${m.pct}%`, backgroundColor: `var(--chart-${(i % 8) + 1})` }} />)}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {methods.map((m, i) => (
                  <div key={m.method} className="flex items-center gap-2 text-[13px]">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: `var(--chart-${(i % 8) + 1})` }} />
                    <span className="flex-1 text-muted-foreground">{m.method}</span>
                    <span className="num font-semibold">{Math.round(m.pct)}%</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
