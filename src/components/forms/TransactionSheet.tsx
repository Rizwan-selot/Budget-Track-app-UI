import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Button } from "@/components/ui/button";
import { ACCOUNTS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/data/categories";
import { DEMO_TODAY } from "@/data/mock";
import { newId, useFinance } from "@/store/finance-store";
import type { AccountId, CategoryId, PaymentMethod, Transaction, TxType } from "@/types/finance";
import { AmountInput, CategoryGrid, Field, inputCls, Segmented } from "./fields";

const METHODS: PaymentMethod[] = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash"];
const TYPES: { value: TxType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfer" },
];

export function TransactionSheet() {
  const { state, dispatch } = useFinance();
  const sheet = state.sheet?.kind === "tx" ? state.sheet : null;
  const editing = sheet?.editId ? state.transactions.find((t) => t.id === sheet.editId) : undefined;

  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState<CategoryId>("food");
  const [account, setAccount] = useState<AccountId>("hdfc");
  const [toAccount, setToAccount] = useState<AccountId>("cash");
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [date, setDate] = useState(`${DEMO_TODAY}T12:00`);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sheet) return;
    const t = editing;
    setType(t?.type ?? sheet.type);
    setAmount(t ? String(t.amount) : "");
    setTitle(t?.title ?? "");
    setCat(t?.categoryId ?? (sheet.type === "income" ? "salary" : sheet.type === "transfer" ? "transfer" : "food"));
    setAccount(t?.accountId ?? "hdfc");
    setToAccount(t?.toAccountId ?? "cash");
    setMethod(t?.method ?? "UPI");
    setDate(t?.date ?? `${DEMO_TODAY}T${new Date().toTimeString().slice(0, 5)}`);
    setNote(t?.note ?? "");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet?.editId, sheet?.type, !!sheet]);

  const changeType = (v: TxType) => {
    setType(v);
    setCat(v === "income" ? "salary" : v === "transfer" ? "transfer" : "food");
  };

  const close = () => dispatch({ type: "sheet", sheet: null });

  const save = () => {
    const value = Number(amount);
    if (!value || value <= 0) return setError("Enter an amount greater than zero.");
    if (type === "transfer" && account === toAccount) return setError("Choose two different accounts.");
    const tx: Transaction = {
      id: editing?.id ?? newId("m"),
      title: title.trim() || (type === "transfer" ? `Transfer to ${ACCOUNTS[toAccount].name}` : type === "income" ? "Income" : "Expense"),
      type: editing?.type === "refund" ? "refund" : type,
      categoryId: type === "transfer" ? "transfer" : cat,
      amount: Math.round(value * 100) / 100,
      date,
      accountId: account,
      toAccountId: type === "transfer" ? toAccount : undefined,
      method: type === "transfer" && toAccount === "cash" ? "ATM" : method,
      source: editing?.source ?? "manual",
      status: editing?.status ?? "completed",
      reference: editing?.reference,
      note: note.trim() || undefined,
    };
    dispatch({ type: "tx/upsert", tx });
    close();
    toast.success(editing ? "Transaction updated" : `${type === "income" ? "Income" : type === "transfer" ? "Transfer" : "Expense"} added`, {
      description: type === "transfer" ? "Transfers don't change income or expense totals." : undefined,
    });
  };

  const label = editing ? "Edit transaction" : type === "income" ? "Add income" : type === "transfer" ? "Add transfer" : "Add expense";

  return (
    <BottomSheet
      open={!!sheet}
      onOpenChange={(o) => !o && close()}
      title={label}
      footer={<Button size="xl" className="w-full" onClick={save}>{editing ? "Save changes" : "Save"}</Button>}
    >
      <div className="space-y-5 pb-2">
        {!editing && <Segmented options={TYPES} value={type} onChange={changeType} />}
        <div>
          <AmountInput value={amount} onChange={(v) => { setAmount(v); setError(null); }} />
          {error && <p className="mt-2 text-center text-[13px] font-medium text-expense">{error}</p>}
        </div>
        <Field label={type === "income" ? "Received from" : type === "transfer" ? "Description" : "Merchant or title"}>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === "income" ? "e.g. Salary, client name" : type === "transfer" ? "e.g. ATM withdrawal" : "e.g. Zomato, Reliance Smart"} />
        </Field>
        {type !== "transfer" && (
          <div>
            <span className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">Category</span>
            <CategoryGrid options={type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES} value={cat} onChange={setCat} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label={type === "transfer" ? "From" : "Account"}>
            <select className={inputCls} value={account} onChange={(e) => setAccount(e.target.value as AccountId)}>
              {Object.values(ACCOUNTS).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          {type === "transfer" ? (
            <Field label="To">
              <select className={inputCls} value={toAccount} onChange={(e) => setToAccount(e.target.value as AccountId)}>
                {Object.values(ACCOUNTS).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
          ) : (
            <Field label="Paid via">
              <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
          )}
        </div>
        <Field label="Date and time">
          <input type="datetime-local" className={inputCls} value={date} max={`${DEMO_TODAY}T23:59`} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Note (optional)">
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" />
        </Field>
      </div>
    </BottomSheet>
  );
}
