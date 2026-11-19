# Paisa — Design Documentation

Living document. Keep in sync with `src/styles.css`, `src/components/**` and `src/routes/**`.

## 1. Product Design Overview
- **Purpose:** offline-first, private personal finance tracker for Android that builds a transaction history from bank SMS.
- **Target users:** salaried Indian smartphone users with 1–3 bank accounts, a credit card, UPI-heavy spending.
- **Core needs:** "How much do I have and where did it go?", catch mistakes in auto-imported data, stay within monthly limits, save toward goals.
- **Principles:** offline-first · privacy by default · accuracy over decoration · glanceable numbers · every control does something.
- **Personality:** modern, premium, friendly, organised. Not a bank website, not a crypto app, not a toy.

## 2. Design Direction
- **Reference interpretation:** a purple gradient balance header, white rounded surfaces on off-white, large numbers, colourful donut, budget progress, floating purple add button.
- **Adopted:** gradient header (Home only), donut breakdown, rounded cards, bottom nav + central FAB, ring and bar progress.
- **Changed on purpose:**
  - Gradient used once (Home). Other screens use flat surfaces so the gradient stays special.
  - Money overview card overlaps the header so income / expenses / net are visible without scrolling.
  - Dark "ink" card for the single top insight, giving one high-contrast moment instead of many coloured cards.
  - Transactions grouped by day inside one card per day (dividers instead of a card per row) for density.
  - Five destinations (Home, Activity, Insights, Budgets, Settings) with the FAB in a gap between Activity and Insights.
- **Key decisions:** "Calculated balance" wording + disclaimer; transfers drawn in neutral blue, never green/red; failed payments struck through; SMS review queue is surfaced on Home until cleared.

## 3. Color System
All colours are tokens in `src/styles.css` (oklch). Hex = source value from the brief.

| Token | Hex | Usage |
|---|---|---|
| `--primary` | #8B5CF6 | Brand, active nav, primary buttons, default progress |
| `--primary-deep` | #713CEB | Text on soft purple, pressed states |
| `--primary-soft` | #EDE5FF | Inactive chart bars, chips |
| `--primary-surface` | #F5F0FF | Selected chips, active nav pill, info panels |
| `--background` | #F7F7FA | App background |
| `--card` | #FFFFFF | Surfaces, sheets |
| `--foreground` / `--ink` | #19191F | Primary text, insight card, active filter chip |
| `--muted-foreground` | #777783 | Secondary text |
| `--subtle` | #A0A0AA | Tertiary text, inactive nav icons, bank charges |
| `--border` | #EEEEF2 | Card borders, dividers |
| `--income` | #25B77A (darkened for AA text) | Income amounts, refunds, positive change |
| `--expense` | #F16F65 | Expense indicators, over budget, destructive |
| `--warning` | #F5A623 | Near-limit budgets, review queue |
| `--neutral` | #529BEA | Transfers only |
| `*-soft` variants | — | 10–15% tints behind the matching colour |

**Chart palette:** `--chart-1` purple #8B5CF6 (Shopping) · `--chart-2` blue #3298E8 (Transport, Freelance) · `--chart-3` green #2DBD82 (Groceries, Salary) · `--chart-4` orange #F28A36 (Food) · `--chart-5` pink #E96C9B (Bills) · `--chart-6` yellow #E9B949 (Fuel) · `--chart-7` teal #26B5B0 (Health) · `--chart-8` slate #8A8FA3 (Entertainment). A category always keeps the same colour (`src/data/categories.ts`).

**Gradient:** `--gradient-balance` #A77AFB → #9261F1 → #7543D9 at 155°, with a soft radial highlight top-right. Home header only.

## 4. Typography
- **Manrope** (headings, all money via `.num` utility, tabular numerals, −0.02em tracking). **Inter** for UI text.
- Scale: balance 40/800 · screen title 22/700 · large amount 34/800 · section 17/700 · card title 15/700 · row title 15/600 · body 14–14.5/400 · meta 12.5 · minimum 11 (nav labels, badges).
- Sentence case everywhere; no uppercase labels.

## 5. Spacing and Layout
- 4px base. Screen padding 16px (`px-4`), header 20px. Gaps between sections 20–24px, inside cards 12–16px.
- Phone column max 430px, centered on larger screens. Content bottom padding clears nav + FAB (`pb-safe-nav`).
- Safe areas via `env(safe-area-inset-*)`; viewport `viewport-fit=cover`.

## 6. Shape
- Cards 18px (`--radius`), sheets 26px top, chips/inputs 12px, icon tiles 10–12px, pills fully round.
- Shadows: `--shadow-card` (very soft, 2 layers), `--shadow-fab` (purple glow), `--shadow-nav`. Borders do most of the separation work.

## 7. Iconography
- Lucide, default stroke 2 (active nav 2.3). Category icons on 13% tint of their colour.
- Icons only where they aid recognition: categories, nav, settings rows, status chips.

## 8. Components
| Component | File | Notes |
|---|---|---|
| Money | `common/Money.tsx` | Indian grouping, sign, optional lighter paise, respects "Hide amounts" |
| CategoryIcon | `common/CategoryIcon.tsx` | sm 36 / md 44 / lg 56 |
| ProgressBar / RingProgress | `common/ProgressBar.tsx` | Bar supports alert-threshold marker |
| MonthSelector | `common/MonthSelector.tsx` | plain + glass (on gradient) |
| BottomSheet | `common/BottomSheet.tsx` | vaul drawer, 430px max, sticky footer |
| ScreenHeader | `common/ScreenHeader.tsx` | sticky, blurred, optional back |
| BottomNav + FAB | `navigation/BottomNav.tsx` | FAB opens AddActionSheet |
| TransactionRow / GroupedTransactions | `transactions/` | Day groups with daily net |
| FilterSheet | `transactions/FilterSheet.tsx` | Date, category, account, method, amount |
| Transaction / Budget / Goal sheets | `forms/` | Create + edit + delete |
| DonutChart, BarTrend, CompareBars | `charts/` | recharts, token colours |

## 9. Screens
- **Home:** gradient header (avatar, greeting, review bell, calculated balance, change, month), overview card, review banner, top insight, budget preview, recent transactions.
- **Activity:** search, filter sheet, month, summary, type chips, grouped list, empty states.
- **Transaction detail:** amount, type, warnings (failed / transfer), category correction, account, method, reference, source, status, notes, edit, delete with confirm.
- **Insights:** expense/income switch, donut with tap-to-focus, category list with change vs last month, insights, daily/weekly/weekday trend, income vs expenses, top merchants, payment methods.
- **Budgets:** overall ring, near/over counts, category budgets with states and threshold marker, savings goals with monthly target and "Add" contributions.
- **Settings:** profile, local-only notice, preferences, security, SMS/transactions, data & privacy (CSV export, JSON backup/restore, reset, delete all), about.
- **Review SMS:** raw message, editable title, type (expense/income/own transfer), category, confirm or ignore; OTPs flagged.
- **Import past SMS:** range picker, simulated scan with counts, summary actions.

## 10. Interaction Patterns
- FAB → action sheet → type-specific form. Saves update every total, chart and budget immediately.
- Bottom sheets for all create/edit/filter flows; destructive actions confirm in a dialog.
- Toasts confirm every change. Eye toggle on Home hides all amounts app-wide.
- Month selector shared across screens (one selected month in state).

## 11. Financial Data Rules (enforced in `src/lib/finance.ts`, tested in `finance.test.ts`)
1. UPI/card purchases = expense. 2. Salary and received payments = income. 3. Card bill payment = transfer (not a second expense). 4. ATM withdrawal = transfer bank → cash. 5. Own-account transfers are neutral. 6. Refunds subtract from their category's expense. 7. Failed transactions excluded everywhere. 8. Bank charges = expense. 9. Balance = opening + income + refunds − expenses ("calculated", never "live").
Demo month Nov 2026: income ₹39,000, expenses ₹18,450, net ₹20,550, calculated balance ₹85,400.

## 12. Accessibility
- Text contrast: income green darkened for AA; muted text #777783 on white ≥ 4.5:1.
- Touch targets ≥ 40px; icon buttons have aria-labels; progress bars expose values; segmented controls use tab roles.
- Amounts never rely on colour alone (sign, strike-through, labelled chips).

## 13. Android / Jetpack Compose Handoff
- Tokens → `MaterialTheme` ColorScheme + custom `FinanceColors` (income, expense, warning, neutral, chart 1–8). Radii → `Shapes(small=12.dp, medium=18.dp, large=26.dp)`.
- Manrope/Inter via `FontFamily`; money uses `fontFeatureSettings = "tnum"`.
- BottomSheet → `ModalBottomSheet`; BottomNav → `NavigationBar` with a centered FAB in a `Scaffold` with `FabPosition.Center`.
- Browser-only stand-ins to replace natively: SMS permission toggle, import scan simulation, localStorage persistence (→ encrypted Room/SQLCipher), file backup (→ SAF), PIN/biometric (→ BiometricPrompt).

## 14. Decisions and Future Work
- Fixed demo "today" (18 Nov 2026) keeps Today/Yesterday labels stable.
- Not yet built: onboarding flow (welcome → PIN → biometric → permission), PIN entry screen, category and merchant-rule management, account management, custom import date range.
