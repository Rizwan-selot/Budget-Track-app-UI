import { type Dispatch, createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import type { Budget, Goal, ReviewItem, Settings, Transaction, TxType } from "@/types/finance";
import { CURRENT_MONTH, DEFAULT_SETTINGS, MOCK_BUDGETS, MOCK_GOALS, MOCK_REVIEW, MOCK_TRANSACTIONS } from "@/data/mock";

export type SheetState =
  | { kind: "actions" }
  | { kind: "tx"; type: TxType; editId?: string }
  | { kind: "budget"; editId?: string }
  | { kind: "goal"; editId?: string }
  | null;

interface State {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  review: ReviewItem[];
  settings: Settings;
  month: string;
  sheet: SheetState;
}

type Action =
  | { type: "hydrate"; state: Partial<State> }
  | { type: "reset" }
  | { type: "month"; month: string }
  | { type: "sheet"; sheet: SheetState }
  | { type: "tx/upsert"; tx: Transaction }
  | { type: "tx/delete"; id: string }
  | { type: "budget/upsert"; budget: Budget }
  | { type: "budget/delete"; id: string }
  | { type: "goal/upsert"; goal: Goal }
  | { type: "goal/delete"; id: string }
  | { type: "goal/add"; id: string; amount: number }
  | { type: "review/resolve"; id: string; tx?: Transaction }
  | { type: "review/add"; items: ReviewItem[] }
  | { type: "settings"; patch: Partial<Settings> };

const initial: State = {
  transactions: MOCK_TRANSACTIONS,
  budgets: MOCK_BUDGETS,
  goals: MOCK_GOALS,
  review: MOCK_REVIEW,
  settings: DEFAULT_SETTINGS,
  month: CURRENT_MONTH,
  sheet: null,
};

const upsert = <T extends { id: string }>(list: T[], item: T) =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "hydrate": return { ...s, ...a.state, sheet: null };
    case "reset": return { ...initial };
    case "month": return { ...s, month: a.month };
    case "sheet": return { ...s, sheet: a.sheet };
    case "tx/upsert": return { ...s, transactions: upsert(s.transactions, a.tx) };
    case "tx/delete": return { ...s, transactions: s.transactions.filter((t) => t.id !== a.id) };
    case "budget/upsert": return { ...s, budgets: upsert(s.budgets, a.budget) };
    case "budget/delete": return { ...s, budgets: s.budgets.filter((b) => b.id !== a.id) };
    case "goal/upsert": return { ...s, goals: upsert(s.goals, a.goal) };
    case "goal/delete": return { ...s, goals: s.goals.filter((g) => g.id !== a.id) };
    case "goal/add":
      return { ...s, goals: s.goals.map((g) => (g.id === a.id ? { ...g, saved: Math.max(0, g.saved + a.amount) } : g)) };
    case "review/resolve":
      return {
        ...s,
        review: s.review.filter((r) => r.id !== a.id),
        transactions: a.tx ? [a.tx, ...s.transactions] : s.transactions,
      };
    case "review/add": return { ...s, review: [...a.items, ...s.review] };
    case "settings": return { ...s, settings: { ...s.settings, ...a.patch } };
  }
}

const KEY = "paisa-prototype-v1";
const Ctx = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const { sheet: _sheet, ...persist } = state;
    localStorage.setItem(KEY, JSON.stringify(persist));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFinance() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}

export const newId = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
