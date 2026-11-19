import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ChevronRight, MessageSquareText } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { BottomSheet } from "@/components/common/BottomSheet";
import { useFinance } from "@/store/finance-store";
import type { TxType } from "@/types/finance";

const OPTIONS: { type: TxType; label: string; hint: string; icon: typeof ArrowUpRight; cls: string }[] = [
  { type: "expense", label: "Add expense", hint: "Money you spent", icon: ArrowUpRight, cls: "bg-expense-soft text-expense" },
  { type: "income", label: "Add income", hint: "Salary, payments received", icon: ArrowDownLeft, cls: "bg-income-soft text-income" },
  { type: "transfer", label: "Add transfer", hint: "Between your own accounts, ATM", icon: ArrowLeftRight, cls: "bg-neutral-soft text-neutral" },
];

export function AddActionSheet() {
  const { state, dispatch } = useFinance();
  const navigate = useNavigate();
  const open = state.sheet?.kind === "actions";
  return (
    <BottomSheet open={open} onOpenChange={(o) => !o && dispatch({ type: "sheet", sheet: null })} title="Add a transaction" description="Manual entries are marked so you can tell them from SMS imports.">
      <div className="space-y-2 pb-2">
        {OPTIONS.map((o) => (
          <button key={o.type} onClick={() => dispatch({ type: "sheet", sheet: { kind: "tx", type: o.type } })} className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left hover:bg-muted/60">
            <span className={`inline-flex size-11 items-center justify-center rounded-xl ${o.cls}`}><o.icon className="size-5" /></span>
            <span className="flex-1">
              <span className="block text-[15px] font-semibold">{o.label}</span>
              <span className="block text-[13px] text-muted-foreground">{o.hint}</span>
            </span>
            <ChevronRight className="size-4 text-subtle" />
          </button>
        ))}
        {state.review.length > 0 && (
          <button onClick={() => { dispatch({ type: "sheet", sheet: null }); navigate({ to: "/review" }); }} className="flex w-full items-center gap-3 rounded-2xl bg-primary-surface p-3 text-left">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-card text-primary"><MessageSquareText className="size-5" /></span>
            <span className="flex-1">
              <span className="block text-[15px] font-semibold">Review {state.review.length} SMS</span>
              <span className="block text-[13px] text-muted-foreground">Messages we couldn't classify</span>
            </span>
            <ChevronRight className="size-4 text-subtle" />
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
