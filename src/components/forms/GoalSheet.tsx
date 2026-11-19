import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Button } from "@/components/ui/button";
import { GOAL_ICONS } from "@/data/categories";
import { cn } from "@/lib/utils";
import { newId, useFinance } from "@/store/finance-store";
import type { GoalIcon } from "@/types/finance";
import { AmountInput, Field, inputCls } from "./fields";

export function GoalSheet() {
  const { state, dispatch } = useFinance();
  const sheet = state.sheet?.kind === "goal" ? state.sheet : null;
  const editing = sheet?.editId ? state.goals.find((g) => g.id === sheet.editId) : undefined;
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<GoalIcon>("vacation");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [date, setDate] = useState("2027-06");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sheet) return;
    setName(editing?.name ?? "");
    setIcon(editing?.icon ?? "vacation");
    setTarget(editing ? String(editing.target) : "");
    setSaved(editing ? String(editing.saved) : "");
    setDate(editing?.targetDate ?? "2027-06");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet?.editId, !!sheet]);

  const close = () => dispatch({ type: "sheet", sheet: null });
  const save = () => {
    const t = Number(target);
    const s = Number(saved || 0);
    if (!name.trim()) return setError("Give your goal a name.");
    if (!t || t <= 0) return setError("Enter a target amount.");
    if (s > t) return setError("Saved amount can't be more than the target.");
    dispatch({ type: "goal/upsert", goal: { id: editing?.id ?? newId("g"), name: name.trim(), icon, target: t, saved: s, targetDate: date } });
    toast.success(editing ? "Goal updated" : "Goal created");
    close();
  };
  const remove = () => {
    if (!editing) return;
    dispatch({ type: "goal/delete", id: editing.id });
    toast("Goal deleted");
    close();
  };

  return (
    <BottomSheet
      open={!!sheet}
      onOpenChange={(o) => !o && close()}
      title={editing ? "Edit savings goal" : "New savings goal"}
      description="Money you're setting aside. Goals don't affect your spending budgets."
      footer={
        <div className="flex gap-2">
          {editing && <Button variant="danger" size="xl" onClick={remove}>Delete</Button>}
          <Button size="xl" className="flex-1" onClick={save}>{editing ? "Save changes" : "Create goal"}</Button>
        </div>
      }
    >
      <div className="space-y-5 pb-2">
        <div className="grid grid-cols-6 gap-2">
          {(Object.keys(GOAL_ICONS) as GoalIcon[]).map((k) => {
            const g = GOAL_ICONS[k];
            return (
              <button key={k} type="button" aria-label={g.label} aria-pressed={icon === k} onClick={() => setIcon(k)} className={cn("flex aspect-square items-center justify-center rounded-2xl border", icon === k ? "border-primary bg-primary-surface" : "bg-card")} style={{ color: g.color }}>
                <g.icon className="size-5" />
              </button>
            );
          })}
        </div>
        <Field label="Goal name">
          <input className={inputCls} value={name} onChange={(e) => { setName(e.target.value); setError(null); }} placeholder="e.g. New laptop" />
        </Field>
        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">Target amount</span>
          <AmountInput value={target} onChange={(v) => { setTarget(v); setError(null); }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Already saved">
            <input inputMode="numeric" className={inputCls} value={saved} onChange={(e) => setSaved(e.target.value.replace(/\D/g, ""))} placeholder="₹0" />
          </Field>
          <Field label="Target month">
            <input type="month" className={inputCls} value={date} min="2026-12" onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        {error && <p className="text-center text-[13px] font-medium text-expense">{error}</p>}
      </div>
    </BottomSheet>
  );
}
