import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarRange, CheckCircle2, Copy, MessageSquareText, ScanSearch, ShieldCheck, TriangleAlert } from "lucide-react";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { ProgressBar } from "@/components/common/ProgressBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFinance } from "@/store/finance-store";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import past SMS · Paisa" },
      { name: "description", content: "Scan older bank messages on your phone to build your transaction history." },
      { property: "og:title", content: "Import past SMS · Paisa" },
      { property: "og:description", content: "Scan older bank messages on your phone to build your transaction history." },
    ],
  }),
  component: ImportScreen,
});

const RANGES = [
  { id: "30d", label: "Last 30 days", msgs: 214 },
  { id: "3m", label: "Last 3 months", msgs: 642 },
  { id: "6m", label: "Last 6 months", msgs: 1188 },
  { id: "12m", label: "Last 12 months", msgs: 2310 },
] as const;

function ImportScreen() {
  const { state } = useFinance();
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("3m");
  const [phase, setPhase] = useState<"pick" | "scan" | "done">("pick");
  const [progress, setProgress] = useState(0);
  const total = RANGES.find((r) => r.id === range)!.msgs;
  const found = Math.round(total * 0.31);
  const dupes = Math.round(total * 0.04);
  const review = Math.max(1, Math.round(total * 0.012));

  useEffect(() => {
    if (phase !== "scan") return;
    const id = setInterval(() => setProgress((p) => {
      if (p >= 100) { clearInterval(id); setPhase("done"); return 100; }
      return p + 4;
    }), 90);
    return () => clearInterval(id);
  }, [phase]);

  const permitted = state.settings.smsPermission === "granted";

  return (
    <div>
      <ScreenHeader title="Import past SMS" back />
      <div className="space-y-4 px-4">
        {!permitted && (
          <div className="flex gap-3 rounded-[18px] bg-expense-soft p-3.5 text-[13px]">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-expense" />
            <p><span className="font-semibold text-expense">SMS access is off.</span> Turn it on in Settings so the app can read bank messages on your phone.</p>
          </div>
        )}

        {phase === "pick" && (
          <>
            <div className="surface p-4">
              <div className="flex items-center gap-2 text-[14px] font-semibold"><ShieldCheck className="size-4 text-income" />Scanned on this device only</div>
              <p className="mt-1 text-[13px] text-muted-foreground">Only messages from bank and card senders are read. Personal chats are skipped and nothing is uploaded.</p>
            </div>
            <div className="space-y-2" role="radiogroup" aria-label="How far back">
              {RANGES.map((r) => (
                <button key={r.id} role="radio" aria-checked={range === r.id} onClick={() => setRange(r.id)} className={cn("flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left", range === r.id && "border-primary bg-primary-surface")}>
                  <CalendarRange className={cn("size-5", range === r.id ? "text-primary" : "text-subtle")} />
                  <span className="flex-1 text-[15px] font-semibold">{r.label}</span>
                  <span className="text-[12.5px] text-muted-foreground">~{r.msgs} SMS</span>
                </button>
              ))}
            </div>
            <Button size="xl" className="w-full" disabled={!permitted} onClick={() => { setProgress(0); setPhase("scan"); }}><ScanSearch />Start scan</Button>
            <p className="text-center text-[12px] text-subtle">Prototype: this simulates the scan. The Android app does the real reading.</p>
          </>
        )}

        {phase !== "pick" && (
          <div className="surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold">{phase === "done" ? "Import complete" : "Scanning messages…"}</h2>
              {phase === "done" ? <CheckCircle2 className="size-5 text-income" /> : <span className="num text-[14px] font-bold text-primary">{progress}%</span>}
            </div>
            <ProgressBar value={progress} className="mt-3 h-2.5" color={phase === "done" ? "var(--income)" : "var(--primary)"} />
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <Stat icon={MessageSquareText} label="Messages scanned" value={Math.round((total * progress) / 100)} />
              <Stat icon={CheckCircle2} label="Transactions found" value={Math.round((found * progress) / 100)} tone="text-income" />
              <Stat icon={Copy} label="Duplicates skipped" value={Math.round((dupes * progress) / 100)} />
              <Stat icon={TriangleAlert} label="Need review" value={Math.round((review * progress) / 100)} tone="text-warning" />
            </div>
            {phase === "done" && (
              <div className="mt-5 grid gap-2">
                <Button asChild size="xl"><Link to="/review">Review messages</Link></Button>
                <Button asChild size="xl" variant="soft"><Link to="/activity">See transactions</Link></Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof CheckCircle2; label: string; value: number; tone?: string | undefined }) {
  return (
    <div className="rounded-xl bg-muted/70 p-3">
      <Icon className={cn("size-4 text-muted-foreground", tone)} />
      <p className="num mt-2 text-[20px] font-extrabold">{value.toLocaleString("en-IN")}</p>
      <p className="text-[12px] text-muted-foreground">{label}</p>
    </div>
  );
}
