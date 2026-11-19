import { Money } from "@/components/common/Money";
import { dayKey, dayLabel, isCounted } from "@/lib/finance";
import type { Transaction } from "@/types/finance";
import { TransactionRow } from "./TransactionRow";

export function GroupedTransactions({ items }: { items: Transaction[] }) {
  const groups = new Map<string, Transaction[]>();
  [...items].sort((a, b) => b.date.localeCompare(a.date)).forEach((t) => {
    const k = dayKey(t.date);
    groups.set(k, [...(groups.get(k) ?? []), t]);
  });
  return (
    <div className="space-y-5">
      {[...groups.entries()].map(([k, list]) => {
        const net = list.reduce((s, t) => (!isCounted(t) ? s : t.type === "expense" ? s - t.amount : t.type === "income" || t.type === "refund" ? s + t.amount : s), 0);
        return (
          <section key={k}>
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-[13px] font-semibold text-muted-foreground">{dayLabel(k)}</h3>
              {net !== 0 && <Money value={net} sign className="text-[12.5px] font-semibold text-muted-foreground" />}
            </div>
            <div className="surface divide-y overflow-hidden">
              {list.map((t) => <TransactionRow key={t.id} t={t} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
