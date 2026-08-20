import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { CommandCenterSegmentedChoice } from "../../command-center/CommandCenterSegmentedChoice";
import { CommandCenterToggle } from "../../command-center/CommandCenterToggle";
import { CommandResultPreview } from "../../command-center/CommandResultPreview";
import type {
  CommandCenterPreviewFact,
  CommandResultPreviewAction,
  RichCommandResult,
} from "../../command-center/command-result-preview.types";
import type { RankedOmnibarResult } from "./omnibar-result-view";

export interface OmnibarDetailPaneProps {
  result: RankedOmnibarResult;
  actions: readonly CommandResultPreviewAction[];
  extraFacts: CommandCenterPreviewFact[];
  detail: ReactNode;
  detailLoading: boolean;
  /** True while the mutation behind this result's inline control is in flight. */
  controlPending: boolean;
  /** Contextual state that is useful in the preview but does not belong to the resource itself. */
  contextStatusLabel?: string;
}

/**
 * One preview body shared by the three detail surfaces (mobile inline, browse,
 * and the external xl panel) so they never drift apart. It also renders the
 * inline choice/toggle editors the compact mobile/xl panels show.
 */
export function OmnibarDetailPane({
  result,
  actions,
  extraFacts,
  detail,
  detailLoading,
  controlPending,
  contextStatusLabel,
}: OmnibarDetailPaneProps) {
  const { t } = useTranslation();
  return (
    <>
      <CommandResultPreview
        result={
          {
            command: result.command,
            score: result.score,
            preview: result.preview?.(),
          } as RichCommandResult
        }
        variant="compact"
        statusLabel={
          result.command.availability?.status === "requires-capability"
            ? t("commandCenter.setupRequired", "Setup required: {{capability}}", {
                capability: result.command.availability.capability ?? t("commandCenter.capability", "capability"),
              })
            : result.command.availability?.status === "requires-admin"
              ? t("commandCenter.adminRequired", "Administrator access required")
              : contextStatusLabel
        }
        actions={actions}
        extraFacts={extraFacts}
        detail={detail}
        detailLoading={detailLoading}
      />
      {result.control?.type === "choice" ? (
        <div className="border-t border-[var(--border)] p-3">
          <CommandCenterSegmentedChoice
            label={result.control.label}
            value={String(result.control.value)}
            options={(result.control.options ?? []).map((option) => ({ ...option }))}
            onValueChange={(value) => result.control?.onChange(value)}
            variant="compact"
          />
        </div>
      ) : null}
      {result.control?.type === "toggle" && result.category !== "persona" && result.category !== "preset" ? (
        <div className="border-t border-[var(--border)] p-3">
          <CommandCenterToggle
            label={result.control.label}
            checked={Boolean(result.control.value)}
            stateLabel={
              result.control.value
                ? t("commandCenter.values.enabled", "Enabled")
                : t("commandCenter.values.disabled", "Disabled")
            }
            onCheckedChange={(value) => result.control?.onChange(value)}
            disabled={controlPending}
            loading={controlPending}
            variant="compact"
            className="w-full"
          />
        </div>
      ) : null}
    </>
  );
}
