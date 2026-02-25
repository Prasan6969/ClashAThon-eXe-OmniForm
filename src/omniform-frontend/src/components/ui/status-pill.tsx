import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type StatusPillProps = HTMLAttributes<HTMLDivElement> & {
  status: "pending" | "completed" | "rejected" | "canceled";
  labelOverrides?: Partial<Record<"pending" | "completed" | "rejected" | "canceled", string>>;
};

const styles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  canceled: "bg-sand-100 text-sand-600 border-sand-200",
};

export const StatusPill = ({
  status,
  labelOverrides,
  className,
  ...props
}: StatusPillProps) => {
  const label = labelOverrides?.[status] || status;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
        styles[status],
        className
      )}
      {...props}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {label}
    </div>
  );
};
