import type { ReactNode } from "react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Button } from "@/components/ui/button";
import { ACCOUNTS, CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";
import type { AccountId, CategoryId, PaymentMethod } from "@/types/finance";

export interface Filters {
  categories: CategoryId[];
  accounts: AccountId[];
  methods: PaymentMethod[];
  min: string;
  max: string;
  from: string;
  to: string;
}
export const EMPTY_FILTERS: Filters = { categories: [], accounts: [], methods: [], min: "", max: "", from: "", to: "" };
export const countFilters = (f: Filters) => f.categories.length + f.accounts.length + f.methods.length + (f.min || f.max ? 1 : 0) + (f.from || f.to ? 1 : 0);

const METHODS: PaymentMethod[] = ["UPI", "Credit Card", "Debit Card", "Net Banking", "NEFT", "ATM", "Cash", "Auto-debit"];

function Chip({ on, children, onClick }: { on: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={cn("rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors", on ? "border-primary bg-primary-surface text-primary-deep" : "bg-card text-foreground hover:bg-muted")}>
      {children}
    </button>
  );
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
const field = "h-11 w-full rounded-xl border bg-card px-3 text-[14px] outline-none focus:border-primary";

export function FilterSheet({ open, onOpenChange, value, onChange }: { open: boolean; onOpenChange: (o: boolean) => void; value: Filters; onChange: (f: Filters) => void }) {
  const set = (p: Partial<Filters>) => onChange({ ...value, ...p });
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filter transactions"
      footer={
        <div className="flex gap-2">
          <Button variant="soft" size="xl" className="flex-1" onClick={() => onChange(EMPTY_FILTERS)}>Clear all</Button>
          <Button size="xl" className="flex-[2]" onClick={() => onOpenChange(false)}>Show results</Button>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        <section>
          <h4 className="mb-2.5 text-[14px] font-semibold">Date range</h4>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" aria-label="From date" className={field} value={value.from} min="2026-09-01" max="2026-11-30" onChange={(e) => set({ from: e.target.value })} />
            <input type="date" aria-label="To date" className={field} value={value.to} min="2026-09-01" max="2026-11-30" onChange={(e) => set({ to: e.target.value })} />
          </div>
        </section>
        <section>
          <h4 className="mb-2.5 text-[14px] font-semibold">Category</h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(CATEGORIES).map((c) => (
              <Chip key={c.id} on={value.categories.includes(c.id)} onClick={() => set({ categories: toggle(value.categories, c.id) })}>{c.name}</Chip>
            ))}
          </div>
        </section>
        <section>
          <h4 className="mb-2.5 text-[14px] font-semibold">Account</h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(ACCOUNTS).map((a) => (
              <Chip key={a.id} on={value.accounts.includes(a.id)} onClick={() => set({ accounts: toggle(value.accounts, a.id) })}>{a.name}</Chip>
            ))}
          </div>
        </section>
        <section>
          <h4 className="mb-2.5 text-[14px] font-semibold">Payment method</h4>
          <div className="flex flex-wrap gap-2">
            {METHODS.map((m) => <Chip key={m} on={value.methods.includes(m)} onClick={() => set({ methods: toggle(value.methods, m) })}>{m}</Chip>)}
          </div>
        </section>
        <section>
          <h4 className="mb-2.5 text-[14px] font-semibold">Amount (₹)</h4>
          <div className="grid grid-cols-2 gap-2">
            <input inputMode="numeric" placeholder="Min" className={field} value={value.min} onChange={(e) => set({ min: e.target.value.replace(/\D/g, "") })} />
            <input inputMode="numeric" placeholder="Max" className={field} value={value.max} onChange={(e) => set({ max: e.target.value.replace(/\D/g, "") })} />
          </div>
        </section>
      </div>
    </BottomSheet>
  );
}
