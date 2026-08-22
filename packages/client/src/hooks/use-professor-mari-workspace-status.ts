import { useQuery } from "@tanstack/react-query";
import type { MariWorkspaceStatus } from "@marinara-engine/shared";
import { api } from "../lib/api-client";

export const professorMariWorkspaceStatusKeys = {
  all: ["professor-mari", "workspace", "status"] as const,
};

export const PROFESSOR_MARI_STATUS_DIALOG_INTERVAL_MS = 5_000;

/**
 * The omnibar dialog polls quickly while it is open. The always-mounted host
 * keeps a slow heartbeat on the same query key so work that finishes after a
 * close is still noticed — React Query shares one query between both, and the
 * shorter interval wins whenever the dialog is up.
 */
export function useProfessorMariWorkspaceStatus(options?: { intervalMs?: number }) {
  const intervalMs = options?.intervalMs ?? PROFESSOR_MARI_STATUS_DIALOG_INTERVAL_MS;
  return useQuery({
    queryKey: professorMariWorkspaceStatusKeys.all,
    queryFn: () => api.get<MariWorkspaceStatus>("/professor-mari/workspace/status"),
    staleTime: 2_000,
    // Stop polling once the server says the workspace is off, and after a
    // failure: the route is privileged, so an unprivileged client would
    // otherwise retry on every tick for the whole session.
    refetchInterval: (query) =>
      query.state.status === "error" || query.state.data?.enabled === false ? false : intervalMs,
    retry: false,
  });
}
