import type { SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ className, ...props }: SelectProps) => (
  <select
    className={cn(
      "w-full rounded-2xl border border-sand-300 bg-sand-50 px-4 py-2.5 text-base text-sand-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-400",
      className
    )}
    {...props}
  />
);
