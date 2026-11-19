import { ChevronLeft, ChevronRight } from "lucide-react";
import { DEMO_MONTHS } from "@/data/mock";
import { monthLabel } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { useFinance } from "@/store/finance-store";

export function MonthSelector({ tone = "plain" }: { tone?: "plain" | "glass" | undefined }) {
  const { state, dispatch } = useFinance();
  const i = DEMO_MONTHS.indexOf(state.month);
  const go = (d: number) => {
    const next = DEMO_MONTHS[i + d];
    if (next) dispatch({ type: "month", month: next });
  };
  const btn = "inline-flex size-8 items-center justify-center rounded-full disabled:opacity-30";
  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-full p-1", tone === "glass" ? "bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20" : "border bg-card")}>
      <button className={btn} onClick={() => go(-1)} disabled={i <= 0} aria-label="Previous month"><ChevronLeft className="size-4" /></button>
      <span className="min-w-[92px] text-center text-[13px] font-semibold">{monthLabel(state.month, "short")}</span>
      <button className={btn} onClick={() => go(1)} disabled={i >= DEMO_MONTHS.length - 1} aria-label="Next month"><ChevronRight className="size-4" /></button>
    </div>
  );
}
