import { useQuery } from "@tanstack/react-query";
import type { MariWorkspaceStatus } from "@marinara-engine/shared";
import { api } from "../lib/api-client";

export const professorMariWorkspaceStatusKeys = {
  all: ["professor-mari", "workspace", "status"] as const,
};

export function useProfessorMariWorkspaceStatus() {
  return useQuery({
    queryKey: professorMariWorkspaceStatusKeys.all,
    queryFn: () => api.get<MariWorkspaceStatus>("/professor-mari/workspace/status"),
    staleTime: 2_000,
    refetchInterval: 5_000,
    retry: false,
  });
}
