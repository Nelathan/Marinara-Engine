import { useProfessorMariWorkspaceStatus } from "./use-professor-mari-workspace-status";

/**
 * Heartbeat for Professor Mari's presence outside the omnibar dialog.
 *
 * Her state used to live inside the dialog, which is unmounted on close, so a
 * task that finished while the omnibar was shut was simply lost. This reads the
 * server status instead, at a slow cadence, from a component that is always
 * mounted.
 */
const PRESENCE_INTERVAL_MS = 30_000;

export interface MariPresence {
  /** She is running something right now. */
  working: boolean;
  /** She is blocked on the user: an approval is waiting. */
  needsAttention: boolean;
  pendingCount: number;
  /** Newest workspace-history entry id, or null when she has no history. */
  latestHistoryId: string | null;
}

export function useMariPresence(): MariPresence {
  const status = useProfessorMariWorkspaceStatus({ intervalMs: PRESENCE_INTERVAL_MS });
  const pendingCount = status.data?.pendingApprovals.length ?? 0;
  return {
    working: status.data?.active === true,
    needsAttention: pendingCount > 0,
    pendingCount,
    // getHistory() reverses after slicing, so the newest entry is first.
    latestHistoryId: status.data?.history[0]?.id ?? null,
  };
}
