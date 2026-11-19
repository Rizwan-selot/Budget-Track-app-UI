import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/finance";
import { useFinance } from "@/store/finance-store";

interface Props {
  value: number;
  className?: string | undefined;
  sign?: boolean | undefined;
  /** Render paise in a lighter weight, like a statement figure */
  split?: boolean | undefined;
  decimals?: boolean | undefined;
}

export function Money({ value, className, sign, split, decimals }: Props) {
  const { state } = useFinance();
  if (state.settings.hideAmounts) {
    return <span className={cn("num", className)} aria-label="Amount hidden">₹ ••••</span>;
  }
  const text = formatINR(value, { sign, decimals: decimals || split });
  if (split) {
    const [whole, frac] = text.split(".");
    return (
      <span className={cn("num", className)}>
        {whole}
        <span className="opacity-55">.{frac}</span>
      </span>
    );
  }
  return <span className={cn("num", className)}>{text}</span>;
}
