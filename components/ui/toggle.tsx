import { cn } from "@/lib/utils/cn";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
};

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-card/60 px-3 py-2.5 text-left transition hover:border-accent/40",
        disabled && "opacity-50",
      )}
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-muted">{description}</span>
        ) : null}
      </span>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border border-border bg-zinc-200 transition dark:bg-zinc-800",
          checked && "border-accent bg-accent/90",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition",
            checked && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
