import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type StatusPillProps = HTMLAttributes<HTMLDivElement> & {
  status: "pending" | "completed" | "rejected";
};

const styles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export const StatusPill = ({ status, className, ...props }: StatusPillProps) => (
  <div
    className={cn(
      "inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
      styles[status],
      className
    )}
    {...props}
  >
    <span className="h-2 w-2 rounded-full bg-current" />
    {status}
  </div>
);
