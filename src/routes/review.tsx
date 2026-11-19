import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Ban, Check, MessageSquareText, PartyPopper } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { CategoryGrid, Segmented } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { ACCOUNTS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/data/categories";
import { formatINR } from "@/lib/finance";
import { newId, useFinance } from "@/store/finance-store";
import type { CategoryId, ReviewItem, TxType } from "@/types/finance";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review SMS · Paisa" },
      { name: "description", content: "Confirm, correct or ignore bank messages the app couldn't classify on its own." },
      { property: "og:title", content: "Review SMS · Paisa" },
      { property: "og:description", content: "Confirm, correct or ignore bank messages the app couldn't classify on its own." },
    ],
  }),
  component: Review,
});

function Review() {
  const { state } = useFinance();
  return (
    <div>
      <ScreenHeader title="Review SMS" back subtitle={state.review.length ? `${state.review.length} message${state.review.length > 1 ? "s" : ""} not counted yet` : undefined} />
      <div className="space-y-3 px-4">
        {state.review.length === 0 ? (
          <div className="surface"><EmptyState icon={PartyPopper} title="All caught up" text="Every imported message has been confirmed or ignored." action={<Button asChild variant="soft"><Link to="/activity">Go to activity</Link></Button>} /></div>
        ) : (
          state.review.map((r) => <ReviewCard key={r.id} item={r} />)
        )}
      </div>
    </div>
  );
}

function ReviewCard({ item }: { item: ReviewItem }) {
  const { dispatch } = useFinance();
  const initialType: TxType = item.suggestedType === "not_transaction" ? "expense" : item.suggestedType;
  const [type, setType] = useState<TxType>(initialType);
  const [cat, setCat] = useState<CategoryId>(initialType === "income" ? "other_income" : "shopping");
  const [title, setTitle] = useState(item.suggestedTitle);
  const isOtp = item.suggestedType === "not_transaction";

  const confirm = () => {
    if (!item.amount) return;
    dispatch({
      type: "review/resolve",
      id: item.id,
      tx: {
        id: newId("s"), title, type, categoryId: type === "transfer" ? "transfer" : cat, amount: item.amount, date: item.receivedAt,
        accountId: item.accountId, toAccountId: type === "transfer" ? "sbi" : undefined, method: "UPI", source: "sms", status: "completed",
        reference: item.sms.match(/Ref\s*(\d+)/)?.[1],
      },
    });
    toast.success("Transaction confirmed", { description: `${formatINR(item.amount)} added as ${type}.` });
  };
  const ignore = () => {
    dispatch({ type: "review/resolve", id: item.id });
    toast("Message ignored", { description: "It won't affect your totals." });
  };

  return (
    <article className="surface space-y-4 p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-surface text-primary"><MessageSquareText className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="num text-[13px] font-bold">{item.sender}</span>
            <span className="text-[12px] text-subtle">{new Date(item.receivedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
          </div>
          <p className="mt-1 rounded-xl bg-muted/70 p-3 text-[13px] leading-relaxed text-muted-foreground">{item.sms}</p>
        </div>
      </div>

      {isOtp ? (
        <div className="rounded-xl bg-warning-soft p-3 text-[13px]">
          <span className="font-semibold text-warning">Looks like an OTP, not a payment.</span> One-time passwords don't mean money moved. We suggest ignoring it.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" className="min-w-0 flex-1 rounded-lg bg-transparent text-[15px] font-semibold outline-none focus:bg-muted/60" />
            <span className="num text-[18px] font-extrabold">{formatINR(item.amount ?? 0)}</span>
          </div>
          <p className="-mt-3 text-[12.5px] text-muted-foreground">{ACCOUNTS[item.accountId].name}</p>
          <Segmented options={[{ value: "expense", label: "Expense" }, { value: "income", label: "Income" }, { value: "transfer", label: "Own transfer" }]} value={type} onChange={(v) => { setType(v); setCat(v === "income" ? "other_income" : "shopping"); }} />
          {type !== "transfer" && <CategoryGrid options={type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES} value={cat} onChange={setCat} />}
        </>
      )}

      <div className="flex gap-2">
        <Button variant={isOtp ? "default" : "soft"} size="xl" className="flex-1" onClick={ignore}><Ban />Ignore</Button>
        {!isOtp && <Button size="xl" className="flex-[1.4]" onClick={confirm}><Check />Confirm</Button>}
      </div>
    </article>
  );
}
