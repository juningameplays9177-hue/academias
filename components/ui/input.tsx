import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, id, className, ...props }: Props) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={inputId}>
      {label ? (
        <span className="text-muted">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "rounded-lg border border-border bg-card px-3 py-2 text-foreground shadow-inner outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25",
          className,
        )}
        {...props}
      />
    </label>
  );
}
