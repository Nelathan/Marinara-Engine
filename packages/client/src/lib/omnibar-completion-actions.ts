import {
  PROFESSOR_MARI_CAPABILITY_CATALOG,
  type ProfessorMariAskContext,
  type ProfessorMariCapability,
  type ProfessorMariCompletionKind,
} from "@marinara-engine/shared";

/** What the omnibar offers after Mari finishes a task. Mapped to real surfaces by the caller. */
export type OmnibarCompletionActionKind = "open-resource" | "open-field" | "review" | "return";

export interface OmnibarCompletionAction {
  kind: OmnibarCompletionActionKind;
  /** Present for resource/field actions so the caller can open the right thing. */
  resource?: ProfessorMariAskContext["resource"];
  field?: string;
}

/**
 * Bounded completion actions for a finished Mari task, derived deterministically
 * from the capability's completion kind plus the context the handoff already
 * carries. Only actions that are valid for the current state are returned, and
 * never more than three. "Return" is always available as the last option.
 */
export function omnibarCompletionActions(
  context: Pick<ProfessorMariAskContext, "capability" | "resource" | "field"> | null | undefined,
): OmnibarCompletionAction[] {
  if (!context) return [{ kind: "return" }];
  const capability = context.capability as ProfessorMariCapability | undefined;
  const completion: ProfessorMariCompletionKind | undefined = capability
    ? PROFESSOR_MARI_CAPABILITY_CATALOG[capability]?.completion
    : undefined;
  const resource = context.resource;
  const field = context.field;

  const actions: OmnibarCompletionAction[] = [];
  const addResource = () => {
    if (resource) actions.push({ kind: "open-resource", resource });
  };
  const addField = () => {
    if (resource && field) actions.push({ kind: "open-field", resource, field });
  };

  switch (completion) {
    case "open-resource":
      addResource();
      break;
    case "show-field":
      addField();
      actions.push({ kind: "review" });
      break;
    case "show-review":
      actions.push({ kind: "review" });
      // A field edit is easiest to check in place; fall back to the whole resource.
      if (field) addField();
      else addResource();
      break;
    default:
      break;
  }

  actions.push({ kind: "return" });
  return actions.slice(0, 3);
}
