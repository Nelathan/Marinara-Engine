import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { jsonishLooksTruncated } from "../../packages/server/src/services/game/jsonish.ts";
import {
  COMBAT_INIT_DROPPED_STREAM_ERROR,
  COMBAT_INIT_OBJECTIVE_NOTES,
  FLEEING_ESCAPE_OBJECTIVE,
  ensureFleeingEscapeObjective,
  historyIndicatesFleeing,
  isDroppedStreamFinishReason,
  parseCombatInitBlueprint,
  resolveCombatInitFromLlm,
} from "../../packages/server/src/services/game/combat-init.ts";

const party = [{ name: "Hero", hp: 12, maxHp: 12, attacks: [], items: [], statuses: [], isPlayer: true }];
const enemies = [{ name: "Guard", hp: 8, maxHp: 8, attacks: [], statuses: [], description: "A city guard", sprite: "🛡️" }];

function blueprint(overrides: Record<string, unknown> = {}) {
  return {
    party,
    enemies,
    environment: "A smoke-filled alley",
    ...overrides,
  };
}

const fleeingHistory = [{ role: "assistant", content: "You run. Smoke drops to chest height as boots hammer the cobbles behind you." }];
const fightHistory = [{ role: "assistant", content: "A goblin blocks the road and draws a rusty blade. You raise your sword." }];
const runIntoHistory = [{ role: "assistant", content: "You run into the guards at the gate. They lower their spears." }];

assert.equal(historyIndicatesFleeing(fleeingHistory), true, "Playtester run-away narration must count as fleeing");
assert.equal(historyIndicatesFleeing([{ content: "You flee down the alley." }]), true);
assert.equal(historyIndicatesFleeing([{ content: "The party is retreating toward the exit." }]), true);
assert.equal(historyIndicatesFleeing([{ content: "You are getting away through the smoke." }]), true);
assert.equal(historyIndicatesFleeing(fightHistory), false, "ordinary stand-and-fight must not look like a chase");
assert.equal(historyIndicatesFleeing(runIntoHistory), false, "running into enemies is a collision, not an escape");

const injected = ensureFleeingEscapeObjective(
  blueprint({
    objectives: [{ id: "wipe", kind: "eliminate", label: "Defeat the guard" }],
  }),
  fleeingHistory,
);
assert.equal((injected.objectives as Array<{ kind: string }>)[0]?.kind, "escape");
assert.equal((injected.objectives as Array<{ id: string }>)[0]?.id, FLEEING_ESCAPE_OBJECTIVE.id);
assert.equal((injected.objectives as Array<{ label: string }>)[0]?.label, "Reach the exit");
assert.equal((injected.objectives as Array<{ kind: string }>)[1]?.kind, "eliminate");

const untouched = ensureFleeingEscapeObjective(
  blueprint({
    objectives: [{ id: "wipe", kind: "eliminate", label: "Defeat the guard" }],
  }),
  fightHistory,
);
assert.deepEqual(untouched.objectives, [{ id: "wipe", kind: "eliminate", label: "Defeat the guard" }]);

const alreadyEscape = ensureFleeingEscapeObjective(
  blueprint({
    objectives: [
      { id: "wipe", kind: "eliminate", label: "Defeat the guard" },
      { id: "exit", kind: "escape", label: "Get out of the alley" },
    ],
  }),
  fleeingHistory,
);
assert.equal((alreadyEscape.objectives as Array<{ kind: string }>)[0]?.kind, "escape");
assert.equal((alreadyEscape.objectives as Array<{ id: string }>)[0]?.id, "exit");

const truncated = `{
  "party": [{"name":"Hero","hp":12,"maxHp":12,"attacks":[],"items":[],"statuses":[],"isPlayer":true}],
  "enemies": [{"name":"Guard","hp":8,"maxHp":8,"attacks":[],"statuses":[],"description":"A city guard","sprite":"x"}],
  "environment": "A smoke-filled alley",
  "objectives": [{"id":"wipe","kind":"eliminate","label":"Defeat the guard"}],
  "itemEffects": [`;
assert.equal(jsonishLooksTruncated(truncated), true);
const salvaged = parseCombatInitBlueprint(truncated);
assert.ok(salvaged, "jsonish must salvage a truncated party+enemies blueprint");
assert.equal((salvaged!.party as unknown[]).length, 1);
assert.equal((salvaged!.enemies as unknown[]).length, 1);

const fleeingSalvage = resolveCombatInitFromLlm({
  content: `{
  "party": [{"name":"Hero","hp":12,"maxHp":12,"attacks":[],"items":[],"statuses":[],"isPlayer":true}],
  "enemies": [{"name":"Guard","hp":8,"maxHp":8,"attacks":[],"statuses":[],"description":"A city guard","sprite":"x"}],
  "environment": "A smoke-filled alley",
  "itemEffects": [`,
  finishReason: "error",
  history: fleeingHistory,
});
assert.equal(fleeingSalvage.ok, true);
if (fleeingSalvage.ok) {
  assert.equal(fleeingSalvage.salvaged, true);
  assert.equal((fleeingSalvage.combatState.objectives as Array<{ kind: string }>)[0]?.kind, "escape");
  assert.equal((fleeingSalvage.combatState.objectives as Array<{ label: string }>)[0]?.label, "Reach the exit");
}

const ordinary = resolveCombatInitFromLlm({
  content: JSON.stringify(
    blueprint({
      objectives: [{ id: "wipe", kind: "eliminate", label: "Defeat the guard" }],
    }),
  ),
  finishReason: "stop",
  history: fightHistory,
});
assert.equal(ordinary.ok, true);
if (ordinary.ok) {
  assert.equal((ordinary.combatState.objectives as Array<{ kind: string }>)[0]?.kind, "eliminate");
}

const dropped = resolveCombatInitFromLlm({
  content: "Thinking about the battle",
  finishReason: "error",
  history: fleeingHistory,
});
assert.equal(dropped.ok, false);
if (!dropped.ok) {
  assert.equal(dropped.status, 502);
  assert.equal(dropped.error, COMBAT_INIT_DROPPED_STREAM_ERROR);
}

const invalid = resolveCombatInitFromLlm({
  content: "Thinking about the battle",
  finishReason: "stop",
  history: fightHistory,
});
assert.equal(invalid.ok, false);
if (!invalid.ok) {
  assert.equal(invalid.error, "AI returned invalid JSON");
}

assert.match(COMBAT_INIT_OBJECTIVE_NOTES, /PRIMARY objective MUST be kind "escape"/);

const routeSource = readFileSync(new URL("../../packages/server/src/routes/encounter.routes.ts", import.meta.url), "utf8");
const environmentIdx = routeSource.indexOf('"environment": "Brief description of the combat environment"');
const objectivesIdx = routeSource.indexOf('inst += `  "objectives": [\\n`;');
const itemEffectsIdx = routeSource.indexOf('inst += `  "itemEffects": [\\n`;');
assert.ok(environmentIdx > 0 && objectivesIdx > environmentIdx, "objectives schema must follow environment");
assert.ok(itemEffectsIdx > objectivesIdx, "objectives schema must precede itemEffects so a truncated salvage still has them");
assert.match(routeSource, /resolveCombatInitFromLlm/);

const tacticalTruncated = `{
  "party": [{"name":"Hero","hp":12,"maxHp":12,"attacks":[],"items":[],"statuses":[],"class":"fighter","isPlayer":true}],
  "enemies": [{"name":"Guard","hp":8,"maxHp":8,"attacks":[],"statuses":[],"description":"A city guard","class":"knight","sprite":"x"}],
  "environment": "A smoke-filled alley",
  "objectives": [{"id":"wipe","kind":"eliminate","label":"Defeat the guard"}],
  "styleNotes": {"environmentType":"city","atmosphere":"dark","timeOfDay":"night","weather":"clear"},
  "battlefield": { "formation": "skirmi`;
assert.equal(jsonishLooksTruncated(tacticalTruncated), true);
const tacticalSalvaged = parseCombatInitBlueprint(tacticalTruncated);
assert.ok(tacticalSalvaged, "jsonish must salvage a truncated Tactical party+enemies blueprint");
assert.equal((tacticalSalvaged!.party as unknown[]).length, 1);
assert.equal((tacticalSalvaged!.enemies as unknown[]).length, 1);

const danglingBattlefieldKey = `{
  "party": [{"name":"Hero","hp":12,"maxHp":12,"attacks":[],"items":[],"statuses":[],"class":"fighter","isPlayer":true}],
  "enemies": [{"name":"Guard","hp":8,"maxHp":8,"attacks":[],"statuses":[],"description":"A city guard","class":"knight","sprite":"x"}],
  "environment": "A smoke-filled alley",
  "battle`;
const danglingSalvage = resolveCombatInitFromLlm({
  content: danglingBattlefieldKey,
  finishReason: "terminated",
  history: fightHistory,
});
assert.equal(danglingSalvage.ok, true, "terminated Tactical JSON with a dangling extra field must salvage");
if (danglingSalvage.ok) {
  assert.equal(danglingSalvage.salvaged, true);
  assert.equal((danglingSalvage.combatState.party as unknown[]).length, 1);
  assert.equal((danglingSalvage.combatState.enemies as unknown[]).length, 1);
}

const terminatedUsable = resolveCombatInitFromLlm({
  content: truncated,
  finishReason: "terminated",
  history: fightHistory,
});
assert.equal(terminatedUsable.ok, true);
if (terminatedUsable.ok) {
  assert.equal(terminatedUsable.salvaged, true);
  assert.equal((terminatedUsable.combatState.party as unknown[]).length, 1);
  assert.equal((terminatedUsable.combatState.enemies as unknown[]).length, 1);
}

const unterminatedGarbage = resolveCombatInitFromLlm({
  content: '{ "not": "a combat blueprint", "truncated": ',
  finishReason: "stop",
  history: fightHistory,
});
assert.equal(unterminatedGarbage.ok, false, "unterminated garbage without party+enemies must 502");
if (!unterminatedGarbage.ok) {
  assert.equal(unterminatedGarbage.status, 502);
  assert.equal(unterminatedGarbage.error, "AI returned invalid JSON");
}

const terminatedEmpty = resolveCombatInitFromLlm({
  content: "",
  finishReason: "terminated",
  history: fightHistory,
});
assert.equal(terminatedEmpty.ok, false);
if (!terminatedEmpty.ok) {
  assert.equal(terminatedEmpty.status, 502);
  assert.equal(terminatedEmpty.error, COMBAT_INIT_DROPPED_STREAM_ERROR);
  assert.notEqual(terminatedEmpty.error, "AI returned invalid JSON");
}

assert.equal(isDroppedStreamFinishReason("terminated"), true);
assert.equal(isDroppedStreamFinishReason("error"), true);
assert.equal(isDroppedStreamFinishReason("stop"), false);

const thinkWrappedBlueprint = `<think>{"foo":1}</think>\n` + JSON.stringify(
  blueprint({
    objectives: [{ id: "wipe", kind: "eliminate", label: "Defeat the guard" }],
  }),
);
const thinkWrappedParsed = parseCombatInitBlueprint(thinkWrappedBlueprint);
assert.ok(thinkWrappedParsed, "leading think block with nested JSON must be stripped before parse");
assert.equal((thinkWrappedParsed!.party as unknown[]).length, 1);
assert.equal((thinkWrappedParsed!.enemies as unknown[]).length, 1);

const unclosedThink = resolveCombatInitFromLlm({
  content: "<think>still reasoning about the battle",
  finishReason: "stop",
  history: fightHistory,
});
assert.equal(unclosedThink.ok, false, "unclosed think-only content must 502 invalid JSON");
if (!unclosedThink.ok) {
  assert.equal(unclosedThink.status, 502);
  assert.equal(unclosedThink.error, "AI returned invalid JSON");
}
assert.equal(parseCombatInitBlueprint("<think>still reasoning about the battle"), null);

const thinkWrappedFlee = resolveCombatInitFromLlm({
  content: thinkWrappedBlueprint,
  finishReason: "stop",
  history: fleeingHistory,
});
assert.equal(thinkWrappedFlee.ok, true, "fleeing history must inject escape on a think-wrapped blueprint");
if (thinkWrappedFlee.ok) {
  assert.equal((thinkWrappedFlee.combatState.objectives as Array<{ kind: string }>)[0]?.kind, "escape");
  assert.equal((thinkWrappedFlee.combatState.objectives as Array<{ label: string }>)[0]?.label, "Reach the exit");
  assert.equal((thinkWrappedFlee.combatState.party as unknown[]).length, 1);
  assert.equal((thinkWrappedFlee.combatState.enemies as unknown[]).length, 1);
}

const surfaceSource = readFileSync(new URL("../../packages/client/src/components/game/GameSurface.tsx", import.meta.url), "utf8");
assert.match(surfaceSource, /const COMBAT_INIT_CLIENT_TIMEOUT_MS = 25_000;/);
assert.equal(
  surfaceSource.includes("AbortSignal.timeout(COMBAT_INIT_CLIENT_TIMEOUT_MS)"),
  false,
  "/encounter/init must not abort via AbortSignal.timeout",
);
const stallTimerMatch = surfaceSource.match(
  /combatInitStallTimer = window\.setTimeout\(\(\) => \{([\s\S]*?)\}, COMBAT_INIT_CLIENT_TIMEOUT_MS\)/,
);
assert.ok(stallTimerMatch, "combat init stall timer must exist");
const stallTimerBody = stallTimerMatch[1] ?? "";
assert.match(stallTimerBody, /if \(notify\) \{\s*toast\.info/s, "stall wait must toast.info");
assert.equal(stallTimerBody.includes("setCombatGenerationPending"), false, "stall toast must not clear pending");
assert.equal(stallTimerBody.includes("setCombatGenerationError"), false, "stall toast must not set combatGenerationError");
assert.equal(stallTimerBody.includes("toast.error"), false, "stall toast must not toast.error");
assert.match(surfaceSource, /if \(notify\) \{\s*toast\.error/s, "real encounter-init failures still toast.error");
assert.match(routeSource, /isDroppedStreamFinishReason/);

console.log("Combat init escape regression passed.");
