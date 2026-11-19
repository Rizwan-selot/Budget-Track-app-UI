import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Bell, ChevronRight, Eye, EyeOff, MessageSquareWarning, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Money } from "@/components/common/Money";
import { MonthSelector } from "@/components/common/MonthSelector";
import { ProgressBar } from "@/components/common/ProgressBar";
import { SectionTitle } from "@/components/common/ScreenHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { GroupedTransactions } from "@/components/transactions/GroupedTransactions";
import { Button } from "@/components/ui/button";
import { OPENING_BALANCE } from "@/data/mock";
import { budgetProgress, buildInsights, calculatedBalance, inMonth, monthLabel, monthTotals, prevMonth } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { useFinance } from "@/store/finance-store";
import { ReceiptText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home · Paisa money tracker" },
      { name: "description", content: "Your calculated balance, monthly income and expenses, budgets and recent transactions at a glance." },
      { property: "og:title", content: "Home · Paisa money tracker" },
      { property: "og:description", content: "Your calculated balance, monthly income and expenses, budgets and recent transactions at a glance." },
    ],
  }),
  component: Home,
});

function Home() {
  const { state, dispatch } = useFinance();
  const { transactions: txs, month, settings } = state;
  const totals = monthTotals(txs, month);
  const balance = calculatedBalance(txs, OPENING_BALANCE, month);
  const prevBalance = calculatedBalance(txs, OPENING_BALANCE, prevMonth(month));
  const delta = balance - prevBalance;
  const insights = buildInsights(txs, state.budgets, month);
  const bp = budgetProgress(txs, state.budgets, month);
  const recent = txs.filter((t) => inMonth(t, month)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <section className="relative overflow-hidden rounded-b-[32px] bg-balance px-5 pb-20 pt-[calc(env(safe-area-inset-top)+1rem)] text-primary-foreground">
        <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary-foreground/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <Link to="/settings" className="inline-flex size-11 items-center justify-center rounded-full bg-primary-foreground/20 font-display text-[15px] font-bold ring-2 ring-primary-foreground/30" aria-label="Profile">RS</Link>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] text-primary-foreground/75">{greet}</p>
            <p className="font-display text-[17px] font-bold leading-tight">Rizwan</p>
          </div>
          <Link to="/review" className="relative" aria-label={`${state.review.length} messages to review`}>
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/20"><Bell className="size-[18px]" /></span>
            {state.review.length > 0 && <span className="absolute -right-0.5 -top-0.5 inline-flex size-[18px] items-center justify-center rounded-full bg-expense text-[10px] font-bold text-primary-foreground ring-2 ring-primary">{state.review.length}</span>}
          </Link>
        </div>

        <div className="relative mt-7 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[13px] text-primary-foreground/80">
            <span>Calculated balance</span>
            <button onClick={() => dispatch({ type: "settings", patch: { hideAmounts: !settings.hideAmounts } })} className="inline-flex size-7 items-center justify-center rounded-full hover:bg-primary-foreground/15" aria-label={settings.hideAmounts ? "Show amounts" : "Hide amounts"}>
              {settings.hideAmounts ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <Money value={balance} split className="mt-1 block text-[40px] font-extrabold leading-none" />
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[12.5px] font-semibold">
              {delta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              <Money value={delta} sign className="font-semibold" /> in {monthLabel(month, "short").split(" ")[0]}
            </span>
          </div>
          <p className="mt-3 text-[11.5px] text-primary-foreground/65">From recorded transactions · not a live bank balance</p>
          <div className="mt-4 flex justify-center"><MonthSelector tone="glass" /></div>
        </div>
      </section>

      <div className="relative -mt-12 space-y-6 px-4">
        <section className="surface grid grid-cols-3 divide-x p-1" aria-label="Money overview">
          <Stat label="Income" icon={<ArrowDownLeft className="size-3.5" />} tone="income" value={totals.income} />
          <Stat label="Expenses" icon={<ArrowUpRight className="size-3.5" />} tone="expense" value={totals.expenses} />
          <Stat label="Net flow" tone={totals.net >= 0 ? "primary" : "expense"} value={totals.net} sign />
        </section>

        {state.review.length > 0 && (
          <Link to="/review" className="flex items-center gap-3 rounded-[18px] border border-warning/30 bg-warning-soft p-3.5">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-card text-warning"><MessageSquareWarning className="size-5" /></span>
            <span className="flex-1">
              <span className="block text-[14px] font-semibold">{state.review.length} SMS need your review</span>
              <span className="block text-[12.5px] text-muted-foreground">Not counted until you confirm them</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        )}

        {insights[0] && (
          <Link to="/insights" className="flex items-center gap-3 rounded-[18px] bg-ink p-4 text-ink-foreground">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/25 text-primary-soft"><Sparkles className="size-[18px]" /></span>
            <span className="flex-1 text-[14px] font-medium leading-snug">{insights[0].text}</span>
            <ChevronRight className="size-4 opacity-60" />
          </Link>
        )}

        {bp.limit > 0 && (
          <Link to="/budgets" className="surface block p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold">Monthly budget</h2>
              <span className={cn("num text-[13px] font-bold", bp.pct > 100 ? "text-expense" : bp.pct >= 85 ? "text-warning" : "text-primary")}>{Math.round(bp.pct)}% used</span>
            </div>
            <ProgressBar value={bp.pct} className="mt-3 h-2.5" color={bp.pct > 100 ? "var(--expense)" : bp.pct >= 85 ? "var(--warning)" : "var(--primary)"} />
            <div className="mt-3 flex justify-between text-[13px]">
              <span className="text-muted-foreground">Spent <Money value={bp.spent} className="font-semibold text-foreground" /> of <Money value={bp.limit} /></span>
              <span className="text-muted-foreground"><Money value={Math.abs(bp.remaining)} className={cn("font-semibold", bp.remaining < 0 ? "text-expense" : "text-foreground")} /> {bp.remaining < 0 ? "over" : "left"}</span>
            </div>
          </Link>
        )}

        <section>
          <SectionTitle title="Recent transactions" action="View all" to="/activity" />
          {recent.length ? (
            <GroupedTransactions items={recent} />
          ) : (
            <div className="surface">
              <EmptyState icon={ReceiptText} title={`Nothing in ${monthLabel(month, "short")}`} text="Transactions from bank SMS and manual entries will show up here." action={<Button onClick={() => dispatch({ type: "sheet", sheet: { kind: "actions" } })}>Add transaction</Button>} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, tone, icon, sign }: { label: string; value: number; tone: "income" | "expense" | "primary"; icon?: ReactNode | undefined; sign?: boolean | undefined }) {
  const cls = { income: "text-income bg-income-soft", expense: "text-expense bg-expense-soft", primary: "text-primary bg-primary-surface" }[tone];
  return (
    <div className="px-3 py-3">
      <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
        {icon && <span className={cn("inline-flex size-5 items-center justify-center rounded-md", cls)}>{icon}</span>}
        {label}
      </div>
      <Money value={value} sign={sign} className={cn("mt-1.5 block text-[16.5px] font-bold", tone === "primary" ? "text-foreground" : "")} />
    </div>
  );
}
