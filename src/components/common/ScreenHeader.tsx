import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function ScreenHeader({ title, back, right, subtitle }: { title: string; back?: boolean | undefined; right?: ReactNode | undefined; subtitle?: string | undefined }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 bg-background/90 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur-md">
      {back && (
        <button onClick={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" }))} className="-ml-2 inline-flex size-10 items-center justify-center rounded-full hover:bg-muted" aria-label="Go back">
          <ArrowLeft className="size-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[22px] font-bold">{title}</h1>
        {subtitle && <p className="text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}

export function SectionTitle({ title, action, to }: { title: string; action?: string | undefined; to?: "/activity" | "/budgets" | "/insights" | "/review" | undefined }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-[17px] font-bold">{title}</h2>
      {action && to && (
        <Link to={to} className="text-[13px] font-semibold text-primary">
          {action}
        </Link>
      )}
    </div>
  );
}

export function IconButton({ children, label, onClick, tone = "plain" }: { children: ReactNode; label: string; onClick?: () => void; tone?: "plain" | "glass" | undefined }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={
        tone === "glass"
          ? "inline-flex size-10 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20 backdrop-blur hover:bg-primary-foreground/25"
          : "inline-flex size-10 items-center justify-center rounded-full border bg-card text-foreground hover:bg-muted"
      }
    >
      {children}
    </button>
  );
}
