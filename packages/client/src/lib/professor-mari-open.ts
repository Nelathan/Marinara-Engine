import type { ProfessorMariHandoff } from "@marinara-engine/shared";

export const PROFESSOR_MARI_OPEN_EVENT = "marinara:home-professor-mari-open";
export type ProfessorMariOpenDetail = ProfessorMariHandoff;

let pendingProfessorMariOpen: ProfessorMariOpenDetail | null = null;

export function requestProfessorMariOpen(handoff: string | ProfessorMariHandoff = "") {
  const request = typeof handoff === "string" ? { draft: handoff } : handoff;
  pendingProfessorMariOpen = request;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<ProfessorMariOpenDetail>(PROFESSOR_MARI_OPEN_EVENT, { detail: request }));
  }
}

export function consumeProfessorMariOpenRequest(destination: "home" | "floating-assistant" = "home") {
  if ((pendingProfessorMariOpen?.destination ?? "home") !== destination) return null;
  const request = pendingProfessorMariOpen;
  pendingProfessorMariOpen = null;
  return request;
}

export function peekProfessorMariOpenRequest() {
  return pendingProfessorMariOpen;
}
