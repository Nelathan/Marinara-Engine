import assert from "node:assert/strict";

import type { MariDbCommandResult } from "@marinara-engine/shared";
import {
  buildMariWorkspaceActionResult,
  parseAssistantWorkspaceAction,
} from "../../../packages/server/src/services/professor-mari/workspace-agent.service.js";

function result(table: string, action: "insert" | "update" | "replace"): MariDbCommandResult {
  return {
    ok: true,
    mode: "apply",
    command: "app_data",
    summary: {
      matchedRows: 1,
      affectedRows: 1,
      insertedRows: action === "insert" ? 1 : 0,
      updatedRows: action === "update" ? 1 : 0,
      replacedRows: action === "replace" ? 1 : 0,
      deletedRows: 0,
      affectedTables: { [table]: 1 },
      preview: [
        {
          table,
          id: `${table}-id`,
          action,
          before: action === "insert" ? null : { id: `${table}-id`, name: "Old", description: "Before" },
          after: { id: `${table}-id`, name: "New", description: "After" },
        },
      ],
      truncated: false,
    },
    approval: { status: "pending", id: "review-id" },
  };
}

for (const [table, kind] of [
  ["characters", "character"],
  ["personas", "persona"],
  ["lorebooks", "lorebook"],
  ["prompt_presets", "preset"],
] as const) {
  const actionResult = buildMariWorkspaceActionResult(`${kind}.update`, result(table, "update"));
  assert.equal(actionResult?.resource.kind, kind);
  assert.equal(actionResult?.resource.id, `${table}-id`);
  assert.equal(actionResult?.reviewId, "review-id");
  assert.deepEqual(actionResult?.changedFields, ["name", "description"]);
}

const created = buildMariWorkspaceActionResult("character.create", result("characters", "insert"));
assert.equal(created?.status, "created");
assert.equal(created?.summary, "Created character “New”.");

const presetSection = result("prompt_sections", "update");
presetSection.summary!.preview[0]!.after!.presetId = "parent-preset-id";
const presetSectionResult = buildMariWorkspaceActionResult("preset.updateSection", presetSection);
assert.equal(presetSectionResult?.status, "updated");
assert.equal(presetSectionResult?.resource.kind, "preset");
assert.equal(presetSectionResult?.resource.id, "parent-preset-id");

const dryRun = { ...result("characters", "insert"), mode: "dry-run" as const };
assert.equal(buildMariWorkspaceActionResult("character.create", dryRun), null);
assert.equal(buildMariWorkspaceActionResult("theme.create", result("themes", "insert")), null);

const parsedAction = parseAssistantWorkspaceAction(
  JSON.stringify({
    say: "I updated Luna.",
    commands: [{ name: "app_data", arguments: { action: "character.update" } }],
    stop: true,
  }),
);
assert.equal(parsedAction.protocolValid, true, "structured action output remains valid");
assert.equal(parsedAction.commands[0]?.name, "app_data", "app-data action calls are retained");

const malformedAction = parseAssistantWorkspaceAction(
  '<delete_everything>{"action":"delete"}</delete_everything>',
);
assert.equal(malformedAction.protocolValid, false, "unknown action tools are rejected");
assert.equal(malformedAction.commands.length, 0, "rejected action tools cannot reach execution");

console.log("Professor Mari action-result regression checks passed.");
