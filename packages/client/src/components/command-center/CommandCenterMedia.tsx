import { useEffect, useState, type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { getValidatedCommandCenterAccent } from "./command-center-visuals";

export type CommandCenterMediaSize = "row" | "preview" | "grid";
export type CommandCenterMediaKind = "image" | "thumbnail" | "avatar" | "artwork";

export interface CommandCenterMediaProps {
  size: CommandCenterMediaSize;
  icon: LucideIcon;
  src?: string | null;
  kind?: CommandCenterMediaKind;
  avatarCropStyle?: CSSProperties;
  groupClassName?: string;
  accent?: string | null;
  className?: string;
}

const sizeClasses: Record<CommandCenterMediaSize, string> = {
  row: "size-9",
  preview: "size-16",
  grid: "size-24",
};

const iconClasses: Record<CommandCenterMediaSize, string> = {
  row: "size-4",
  preview: "size-6",
  grid: "size-8",
};

export function CommandCenterMedia({
  size,
  icon: Icon,
  src,
  kind = "image",
  avatarCropStyle,
  groupClassName,
  accent,
  className,
}: CommandCenterMediaProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const hasImage = Boolean(src && src !== failedSrc);
  const validAccent = getValidatedCommandCenterAccent(accent);

  useEffect(() => setFailedSrc(undefined), [src]);

  return (
    <span
      aria-hidden="true"
      data-command-center-media={size}
      data-media-kind={kind}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-[color-mix(in_srgb,var(--mari-panel-gradient-start,var(--border))_24%,var(--border))] bg-[color-mix(in_srgb,var(--mari-panel-gradient-start,var(--muted))_8%,var(--muted))] text-[color-mix(in_srgb,var(--mari-panel-gradient-start,var(--muted-foreground))_30%,var(--foreground))]",
        sizeClasses[size],
        kind === "avatar" && "rounded-full",
        groupClassName,
        className,
      )}
    >
      {hasImage ? (
        <img
          src={src ?? undefined}
          alt=""
          loading={size === "grid" ? "lazy" : "eager"}
          decoding={size === "grid" ? "async" : "auto"}
          onError={() => setFailedSrc(src ?? undefined)}
          style={kind === "avatar" ? avatarCropStyle : undefined}
          className="size-full object-cover"
        />
      ) : (
        <Icon className={iconClasses[size]} strokeWidth={1.8} />
      )}
      {validAccent ? (
        <span
          className="absolute bottom-1 right-1 size-2.5 rounded-full border border-[var(--card)]"
          style={{ backgroundColor: validAccent }}
        />
      ) : null}
    </span>
  );
}
