import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BottomNav, TAB_PATHS } from "./BottomNav";
import { AddActionSheet } from "./AddActionSheet";
import { TransactionSheet } from "@/components/forms/TransactionSheet";
import { BudgetSheet } from "@/components/forms/BudgetSheet";
import { GoalSheet } from "@/components/forms/GoalSheet";

/** Centers a phone-width column on larger screens so the prototype behaves like a native app. */
export function AppFrame({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const showNav = TAB_PATHS.includes(pathname);
  return (
    <div className="min-h-dvh bg-secondary">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-background sm:shadow-card">
        <main className={showNav ? "pb-safe-nav" : "pb-10"}>{children}</main>
        {showNav && <BottomNav />}
      </div>
      <AddActionSheet />
      <TransactionSheet />
      <BudgetSheet />
      <GoalSheet />
    </div>
  );
}
