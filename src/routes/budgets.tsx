import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CircleCheck, Plus, Target, PiggyBank, MoreHorizontal } from "lucide-react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { CategoryIcon } from "@/components/common/CategoryIcon";
import { EmptyState } from "@/components/common/EmptyState";
import { Money } from "@/components/common/Money";
import { MonthSelector } from "@/components/common/MonthSelector";
import { ProgressBar, RingProgress } from "@/components/common/ProgressBar";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AmountInput } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { CATEGORIES, GOAL_ICONS } from "@/data/categories";
import { CURRENT_MONTH } from "@/data/mock";
import { budgetProgress, formatINR, monthLabel, type BudgetState } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { useFinance } from "@/store/finance-store";
import type { Goal } from "@/types/finance";

export const Route = createFileRoute("/budgets")({
  head: () => ({
    meta: [
      { title: "Budgets & goals · Paisa money tracker" },
      { name: "description", content: "Monthly category budgets with alerts, plus savings goals with progress and target dates." },
      { property: "og:title", content: "Budgets & goals · Paisa money tracker" },
      { property: "og:description", content: "Monthly category budgets with alerts, plus savings goals with progress and target dates." },
    ],
  }),
  component: Budgets,
});

const STATE_UI: Record<BudgetState, { color: string; label: string; cls: string }> = {
  normal: { color: "var(--primary)", label: "On track", cls: "bg-primary-surface text-primary-deep" },
  approaching: { color: "var(--warning)", label: "Near limit", cls: "bg-warning-soft text-warning" },
  exceeded: { color: "var(--expense)", label: "Over budget", cls: "bg-expense-soft text-expense" },
};

function monthsBetween(from: string, to: string) {
  const [a = 0, b = 0] = from.split("-").map(Number);
  const [c = 0, d = 0] = to.split("-").map(Number);
  return (c - a) * 12 + (d - b);
}

function Budgets() {
  const { state, dispatch } = useFinance();
  const bp = budgetProgress(state.transactions, state.budgets, state.month);
  const [contrib, setContrib] = useState<Goal | null>(null);
  const [amount, setAmount] = useState("");
  const overall: BudgetState = bp.spent > bp.limit ? "exceeded" : bp.pct >= 85 ? "approaching" : "normal";

  return (
    <div>
      <ScreenHeader title="Budgets" right={<MonthSelector />} />
      <div className="space-y-6 px-4">
        <section className="surface p-4">
          <div className="flex items-center gap-4">
            <RingProgress value={bp.pct} color={STATE_UI[overall].color} size={84} stroke={9}>
              <span className="num text-[17px] font-extrabold">{Math.round(bp.pct)}%</span>
            </RingProgress>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] text-muted-foreground">Spent in {monthLabel(state.month, "short")}</p>
              <Money value={bp.spent} className="block text-[24px] font-extrabold" />
              <p className="text-[13px] text-muted-foreground">of <Money value={bp.limit} className="font-semibold text-foreground" /> budgeted</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Pill label="Remaining" value={Math.max(0, bp.remaining)} />
            <Pill label="Near limit" count={bp.items.filter((i) => i.state === "approaching").length} tone="warning" />
            <Pill label="Over" count={bp.items.filter((i) => i.state === "exceeded").length} tone="expense" />
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-bold">Category budgets</h2>
            <Button variant="soft" size="sm" className="h-9 rounded-full px-3.5" onClick={() => dispatch({ type: "sheet", sheet: { kind: "budget" } })}><Plus />New</Button>
          </div>
          {bp.items.length === 0 ? (
            <div className="surface"><EmptyState icon={Target} title="No budgets yet" text="Set a monthly limit for a category to see how your spending tracks against it." action={<Button onClick={() => dispatch({ type: "sheet", sheet: { kind: "budget" } })}>Create a budget</Button>} /></div>
          ) : (
            <div className="space-y-2.5">
              {bp.items.sort((a, b) => b.pct - a.pct).map(({ budget, spent, remaining, pct, state: st }) => {
                const ui = STATE_UI[st];
                return (
                  <button key={budget.id} onClick={() => dispatch({ type: "sheet", sheet: { kind: "budget", editId: budget.id } })} className="surface block w-full p-4 text-left transition-colors hover:bg-muted/40">
                    <div className="flex items-center gap-3">
                      <CategoryIcon id={budget.categoryId} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[15px] font-semibold">{CATEGORIES[budget.categoryId].name}</span>
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold", ui.cls)}>
                            {st === "normal" ? <CircleCheck className="size-3" /> : <AlertTriangle className="size-3" />}{ui.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[13px] text-muted-foreground"><Money value={spent} className="font-semibold text-foreground" /> of <Money value={budget.limit} /></p>
                      </div>
                    </div>
                    <ProgressBar value={pct} color={ui.color} marker={budget.alertAt} className="mt-3 h-2.5" />
                    <div className="mt-2 flex justify-between text-[12.5px]">
                      <span className="num font-semibold" style={{ color: ui.color }}>{Math.round(pct)}% used</span>
                      <span className="text-muted-foreground">{remaining >= 0 ? <><Money value={remaining} className="font-semibold text-foreground" /> left</> : <><Money value={-remaining} className="font-semibold text-expense" /> over</>}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[17px] font-bold">Savings goals</h2>
            <Button variant="soft" size="sm" className="h-9 rounded-full px-3.5" onClick={() => dispatch({ type: "sheet", sheet: { kind: "goal" } })}><Plus />New</Button>
          </div>
          <p className="mb-3 text-[12.5px] text-muted-foreground">Money set aside for later. Separate from your spending budgets.</p>
          {state.goals.length === 0 ? (
            <div className="surface"><EmptyState icon={PiggyBank} title="No savings goals" text="Create a goal like an emergency fund or a trip and track your progress." /></div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {state.goals.map((g) => {
                const meta = GOAL_ICONS[g.icon];
                const pct = (g.saved / g.target) * 100;
                const left = g.target - g.saved;
                const months = Math.max(1, monthsBetween(CURRENT_MONTH, g.targetDate));
                return (
                  <div key={g.id} className="surface p-4">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex size-11 items-center justify-center rounded-xl" style={{ color: meta.color, backgroundColor: `color-mix(in oklab, ${meta.color} 13%, transparent)` }}><meta.icon className="size-5" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold">{g.name}</p>
                        <p className="text-[12.5px] text-muted-foreground">By {monthLabel(g.targetDate, "short")} · {months} month{months > 1 ? "s" : ""} left</p>
                      </div>
                      <button onClick={() => dispatch({ type: "sheet", sheet: { kind: "goal", editId: g.id } })} className="-mr-1 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted" aria-label={`Edit ${g.name}`}><MoreHorizontal className="size-4" /></button>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <p><Money value={g.saved} className="text-[20px] font-extrabold" /> <span className="text-[13px] text-muted-foreground">of <Money value={g.target} /></span></p>
                      <span className="num text-[13px] font-bold" style={{ color: meta.color }}>{Math.round(pct)}%</span>
                    </div>
                    <ProgressBar value={pct} color={meta.color} className="mt-2 h-2.5" />
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[12.5px] text-muted-foreground">{left > 0 ? <>Save <Money value={Math.ceil(left / months)} className="font-semibold text-foreground" />/month to reach it</> : <span className="font-semibold text-income">Goal reached</span>}</p>
                      {left > 0 && <Button size="sm" variant="ink" className="h-8 rounded-full px-3" onClick={() => { setContrib(g); setAmount(""); }}><Plus />Add</Button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <BottomSheet
        open={!!contrib}
        onOpenChange={(o) => !o && setContrib(null)}
        title={contrib ? `Add to ${contrib.name}` : ""}
        description={contrib ? `${formatINR(contrib.target - contrib.saved)} to go` : undefined}
        footer={<Button size="xl" className="w-full" onClick={() => {
          const v = Number(amount);
          if (!contrib || !v) return;
          const capped = Math.min(v, contrib.target - contrib.saved);
          dispatch({ type: "goal/add", id: contrib.id, amount: capped });
          toast.success(`${formatINR(capped)} added to ${contrib.name}`);
          setContrib(null);
        }}>Add savings</Button>}
      >
        <div className="space-y-3 pb-2">
          <AmountInput value={amount} onChange={setAmount} />
          <div className="flex justify-center gap-2">
            {[1000, 2500, 5000].map((v) => <button key={v} onClick={() => setAmount(String(v))} className="rounded-full border px-3.5 py-1.5 text-[13px] font-semibold hover:bg-muted">{formatINR(v)}</button>)}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

function Pill({ label, value, count, tone }: { label: string; value?: number | undefined; count?: number | undefined; tone?: "warning" | "expense" | undefined }) {
  return (
    <div className={cn("rounded-xl px-2 py-2.5", tone === "warning" ? "bg-warning-soft" : tone === "expense" ? "bg-expense-soft" : "bg-muted")}>
      <p className="text-[11.5px] text-muted-foreground">{label}</p>
      {value !== undefined ? <Money value={value} className="text-[15px] font-bold" /> : <span className={cn("num text-[15px] font-bold", tone === "warning" ? "text-warning" : "text-expense")}>{count}</span>}
    </div>
  );
}
