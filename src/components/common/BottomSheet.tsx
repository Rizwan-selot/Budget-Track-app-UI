import { Drawer as D } from "vaul";
import type { ReactNode } from "react";

export function BottomSheet({ open, onOpenChange, title, description, children, footer }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string | undefined; children: ReactNode; footer?: ReactNode | undefined }) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px]" />
        <D.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-[430px] flex-col rounded-t-[26px] bg-card outline-none">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
          <div className="px-5 pb-2 pt-4">
            <D.Title className="font-display text-[19px] font-bold">{title}</D.Title>
            {description ? <D.Description className="mt-0.5 text-[13px] text-muted-foreground">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">{children}</div>
          {footer && <div className="border-t px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">{footer}</div>}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
