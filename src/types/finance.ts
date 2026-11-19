export type TxType = "expense" | "income" | "transfer" | "refund";
export type TxStatus = "completed" | "failed";
export type TxSource = "sms" | "manual";

export type ExpenseCategoryId =
  | "food"
  | "groceries"
  | "shopping"
  | "transport"
  | "fuel"
  | "bills"
  | "health"
  | "entertainment"
  | "bank_charges";
export type IncomeCategoryId = "salary" | "freelance" | "interest" | "other_income";
export type CategoryId = ExpenseCategoryId | IncomeCategoryId | "transfer";

export type AccountId = "hdfc" | "icici_cc" | "sbi" | "cash";
export type PaymentMethod =
  | "UPI"
  | "Credit Card"
  | "Debit Card"
  | "Net Banking"
  | "NEFT"
  | "ATM"
  | "Cash"
  | "Auto-debit";

export interface Transaction {
  id: string;
  title: string;
  type: TxType;
  categoryId: CategoryId;
  amount: number; // always positive
  date: string; // ISO local datetime "2026-11-18T13:22"
  accountId: AccountId;
  toAccountId?: AccountId | undefined; // transfers only
  method: PaymentMethod;
  source: TxSource;
  status: TxStatus;
  reference?: string | undefined;
  note?: string | undefined;
}

export interface Budget {
  id: string;
  categoryId: ExpenseCategoryId;
  limit: number;
  alertAt: number; // percent of limit that triggers "approaching"
  startMonth: string; // "2026-11"
}

export type GoalIcon = "car" | "education" | "vacation" | "emergency" | "home" | "gift";

export interface Goal {
  id: string;
  name: string;
  icon: GoalIcon;
  target: number;
  saved: number;
  targetDate: string; // "2027-12"
}

export interface ReviewItem {
  id: string;
  sender: string;
  receivedAt: string;
  sms: string;
  amount: number | null;
  suggestedType: TxType | "not_transaction";
  suggestedTitle: string;
  accountId: AccountId;
}

export interface Account {
  id: AccountId;
  name: string;
  short: string;
  kind: "savings" | "credit" | "cash";
  mask?: string | undefined;
}

export interface Settings {
  hideAmounts: boolean;
  pinEnabled: boolean;
  biometric: boolean;
  autoLock: "immediately" | "1 min" | "5 min";
  smsPermission: "granted" | "denied" | "not_asked";
  autoCategorize: boolean;
  budgetAlerts: boolean;
  firstDay: number;
}
