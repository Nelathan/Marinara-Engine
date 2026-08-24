import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { CommandCenterMedia, type CommandCenterMediaKind } from "./CommandCenterMedia";

type Props = {
  icon: LucideIcon;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  metadata?: string;
  mediaSrc?: string | null;
  mediaAlt?: string;
  mediaKind?: CommandCenterMediaKind;
  avatarCropStyle?: CSSProperties;
  accent?: string | null;
  variant?: "preview" | "row";
  trailing?: ReactNode;
  titleId?: string;
  className?: string;
};

/**
 * Canonical resource identity shared by browse previews and review rows.
 * Each surface owns its body and actions; identity never changes shape or
 * loses artwork merely because the resource moved into an agent workflow.
 */
export function ResourceIdentityHeader({
  icon,
  title,
  eyebrow,
  subtitle,
  metadata,
  mediaSrc,
  mediaAlt = "",
  mediaKind = "image",
  avatarCropStyle,
  accent,
  variant = "preview",
  trailing,
  titleId,
  className,
}: Props) {
  const row = variant === "row";
  return (
    <div className={cn("flex min-w-0 items-center", row ? "gap-2" : "gap-3", className)}>
      <CommandCenterMedia
        size={row ? "row" : "preview"}
        role={row ? "row" : "preview"}
        icon={icon}
        src={mediaSrc}
        alt={mediaAlt}
        kind={mediaKind}
        avatarCropStyle={avatarCropStyle}
        accent={accent}
        className={row ? "size-9" : undefined}
      />
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p
            className={cn(
              "truncate font-semibold uppercase text-[var(--muted-foreground)]",
              row ? "text-[0.625rem] tracking-[0.06em]" : "text-xs tracking-[0.08em]",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <p
          id={titleId}
          className={cn(
            "truncate font-semibold text-[var(--foreground)]",
            row ? "text-sm leading-5" : "text-[18px] leading-6",
          )}
        >
          {title}
        </p>
        {subtitle ? (
          <p className={cn("truncate text-[var(--muted-foreground)]", row ? "text-xs" : "mt-0.5 text-xs leading-5")}>
            {subtitle}
          </p>
        ) : null}
        {metadata ? (
          <p className={cn("truncate text-[var(--muted-foreground)]", row ? "text-xs" : "mt-1 text-xs")}>{metadata}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
