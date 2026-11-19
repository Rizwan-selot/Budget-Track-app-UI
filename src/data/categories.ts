import {
  Banknote,
  BriefcaseBusiness,
  Car,
  Clapperboard,
  Fuel,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  LifeBuoy,
  Palmtree,
  PiggyBank,
  Receipt,
  ShoppingBag,
  ShoppingBasket,
  UtensilsCrossed,
  ArrowLeftRight,
  Gift,
  Coins,
  type LucideIcon,
} from "lucide-react";
import type { Account, CategoryId, GoalIcon } from "@/types/finance";

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  icon: LucideIcon;
  /** CSS variable name of the chart colour token */
  color: string;
  kind: "expense" | "income" | "transfer";
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  food: { id: "food", name: "Food & Dining", icon: UtensilsCrossed, color: "var(--chart-4)", kind: "expense" },
  groceries: { id: "groceries", name: "Groceries", icon: ShoppingBasket, color: "var(--chart-3)", kind: "expense" },
  shopping: { id: "shopping", name: "Shopping", icon: ShoppingBag, color: "var(--chart-1)", kind: "expense" },
  transport: { id: "transport", name: "Transportation", icon: Car, color: "var(--chart-2)", kind: "expense" },
  fuel: { id: "fuel", name: "Fuel", icon: Fuel, color: "var(--chart-6)", kind: "expense" },
  bills: { id: "bills", name: "Bills & Utilities", icon: Receipt, color: "var(--chart-5)", kind: "expense" },
  health: { id: "health", name: "Health", icon: HeartPulse, color: "var(--chart-7)", kind: "expense" },
  entertainment: { id: "entertainment", name: "Entertainment", icon: Clapperboard, color: "var(--chart-8)", kind: "expense" },
  bank_charges: { id: "bank_charges", name: "Bank Charges", icon: Landmark, color: "var(--subtle)", kind: "expense" },
  salary: { id: "salary", name: "Salary", icon: BriefcaseBusiness, color: "var(--chart-3)", kind: "income" },
  freelance: { id: "freelance", name: "Freelance", icon: Coins, color: "var(--chart-2)", kind: "income" },
  interest: { id: "interest", name: "Interest", icon: PiggyBank, color: "var(--chart-6)", kind: "income" },
  other_income: { id: "other_income", name: "Other Income", icon: Banknote, color: "var(--chart-1)", kind: "income" },
  transfer: { id: "transfer", name: "Transfer", icon: ArrowLeftRight, color: "var(--neutral)", kind: "transfer" },
};

export const EXPENSE_CATEGORIES = Object.values(CATEGORIES).filter((c) => c.kind === "expense");
export const INCOME_CATEGORIES = Object.values(CATEGORIES).filter((c) => c.kind === "income");

export const ACCOUNTS: Record<Account["id"], Account> = {
  hdfc: { id: "hdfc", name: "HDFC Savings", short: "HDFC ••4521", kind: "savings", mask: "4521" },
  sbi: { id: "sbi", name: "SBI Savings", short: "SBI ••0917", kind: "savings", mask: "0917" },
  icici_cc: { id: "icici_cc", name: "ICICI Amazon Pay Card", short: "ICICI Card ••8832", kind: "credit", mask: "8832" },
  cash: { id: "cash", name: "Cash Wallet", short: "Cash", kind: "cash" },
};

export const GOAL_ICONS: Record<GoalIcon, { icon: LucideIcon; color: string; label: string }> = {
  car: { icon: Car, color: "var(--chart-4)", label: "Vehicle" },
  education: { icon: GraduationCap, color: "var(--chart-1)", label: "Education" },
  vacation: { icon: Palmtree, color: "var(--chart-2)", label: "Travel" },
  emergency: { icon: LifeBuoy, color: "var(--chart-3)", label: "Safety net" },
  home: { icon: House, color: "var(--chart-5)", label: "Home" },
  gift: { icon: Gift, color: "var(--chart-6)", label: "Other" },
};
