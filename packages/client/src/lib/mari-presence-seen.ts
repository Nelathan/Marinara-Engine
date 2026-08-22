const MARI_SEEN_HISTORY_KEY = "marinara:professor-mari-seen-history";

/**
 * The newest workspace-history entry the user has already looked at.
 *
 * The server has no notion of "seen", so the marker is the client's. It is the
 * history entry id rather than a boolean because the heartbeat is slow: a task
 * that starts and finishes between two polls is never observed as active, but it
 * still leaves a history entry behind.
 */
export function readMariSeenHistoryId(): string | null {
  try {
    return window.localStorage.getItem(MARI_SEEN_HISTORY_KEY);
  } catch {
    return null;
  }
}

export function rememberMariSeenHistoryId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(MARI_SEEN_HISTORY_KEY, id);
    else window.localStorage.removeItem(MARI_SEEN_HISTORY_KEY);
  } catch {
    /* ignore */
  }
}
