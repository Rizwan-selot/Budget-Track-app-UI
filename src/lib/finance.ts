import type { Budget, CategoryId, Transaction } from "@/types/finance";
import { DEMO_TODAY } from "@/data/mock";

/* ---------------- Formatting ---------------- */

const inr0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** ₹1,25,000 style Indian grouping. */
export function formatINR(value: number, opts: { decimals?: boolean | undefined; sign?: boolean | undefined } = {}) {
  const abs = Math.abs(value);
  const body = opts.decimals || !Number.isInteger(abs) ? inr2.format(abs) : inr0.format(abs);
  const sign = value < 0 ? "−" : opts.sign && value > 0 ? "+" : "";
  return `${sign}₹${body}`;
}

export function compactINR(value: number) {
  const abs = Math.abs(value);
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(abs % 100000 === 0 ? 0 : 1)}L`;
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}k`;
  return `₹${abs}`;
}

export function monthLabel(month: string, style: "long" | "short" = "long") {
  const [y = 2026, m = 1] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: style, year: "numeric" });
}

export function prevMonth(month: string) {
  const [y = 2026, m = 1] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export function dayLabel(key: string, today = DEMO_TODAY) {
  if (key === today) return "Today";
  const t = new Date(today + "T00:00");
  t.setDate(t.getDate() - 1);
  const y = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  if (key === y) return "Yesterday";
  return new Date(key + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

/* ---------------- Rules ---------------- */

/** Failed transactions never affect totals. Transfers never count as income or expense. */
export const isCounted = (t: Transaction) => t.status === "completed";
export const inMonth = (t: Transaction, month: string) => t.date.startsWith(month);

export interface Totals {
  income: number;
  expenses: number;
  net: number;
  transfers: number;
}

export function monthTotals(txs: Transaction[], month: string): Totals {
  let income = 0;
  let spent = 0;
  let refunds = 0;
  let transfers = 0;
  for (const t of txs) {
    if (!isCounted(t) || !inMonth(t, month)) continue;
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") spent += t.amount;
    else if (t.type === "refund") refunds += t.amount;
    else transfers += t.amount;
  }
  const expenses = Math.max(0, spent - refunds);
  return { income, expenses, net: income - expenses, transfers };
}

/** Balance recorded across all accounts: opening + income + refunds − expenses. Transfers move money between own accounts so they are neutral. */
export function calculatedBalance(txs: Transaction[], opening: number, uptoMonth?: string) {
  return txs.reduce((sum, t) => {
    if (!isCounted(t)) return sum;
    if (uptoMonth && t.date.slice(0, 7) > uptoMonth) return sum;
    if (t.type === "income" || t.type === "refund") return sum + t.amount;
    if (t.type === "expense") return sum - t.amount;
    return sum;
  }, opening);
}

export interface CategorySlice {
  categoryId: CategoryId;
  amount: number;
  pct: number;
  previous: number;
  change: number | null; // % vs previous month
  count: number;
}

export function categoryBreakdown(txs: Transaction[], month: string, kind: "expense" | "income"): CategorySlice[] {
  const tally = (m: string) => {
    const map = new Map<CategoryId, { amount: number; count: number }>();
    for (const t of txs) {
      if (!isCounted(t) || !inMonth(t, m)) continue;
      let delta = 0;
      if (kind === "expense" && t.type === "expense") delta = t.amount;
      else if (kind === "expense" && t.type === "refund") delta = -t.amount;
      else if (kind === "income" && t.type === "income") delta = t.amount;
      else continue;
      const cur = map.get(t.categoryId) ?? { amount: 0, count: 0 };
      cur.amount += delta;
      if (delta > 0) cur.count += 1;
      map.set(t.categoryId, cur);
    }
    return map;
  };
  const now = tally(month);
  const before = tally(prevMonth(month));
  const total = [...now.values()].reduce((s, v) => s + Math.max(0, v.amount), 0);
  return [...now.entries()]
    .filter(([, v]) => v.amount > 0)
    .map(([categoryId, v]) => {
      const previous = before.get(categoryId)?.amount ?? 0;
      return {
        categoryId,
        amount: v.amount,
        count: v.count,
        pct: total ? (v.amount / total) * 100 : 0,
        previous,
        change: previous > 0 ? ((v.amount - previous) / previous) * 100 : null,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function spentInCategory(txs: Transaction[], month: string, categoryId: CategoryId) {
  return txs.reduce((s, t) => {
    if (!isCounted(t) || !inMonth(t, month) || t.categoryId !== categoryId) return s;
    if (t.type === "expense") return s + t.amount;
    if (t.type === "refund") return s - t.amount;
    return s;
  }, 0);
}

export type BudgetState = "normal" | "approaching" | "exceeded";

export function budgetState(spent: number, limit: number, alertAt: number): BudgetState {
  if (spent > limit) return "exceeded";
  if (limit > 0 && (spent / limit) * 100 >= alertAt) return "approaching";
  return "normal";
}

export function budgetProgress(txs: Transaction[], budgets: Budget[], month: string) {
  const items = budgets
    .filter((b) => b.startMonth <= month)
    .map((b) => {
      const spent = Math.max(0, spentInCategory(txs, month, b.categoryId));
      return { budget: b, spent, remaining: b.limit - spent, pct: b.limit ? (spent / b.limit) * 100 : 0, state: budgetState(spent, b.limit, b.alertAt) };
    });
  const limit = items.reduce((s, i) => s + i.budget.limit, 0);
  const spent = items.reduce((s, i) => s + i.spent, 0);
  return { items, limit, spent, remaining: limit - spent, pct: limit ? (spent / limit) * 100 : 0 };
}

/** Day-of-month → net expense for that day. */
export function dailySpend(txs: Transaction[], month: string) {
  const [y = 2026, m = 1] = month.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  const out = Array.from({ length: days }, (_, i) => ({ day: i + 1, amount: 0 }));
  for (const t of txs) {
    if (!isCounted(t) || !inMonth(t, month)) continue;
    const d = Number(t.date.slice(8, 10)) - 1;
    if (t.type === "expense") out[d]!.amount += t.amount;
    if (t.type === "refund") out[d]!.amount -= t.amount;
  }
  return out;
}

export function weeklySpend(txs: Transaction[], month: string) {
  const daily = dailySpend(txs, month);
  const weeks = [0, 0, 0, 0, 0];
  daily.forEach((d) => (weeks[Math.min(4, Math.floor((d.day - 1) / 7))]! += d.amount));
  return weeks.map((amount, i) => ({ label: `W${i + 1}`, amount })).filter((w, i) => i < 4 || w.amount > 0);
}

export function weekdaySpend(txs: Transaction[], month: string) {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sums = names.map((label) => ({ label, amount: 0 }));
  for (const t of txs) {
    if (!isCounted(t) || !inMonth(t, month)) continue;
    const wd = new Date(t.date).getDay();
    if (t.type === "expense") sums[wd]!.amount += t.amount;
    if (t.type === "refund") sums[wd]!.amount -= t.amount;
  }
  return sums;
}

export function topMerchants(txs: Transaction[], month: string, n = 4) {
  const map = new Map<string, { title: string; amount: number; count: number; categoryId: CategoryId }>();
  for (const t of txs) {
    if (!isCounted(t) || !inMonth(t, month) || t.type !== "expense") continue;
    const key = t.title.split(" ·")[0] ?? t.title;
    const cur = map.get(key) ?? { title: key, amount: 0, count: 0, categoryId: t.categoryId };
    cur.amount += t.amount;
    cur.count += 1;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, n);
}

export function methodBreakdown(txs: Transaction[], month: string) {
  const map = new Map<string, number>();
  for (const t of txs) {
    if (!isCounted(t) || !inMonth(t, month) || t.type !== "expense") continue;
    map.set(t.method, (map.get(t.method) ?? 0) + t.amount);
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0);
  return [...map.entries()].map(([method, amount]) => ({ method, amount, pct: total ? (amount / total) * 100 : 0 })).sort((a, b) => b.amount - a.amount);
}

export function pctChange(now: number, before: number) {
  if (!before) return null;
  return ((now - before) / before) * 100;
}

/** Only insights backed by the data in the selected month. */
export function buildInsights(txs: Transaction[], budgets: Budget[], month: string) {
  const out: { tone: "good" | "warn" | "info"; text: string }[] = [];
  const now = monthTotals(txs, month);
  const before = monthTotals(txs, prevMonth(month));
  const change = pctChange(now.expenses, before.expenses);
  if (change !== null && Math.abs(change) >= 1) {
    out.push({
      tone: change < 0 ? "good" : "warn",
      text: `Spending is ${change < 0 ? "down" : "up"} ${Math.abs(Math.round(change))}% compared with ${monthLabel(prevMonth(month), "short").split(" ")[0]}.`,
    });
  }
  const cats = categoryBreakdown(txs, month, "expense");
  if (cats[0]) out.push({ tone: "info", text: `${catName(cats[0].categoryId)} is your highest spend at ${Math.round(cats[0].pct)}% of expenses.` });
  const bp = budgetProgress(txs, budgets, month);
  if (bp.limit) out.push({ tone: bp.pct > 90 ? "warn" : "info", text: `You've used ${Math.round(bp.pct)}% of this month's budgets.` });
  const over = bp.items.filter((i) => i.state === "exceeded");
  if (over[0]) out.push({ tone: "warn", text: `${catName(over[0].budget.categoryId)} is ${formatINR(over[0].spent - over[0].budget.limit)} over budget.` });
  const wd = weekdaySpend(txs, month).sort((a, b) => b.amount - a.amount)[0];
  if (wd && wd.amount > 0) out.push({ tone: "info", text: `${fullDay(wd.label)} is your biggest spending day this month.` });
  if (before.income && now.income) {
    const rateNow = now.net / now.income;
    const rateBefore = before.net / before.income;
    if (rateNow > rateBefore) out.push({ tone: "good", text: `You saved ${Math.round(rateNow * 100)}% of income, up from ${Math.round(rateBefore * 100)}%.` });
  }
  return out;
}

const DAY_NAMES: Record<string, string> = { Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };
const fullDay = (s: string) => DAY_NAMES[s] ?? s;

// Lazy import avoided: names duplicated minimally to keep this module UI-free.
const CAT_NAMES: Partial<Record<CategoryId, string>> = {
  food: "Food & Dining", groceries: "Groceries", shopping: "Shopping", transport: "Transportation", fuel: "Fuel",
  bills: "Bills & Utilities", health: "Health", entertainment: "Entertainment", bank_charges: "Bank charges",
};
const catName = (id: CategoryId) => CAT_NAMES[id] ?? id;
