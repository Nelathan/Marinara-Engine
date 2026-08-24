import type { ProfessorMariHandoff } from "@marinara-engine/shared";

export const PROFESSOR_MARI_OPEN_EVENT = "marinara:home-professor-mari-open";
export type ProfessorMariOpenDetail = ProfessorMariHandoff;

const PROFESSOR_MARI_OPEN_REQUEST_TTL_MS = 30_000;
let pendingProfessorMariOpen: { request: ProfessorMariOpenDetail; expiresAt: number } | null = null;

export function requestProfessorMariOpen(handoff: string | ProfessorMariHandoff = "") {
  const request: ProfessorMariOpenDetail =
    typeof handoff === "string"
      ? { destination: "omnibar", draft: handoff }
      : { ...handoff, destination: handoff.destination ?? "omnibar" };
  pendingProfessorMariOpen = { request, expiresAt: Date.now() + PROFESSOR_MARI_OPEN_REQUEST_TTL_MS };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<ProfessorMariOpenDetail>(PROFESSOR_MARI_OPEN_EVENT, { detail: request }));
  }
}

export function consumeProfessorMariOpenRequest(
  destination: NonNullable<ProfessorMariOpenDetail["destination"]> = "omnibar",
) {
  if (pendingProfessorMariOpen && pendingProfessorMariOpen.expiresAt <= Date.now()) pendingProfessorMariOpen = null;
  if ((pendingProfessorMariOpen?.request.destination ?? "omnibar") !== destination) return null;
  const request = pendingProfessorMariOpen?.request ?? null;
  pendingProfessorMariOpen = null;
  return request;
}

export function peekProfessorMariOpenRequest() {
  if (pendingProfessorMariOpen && pendingProfessorMariOpen.expiresAt <= Date.now()) pendingProfessorMariOpen = null;
  return pendingProfessorMariOpen?.request ?? null;
}
