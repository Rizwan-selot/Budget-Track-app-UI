import type { ReactNode } from "react";
import { CategoryIcon } from "@/components/common/CategoryIcon";
import { cn } from "@/lib/utils";
import type { CategoryMeta } from "@/data/categories";
import type { CategoryId } from "@/types/finance";

export const inputCls = "h-12 w-full rounded-xl border bg-card px-3.5 text-[15px] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";

export function Field({ label, children, hint, error }: { label: string; children: ReactNode; hint?: string | undefined; error?: string | undefined }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[12px] font-medium text-expense">{error}</span> : hint ? <span className="mt-1 block text-[12px] text-subtle">{hint}</span> : null}
    </label>
  );
}

export function AmountInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean | undefined }) {
  return (
    <div className="flex items-baseline justify-center gap-1 rounded-2xl bg-muted/60 py-5">
      <span className="num text-[28px] font-bold text-subtle">₹</span>
      <input
        autoFocus={autoFocus}
        inputMode="decimal"
        aria-label="Amount"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1"))}
        style={{ width: `${Math.max(1, value.length) + 0.6}ch` }}
        className="num max-w-[10ch] bg-transparent text-center text-[40px] font-extrabold outline-none placeholder:text-subtle"
      />
    </div>
  );
}

export function CategoryGrid({ options, value, onChange }: { options: CategoryMeta[]; value: CategoryId; onChange: (id: CategoryId) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map((c) => (
        <button key={c.id} type="button" onClick={() => onChange(c.id)} aria-pressed={value === c.id} className={cn("flex flex-col items-center gap-1.5 rounded-2xl border p-2 pb-2.5 text-center transition-colors", value === c.id ? "border-primary bg-primary-surface" : "bg-card hover:bg-muted/60")}>
          <CategoryIcon id={c.id} size="sm" />
          <span className="line-clamp-2 text-[11px] font-medium leading-tight">{c.name}</span>
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid rounded-2xl bg-muted p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} type="button" onClick={() => onChange(o.value)} className={cn("h-10 rounded-xl text-[14px] font-semibold transition-all", value === o.value ? "bg-card text-foreground shadow-card" : "text-muted-foreground")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
