import { useEffect, useState, type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { getValidatedCommandCenterAccent } from "./command-center-visuals";

export type CommandCenterMediaSize = "row" | "preview" | "grid";
export type CommandCenterMediaRole = "row" | "preview" | "browse";
export type CommandCenterMediaKind = "image" | "thumbnail" | "avatar" | "artwork";

export interface CommandCenterMediaProps {
  size: CommandCenterMediaSize;
  role?: CommandCenterMediaRole;
  icon: LucideIcon;
  src?: string | null;
  alt?: string;
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

const roleClasses: Record<CommandCenterMediaRole, string> = {
  row: "size-9",
  preview: "size-24 sm:size-28",
  browse: "size-24",
};

export function CommandCenterMedia({
  size,
  role = size === "grid" ? "browse" : size,
  icon: Icon,
  src,
  alt = "",
  kind = "image",
  avatarCropStyle,
  groupClassName,
  accent,
  className,
}: CommandCenterMediaProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const [loadedSrc, setLoadedSrc] = useState<string>();
  const hasImage = Boolean(src && src !== failedSrc);
  const validAccent = getValidatedCommandCenterAccent(accent);

  useEffect(() => {
    setFailedSrc(undefined);
    setLoadedSrc(undefined);
  }, [src]);

  return (
    <span
      aria-hidden={role === "row" ? true : undefined}
      data-command-center-media={role}
      data-media-kind={kind}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-[color-mix(in_srgb,var(--mari-panel-gradient-start,var(--border))_24%,var(--border))] bg-[color-mix(in_srgb,var(--mari-panel-gradient-start,var(--muted))_8%,var(--muted))] text-[color-mix(in_srgb,var(--mari-panel-gradient-start,var(--muted-foreground))_30%,var(--foreground))]",
        role === "preview" ? roleClasses.preview : role === "browse" ? roleClasses.browse : sizeClasses.row,
        kind === "avatar" && "rounded-full",
        role === "browse" && kind === "avatar" && "aspect-square h-auto w-full",
        role === "preview" && kind !== "avatar" && kind !== "artwork" && "aspect-[4/5] h-auto w-24 sm:w-28",
        role === "preview" && kind === "artwork" && "aspect-video h-auto w-32 sm:w-40",
        groupClassName,
        className,
      )}
    >
      {hasImage ? (
        <img
          // A cached image can complete before React attaches onLoad, which used
          // to leave it stuck at opacity-0. Read the state on mount instead.
          ref={(node) => {
            if (node?.complete && node.naturalWidth > 0) setLoadedSrc(src ?? undefined);
          }}
          src={src ?? undefined}
          alt={role === "row" ? "" : alt}
          loading={size === "grid" ? "lazy" : "eager"}
          decoding={size === "grid" ? "async" : "auto"}
          onLoad={() => setLoadedSrc(src ?? undefined)}
          onError={() => setFailedSrc(src ?? undefined)}
          style={kind === "avatar" ? avatarCropStyle : undefined}
          className={cn(
            "size-full object-cover transition-opacity duration-200 motion-reduce:transition-none",
            loadedSrc === src ? "opacity-100" : "opacity-0",
          )}
        />
      ) : (
        <Icon className={iconClasses[size]} strokeWidth={1.8} />
      )}
      {hasImage && loadedSrc !== src && !failedSrc ? (
        <span className="absolute inset-0 animate-pulse bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))] motion-reduce:animate-none" />
      ) : null}
      {validAccent ? (
        <span
          className="absolute bottom-1 right-1 size-2.5 rounded-full border border-[var(--card)]"
          style={{ backgroundColor: validAccent }}
        />
      ) : null}
    </span>
  );
}
