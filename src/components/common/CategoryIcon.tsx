import { CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types/finance";

const sizes = { sm: "size-9 rounded-[10px] [&>svg]:size-4", md: "size-11 rounded-xl [&>svg]:size-5", lg: "size-14 rounded-2xl [&>svg]:size-6" };

export function CategoryIcon({ id, size = "md", className }: { id: CategoryId; size?: keyof typeof sizes | undefined; className?: string | undefined }) {
  const c = CATEGORIES[id];
  const Icon = c.icon;
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", sizes[size], className)}
      style={{ color: c.color, backgroundColor: `color-mix(in oklab, ${c.color} 13%, transparent)` }}
      aria-hidden
    >
      <Icon strokeWidth={2} />
    </span>
  );
}
