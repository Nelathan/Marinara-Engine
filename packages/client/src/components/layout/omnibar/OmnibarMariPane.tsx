import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { ProfessorMariAskContext } from "@marinara-engine/shared";

import type { CreationProposal } from "../../../lib/omnibar-creation-proposal";
import type { OmnibarCompletionAction } from "../../../lib/omnibar-completion-actions";
import type { ProfessorMariVisualState } from "../../../lib/professor-mari-visual-state";

const OmnibarProfessorMariChat = lazy(() =>
  import("../../chat/HomeProfessorMariChat").then((module) => ({ default: module.HomeProfessorMariChat })),
);

export interface OmnibarMariPaneProps {
  /** False while the pane stays mounted but parked behind another pane. */
  active: boolean;
  reduceMotion: boolean | null;
  proposalDraft: CreationProposal | null;
  acceptPending: boolean;
  onAcceptProposal: (proposal: CreationProposal, options?: { assistedOnly?: boolean }) => void;
  onCancelProposal: () => void;
  mariContext: ProfessorMariAskContext | null;
  mariOpenChatId: string | null;
  mariPendingReviewRequest: number;
  mariChatOpen: boolean;
  onChatWindowOpenChange: (open: boolean) => void;
  completionActions: readonly OmnibarCompletionAction[];
  onCompletionAction: (action: OmnibarCompletionAction) => void;
  onVisualStateChange: (state: ProfessorMariVisualState, hasConversation: boolean) => void;
}

export function OmnibarMariPane({
  active,
  reduceMotion,
  proposalDraft,
  acceptPending,
  onAcceptProposal,
  onCancelProposal,
  mariContext,
  mariOpenChatId,
  mariPendingReviewRequest,
  mariChatOpen,
  onChatWindowOpenChange,
  completionActions,
  onCompletionAction,
  onVisualStateChange,
}: OmnibarMariPaneProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      key="omnibar-mari-pane"
      data-component="GlobalOmnibar.Mari"
      initial={active ? { opacity: 0, y: -14, scale: 0.985 } : false}
      animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -12, scale: 0.995 }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 30, mass: 0.75 }}
      className={`mari-workspace-canvas min-h-0 overflow-hidden ${active ? "relative flex-1" : "pointer-events-none absolute inset-0"}`}
      aria-hidden={!active}
      inert={!active}
    >
      {proposalDraft ? (
        <div data-component="GlobalOmnibar.Proposal" className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              {t("commandCenter.proposal.heading", "Set up {{title}}", { title: proposalDraft.title })}
            </h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{proposalDraft.seed}</p>
          </div>
          <ul className="flex flex-col gap-1 text-xs">
            {proposalDraft.items.map((item, index) => (
              <li key={`${item.kind}-${item.label}-${index}`} className="flex items-center justify-between gap-2">
                <span className="text-[var(--foreground)]">{item.label}</span>
                <span className="text-[var(--muted-foreground)]">
                  {item.status === "known"
                    ? t("commandCenter.proposal.existing", "existing {{kind}}", { kind: item.kind })
                    : t("commandCenter.proposal.new", "new {{kind}}", { kind: item.kind })}
                </span>
              </li>
            ))}
          </ul>
          {proposalDraft.missingDecisions.length > 0 ? (
            <p className="text-xs text-[var(--muted-foreground)]">
              {t("commandCenter.proposal.missing", "Mari will ask about: {{list}}", {
                list: proposalDraft.missingDecisions.join(", "),
              })}
            </p>
          ) : null}
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => onAcceptProposal(proposalDraft)}
              disabled={acceptPending}
              className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
            >
              {t("commandCenter.proposal.accept", "Create it")}
            </button>
            <button
              type="button"
              onClick={() => onAcceptProposal(proposalDraft, { assistedOnly: true })}
              className="mari-chrome-control mari-chrome-control--small"
            >
              {t("commandCenter.proposal.withMari", "Build with Mari")}
            </button>
            <button type="button" onClick={onCancelProposal} className="mari-chrome-control mari-chrome-control--small">
              {t("commandCenter.proposal.cancel", "Cancel")}
            </button>
          </div>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="flex min-h-24 items-center justify-center text-sm text-[var(--muted-foreground)]">
              <Loader2 className="mr-2 animate-spin" size={16} />
              {t("omnibar.loading", "Loading results")}
            </div>
          }
        >
          <OmnibarProfessorMariChat
            pageActive
            embeddedTab
            omnibarMode
            launchHidden
            initialAskContext={mariContext}
            openChatId={mariOpenChatId}
            pendingReviewRequest={mariPendingReviewRequest}
            chatWindowOpen={mariChatOpen}
            onChatWindowOpenChange={onChatWindowOpenChange}
            onVisualStateChange={onVisualStateChange}
          />
        </Suspense>
      )}
      {completionActions.length > 0 ? (
        <div
          data-component="GlobalOmnibar.CompletionActions"
          className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--card)] px-3 py-2"
        >
          {completionActions.map((action) => (
            <button
              key={action.kind}
              type="button"
              onClick={() => onCompletionAction(action)}
              className="mari-chrome-control mari-chrome-control--small"
            >
              {action.kind === "open-resource"
                ? t("commandCenter.completion.openResource", "Open {{label}}", {
                    label: action.resource?.label ?? "",
                  })
                : action.kind === "open-field"
                  ? t("commandCenter.completion.openField", "Open {{field}}", { field: action.field ?? "" })
                  : action.kind === "review"
                    ? t("commandCenter.completion.review", "Review changes")
                    : t("commandCenter.completion.return", "Return to results")}
            </button>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
