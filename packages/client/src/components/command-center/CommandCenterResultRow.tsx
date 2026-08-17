import type { MouseEventHandler, ReactNode } from "react";
import { ChevronRight, CornerDownLeft, Pin, Settings2, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { CommandCenterMedia, type CommandCenterMediaKind } from "./CommandCenterMedia";

export interface CommandCenterResultRowProps {
  id?: string;
  dataResultId?: string;
  title: string;
  metadata: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
  mediaSrc?: string | null;
  mediaKind?: CommandCenterMediaKind;
  avatarCropStyle?: React.CSSProperties;
  groupClassName?: string;
  accent?: string | null;
  control?: ReactNode;
  currentChoice?: string;
  enterHint?: string;
  setupStatus?: string;
  detailsLabel?: string;
  onDetails?: () => void;
  pinned?: boolean;
  pinLabel?: string;
  onPinChange?: (pinned: boolean) => void;
  onMouseEnter?: MouseEventHandler<HTMLLIElement>;
  className?: string;
}

export function CommandCenterResultRow({
  id,
  dataResultId,
  title,
  metadata,
  icon,
  selected,
  onSelect,
  mediaSrc,
  mediaKind,
  avatarCropStyle,
  groupClassName,
  accent,
  control,
  currentChoice,
  enterHint,
  setupStatus,
  detailsLabel,
  onDetails,
  pinned = false,
  pinLabel,
  onPinChange,
  onMouseEnter,
  className,
}: CommandCenterResultRowProps) {
  const hasPinAction = Boolean(pinLabel && onPinChange);
  const hasTwoActions = hasPinAction && Boolean(onDetails);

  return (
    <li
      data-result-id={dataResultId}
      data-command-center-result-row
      onMouseEnter={onMouseEnter}
      className={cn(
        "group relative flex h-14 min-w-0 items-center rounded-md transition-colors sm:h-11",
        selected ? "bg-[var(--accent)]" : "hover:bg-[var(--accent)]/60",
        groupClassName,
        className,
      )}
    >
      <button
        id={id}
        type="button"
        data-selected={selected || undefined}
        onClick={onSelect}
        className={cn(
          "flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 text-left text-[var(--foreground)] outline-none",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]",
          hasTwoActions ? "pr-[5.5rem] sm:pr-[4.5rem]" : (hasPinAction || onDetails) && "pr-11 sm:pr-9",
        )}
      >
        <CommandCenterMedia
          size="row"
          icon={icon}
          src={mediaSrc}
          kind={mediaKind}
          avatarCropStyle={avatarCropStyle}
          accent={accent}
        />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-semibold">{title}</span>
          <span className="mt-0.5 block truncate text-xs text-[var(--muted-foreground)]">{metadata}</span>
        </span>
        {currentChoice ? (
          <span className="max-w-24 shrink-0 truncate text-xs font-medium text-[var(--muted-foreground)] sm:max-w-32">
            {currentChoice}
          </span>
        ) : null}
        {!control && setupStatus ? (
          <span className="inline-flex min-w-0 max-w-24 shrink items-center gap-1 text-xs text-[var(--muted-foreground)] sm:max-w-28">
            <Settings2 className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{setupStatus}</span>
          </span>
        ) : !control && enterHint ? (
          <span className="hidden min-w-0 shrink-0 items-center gap-1 text-xs text-[var(--muted-foreground)] sm:inline-flex">
            <span className="max-w-28 truncate">{enterHint}</span>
            <CornerDownLeft className="size-3.5 shrink-0" aria-hidden="true" />
          </span>
        ) : null}
      </button>

      {control ? (
        <div
          className={cn(
            "mr-1 w-28 shrink-0",
            hasTwoActions ? "mr-[5.5rem] sm:mr-[4.5rem]" : (hasPinAction || onDetails) && "mr-11 sm:mr-9",
          )}
        >
          {control}
        </div>
      ) : null}

      {onDetails && detailsLabel ? (
        <button
          type="button"
          aria-label={detailsLabel}
          title={detailsLabel}
          onClick={onDetails}
          className={cn(
            "absolute inline-flex size-11 items-center justify-center rounded-md text-[var(--muted-foreground)] outline-none transition-colors sm:size-9",
            hasPinAction ? "right-11 sm:right-9" : "right-0.5",
            "hover:bg-[var(--secondary)] hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]",
          )}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {hasPinAction ? (
        <button
          type="button"
          aria-label={pinLabel}
          aria-pressed={pinned}
          onClick={() => onPinChange?.(!pinned)}
          className={cn(
            "absolute right-0.5 inline-flex size-11 items-center justify-center rounded-md text-[var(--muted-foreground)] outline-none transition-colors sm:size-9",
            "hover:bg-[var(--secondary)] hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]",
            "sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
            pinned && "text-[var(--primary)] sm:opacity-100",
          )}
        >
          <Pin className="size-3.5" fill={pinned ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      ) : null}
    </li>
  );
}
