import { Loader2, ToggleLeft, ToggleRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CommandCenterToggleProps {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function CommandCenterToggle({
  checked,
  label,
  onCheckedChange,
  icon: Icon,
  disabled = false,
  loading = false,
  className,
}: CommandCenterToggleProps) {
  const StateIcon = checked ? ToggleRight : ToggleLeft;
  const unavailable = disabled || loading;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-busy={loading || undefined}
      disabled={unavailable}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex min-h-9 min-w-0 items-center gap-2 rounded-md border px-2.5 text-xs font-semibold transition-colors",
        "max-md:min-h-11 max-md:px-3",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] bg-[color-mix(in_srgb,var(--primary)_14%,var(--secondary))] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--primary)_20%,var(--secondary))]"
          : "border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="size-4 shrink-0" aria-hidden="true" />
      ) : null}
      <span className="min-w-0 truncate">{label}</span>
      {!loading ? (
        <StateIcon
          className={cn(
            "ml-auto size-4 shrink-0",
            checked ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]",
          )}
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}
