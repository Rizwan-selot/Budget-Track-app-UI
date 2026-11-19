import type { Budget, Goal, ReviewItem, Settings, Transaction } from "@/types/finance";

/** Demonstration data only. "Today" in the prototype is fixed so date groups stay stable. */
export const DEMO_TODAY = "2026-11-18";
export const DEMO_MONTHS = ["2026-09", "2026-10", "2026-11"];
export const CURRENT_MONTH = "2026-11";
/** Recorded balance across accounts before the first tracked month. */
export const OPENING_BALANCE = 48250;

type Row = [string, Transaction["type"], Transaction["categoryId"], number, string, Transaction["accountId"], Transaction["method"], Partial<Transaction>?];

const rows: Row[] = [
  // ---------- November 2026 ----------
  ["Monthly Salary · Acme Tech", "income", "salary", 35000, "2026-11-01T09:12", "hdfc", "NEFT", { reference: "NEFT N305261184420" }],
  ["Kiran Design Studio", "income", "freelance", 4000, "2026-11-12T16:40", "hdfc", "UPI", { reference: "UPI 631642118870", note: "Logo project, final payment" }],
  ["Zomato", "expense", "food", 450, "2026-11-18T13:22", "hdfc", "UPI", { reference: "UPI 632213498001" }],
  ["Swiggy", "expense", "food", 280, "2026-11-17T20:45", "hdfc", "UPI", { reference: "UPI 632120447812" }],
  ["Swiggy Instamart", "expense", "groceries", 520, "2026-11-17T19:02", "hdfc", "UPI", { status: "failed", reference: "UPI 632119300418", note: "Bank reported failure. Money not deducted." }],
  ["Zomato", "expense", "food", 620, "2026-11-08T21:10", "icici_cc", "Credit Card"],
  ["Starbucks", "expense", "food", 230, "2026-11-14T11:05", "icici_cc", "Credit Card"],
  ["Chai & snacks", "expense", "food", 120, "2026-11-16T17:40", "cash", "Cash", { source: "manual" }],
  ["Reliance Smart", "expense", "groceries", 1450, "2026-11-15T18:30", "hdfc", "Debit Card"],
  ["BigBasket", "expense", "groceries", 2150, "2026-11-04T10:15", "hdfc", "UPI"],
  ["Amazon", "expense", "shopping", 1299, "2026-11-10T14:02", "icici_cc", "Credit Card", { reference: "ORD 408-2210931" }],
  ["Myntra", "expense", "shopping", 3183, "2026-11-14T19:48", "icici_cc", "Credit Card"],
  ["Amazon refund", "refund", "shopping", 299, "2026-11-16T10:00", "icici_cc", "Credit Card", { note: "Returned phone case" }],
  ["Uber", "expense", "transport", 185, "2026-11-18T09:05", "hdfc", "UPI"],
  ["Ola", "expense", "transport", 315, "2026-11-11T08:50", "hdfc", "UPI"],
  ["Namma Metro recharge", "expense", "transport", 500, "2026-11-03T08:20", "hdfc", "UPI"],
  ["Indian Oil", "expense", "fuel", 2000, "2026-11-07T17:30", "icici_cc", "Credit Card"],
  ["Jio Prepaid", "expense", "bills", 399, "2026-11-05T12:00", "hdfc", "UPI"],
  ["BESCOM Electricity", "expense", "bills", 1851, "2026-11-06T11:20", "hdfc", "Net Banking"],
  ["Apollo Pharmacy", "expense", "health", 850, "2026-11-09T19:05", "hdfc", "UPI"],
  ["Cult.fit membership", "expense", "health", 1500, "2026-11-02T07:30", "hdfc", "Debit Card"],
  ["PVR Cinemas", "expense", "entertainment", 700, "2026-11-14T21:30", "icici_cc", "Credit Card"],
  ["Netflix", "expense", "entertainment", 649, "2026-11-01T00:10", "icici_cc", "Auto-debit"],
  ["SMS alert charges", "expense", "bank_charges", 18, "2026-11-13T00:05", "hdfc", "Auto-debit"],
  ["ATM Withdrawal", "transfer", "transfer", 2000, "2026-11-09T12:40", "hdfc", "ATM", { toAccountId: "cash" }],
  ["ICICI card bill payment", "transfer", "transfer", 5400, "2026-11-05T09:30", "hdfc", "Net Banking", { toAccountId: "icici_cc", note: "Pays October card spends, already counted as expenses" }],
  // ---------- October 2026 ----------
  ["Monthly Salary · Acme Tech", "income", "salary", 35000, "2026-10-01T09:10", "hdfc", "NEFT"],
  ["Kiran Design Studio", "income", "freelance", 2500, "2026-10-20T15:15", "hdfc", "UPI"],
  ["Zomato", "expense", "food", 1250, "2026-10-04T20:30", "hdfc", "UPI"],
  ["Swiggy", "expense", "food", 1200, "2026-10-18T21:00", "icici_cc", "Credit Card"],
  ["BigBasket", "expense", "groceries", 2100, "2026-10-06T10:00", "hdfc", "UPI"],
  ["DMart", "expense", "groceries", 1800, "2026-10-21T18:10", "hdfc", "Debit Card"],
  ["Flipkart · Big Billion Days", "expense", "shopping", 5200, "2026-10-12T13:45", "icici_cc", "Credit Card"],
  ["Uber", "expense", "transport", 850, "2026-10-09T08:40", "hdfc", "UPI"],
  ["Namma Metro recharge", "expense", "transport", 500, "2026-10-02T08:15", "hdfc", "UPI"],
  ["HP Petrol", "expense", "fuel", 2400, "2026-10-15T17:20", "icici_cc", "Credit Card"],
  ["Jio Prepaid", "expense", "bills", 399, "2026-10-05T12:00", "hdfc", "UPI"],
  ["BESCOM Electricity", "expense", "bills", 1851, "2026-10-07T11:00", "hdfc", "Net Banking"],
  ["Apollo Pharmacy", "expense", "health", 1200, "2026-10-23T19:30", "hdfc", "UPI"],
  ["BookMyShow", "expense", "entertainment", 1501, "2026-10-19T18:00", "icici_cc", "Credit Card"],
  ["Netflix", "expense", "entertainment", 649, "2026-10-01T00:10", "icici_cc", "Auto-debit"],
  ["Transfer to SBI savings", "transfer", "transfer", 10000, "2026-10-02T10:00", "hdfc", "UPI", { toAccountId: "sbi" }],
];

export const MOCK_TRANSACTIONS: Transaction[] = rows.map(([title, type, categoryId, amount, date, accountId, method, extra], i) => ({
  id: `t${i + 1}`,
  title,
  type,
  categoryId,
  amount,
  date,
  accountId,
  method,
  source: "sms",
  status: "completed",
  ...extra,
}));

export const MOCK_BUDGETS: Budget[] = [
  { id: "b1", categoryId: "food", limit: 3000, alertAt: 80, startMonth: "2026-10" },
  { id: "b2", categoryId: "groceries", limit: 4000, alertAt: 85, startMonth: "2026-10" },
  { id: "b3", categoryId: "shopping", limit: 4000, alertAt: 80, startMonth: "2026-10" },
  { id: "b4", categoryId: "transport", limit: 1500, alertAt: 80, startMonth: "2026-10" },
  { id: "b5", categoryId: "fuel", limit: 2500, alertAt: 75, startMonth: "2026-10" },
  { id: "b6", categoryId: "bills", limit: 2500, alertAt: 85, startMonth: "2026-10" },
  { id: "b7", categoryId: "entertainment", limit: 2000, alertAt: 80, startMonth: "2026-10" },
];

export const MOCK_GOALS: Goal[] = [
  { id: "g1", name: "Save for a Car", icon: "car", target: 250000, saved: 62500, targetDate: "2027-12" },
  { id: "g2", name: "Emergency Fund", icon: "emergency", target: 150000, saved: 97500, targetDate: "2027-03" },
  { id: "g3", name: "Goa trip with family", icon: "vacation", target: 40000, saved: 26000, targetDate: "2027-01" },
  { id: "g4", name: "MBA preparation", icon: "education", target: 120000, saved: 30000, targetDate: "2027-06" },
];

export const MOCK_REVIEW: ReviewItem[] = [
  {
    id: "r1",
    sender: "AX-HDFCBK",
    receivedAt: "2026-11-18T08:14",
    sms: "Rs.1,250.00 debited from A/c XX4521 on 18-11-26 to VPA paytmqr28100@paytm. UPI Ref 632218745510. Not you? Call 18002586161",
    amount: 1250,
    suggestedType: "expense",
    suggestedTitle: "Paytm QR merchant",
    accountId: "hdfc",
  },
  {
    id: "r2",
    sender: "VM-HDFCBK",
    receivedAt: "2026-11-16T19:52",
    sms: "INR 3,000.00 credited to A/c XX4521 on 16-11-26 by IMPS from RAHUL S. IMPS Ref 631919004221. Avl bal is hidden.",
    amount: 3000,
    suggestedType: "income",
    suggestedTitle: "Rahul S (IMPS)",
    accountId: "hdfc",
  },
  {
    id: "r3",
    sender: "AD-FLPKRT",
    receivedAt: "2026-11-15T13:03",
    sms: "448210 is your OTP for a payment of Rs 899 at FLIPKART. Valid for 10 mins. Do not share it with anyone.",
    amount: 899,
    suggestedType: "not_transaction",
    suggestedTitle: "Flipkart OTP",
    accountId: "icici_cc",
  },
];

export const DEFAULT_SETTINGS: Settings = {
  hideAmounts: false,
  pinEnabled: true,
  biometric: true,
  autoLock: "1 min",
  smsPermission: "granted",
  autoCategorize: true,
  budgetAlerts: true,
  firstDay: 1,
};
