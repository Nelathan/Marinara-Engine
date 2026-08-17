import { useId, type KeyboardEvent } from "react";
import { Loader2, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CommandCenterChoiceOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface CommandCenterSegmentedChoiceProps<T extends string> {
  value: T;
  label: string;
  options: readonly CommandCenterChoiceOption<T>[];
  onValueChange: (value: T) => void;
  variant?: "default" | "compact";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function CommandCenterSegmentedChoice<T extends string>({
  value,
  label,
  options,
  onValueChange,
  variant = "default",
  disabled = false,
  loading = false,
  className,
}: CommandCenterSegmentedChoiceProps<T>) {
  const labelId = useId();
  const unavailable = disabled || loading;
  const compact = variant === "compact";
  const selectedOption = options.find((option) => option.value === value && !option.disabled);
  const fallbackOption = options.find((option) => !option.disabled);
  const tabStopValue = selectedOption?.value ?? fallbackOption?.value;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, optionIndex: number) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const enabledOptions = options.map((option, index) => ({ option, index })).filter(({ option }) => !option.disabled);
    if (enabledOptions.length === 0) return;

    const currentIndex = enabledOptions.findIndex(({ index }) => index === optionIndex);
    const offset = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    const targetIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? enabledOptions.length - 1
          : (currentIndex + offset + enabledOptions.length) % enabledOptions.length;
    const target = enabledOptions[targetIndex];
    if (!target) return;

    onValueChange(target.option.value);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role='radio']")[target.index]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex min-w-0 max-w-full rounded-md border border-[var(--border)] bg-[var(--secondary)] p-0.5",
        compact ? "w-full flex-nowrap overflow-x-auto overscroll-x-contain" : "flex-wrap",
        unavailable && "opacity-50",
        className,
      )}
    >
      <span id={labelId} className="sr-only">
        {label}
      </span>
      {options.map((option, index) => {
        const selected = option.value === value;
        const OptionIcon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={unavailable || option.disabled}
            tabIndex={!unavailable && option.value === tabStopValue ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded px-3 text-xs font-semibold transition-colors sm:min-h-8",
              compact ? "shrink-0" : "min-w-0 max-md:flex-1",
              "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              "disabled:cursor-not-allowed",
              selected
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
            )}
          >
            {loading && selected ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />
            ) : OptionIcon ? (
              <OptionIcon className="size-3.5 shrink-0" aria-hidden="true" />
            ) : null}
            <span className="min-w-0 whitespace-normal break-words text-center leading-4">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
