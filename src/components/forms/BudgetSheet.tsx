import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { EXPENSE_CATEGORIES } from "@/data/categories";
import { DEMO_MONTHS } from "@/data/mock";
import { monthLabel } from "@/lib/finance";
import { newId, useFinance } from "@/store/finance-store";
import type { ExpenseCategoryId } from "@/types/finance";
import { AmountInput, CategoryGrid, Field, inputCls } from "./fields";

export function BudgetSheet() {
  const { state, dispatch } = useFinance();
  const sheet = state.sheet?.kind === "budget" ? state.sheet : null;
  const editing = sheet?.editId ? state.budgets.find((b) => b.id === sheet.editId) : undefined;
  const used = new Set(state.budgets.filter((b) => b.id !== editing?.id).map((b) => b.categoryId));
  const options = EXPENSE_CATEGORIES.filter((c) => !used.has(c.id as ExpenseCategoryId));

  const [cat, setCat] = useState<ExpenseCategoryId>("food");
  const [limit, setLimit] = useState("");
  const [alertAt, setAlertAt] = useState(80);
  const [start, setStart] = useState(state.month);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sheet) return;
    setCat(editing?.categoryId ?? ((options[0]?.id as ExpenseCategoryId) || "food"));
    setLimit(editing ? String(editing.limit) : "");
    setAlertAt(editing?.alertAt ?? 80);
    setStart(editing?.startMonth ?? state.month);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet?.editId, !!sheet]);

  const close = () => dispatch({ type: "sheet", sheet: null });
  const save = () => {
    const v = Number(limit);
    if (!v || v <= 0) return setError("Enter a monthly limit.");
    if (!options.some((o) => o.id === cat)) return setError("Pick a category without a budget.");
    dispatch({ type: "budget/upsert", budget: { id: editing?.id ?? newId("b"), categoryId: cat, limit: v, alertAt, startMonth: start } });
    toast.success(editing ? "Budget updated" : "Budget created");
    close();
  };
  const remove = () => {
    if (!editing) return;
    dispatch({ type: "budget/delete", id: editing.id });
    toast("Budget deleted");
    close();
  };

  return (
    <BottomSheet
      open={!!sheet}
      onOpenChange={(o) => !o && close()}
      title={editing ? "Edit budget" : "New budget"}
      description="A monthly spending limit for one category."
      footer={
        <div className="flex gap-2">
          {editing && <Button variant="danger" size="xl" onClick={remove}>Delete</Button>}
          <Button size="xl" className="flex-1" onClick={save}>{editing ? "Save changes" : "Create budget"}</Button>
        </div>
      }
    >
      <div className="space-y-5 pb-2">
        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">Category</span>
          {options.length ? <CategoryGrid options={options} value={cat} onChange={(id) => setCat(id as ExpenseCategoryId)} /> : <p className="text-[14px] text-muted-foreground">Every category already has a budget.</p>}
        </div>
        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">Monthly limit</span>
          <AmountInput value={limit} onChange={(v) => { setLimit(v); setError(null); }} />
          {error && <p className="mt-2 text-center text-[13px] font-medium text-expense">{error}</p>}
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-muted-foreground">Alert me at</span>
            <span className="num text-[15px] font-bold text-primary">{alertAt}%</span>
          </div>
          <Slider value={[alertAt]} min={50} max={100} step={5} onValueChange={([v]) => setAlertAt(v ?? 80)} aria-label="Alert threshold" />
        </div>
        <Field label="Starts from">
          <select className={inputCls} value={start} onChange={(e) => setStart(e.target.value)}>
            {DEMO_MONTHS.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </Field>
      </div>
    </BottomSheet>
  );
}
