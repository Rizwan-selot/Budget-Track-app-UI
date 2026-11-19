import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, CircleSlash, PencilLine, Undo2 } from "lucide-react";
import { CategoryIcon } from "@/components/common/CategoryIcon";
import { Money } from "@/components/common/Money";
import { ACCOUNTS, CATEGORIES } from "@/data/categories";
import { timeLabel } from "@/lib/finance";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/finance";

export function amountTone(t: Transaction) {
  if (t.status === "failed") return "text-subtle line-through";
  if (t.type === "income" || t.type === "refund") return "text-income";
  if (t.type === "transfer") return "text-neutral";
  return "text-foreground";
}

export function signedAmount(t: Transaction) {
  if (t.type === "income" || t.type === "refund") return t.amount;
  if (t.type === "transfer") return t.amount;
  return -t.amount;
}

export function TransactionRow({ t }: { t: Transaction }) {
  const cat = CATEGORIES[t.categoryId];
  const acct = ACCOUNTS[t.accountId];
  const sub =
    t.type === "transfer" && t.toAccountId
      ? `${acct.short.split(" ")[0]} → ${ACCOUNTS[t.toAccountId].short.split(" ")[0]}`
      : cat.name;
  return (
    <Link to="/transaction/$id" params={{ id: t.id }} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 active:bg-muted">
      <CategoryIcon id={t.categoryId} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-semibold">{t.title}</span>
          {t.source === "manual" && <PencilLine className="size-3.5 shrink-0 text-subtle" aria-label="Added manually" />}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <span className="truncate">{sub}</span>
          <span className="text-subtle">·</span>
          <span className="shrink-0">{t.method}</span>
          <span className="text-subtle">·</span>
          <span className="shrink-0">{timeLabel(t.date)}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <Money value={t.type === "transfer" ? t.amount : signedAmount(t)} sign={t.type !== "transfer"} className={cn("text-[15px] font-bold", amountTone(t))} />
        {t.status === "failed" ? (
          <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-expense"><CircleSlash className="size-3" />Failed</span>
        ) : t.type === "refund" ? (
          <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-income"><Undo2 className="size-3" />Refund</span>
        ) : t.type === "transfer" ? (
          <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-neutral"><ArrowLeftRight className="size-3" />Transfer</span>
        ) : (
          <span className="mt-0.5 text-[11px] text-subtle">{acct.short}</span>
        )}
      </div>
    </Link>
  );
}
