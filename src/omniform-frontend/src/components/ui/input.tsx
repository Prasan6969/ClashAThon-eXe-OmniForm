import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: InputProps) => (
  <input
    className={cn(
      "w-full rounded-2xl border border-sand-300 bg-sand-50 px-4 py-2.5 text-base text-sand-950 placeholder:text-sand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-900",
      className
    )}
    {...props}
  />
);
