import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sand-900/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-sand-900 text-white hover:bg-sand-950 focus-visible:ring-sand-700",
  secondary:
    "bg-sand-100 text-sand-900 hover:bg-sand-200 focus-visible:ring-sand-300",
  ghost:
    "bg-transparent text-sand-900 hover:bg-sand-100 focus-visible:ring-sand-300",
};

const sizes = {
  sm: "text-sm px-4 py-2",
  md: "text-base px-5 py-2.5",
  lg: "text-lg px-6 py-3",
};

export const Button = ({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) => (
  <button
    className={cn(base, variants[variant], sizes[size], className)}
    {...props}
  />
);
