import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "pending" | "completed" | "rejected" | "neutral";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
  neutral: "bg-sand-100 text-sand-700 border-sand-200",
};

export const Badge = ({ tone = "neutral", className, ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
      tones[tone],
      className
    )}
    {...props}
  />
);
