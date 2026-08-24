import { ArrowRight, CornerDownRight } from "lucide-react";
import { useId, type ReactNode } from "react";
import { getCommandIcon } from "../../lib/command-icons";
import { cn } from "../../lib/utils";
import { ResourceIdentityHeader } from "./ResourceIdentityHeader";
import { getCommandCenterStatusClass } from "./command-center-visuals";
import type {
  CommandCenterPreviewFact,
  CommandResultPreviewAction,
  RichCommandResult,
} from "./command-result-preview.types";

export interface CommandResultPreviewProps {
  result: RichCommandResult;
  actions?: readonly CommandResultPreviewAction[];
  statusLabel?: string;
  variant?: "default" | "compact" | "inline";
  className?: string;
  /** Facts fetched lazily on focus, appended after the eager facts. */
  extraFacts?: readonly CommandCenterPreviewFact[];
  /** Lazily-loaded body content (e.g. a chat message excerpt). */
  detail?: ReactNode;
  /** True while lazy detail is being fetched, before anything arrives. */
  detailLoading?: boolean;
}

export function CommandResultPreview({
  result,
  actions,
  statusLabel,
  variant = "default",
  className,
  extraFacts,
  detail,
  detailLoading,
}: CommandResultPreviewProps) {
  const titleId = useId();
  const descriptionId = useId();
  const preview = result.preview;
  const title = preview?.title ?? result.command.title;
  const Icon = getCommandIcon(result.command.icon, result.command.kind);
  const allFacts = [...(preview?.facts ?? []), ...(extraFacts ?? [])];
  const hasFacts = allFacts.length > 0;
  const resolvedActions = actions?.slice(0, 3) ?? [];
  const hasActions = resolvedActions.length > 0;
  const facts = allFacts.slice(0, 8);
  const tags = preview?.tags ?? preview?.badges;
  const compact = variant === "compact";
  const inline = variant === "inline";

  return (
    <article
      aria-labelledby={titleId}
      aria-describedby={preview?.description ? descriptionId : undefined}
      data-component="CommandResultPreview"
      data-preview-kind={preview?.kind ?? result.command.kind}
      data-variant={variant}
      className={cn(
        "flex min-h-0 w-full flex-col overflow-hidden bg-[var(--card)] text-[var(--foreground)] animate-in fade-in duration-200 motion-reduce:animate-none",
        !inline && "h-full slide-in-from-right-1",
        inline && "rounded-xl border border-[color-mix(in_srgb,var(--primary)_20%,var(--border))]",
        className,
      )}
    >
      <header
        className={cn(
          "flex items-start border-b border-[var(--border)]",
          compact ? "gap-2.5 px-3 py-3" : inline ? "gap-3 px-3.5 py-3.5 sm:px-4" : "gap-3 px-4 py-3 sm:px-5",
        )}
      >
        <ResourceIdentityHeader
          icon={Icon}
          title={title}
          eyebrow={preview?.eyebrow ?? preview?.categoryLabel}
          subtitle={preview?.subtitle}
          metadata={preview?.metadataLine}
          mediaSrc={preview?.media?.src}
          mediaAlt={preview?.media?.alt}
          mediaKind={preview?.media?.kind}
          avatarCropStyle={preview?.media?.avatarCropStyle}
          accent={preview?.accent}
          titleId={titleId}
          className="min-w-0 flex-1"
        />
      </header>

      {((preview && (preview.description || tags?.length || preview.status || preview.supportingInfo)) ||
        hasFacts ||
        statusLabel ||
        detail ||
        detailLoading) && (
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            // Only cap the body when the preview is not already inside a
            // height-bounded panel; otherwise the footer floats mid-panel.
            !compact && !inline && "max-h-[min(20rem,45vh)]",
            compact ? "px-3 py-3" : inline ? "overflow-visible px-3.5 py-3 sm:px-4" : "px-4 py-3 sm:px-5",
          )}
        >
          {preview?.description && (
            <p
              id={descriptionId}
              className={cn(
                "max-w-[70ch] whitespace-pre-line break-words text-sm leading-5 text-[var(--foreground)]",
                // A resource description is often the full card text. Show the
                // opening; the editor has the rest.
                preview.kind === "character" ? "line-clamp-4" : compact && "line-clamp-6",
              )}
            >
              {preview.description}
            </p>
          )}

          {(statusLabel || preview?.status || tags?.length) && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={preview?.categoryLabel}>
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
                  className="inline-flex max-w-full break-words rounded-md bg-[color-mix(in_srgb,var(--primary)_9%,var(--card))] px-2 py-1 text-xs font-medium text-[color-mix(in_srgb,var(--primary)_68%,var(--foreground))]"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {preview?.supportingInfo && (
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{preview.supportingInfo}</p>
          )}

          {hasFacts && (
            <dl className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {facts.map((fact, index) => (
                <div
                  key={`${fact.label}-${index}`}
                  className="grid min-w-0 grid-cols-[minmax(5.5rem,0.8fr)_minmax(0,1.2fr)] gap-3 py-2.5"
                >
                  <dt className="text-xs font-medium text-[var(--muted-foreground)]">{fact.label}</dt>
                  <dd className="break-words text-right text-sm leading-5 text-[var(--foreground)]">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {detail && <div className="mt-3">{detail}</div>}

          {detailLoading && !detail && (
            <div className="mt-3 space-y-1.5" aria-hidden="true">
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-[color-mix(in_srgb,var(--foreground)_9%,var(--card))] motion-reduce:animate-none" />
              <div className="h-3 w-full animate-pulse rounded-full bg-[color-mix(in_srgb,var(--foreground)_9%,var(--card))] motion-reduce:animate-none" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-[color-mix(in_srgb,var(--foreground)_9%,var(--card))] motion-reduce:animate-none" />
            </div>
          )}
        </div>
      )}

      {hasActions && (
        <footer
          className={cn(
            "mt-auto flex flex-col-reverse gap-2 border-t border-[var(--border)] sm:flex-row sm:justify-end",
            compact ? "px-3 py-2" : inline ? "px-3.5 py-2.5 sm:px-4" : "px-4 py-3 sm:px-5",
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
