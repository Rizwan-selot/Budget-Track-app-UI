import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Bell, ChevronRight, CloudOff, DatabaseBackup, Download, EyeOff, Fingerprint, History, IndianRupee, Info, KeyRound, Lock,
  MessageSquareText, RotateCcw, ScanSearch, ShieldCheck, Sparkles, Trash2, Upload, CalendarDays, type LucideIcon,
} from "lucide-react";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { ACCOUNTS, CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";
import { useFinance } from "@/store/finance-store";
import type { Settings as S } from "@/types/finance";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Paisa money tracker" },
      { name: "description", content: "Security, SMS import, backups and privacy for your on-device finance data." },
      { property: "og:title", content: "Settings · Paisa money tracker" },
      { property: "og:description", content: "Security, SMS import, backups and privacy for your on-device finance data." },
    ],
  }),
  component: SettingsScreen,
});

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function SettingsScreen() {
  const { state, dispatch } = useFinance();
  const s = state.settings;
  const set = (patch: Partial<S>, msg?: string) => { dispatch({ type: "settings", patch }); if (msg) toast(msg); };
  const [wipe, setWipe] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cycle = <T,>(list: readonly T[], v: T): T => list[(list.indexOf(v) + 1) % list.length] ?? v;

  const exportCsv = () => {
    const head = "Date,Title,Type,Category,Amount,Account,Method,Status,Source";
    const rows = state.transactions.map((t) => [t.date, `"${t.title}"`, t.type, CATEGORIES[t.categoryId].name, t.amount, ACCOUNTS[t.accountId].name, t.method, t.status, t.source].join(","));
    download("paisa-transactions.csv", [head, ...rows].join("\n"), "text/csv");
    toast.success(`Exported ${state.transactions.length} transactions`);
  };
  const backup = () => {
    const { sheet: _s, ...data } = state;
    download(`paisa-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), "application/json");
    toast.success("Backup file saved");
  };
  const restore = async (f?: File) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.transactions)) throw new Error();
      dispatch({ type: "hydrate", state: data });
      toast.success("Backup restored");
    } catch {
      toast.error("That file isn't a valid backup");
    }
  };

  const permCls = { granted: "bg-income-soft text-income", denied: "bg-expense-soft text-expense", not_asked: "bg-warning-soft text-warning" }[s.smsPermission];
  const permLabel = { granted: "Allowed", denied: "Denied", not_asked: "Not asked" }[s.smsPermission];

  return (
    <div>
      <ScreenHeader title="Settings" />
      <div className="space-y-6 px-4">
        <section className="surface flex items-center gap-3 p-4">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-balance font-display text-[18px] font-bold text-primary-foreground">RS</span>
          <div className="flex-1">
            <p className="text-[16px] font-bold">Rizwan Selot</p>
            <p className="text-[13px] text-muted-foreground">{Object.keys(ACCOUNTS).length} accounts · {state.transactions.length} transactions</p>
          </div>
        </section>

        <div className="flex gap-3 rounded-[18px] bg-primary-surface p-4">
          <CloudOff className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-[13px] leading-relaxed"><span className="font-semibold">Your data stays on this phone.</span> No account, no cloud sync. SMS are read and stored locally in an encrypted database.</p>
        </div>

        <Group title="Preferences">
          <Item icon={IndianRupee} label="Currency" value="Indian Rupee (₹)" />
          <Item icon={CalendarDays} label="Month starts on" value={`${s.firstDay}${s.firstDay === 1 ? "st" : "th"} of month`} onClick={() => set({ firstDay: cycle([1, 5, 10, 25] as const, s.firstDay as 1) })} />
          <Item icon={Sparkles} label="Theme" value="Light" />
          <Toggle icon={Bell} label="Budget alerts" checked={s.budgetAlerts} onChange={(v) => set({ budgetAlerts: v })} />
        </Group>

        <Group title="Security">
          <Toggle icon={KeyRound} label="App PIN" hint="6-digit PIN to open the app" checked={s.pinEnabled} onChange={(v) => set({ pinEnabled: v, biometric: v ? s.biometric : false }, v ? "PIN turned on" : "PIN turned off")} />
          <Toggle icon={Fingerprint} label="Fingerprint unlock" checked={s.biometric} disabled={!s.pinEnabled} onChange={(v) => set({ biometric: v })} />
          <Item icon={Lock} label="Auto-lock" value={s.autoLock === "immediately" ? "Immediately" : `After ${s.autoLock}`} onClick={() => set({ autoLock: cycle(["immediately", "1 min", "5 min"] as const, s.autoLock) })} />
          <Toggle icon={EyeOff} label="Hide amounts" hint="Show ₹ •••• until you tap the eye" checked={s.hideAmounts} onChange={(v) => set({ hideAmounts: v })} />
        </Group>

        <Group title="Transactions">
          <Item icon={MessageSquareText} label="SMS access" right={<span className={cn("rounded-full px-2.5 py-1 text-[12px] font-semibold", permCls)}>{permLabel}</span>}
            onClick={() => set({ smsPermission: cycle(["granted", "denied", "not_asked"] as const, s.smsPermission) }, "Prototype: SMS permission is asked by Android in the real app")} />
          <Toggle icon={Sparkles} label="Auto-categorise" hint="Use merchant rules for new SMS" checked={s.autoCategorize} onChange={(v) => set({ autoCategorize: v })} />
          <LinkItem icon={ScanSearch} label="Import past SMS" to="/import" />
          <LinkItem icon={History} label="Review queue" to="/review" badge={state.review.length || undefined} />
        </Group>

        <Group title="Data & privacy">
          <Item icon={Download} label="Export transactions (CSV)" onClick={exportCsv} />
          <Item icon={DatabaseBackup} label="Back up to a file" onClick={backup} />
          <Item icon={Upload} label="Restore from backup" onClick={() => fileRef.current?.click()} />
          <Item icon={RotateCcw} label="Reload demo data" onClick={() => { dispatch({ type: "reset" }); toast("Demo data restored"); }} />
          <Item icon={Trash2} label="Delete all local data" danger onClick={() => setWipe(true)} />
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => restore(e.target.files?.[0])} />
        </Group>

        <Group title="About">
          <Item icon={Info} label="Version" value="0.1 prototype" />
          <Item icon={ShieldCheck} label="Privacy" value="On-device only" />
        </Group>
        <p className="pb-2 text-center text-[12px] text-subtle">All figures are demonstration data.</p>
      </div>

      <AlertDialog open={wipe} onOpenChange={setWipe}>
        <AlertDialogContent className="max-w-[360px] rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete everything on this device?</AlertDialogTitle>
            <AlertDialogDescription>All transactions, budgets and goals will be erased. Make a backup first if you might need them.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
              dispatch({ type: "hydrate", state: { transactions: [], budgets: [], goals: [], review: [] } });
              toast("All local data deleted");
            }}>Delete all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-[13px] font-semibold text-muted-foreground">{title}</h2>
      <div className="surface divide-y overflow-hidden">{children}</div>
    </section>
  );
}

function Shell({ icon: Icon, label, hint, danger, children }: { icon: LucideIcon; label: string; hint?: string | undefined; danger?: boolean | undefined; children?: ReactNode | undefined }) {
  return (
    <>
      <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-[10px]", danger ? "bg-expense-soft text-expense" : "bg-muted text-foreground")}><Icon className="size-[18px]" /></span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[15px] font-medium", danger && "text-expense")}>{label}</span>
        {hint && <span className="block text-[12.5px] text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </>
  );
}

function Item({ icon, label, value, right, onClick, danger }: { icon: LucideIcon; label: string; value?: string | undefined; right?: ReactNode | undefined; onClick?: () => void; danger?: boolean | undefined }) {
  const inner = (
    <Shell icon={icon} label={label} danger={danger}>
      {right ?? (value && <span className="text-[13.5px] text-muted-foreground">{value}</span>)}
      {onClick && <ChevronRight className="size-4 text-subtle" />}
    </Shell>
  );
  return onClick ? (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">{inner}</button>
  ) : (
    <div className="flex items-center gap-3 px-4 py-3">{inner}</div>
  );
}

function LinkItem({ icon, label, to, badge }: { icon: LucideIcon; label: string; to: "/import" | "/review"; badge?: number | undefined }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
      <Shell icon={icon} label={label}>
        {badge ? <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">{badge}</span> : null}
        <ChevronRight className="size-4 text-subtle" />
      </Shell>
    </Link>
  );
}

function Toggle({ icon, label, hint, checked, onChange, disabled }: { icon: LucideIcon; label: string; hint?: string | undefined; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean | undefined }) {
  return (
    <label className={cn("flex items-center gap-3 px-4 py-3", disabled && "opacity-50")}>
      <Shell icon={icon} label={label} hint={hint}>
        <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={label} />
      </Shell>
    </label>
  );
}
