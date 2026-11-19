import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode | undefined }) {
  return (
    <div className="flex flex-col items-center px-8 py-12 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-primary-surface text-primary"><Icon className="size-6" /></span>
      <h3 className="text-[16px] font-bold">{title}</h3>
      <p className="mt-1 max-w-[260px] text-[14px] text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
