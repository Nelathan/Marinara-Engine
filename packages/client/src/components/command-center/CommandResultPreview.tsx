import { ArrowRight, CornerDownRight } from "lucide-react";
import { useId } from "react";
import { getCommandIcon } from "../../lib/command-icons";
import { cn } from "../../lib/utils";
import { CommandCenterMedia } from "./CommandCenterMedia";
import type { CommandResultPreviewAction, RichCommandResult } from "./command-result-preview.types";

export interface CommandResultPreviewProps {
  result: RichCommandResult;
  primaryAction?: CommandResultPreviewAction;
  openAction?: CommandResultPreviewAction;
  statusLabel?: string;
  variant?: "default" | "compact";
  className?: string;
}

export function CommandResultPreview({
  result,
  primaryAction,
  openAction,
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
  const hasActions = Boolean(primaryAction || openAction);
  const facts = preview?.facts?.slice(0, 6);
  const compact = variant === "compact";

  return (
    <article
      aria-labelledby={titleId}
      aria-describedby={preview?.description ? descriptionId : undefined}
      data-component="CommandResultPreview"
      data-preview-kind={preview?.kind ?? result.command.kind}
      data-variant={variant}
      className={cn(
        "flex min-h-0 w-full flex-col overflow-hidden bg-[var(--card)] text-[var(--foreground)]",
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
          icon={Icon}
          src={preview?.media?.src}
          kind={preview?.media?.kind}
          avatarCropStyle={preview?.media?.avatarCropStyle}
          accent={preview?.accent}
          className={compact ? "size-12" : undefined}
        />

        <div className="min-w-0 flex-1 self-center">
          {preview?.categoryLabel && (
            <div className="mb-0.5 text-xs font-medium text-[var(--muted-foreground)]">{preview.categoryLabel}</div>
          )}
          <h2 id={titleId} className="break-words text-base font-semibold leading-5">
            {title}
          </h2>
          {preview?.subtitle && (
            <p className="mt-0.5 break-words text-xs leading-5 text-[var(--muted-foreground)]">{preview.subtitle}</p>
          )}
        </div>
      </header>

      {((preview && (preview.description || preview.badges?.length || hasFacts)) || statusLabel) && (
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

          {(statusLabel || (preview?.badges && preview.badges.length > 0)) && (
            <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1" aria-label={preview?.categoryLabel}>
              {statusLabel ? (
                <li className="max-w-full break-words text-xs font-medium text-[var(--foreground)]">{statusLabel}</li>
              ) : null}
              {preview?.badges?.map((badge, index) => (
                <li key={`${badge}-${index}`} className="max-w-full break-words text-xs text-[var(--muted-foreground)]">
                  {badge}
                </li>
              ))}
            </ul>
          )}

          {hasFacts && preview && (
            <dl
              className={cn(
                "mt-3 grid grid-cols-1 gap-x-5 gap-y-2 border-t border-[var(--border)] pt-3",
                !compact && "sm:grid-cols-2",
              )}
            >
              {facts?.map((fact, index) => (
                <div key={`${fact.label}-${index}`} className="min-w-0">
                  <dt className="text-xs font-medium text-[var(--muted-foreground)]">{fact.label}</dt>
                  <dd className="break-words text-sm leading-5 text-[var(--foreground)]">{fact.value}</dd>
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
          {openAction && (
            <button
              type="button"
              onClick={() => openAction.onSelect(result)}
              disabled={openAction.disabled}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-9"
            >
              <CornerDownRight aria-hidden="true" size="1rem" />
              <span className="break-words text-center">{openAction.label}</span>
              {openAction.shortcut ? (
                <kbd className="ml-auto shrink-0 font-sans text-xs font-medium text-[var(--muted-foreground)] sm:ml-1">
                  {openAction.shortcut}
                </kbd>
              ) : null}
            </button>
          )}
          {primaryAction && (
            <button
              type="button"
              onClick={() => primaryAction.onSelect(result)}
              disabled={primaryAction.disabled}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] transition-[filter,transform] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-9"
            >
              <ArrowRight aria-hidden="true" size="1rem" />
              <span className="break-words text-center">{primaryAction.label}</span>
              {primaryAction.shortcut ? (
                <kbd className="ml-auto shrink-0 font-sans text-xs font-medium opacity-75 sm:ml-1">
                  {primaryAction.shortcut}
                </kbd>
              ) : null}
            </button>
          )}
        </footer>
      )}
    </article>
  );
}
