import { useEffect, useRef, useState } from "react";
import { LOCAL_SIDECAR_CONNECTION_ID, type ProfessorMariQuickPromptRequest } from "@marinara-engine/shared";

import { api } from "../lib/api-client";
import { useUIStore } from "../stores/ui.store";

/**
 * Default idle delay before the aside calls a model.
 *
 * A knob, not a constant: too short spends a call on an ordinary typing pause,
 * too long makes the feature feel absent, and the right value depends on how
 * fast the user types and how slow their model is. Tune it against real use.
 */
export const OMNIBAR_ASIDE_DELAY_MS = 3_000;

/** Below this the query is too short to mean anything. Matches message search. */
const MIN_QUERY_LENGTH = 3;

export type OmnibarAsideStatus = "idle" | "waiting" | "streaming" | "complete" | "error";

export interface OmnibarAsideState {
  status: OmnibarAsideStatus;
  /** The answer so far. Streams. */
  answer: string;
  /** Present only when status is "error". Plain, and never a toast (R24). */
  error: string | null;
  /** The query this answer belongs to, so a stale answer is never shown. */
  query: string;
  /** What answered: the local sidecar, or a connection name. */
  tier: "local" | "remote";
}

const IDLE: OmnibarAsideState = { status: "idle", answer: "", error: null, query: "", tier: "local" };

/**
 * The cheap answer beside the omnibar list.
 *
 * It fires only when the deterministic list has already given up (R10) and the
 * input has been idle for the delay (R23), and it sends a payload built for an
 * unasked call - no memories, no field contents (R22). The list is never blocked
 * on it and never degraded by its failure (R2, R24).
 */
export function useOmnibarAside(params: {
  /** The typed query, after any scope prefix is stripped. */
  query: string;
  /** True when nothing deterministic matched well enough to answer. */
  deadEnd: boolean;
  /** Where the user is, for the narrow context payload. */
  source: NonNullable<ProfessorMariQuickPromptRequest["context"]>["source"];
  /** Human label of the focused resource, if there is one. Never its id. */
  resourceLabel?: string | null;
  delayMs?: number;
}): OmnibarAsideState {
  const enabled = useUIStore((state) => state.omnibarAsideEnabled);
  const connectionId = useUIStore((state) => state.omnibarAsideConnectionId);
  const [state, setState] = useState<OmnibarAsideState>(IDLE);
  const abortRef = useRef<AbortController | null>(null);

  const { query, deadEnd, source, resourceLabel } = params;
  const delayMs = params.delayMs ?? OMNIBAR_ASIDE_DELAY_MS;
  const trimmed = query.trim();
  const ready = enabled && deadEnd && trimmed.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (!ready) {
      setState(IDLE);
      return;
    }
    const tier: OmnibarAsideState["tier"] = connectionId === LOCAL_SIDECAR_CONNECTION_ID ? "local" : "remote";
    setState({ status: "waiting", answer: "", error: null, query: trimmed, tier });

    const timer = window.setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      const body: ProfessorMariQuickPromptRequest = {
        message: trimmed,
        connectionId,
        unasked: true,
        resourceLabel: resourceLabel ?? undefined,
        context: { source, query: trimmed },
      };
      void (async () => {
        let answer = "";
        try {
          for await (const event of api.streamEvents("/professor-mari/quick/prompt", body, controller.signal)) {
            if (event.type === "token" && typeof event.data === "string") {
              answer += event.data;
              setState({ status: "streaming", answer, error: null, query: trimmed, tier });
            } else if (event.type === "complete") {
              setState({ status: "complete", answer, error: null, query: trimmed, tier });
            } else if (event.type === "error") {
              throw new Error(typeof event.data === "string" ? event.data : "Professor Mari could not answer.");
            }
          }
        } catch (error) {
          if (controller.signal.aborted) return;
          setState({
            status: "error",
            answer: "",
            error: error instanceof Error ? error.message : String(error),
            query: trimmed,
            tier,
          });
        } finally {
          if (abortRef.current === controller) abortRef.current = null;
        }
      })();
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [connectionId, delayMs, ready, resourceLabel, source, trimmed]);

  return state;
}
