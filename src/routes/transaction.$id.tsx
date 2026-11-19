import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeftRight, CircleSlash, MessageSquareText, PencilLine, Trash2, Tag, SearchX } from "lucide-react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { CategoryIcon } from "@/components/common/CategoryIcon";
import { EmptyState } from "@/components/common/EmptyState";
import { Money } from "@/components/common/Money";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { CategoryGrid } from "@/components/forms/fields";
import { amountTone, signedAmount } from "@/components/transactions/TransactionRow";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ACCOUNTS, CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";
import { useFinance } from "@/store/finance-store";
import type { ReactNode } from "react";

export const Route = createFileRoute("/transaction/$id")({
  head: () => ({
    meta: [
      { title: "Transaction details · Paisa" },
      { name: "description", content: "Amount, category, account, reference and source of a single transaction." },
      { property: "og:title", content: "Transaction details · Paisa" },
      { property: "og:description", content: "Amount, category, account, reference and source of a single transaction." },
    ],
  }),
  component: TransactionDetail,
});

const TYPE_LABEL = { expense: "Expense", income: "Income", transfer: "Transfer", refund: "Refund" } as const;

function TransactionDetail() {
  const { id } = Route.useParams();
  const { state, dispatch } = useFinance();
  const navigate = useNavigate();
  const t = state.transactions.find((x) => x.id === id);
  const [catOpen, setCatOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  if (!t) {
    return (
      <div>
        <ScreenHeader title="Transaction" back />
        <EmptyState icon={SearchX} title="Transaction not found" text="It may have been deleted." action={<Button asChild><Link to="/activity">Back to activity</Link></Button>} />
      </div>
    );
  }

  const cat = CATEGORIES[t.categoryId];
  const date = new Date(t.date);
  const options = t.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div>
      <ScreenHeader title="Details" back right={
        <button onClick={() => dispatch({ type: "sheet", sheet: { kind: "tx", type: t.type, editId: t.id } })} className="inline-flex size-10 items-center justify-center rounded-full border bg-card" aria-label="Edit transaction"><PencilLine className="size-[18px]" /></button>
      } />
      <div className="space-y-4 px-4">
        <section className="surface flex flex-col items-center px-5 pb-6 pt-7 text-center">
          <CategoryIcon id={t.categoryId} size="lg" />
          <h2 className="mt-3 text-[19px] font-bold">{t.title}</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</p>
          <Money value={t.type === "transfer" ? t.amount : signedAmount(t)} sign={t.type !== "transfer"} decimals className={cn("mt-4 block text-[34px] font-extrabold", amountTone(t))} />
          <span className={cn("mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12.5px] font-semibold",
            t.type === "income" || t.type === "refund" ? "bg-income-soft text-income" : t.type === "transfer" ? "bg-neutral-soft text-neutral" : "bg-expense-soft text-expense")}>
            {t.type === "transfer" && <ArrowLeftRight className="size-3.5" />}{TYPE_LABEL[t.type]}
          </span>
        </section>

        {t.status === "failed" && (
          <div className="flex gap-3 rounded-[18px] bg-expense-soft p-3.5 text-[13px]">
            <CircleSlash className="mt-0.5 size-4 shrink-0 text-expense" />
            <p><span className="font-semibold text-expense">Payment failed.</span> This isn't counted in your totals or budgets.</p>
          </div>
        )}
        {t.type === "transfer" && (
          <div className="flex gap-3 rounded-[18px] bg-neutral-soft p-3.5 text-[13px]">
            <ArrowLeftRight className="mt-0.5 size-4 shrink-0 text-neutral" />
            <p>Money moved between your own accounts. It's not counted as income or expense{t.toAccountId === "icici_cc" ? ", so card spends aren't counted twice" : ""}.</p>
          </div>
        )}

        <section className="surface divide-y">
          {t.type !== "transfer" && (
            <Row label="Category">
              <button onClick={() => setCatOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary-surface px-3 py-1.5 text-[13px] font-semibold text-primary-deep">
                <Tag className="size-3.5" />{cat.name}
              </button>
            </Row>
          )}
          {t.type === "transfer" && t.toAccountId ? (
            <Row label="Moved">{ACCOUNTS[t.accountId].name} → {ACCOUNTS[t.toAccountId].name}</Row>
          ) : (
            <Row label="Account">{ACCOUNTS[t.accountId].name}</Row>
          )}
          <Row label="Payment method">{t.method}</Row>
          {t.reference && <Row label="Reference"><span className="num text-[13px]">{t.reference}</span></Row>}
          <Row label="Source">
            {t.source === "sms" ? (
              <span className="inline-flex items-center gap-1.5"><MessageSquareText className="size-4 text-primary" />Imported from SMS</span>
            ) : (
              <span className="inline-flex items-center gap-1.5"><PencilLine className="size-4 text-muted-foreground" />Added manually</span>
            )}
          </Row>
          <Row label="Status">{t.status === "failed" ? <span className="text-expense">Failed</span> : <span className="text-income">Completed</span>}</Row>
          <div className="px-4 py-3.5">
            <p className="text-[13px] text-muted-foreground">Notes</p>
            <p className="mt-1 text-[14.5px]">{t.note || <span className="text-subtle">No notes</span>}</p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="soft" size="xl" onClick={() => dispatch({ type: "sheet", sheet: { kind: "tx", type: t.type, editId: t.id } })}><PencilLine />Edit</Button>
          <Button variant="danger" size="xl" onClick={() => setConfirm(true)}><Trash2 />Delete</Button>
        </div>
      </div>

      <BottomSheet open={catOpen} onOpenChange={setCatOpen} title="Change category" description={t.source === "sms" ? "Correcting this helps you spot similar SMS later." : undefined}>
        <div className="pb-4">
          <CategoryGrid options={options} value={t.categoryId} onChange={(c) => {
            dispatch({ type: "tx/upsert", tx: { ...t, categoryId: c } });
            setCatOpen(false);
            toast.success(`Moved to ${CATEGORIES[c].name}`);
          }} />
        </div>
      </BottomSheet>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent className="max-w-[360px] rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>{t.title} will be removed from your totals, budgets and reports. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep it</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
              dispatch({ type: "tx/delete", id: t.id });
              toast("Transaction deleted");
              navigate({ to: "/activity" });
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <span className="text-[13.5px] text-muted-foreground">{label}</span>
      <span className="text-right text-[14.5px] font-medium">{children}</span>
    </div>
  );
}
