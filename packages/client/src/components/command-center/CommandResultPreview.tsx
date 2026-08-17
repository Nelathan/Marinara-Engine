import { ArrowRight, ExternalLink } from "lucide-react";
import { useId } from "react";
import { getCommandIcon } from "../../lib/command-icons";
import { cn } from "../../lib/utils";
import type { CommandResultPreviewAction, RichCommandResult } from "./command-result-preview.types";

export interface CommandResultPreviewProps {
  result: RichCommandResult;
  primaryAction?: CommandResultPreviewAction;
  openAction?: CommandResultPreviewAction;
  statusLabel?: string;
  className?: string;
}

export function CommandResultPreview({
  result,
  primaryAction,
  openAction,
  statusLabel,
  className,
}: CommandResultPreviewProps) {
  const titleId = useId();
  const descriptionId = useId();
  const preview = result.preview;
  const title = preview?.title ?? result.command.title;
  const Icon = getCommandIcon(result.command.icon, result.command.kind);
  const hasFacts = Boolean(preview?.facts?.length);
  const hasActions = Boolean(primaryAction || openAction);

  return (
    <article
      aria-labelledby={titleId}
      aria-describedby={preview?.description ? descriptionId : undefined}
      data-component="CommandResultPreview"
      data-preview-kind={preview?.kind ?? result.command.kind}
      className={cn(
        "flex min-h-0 w-full flex-col overflow-hidden bg-[var(--card)] text-[var(--foreground)]",
        className,
      )}
    >
      <header className="flex items-start gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-5">
        {preview?.media ? (
          <img
            src={preview.media.src}
            alt={preview.media.alt}
            className="h-14 w-14 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--muted)] object-cover sm:h-16 sm:w-16"
          />
        ) : (
          <span
            aria-hidden="true"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/12 text-[var(--primary)] sm:h-12 sm:w-12"
          >
            <Icon size="1.25rem" strokeWidth={1.8} />
            {preview?.accent ? (
              <span
                className="absolute bottom-1 right-1 size-2.5 rounded-full border border-[var(--card)]"
                style={{ backgroundColor: preview.accent }}
              />
            ) : null}
          </span>
        )}

        <div className="min-w-0 flex-1 self-center">
          {preview?.categoryLabel && (
            <div className="mb-1 text-xs font-semibold text-[var(--primary)]">{preview.categoryLabel}</div>
          )}
          <h2 id={titleId} className="break-words text-base font-bold leading-snug sm:text-lg">
            {title}
          </h2>
          {preview?.subtitle && (
            <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{preview.subtitle}</p>
          )}
        </div>
      </header>

      {((preview && (preview.description || preview.badges?.length || hasFacts)) || statusLabel) && (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {preview?.description && (
            <p
              id={descriptionId}
              className="max-w-[70ch] whitespace-pre-line break-words text-sm leading-6 text-[var(--foreground)]"
            >
              {preview.description}
            </p>
          )}

          {(statusLabel || (preview?.badges && preview.badges.length > 0)) && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={preview?.categoryLabel}>
              {statusLabel ? (
                <li className="max-w-full truncate rounded-full border border-[var(--border)] bg-[var(--muted)] px-2 py-1 text-xs text-[var(--muted-foreground)]">
                  {statusLabel}
                </li>
              ) : null}
              {preview?.badges?.map((badge, index) => (
                <li
                  key={`${badge}-${index}`}
                  className="max-w-full truncate rounded-full border border-[var(--border)] bg-[var(--muted)] px-2 py-1 text-xs text-[var(--muted-foreground)]"
                >
                  {badge}
                </li>
              ))}
            </ul>
          )}

          {hasFacts && preview && (
            <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
              {preview.facts?.map((fact, index) => (
                <div key={`${fact.label}-${index}`} className="min-w-0">
                  <dt className="text-xs font-semibold text-[var(--muted-foreground)]">{fact.label}</dt>
                  <dd className="mt-0.5 break-words text-sm text-[var(--foreground)]">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {hasActions && (
        <footer className="mt-auto flex flex-col-reverse gap-2 border-t border-[var(--border)] px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
          {openAction && (
            <button
              type="button"
              onClick={() => openAction.onSelect(result)}
              disabled={openAction.disabled}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ExternalLink aria-hidden="true" size="1rem" />
              <span className="break-words text-center">{openAction.label}</span>
            </button>
          )}
          {primaryAction && (
            <button
              type="button"
              onClick={() => primaryAction.onSelect(result)}
              disabled={primaryAction.disabled}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition-[filter,transform] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowRight aria-hidden="true" size="1rem" />
              <span className="break-words text-center">{primaryAction.label}</span>
            </button>
          )}
        </footer>
      )}
    </article>
  );
}
