import { cn } from "@/lib/utils/cn";
import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, id, className, ...props }: Props) {
  const tid = id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={tid}>
      {label ? <span className="text-muted">{label}</span> : null}
      <textarea
        id={tid}
        className={cn(
          "min-h-[120px] rounded-lg border border-border bg-card px-3 py-2 text-foreground shadow-inner outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25",
          className,
        )}
        {...props}
      />
    </label>
  );
}
