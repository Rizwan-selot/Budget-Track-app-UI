import { describe, expect, it } from "vitest";
import { MOCK_BUDGETS, MOCK_TRANSACTIONS, OPENING_BALANCE } from "@/data/mock";
import { budgetProgress, budgetState, calculatedBalance, categoryBreakdown, formatINR, monthTotals } from "./finance";
import type { Transaction } from "@/types/finance";

const tx = (p: Partial<Transaction>): Transaction => ({
  id: "x", title: "x", type: "expense", categoryId: "food", amount: 100, date: "2026-11-10T10:00",
  accountId: "hdfc", method: "UPI", source: "manual", status: "completed", ...p,
});

describe("finance rules", () => {
  it("November demo totals are ₹39,000 income, ₹18,450 expenses, ₹20,550 net", () => {
    const t = monthTotals(MOCK_TRANSACTIONS, "2026-11");
    expect(t.income).toBe(39000);
    expect(t.expenses).toBe(18450);
    expect(t.net).toBe(20550);
  });

  it("ATM withdrawals and own-account transfers are neither income nor expense", () => {
    const t = monthTotals([tx({ type: "transfer", categoryId: "transfer", amount: 2000, toAccountId: "cash" })], "2026-11");
    expect(t.expenses).toBe(0);
    expect(t.income).toBe(0);
  });

  it("credit card bill payment is not counted as a second expense", () => {
    const t = monthTotals([
      tx({ amount: 5400, accountId: "icici_cc", method: "Credit Card" }),
      tx({ type: "transfer", categoryId: "transfer", amount: 5400, toAccountId: "icici_cc" }),
    ], "2026-11");
    expect(t.expenses).toBe(5400);
  });

  it("failed UPI payments do not count", () => {
    expect(monthTotals([tx({ amount: 520, status: "failed" })], "2026-11").expenses).toBe(0);
  });

  it("refunds reduce the category's expense", () => {
    const list = [tx({ categoryId: "shopping", amount: 1299 }), tx({ type: "refund", categoryId: "shopping", amount: 299 })];
    expect(monthTotals(list, "2026-11").expenses).toBe(1000);
    expect(categoryBreakdown(list, "2026-11", "expense")[0]?.amount).toBe(1000);
  });

  it("calculated balance ignores transfers", () => {
    expect(calculatedBalance(MOCK_TRANSACTIONS, OPENING_BALANCE)).toBe(85400);
  });

  it("budget states: approaching at alert threshold, exceeded above limit", () => {
    expect(budgetState(3600, 4000, 85)).toBe("approaching");
    expect(budgetState(4183, 4000, 80)).toBe("exceeded");
    expect(budgetState(1000, 1500, 80)).toBe("normal");
    const shopping = budgetProgress(MOCK_TRANSACTIONS, MOCK_BUDGETS, "2026-11").items.find((i) => i.budget.categoryId === "shopping");
    expect(shopping?.state).toBe("exceeded");
  });

  it("uses Indian digit grouping", () => {
    expect(formatINR(125000)).toBe("₹1,25,000");
    expect(formatINR(1250)).toBe("₹1,250");
  });
});
