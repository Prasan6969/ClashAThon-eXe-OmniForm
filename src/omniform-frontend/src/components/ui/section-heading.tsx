import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type SectionHeadingProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  subtitle?: string;
};

export const SectionHeading = ({
  title,
  subtitle,
  className,
  ...props
}: SectionHeadingProps) => (
  <div className={cn("space-y-1", className)} {...props}>
    <h2 className="text-2xl font-semibold text-sand-950 sm:text-3xl">{title}</h2>
    {subtitle ? (
      <p className="text-sm text-sand-500 sm:text-base">{subtitle}</p>
    ) : null}
  </div>
);
