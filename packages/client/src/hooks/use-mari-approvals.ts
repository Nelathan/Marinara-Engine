import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { MariDbHistoryEntry, MariWorkspacePendingApproval } from "@marinara-engine/shared";
import { api } from "../lib/api-client";
import { describeProfessorMariError } from "../lib/professor-mari-errors";
import { professorMariWorkspaceStatusKeys } from "./use-professor-mari-workspace-status";

export type WorkspaceApprovalResponse = {
  ok: boolean;
  approval?: MariWorkspacePendingApproval;
  history?: MariDbHistoryEntry | null;
  completed?: boolean;
  outcome?: "applied" | "discarded" | "state_changed" | "failed";
  error?: string | null;
};

/**
 * Keeping and restoring one of Mari's pending approvals, with the toasts that go
 * with it. Shared by the Work pane and the omnibar so an approval reads the same
 * wherever the user meets it; a second copy of this is how the two surfaces would
 * drift into looking like two features.
 *
 * `onRefresh` is for surfaces that hold workspace state outside React Query (the
 * Work pane keeps its own status and memories list). Surfaces that read the
 * status query need nothing: this invalidates it for them.
 *
 * ponytail: the toast strings keep their `ui.chat.homeprofessormarichat.*` keys.
 * They are auto-generated names and they read wrong here, but renaming them would
 * orphan the zh-Hans and ko translations that already cover them.
 */
export function useMariApprovals(options: { onRefresh?: () => Promise<void> | void } = {}) {
  const { onRefresh } = options;
  const { t: localizeUi } = useTranslation();
  const qc = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: professorMariWorkspaceStatusKeys.all }).catch(() => undefined);
    await Promise.resolve(onRefresh?.()).catch(() => undefined);
  }, [onRefresh, qc]);

  // Invalidation marks every query stale either way; the default 'active' refetch
  // pulls only what is mounted now, and everything else refreshes on its next
  // mount. refetchType:'all' here made every cached chat re-drain its full message
  // page history on each Mari workspace change (#4703).
  const invalidateWorkspaceData = useCallback(async () => {
    await qc.invalidateQueries();
  }, [qc]);

  const keepApproval = useCallback(
    async (id: string, opts?: { enable?: boolean }) => {
      if (pendingId) return;
      setPendingId(id);
      try {
        // #4851 "Keep & Enable": pass { enable: true } so a kept memory insert is switched on.
        const result = await api.post<WorkspaceApprovalResponse>(
          `/professor-mari/workspace/approvals/${id}/approve`,
          opts?.enable ? { enable: true } : undefined,
        );
        await refresh();
        if (result.outcome === "applied") {
          await invalidateWorkspaceData();
          toast.success(
            result.approval?.kind === "dependency_install"
              ? localizeUi("ui.chat.homeprofessormarichat.installedValue1Value2", {
                  value1: result.approval.packageName,
                  value2: result.approval.version,
                })
              : localizeUi("ui.chat.homeprofessormarichat.appliedProfessorMariSSensitiveFileChange"),
          );
        } else if (result.history?.status === "kept") {
          toast.success(localizeUi("ui.chat.homeprofessormarichat.keptMariSWorkspaceChange"));
        } else {
          toast.error(
            result.outcome === "state_changed"
              ? localizeUi("ui.chat.homeprofessormarichat.theWorkspaceChangedAfterProfessorMariStagedThisProposal")
              : localizeUi("ui.chat.homeprofessormarichat.professorMariCouldNotApplyThatWorkspaceChange"),
            { description: result.error ?? undefined, duration: 12_000 },
          );
        }
        return result;
      } catch (error) {
        console.error("[Professor Mari] Failed to keep workspace change", error);
        toast.error(localizeUi("ui.chat.homeprofessormarichat.professorMariCouldNotKeepThatWorkspaceChange"), {
          description: describeProfessorMariError(error),
          duration: 12_000,
        });
        return null;
      } finally {
        setPendingId((current) => (current === id ? null : current));
      }
    },
    [invalidateWorkspaceData, localizeUi, pendingId, refresh],
  );

  const restoreApproval = useCallback(
    async (id: string) => {
      if (pendingId) return;
      setPendingId(id);
      try {
        const result = await api.post<WorkspaceApprovalResponse>(`/professor-mari/workspace/approvals/${id}/reject`);
        await refresh();
        if (result.outcome === "discarded") {
          toast.success(localizeUi("ui.chat.homeprofessormarichat.discardedProfessorMariSProposedChange"));
        } else if (result.history?.status === "restored") {
          await invalidateWorkspaceData();
          toast.success(localizeUi("ui.chat.homeprofessormarichat.restoredThePreviousAppDataSnapshot"));
        } else {
          toast.error(
            result.outcome === "state_changed"
              ? localizeUi("ui.chat.homeprofessormarichat.theWorkspaceChangedAfterProfessorMariStagedThisProposal")
              : localizeUi("ui.chat.homeprofessormarichat.professorMariCouldNotRestoreThatWorkspaceChange"),
            { description: result.error ?? undefined, duration: 12_000 },
          );
        }
        return result;
      } catch (error) {
        console.error("[Professor Mari] Failed to restore workspace change", error);
        toast.error(localizeUi("ui.chat.homeprofessormarichat.professorMariCouldNotRestoreThatWorkspaceChange"), {
          description: describeProfessorMariError(error),
          duration: 12_000,
        });
        return null;
      } finally {
        setPendingId((current) => (current === id ? null : current));
      }
    },
    [invalidateWorkspaceData, localizeUi, pendingId, refresh],
  );

  return { keepApproval, restoreApproval, pendingId };
}
