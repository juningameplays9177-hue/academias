import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-5 py-2.5 text-base",
        variant === "primary" &&
          "bg-accent text-white shadow-sm hover:-translate-y-0.5 hover:bg-orange-600 active:translate-y-0 dark:hover:bg-orange-400",
        variant === "ghost" &&
          "bg-transparent text-foreground hover:bg-zinc-100 dark:hover:bg-neutral-900",
        variant === "outline" &&
          "border border-border bg-transparent text-foreground hover:border-accent/60 hover:bg-accent-soft",
        variant === "danger" &&
          "border border-neutral-700 text-neutral-200 hover:bg-neutral-900 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-800",
        className,
      )}
      {...props}
    />
  );
}
