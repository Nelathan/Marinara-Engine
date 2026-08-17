export const PROFESSOR_MARI_OPEN_EVENT = "marinara:home-professor-mari-open";
export type ProfessorMariOpenDetail = { draft?: string };

let pendingProfessorMariOpen: ProfessorMariOpenDetail | null = null;

export function requestProfessorMariOpen(draft = "") {
  pendingProfessorMariOpen = { draft };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<ProfessorMariOpenDetail>(PROFESSOR_MARI_OPEN_EVENT, { detail: { draft } }));
  }
}

export function consumeProfessorMariOpenRequest() {
  const request = pendingProfessorMariOpen;
  pendingProfessorMariOpen = null;
  return request;
}
