import assert from "node:assert/strict";

import { resolveProfessorMariVisualState } from "../../../packages/client/src/lib/professor-mari-visual-state.js";

const base = {
  busy: false,
  hasActionResult: false,
  hasAssistantReply: false,
  hasConversation: false,
  needsAttention: false,
};

assert.equal(resolveProfessorMariVisualState(base), "idle");
assert.equal(resolveProfessorMariVisualState({ ...base, hasConversation: true }), "shrug");
assert.equal(
  resolveProfessorMariVisualState({ ...base, hasConversation: true, hasAssistantReply: true }),
  "explaining",
);
assert.equal(resolveProfessorMariVisualState({ ...base, hasActionResult: true }), "success");
assert.equal(resolveProfessorMariVisualState({ ...base, busy: true, hasActionResult: true }), "thinking");
assert.equal(resolveProfessorMariVisualState({ ...base, busy: true, needsAttention: true }), "warning");

console.log("Professor Mari visual-state regression checks passed.");
