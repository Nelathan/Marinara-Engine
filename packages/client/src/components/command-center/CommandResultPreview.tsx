import { ArrowRight, CornerDownRight, Tag } from "lucide-react";
import { useId } from "react";
import { getCommandIcon } from "../../lib/command-icons";
import { cn } from "../../lib/utils";
import { CommandCenterMedia } from "./CommandCenterMedia";
import { getCommandCenterStatusClass } from "./command-center-visuals";
import type { CommandResultPreviewAction, RichCommandResult } from "./command-result-preview.types";

export interface CommandResultPreviewProps {
  result: RichCommandResult;
  actions?: readonly CommandResultPreviewAction[];
  statusLabel?: string;
  variant?: "default" | "compact";
  className?: string;
}

export function CommandResultPreview({
  result,
  actions,
  statusLabel,
  variant = "default",
  className,
}: CommandResultPreviewProps) {
  const titleId = useId();
  const descriptionId = useId();
  const preview = result.preview;
  const title = preview?.title ?? result.command.title;
  const Icon = getCommandIcon(result.command.icon, result.command.kind);
  const hasFacts = Boolean(preview?.facts?.length);
  const resolvedActions = actions?.slice(0, 3) ?? [];
  const hasActions = resolvedActions.length > 0;
  const facts = preview?.facts?.slice(0, 6);
  const tags = preview?.tags ?? preview?.badges;
  const compact = variant === "compact";

  return (
    <article
      aria-labelledby={titleId}
      aria-describedby={preview?.description ? descriptionId : undefined}
      data-component="CommandResultPreview"
      data-preview-kind={preview?.kind ?? result.command.kind}
      data-variant={variant}
      className={cn(
        "flex min-h-0 w-full flex-col overflow-hidden bg-[var(--card)] text-[var(--foreground)] animate-in fade-in slide-in-from-right-1 duration-200 motion-reduce:animate-none",
        className,
      )}
    >
      <header
        className={cn(
          "flex items-start border-b border-[var(--border)]",
          compact ? "gap-2.5 px-3 py-3" : "gap-3 px-4 py-3 sm:px-5",
        )}
      >
        <CommandCenterMedia
          size="preview"
          role="preview"
          icon={Icon}
          src={preview?.media?.src}
          alt={preview?.media?.alt}
          kind={preview?.media?.kind}
          avatarCropStyle={preview?.media?.avatarCropStyle}
          accent={preview?.accent}
          className={compact ? "size-20 sm:size-24" : undefined}
        />

        <div className="min-w-0 flex-1 self-center">
          {(preview?.eyebrow || preview?.categoryLabel) && (
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--primary)_65%,var(--muted-foreground))]">
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              {preview.eyebrow ?? preview.categoryLabel}
            </div>
          )}
          <h2 id={titleId} className="break-words text-[18px] font-semibold leading-6">
            {title}
          </h2>
          {preview?.subtitle && (
            <p className="mt-0.5 break-words text-xs leading-5 text-[var(--muted-foreground)]">{preview.subtitle}</p>
          )}
          {preview?.metadataLine && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{preview.metadataLine}</p>
          )}
        </div>
      </header>

      {((preview && (preview.description || tags?.length || preview.status || preview.supportingInfo || hasFacts)) ||
        statusLabel) && (
        <div
          className={cn(
            "max-h-[min(20rem,45vh)] min-h-0 flex-1 overscroll-contain overflow-y-auto",
            compact ? "px-3 py-3" : "px-4 py-3 sm:px-5",
          )}
        >
          {preview?.description && (
            <p
              id={descriptionId}
              className="max-w-[70ch] whitespace-pre-line break-words text-sm leading-5 text-[var(--foreground)]"
            >
              {preview.description}
            </p>
          )}

          {(statusLabel || preview?.status || tags?.length) && (
            <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1" aria-label={preview?.categoryLabel}>
              {statusLabel ? (
                <li className="max-w-full break-words rounded-full bg-[color-mix(in_srgb,var(--foreground)_7%,var(--background))] px-2 py-0.5 text-xs font-medium">
                  {statusLabel}
                </li>
              ) : null}
              {preview?.status ? (
                <li
                  className={cn(
                    "max-w-full break-words rounded-full px-2 py-0.5 text-xs font-medium",
                    getCommandCenterStatusClass(preview.status.tone),
                  )}
                >
                  {preview.status.label}
                </li>
              ) : null}
              {tags?.map((tag, index) => (
                <li
                  key={`${tag}-${index}`}
                  className="inline-flex max-w-full items-center gap-1 break-words text-xs text-[var(--muted-foreground)]"
                >
                  <Tag className="size-3 shrink-0" aria-hidden="true" />
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {preview?.supportingInfo && (
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{preview.supportingInfo}</p>
          )}

          {hasFacts && preview && (
            <dl className={cn("mt-3 grid grid-cols-1 gap-2", !compact && "sm:grid-cols-2")}>
              {facts?.map((fact, index) => (
                <div
                  key={`${fact.label}-${index}`}
                  className="min-w-0 rounded-lg bg-[color-mix(in_srgb,var(--foreground)_4%,var(--card))] px-3 py-2 ring-1 ring-inset ring-[var(--border)]/60"
                >
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--muted-foreground)]">
                    {fact.label}
                  </dt>
                  <dd className="mt-0.5 break-words text-sm leading-5 text-[var(--foreground)]">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {hasActions && (
        <footer
          className={cn(
            "mt-auto flex flex-col-reverse gap-2 border-t border-[var(--border)] sm:flex-row sm:justify-end",
            compact ? "px-3 py-2" : "px-4 py-3 sm:px-5",
          )}
        >
          {resolvedActions.map((action, index) => {
            const ActionIcon = action.icon ?? (index === resolvedActions.length - 1 ? ArrowRight : CornerDownRight);
            return (
              <button
                key={`${action.label}-${index}`}
                type="button"
                onClick={() => action.onSelect(result)}
                disabled={action.disabled}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-[background-color,filter,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:min-h-9",
                  index === resolvedActions.length - 1
                    ? "bg-[var(--primary)] font-semibold text-[var(--primary-foreground)] hover:brightness-105 active:scale-[0.98]"
                    : "text-[var(--foreground)] hover:bg-[var(--accent)]",
                )}
              >
                <ActionIcon aria-hidden="true" size="1rem" />
                <span className="break-words text-center">{action.label}</span>
                {action.shortcut ? (
                  <kbd className="ml-auto shrink-0 font-sans text-xs font-medium text-[var(--muted-foreground)] sm:ml-1">
                    {action.shortcut}
                  </kbd>
                ) : null}
              </button>
            );
          })}
        </footer>
      )}
    </article>
  );
}
