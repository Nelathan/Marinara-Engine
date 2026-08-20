import { getPrivilegedActionErrorMessage } from "./api-client";
import { formatGenerationParameterError } from "./generation-parameter-errors";

/**
 * The toast description for a failed Professor Mari request. Shared so every
 * surface that talks to her — the Work pane, the omnibar — fails with the same
 * words instead of each inventing its own.
 */
export function describeProfessorMariError(error: unknown) {
  const message = getPrivilegedActionErrorMessage(error, "").trim();
  if (message) {
    return `${formatGenerationParameterError(message)} This message will stay visible long enough to screenshot for troubleshooting.`;
  }
  return "The request failed before Professor Mari could answer. This message will stay visible long enough to screenshot for troubleshooting.";
}
