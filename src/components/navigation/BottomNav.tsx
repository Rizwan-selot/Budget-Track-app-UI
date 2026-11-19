import { Link, useLocation } from "@tanstack/react-router";
import { ChartPie, House, Plus, ReceiptText, Settings, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinance } from "@/store/finance-store";

const TABS = [
  { to: "/", label: "Home", icon: House },
  { to: "/activity", label: "Activity", icon: ReceiptText },
  { to: "/insights", label: "Insights", icon: ChartPie },
  { to: "/budgets", label: "Budgets", icon: Target },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export const TAB_PATHS: string[] = TABS.map((t) => t.to);

export function BottomNav() {
  const { pathname } = useLocation();
  const { dispatch } = useFinance();
  const item = (t: (typeof TABS)[number]) => {
    const active = pathname === t.to;
    const Icon = t.icon;
    return (
      <Link key={t.to} to={t.to} className={cn("flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors", active ? "text-primary" : "text-subtle hover:text-muted-foreground")}>
        <span className={cn("inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-primary-surface")}>
          <Icon className="size-[21px]" strokeWidth={active ? 2.3 : 1.9} />
        </span>
        {t.label}
      </Link>
    );
  };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px]" aria-label="Main">
      <div className="relative rounded-t-[26px] border-t bg-card px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-1.5 shadow-nav">
        <div className="flex items-end">
          {TABS.slice(0, 2).map(item)}
          <div className="w-16 shrink-0" aria-hidden />
          {TABS.slice(2).map(item)}
        </div>
        <button
          onClick={() => dispatch({ type: "sheet", sheet: { kind: "actions" } })}
          aria-label="Add transaction"
          className="absolute left-1/2 top-0 inline-flex size-14 -translate-x-1/2 -translate-y-[38%] items-center justify-center rounded-full bg-primary text-primary-foreground ring-[5px] ring-background shadow-fab transition-transform active:scale-95"
        >
          <Plus className="size-6" strokeWidth={2.4} />
        </button>
      </div>
    </nav>
  );
}
