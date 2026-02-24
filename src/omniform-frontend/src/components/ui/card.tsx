import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-3xl border border-sand-200 bg-white p-6 shadow-[0_25px_60px_-50px_rgba(20,10,0,0.4)]",
      className
    )}
    {...props}
  />
);
