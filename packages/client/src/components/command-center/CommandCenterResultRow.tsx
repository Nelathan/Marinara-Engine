import type { MouseEventHandler, ReactNode } from "react";
import { CornerDownLeft, Settings2, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { CommandCenterMedia, type CommandCenterMediaKind } from "./CommandCenterMedia";

export interface CommandCenterResultRowProps {
  id?: string;
  dataResultId?: string;
  title: string;
  metadata: string;
  tertiaryMetadata?: ReactNode;
  description?: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
  mediaSrc?: string | null;
  mediaKind?: CommandCenterMediaKind;
  avatarCropStyle?: React.CSSProperties;
  groupClassName?: string;
  accent?: string | null;
  control?: ReactNode;
  mariAffordance?: ReactNode;
  currentChoice?: string;
  enterHint?: string;
  setupStatus?: string;
  onMouseEnter?: MouseEventHandler<HTMLLIElement>;
  onMouseMove?: MouseEventHandler<HTMLLIElement>;
  onMouseLeave?: MouseEventHandler<HTMLLIElement>;
  className?: string;
  style?: React.CSSProperties;
}

export function CommandCenterResultRow({
  id,
  dataResultId,
  title,
  metadata,
  tertiaryMetadata,
  description,
  icon,
  selected,
  onSelect,
  mediaSrc,
  mediaKind,
  avatarCropStyle,
  groupClassName,
  accent,
  control,
  mariAffordance,
  currentChoice,
  enterHint,
  setupStatus,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  className,
  style,
}: CommandCenterResultRowProps) {
  return (
    <li
      data-result-id={dataResultId}
      data-command-center-result-row
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
      className={cn(
        "group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center rounded-xl transition-colors",
        "min-h-14 sm:h-[3.25rem]",
        selected ? "bg-[var(--primary)]/12 ring-1 ring-inset ring-[var(--primary)]/20" : "hover:bg-[var(--accent)]/60",
        groupClassName,
        className,
      )}
    >
      <button
        id={id}
        type="button"
        data-selected={selected || undefined}
        onClick={onSelect}
        title={description}
        className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl px-2.5 text-left text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]"
      >
        <CommandCenterMedia
          size="row"
          icon={icon}
          src={mediaSrc}
          kind={mediaKind}
          avatarCropStyle={avatarCropStyle}
          accent={accent}
        />
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold">{title}</span>
          <span className="mt-0.5 block truncate text-xs text-[var(--muted-foreground)]">{metadata}</span>
        </span>
        <span className="flex min-w-0 max-w-36 items-center justify-end gap-2 truncate text-xs text-[var(--muted-foreground)] sm:max-w-48">
          {tertiaryMetadata}
          {currentChoice ? <span className="truncate font-medium">{currentChoice}</span> : null}
          {!control && setupStatus ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Settings2 className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{setupStatus}</span>
            </span>
          ) : null}
        </span>
      </button>

      {control || mariAffordance || enterHint ? (
        <div className="col-start-2 flex min-w-0 max-w-[min(48vw,16rem)] shrink-0 items-center justify-end gap-1 pr-1">
          {mariAffordance}
          {!control && enterHint ? (
            <span className="hidden items-center gap-1 text-xs text-[var(--muted-foreground)] sm:inline-flex">
              <span className="truncate">{enterHint}</span>
              <CornerDownLeft className="size-3.5 shrink-0" aria-hidden="true" />
            </span>
          ) : null}
          {control}
        </div>
      ) : null}
    </li>
  );
}
