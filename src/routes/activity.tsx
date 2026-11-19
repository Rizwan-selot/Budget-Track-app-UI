import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SearchX, SlidersHorizontal, Search, X, ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Money } from "@/components/common/Money";
import { MonthSelector } from "@/components/common/MonthSelector";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { GroupedTransactions } from "@/components/transactions/GroupedTransactions";
import { countFilters, EMPTY_FILTERS, FilterSheet, type Filters } from "@/components/transactions/FilterSheet";
import { Button } from "@/components/ui/button";
import { ACCOUNTS, CATEGORIES } from "@/data/categories";
import { inMonth, monthTotals } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { useFinance } from "@/store/finance-store";
import type { Transaction } from "@/types/finance";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity · Paisa money tracker" },
      { name: "description", content: "Search, filter and review every income, expense and transfer imported from your bank SMS." },
      { property: "og:title", content: "Activity · Paisa money tracker" },
      { property: "og:description", content: "Search, filter and review every income, expense and transfer imported from your bank SMS." },
    ],
  }),
  component: Activity,
});

type Kind = "all" | "expense" | "income" | "transfer";
const KINDS: { v: Kind; label: string }[] = [
  { v: "all", label: "All" },
  { v: "expense", label: "Expenses" },
  { v: "income", label: "Income" },
  { v: "transfer", label: "Transfers" },
];

function matches(t: Transaction, q: string) {
  if (!q) return true;
  const s = q.toLowerCase().replace(/[₹,\s]/g, "");
  const hay = `${t.title} ${t.note ?? ""} ${CATEGORIES[t.categoryId].name} ${ACCOUNTS[t.accountId].name} ${t.method}`.toLowerCase();
  return hay.includes(q.toLowerCase().trim()) || String(t.amount).startsWith(s);
}

function Activity() {
  const { state } = useFinance();
  const [kind, setKind] = useState<Kind>("all");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const totals = monthTotals(state.transactions, state.month);
  const nFilters = countFilters(filters);
  const usesDateRange = !!(filters.from || filters.to);

  const list = useMemo(
    () =>
      state.transactions.filter((t) => {
        if (!usesDateRange && !inMonth(t, state.month)) return false;
        if (filters.from && t.date.slice(0, 10) < filters.from) return false;
        if (filters.to && t.date.slice(0, 10) > filters.to) return false;
        if (kind === "expense" && t.type !== "expense") return false;
        if (kind === "income" && t.type !== "income" && t.type !== "refund") return false;
        if (kind === "transfer" && t.type !== "transfer") return false;
        if (filters.categories.length && !filters.categories.includes(t.categoryId)) return false;
        if (filters.accounts.length && !filters.accounts.includes(t.accountId) && !(t.toAccountId && filters.accounts.includes(t.toAccountId))) return false;
        if (filters.methods.length && !filters.methods.includes(t.method)) return false;
        if (filters.min && t.amount < Number(filters.min)) return false;
        if (filters.max && t.amount > Number(filters.max)) return false;
        return matches(t, query);
      }),
    [state.transactions, state.month, kind, query, filters, usesDateRange],
  );

  const monthHasAny = state.transactions.some((t) => inMonth(t, state.month));

  return (
    <div>
      <ScreenHeader
        title="Activity"
        right={
          <>
            <button onClick={() => setSearching((s) => !s)} className={cn("inline-flex size-10 items-center justify-center rounded-full border bg-card", searching && "border-primary text-primary")} aria-label="Search">
              <Search className="size-[18px]" />
            </button>
            <button onClick={() => setFilterOpen(true)} className="relative inline-flex size-10 items-center justify-center rounded-full border bg-card" aria-label="Filters">
              <SlidersHorizontal className="size-[18px]" />
              {nFilters > 0 && <span className="absolute -right-0.5 -top-0.5 inline-flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{nFilters}</span>}
            </button>
          </>
        }
      />
      <div className="space-y-4 px-4">
        {searching && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Merchant, category, note or amount" className="h-12 w-full rounded-2xl border bg-card pl-10 pr-10 text-[15px] outline-none focus:border-primary" />
            {query && <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-subtle hover:bg-muted" aria-label="Clear search"><X className="size-4" /></button>}
          </div>
        )}

        <div className="flex items-center justify-between">
          {usesDateRange ? <span className="text-[13px] font-semibold text-muted-foreground">{filters.from || "Start"} → {filters.to || "Today"}</span> : <MonthSelector />}
          <span className="text-[12.5px] text-muted-foreground">{list.length} items</span>
        </div>

        <section className="surface grid grid-cols-3 divide-x py-3">
          <Mini label="Income" value={totals.income} cls="text-income" />
          <Mini label="Expenses" value={totals.expenses} cls="text-expense" />
          <Mini label="Net" value={totals.net} cls="text-foreground" sign />
        </section>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {KINDS.map((k) => (
            <button key={k.v} onClick={() => setKind(k.v)} aria-pressed={kind === k.v} className={cn("h-9 shrink-0 rounded-full px-4 text-[13.5px] font-semibold transition-colors", kind === k.v ? "bg-ink text-ink-foreground" : "border bg-card text-muted-foreground")}>
              {k.label}
            </button>
          ))}
          {nFilters > 0 && (
            <button onClick={() => setFilters(EMPTY_FILTERS)} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-primary-surface px-3 text-[13px] font-semibold text-primary-deep">
              {nFilters} filter{nFilters > 1 ? "s" : ""} <X className="size-3.5" />
            </button>
          )}
        </div>

        {kind === "transfer" && list.length > 0 && <p className="rounded-xl bg-neutral-soft px-3 py-2 text-[12.5px] text-neutral">Transfers move money between your own accounts. They're never counted as income or expense.</p>}

        {list.length ? (
          <GroupedTransactions items={list} />
        ) : (
          <div className="surface">
            {monthHasAny || usesDateRange ? (
              <EmptyState icon={SearchX} title="No matching transactions" text="Try a different search or remove some filters." action={<Button variant="soft" onClick={() => { setQuery(""); setFilters(EMPTY_FILTERS); setKind("all"); }}>Clear search and filters</Button>} />
            ) : (
              <EmptyState icon={ReceiptText} title="No transactions this month" text="Imported SMS and manual entries for this month will appear here." />
            )}
          </div>
        )}
      </div>
      <FilterSheet open={filterOpen} onOpenChange={setFilterOpen} value={filters} onChange={setFilters} />
    </div>
  );
}

function Mini({ label, value, cls, sign }: { label: string; value: number; cls: string; sign?: boolean | undefined }) {
  return (
    <div className="px-3 text-center">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <Money value={value} sign={sign} className={cn("mt-0.5 block text-[15px] font-bold", cls)} />
    </div>
  );
}
