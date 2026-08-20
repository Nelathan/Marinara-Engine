export type ProfessorMariVisualState = "idle" | "thinking" | "explaining" | "success" | "warning" | "shrug";

export function resolveProfessorMariVisualState({
  busy,
  hasActionResult,
  hasAssistantReply,
  hasConversation,
  needsAttention,
}: {
  busy: boolean;
  hasActionResult: boolean;
  hasAssistantReply: boolean;
  hasConversation: boolean;
  needsAttention: boolean;
}): ProfessorMariVisualState {
  if (needsAttention) return "warning";
  if (busy) return "thinking";
  if (hasActionResult) return "success";
  if (hasAssistantReply) return "explaining";
  if (hasConversation) return "shrug";
  return "idle";
}
