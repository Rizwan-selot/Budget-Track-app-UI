# Paisa — offline personal finance prototype

Interactive, mobile-first web prototype of an Android app that tracks money from bank SMS. All data is demo data stored in the browser; no backend.

**Run:** `bun install && bun run dev`, open on a phone-width window. **Tests:** `bunx vitest run`.

**Structure**
- `src/routes/` — screens (Home, Activity, Transaction detail, Insights, Budgets, Settings, Review SMS, Import)
- `src/components/` — `common`, `navigation`, `transactions`, `forms`, `charts`
- `src/lib/finance.ts` — all money calculations (UI-free) + tests
- `src/data/` — categories, accounts, mock transactions/budgets/goals
- `src/store/finance-store.tsx` — app state (persists to localStorage)
- `DESIGN.md` — design system and decisions
