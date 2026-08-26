import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  combatBossPhasesFromMechanics,
  resolveCombatSessionAction,
  CombatActionValidationError,
} from "../../packages/server/src/services/game/combat-session.service.ts";
import { normalizeManeuverProposal } from "../../packages/server/src/services/game/maneuver-proposal.ts";
import type {
  ClassicCombatState,
  CombatAction,
  CombatBossPhase,
  CombatManeuverProposal,
  CombatSession,
  CombatStatusEffect,
  TacticalCombatState,
  TacticalUnit,
} from "../../packages/shared/src/index.ts";

function unit(id: string, side: "player" | "enemy", hp = 30) {
  return {
    id,
    name: id,
    hp,
    maxHp: hp,
    mp: 10,
    maxMp: 10,
    attack: side === "player" ? 40 : 1,
    defense: 0,
    speed: 10,
    level: 1,
    side,
    skills: [],
    statusEffects: [] as CombatStatusEffect[],
  };
}

function classic(overrides: Partial<ClassicCombatState> = {}, phases: CombatBossPhase[] = []): CombatSession {
  return {
    sessionId: "session-1",
    chatId: "chat-1",
    style: "classic",
    schemaVersion: 1,
    revision: 0,
    status: "active",
    seed: 42,
    rngCursor: 0,
    lastActionId: null,
    canonicalState: {
      party: [unit("hero", "player")],
      enemies: [unit("goblin", "enemy")],
      itemEffects: [{ name: "Potion", target: "self", type: "heal", description: "Restore HP", power: 10 }],
      inventory: [{ name: "Potion", quantity: 1 }],
      mechanics: [],
      dialogueCues: [],
      startMessageId: null,
      round: 1,
      difficulty: "normal",
      ...overrides,
    },
    objectives: [],
    bossPhases: phases,
    actionHistory: [],
    createdAt: "now",
    updatedAt: "now",
  };
}

function tacticalUnit(id: string, side: "party" | "enemy", hp = 30): TacticalUnit {
  return {
    id,
    name: id,
    side,
    hp,
    maxHp: Math.max(30, hp),
    mp: 10,
    maxMp: 10,
    attack: side === "party" ? 40 : 1,
    defense: 0,
    speed: 10,
    level: 1,
    skills: [],
    statusEffects: [],
    x: side === "party" ? 0 : 2,
    y: 0,
    movement: 3,
    attackRange: { min: 1, max: 1 },
    hasMoved: false,
    hasActed: false,
    defending: false,
    skillCooldowns: {},
  };
}

function tactical(overrides: Partial<TacticalCombatState> = {}): CombatSession {
  return {
    sessionId: "tactical-session-1",
    chatId: "chat-1",
    style: "tactical",
    schemaVersion: 1,
    revision: 0,
    status: "active",
    seed: 42,
    rngCursor: 0,
    lastActionId: null,
    canonicalState: {
      schemaVersion: 1,
      grid: { width: 3, height: 1, tiles: [["plains", "plains", "plains"]] },
      units: [tacticalUnit("hero", "party"), tacticalUnit("enemy", "enemy")],
      phase: "player",
      round: 1,
      seed: 42,
      actionCounter: 0,
      log: [],
      difficulty: "normal",
      inventory: [],
      itemEffects: [],
      hazards: [],
      ...overrides,
    },
    objectives: [],
    bossPhases: [],
    actionHistory: [],
    createdAt: "now",
    updatedAt: "now",
  };
}

function advanceClassic(
  session: CombatSession,
  resolution: ReturnType<typeof resolveCombatSessionAction>,
): CombatSession {
  if (session.style !== "classic" || !("party" in resolution.canonicalState)) {
    throw new Error("Expected Classic combat state");
  }
  return {
    ...session,
    revision: session.revision + 1,
    status: resolution.status ?? session.status,
    canonicalState: resolution.canonicalState,
    objectives: resolution.objectives ?? session.objectives,
    bossPhases: resolution.bossPhases ?? session.bossPhases,
  };
}

const attack = { style: "classic" as const, type: "attack" as const, targetId: "goblin" };
const first = resolveCombatSessionAction(classic(), "attack-1", attack);
const second = resolveCombatSessionAction(classic(), "attack-1", attack);
assert.deepEqual(first.canonicalState, second.canonicalState, "seeded Classic action must be deterministic");
assert.deepEqual(first.events, second.events, "seeded Classic events must be deterministic");
assert.equal(first.result?.outcome, "victory", "the deterministic fixture must reach victory");
assert.ok(first.result.loot?.length, "victory must generate authoritative loot");
assert.deepEqual(first.result?.loot, second.result?.loot, "victory loot must use the session RNG");
if (first.result.loot?.length) {
  for (const drop of first.result.loot) {
    assert.equal(
      first.canonicalState.inventory?.some((item) => item.name === drop.name && item.quantity >= (drop.quantity ?? 1)),
      true,
      "authoritative loot must be added to canonical inventory",
    );
  }
}
assert.throws(
  () => resolveCombatSessionAction(advanceClassic(classic(), first), "post-victory-action", attack),
  (error: unknown) => error instanceof CombatActionValidationError && /already over/i.test(error.message),
  "Classic terminal sessions must reject fresh actions instead of awarding victory loot again",
);

const routesSource = readFileSync(new URL("../../packages/server/src/routes/game.routes.ts", import.meta.url), "utf8");
const encounterRoutesSource = readFileSync(
  new URL("../../packages/server/src/routes/encounter.routes.ts", import.meta.url),
  "utf8",
);
const sessionStorageSource = readFileSync(
  new URL("../../packages/server/src/services/storage/game-combat-session.storage.ts", import.meta.url),
  "utf8",
);
const gameSurfaceSource = readFileSync(
  new URL("../../packages/client/src/components/game/GameSurface.tsx", import.meta.url),
  "utf8",
);
const gameHookSource = readFileSync(new URL("../../packages/client/src/hooks/use-game.ts", import.meta.url), "utf8");
const tacticalCombatUiSource = readFileSync(
  new URL("../../packages/client/src/components/game/TacticalCombatUI.tsx", import.meta.url),
  "utf8",
);
const gameCombatUiSource = readFileSync(
  new URL("../../packages/client/src/components/game/GameCombatUI.tsx", import.meta.url),
  "utf8",
);
const tacticalTypesSource = readFileSync(
  new URL("../../packages/shared/src/features/tactical-combat/types.ts", import.meta.url),
  "utf8",
);
const combatSessionServiceSource = readFileSync(
  new URL("../../packages/server/src/services/game/combat-session.service.ts", import.meta.url),
  "utf8",
);

function exportedFunctionSource(source: string, name: string): string {
  const start = source.indexOf(`export function ${name}(`);
  assert.notEqual(start, -1, `expected ${name} to remain exported`);
  const next = source.indexOf("\nexport function ", start + 1);
  return source.slice(start, next === -1 ? undefined : next);
}

function assertBefore(source: string, first: string, second: string, message: string): void {
  const firstIndex = source.indexOf(first);
  assert.notEqual(firstIndex, -1, `${message}: missing first marker`);
  const secondIndex = source.indexOf(second, firstIndex + first.length);
  assert.notEqual(secondIndex, -1, `${message}: missing second marker after first`);
  assert.ok(firstIndex < secondIndex, message);
}
assert.match(
  tacticalCombatUiSource,
  /function TileInspect\([\s\S]*?className="pointer-events-none absolute left-2 top-2 z-20 w-44/,
  "the Tactical tile inspector must let battlefield clicks pass through its informational body",
);
assert.match(
  tacticalCombatUiSource,
  /function TileInspect\([\s\S]*?<span className="pointer-events-auto flex cursor-grab[\s\S]*?<button type="button" onClick=\{onClose\} className="pointer-events-auto/,
  "the Tactical tile inspector must retain narrow interactive drag and close controls",
);
assert.match(
  tacticalCombatUiSource,
  /Crown className="pointer-events-none absolute -top-2[\s\S]{0,300}Skull className="pointer-events-none absolute -top-2[\s\S]{0,500}className="pointer-events-none absolute -bottom-0\.5 -right-0\.5/,
  "Tactical token decorations must not intercept clicks outside the avatar",
);
assert.equal(
  (routesSource.match(/await syncCombatInventory\(/g) ?? []).length,
  2,
  "Classic and Tactical duplicate responses must retry durable inventory synchronization",
);
assert.match(
  encounterRoutesSource,
  /maxTokens: COMBAT_BLUEPRINT_OUTPUT_TOKENS,\s*stream: true,/,
  "large combat blueprints must stream so slow providers send response headers before the transport timeout",
);
assert.match(
  routesSource,
  /bossPhases: z\.array\(combatBossPhaseSchema\)\.max\(20\)\.optional\(\)/,
  "generic combat session starts must validate boss phases with a concrete schema",
);
assert.match(
  routesSource,
  /if \(session && session\.style !== "tactical"\) \{\s*return reply\s*\.status\(409\)/,
  "every Tactical request must preserve an active Classic session",
);
assert.equal(
  (routesSource.match(/code: "COMBAT_WRONG_STYLE"/g) ?? []).length,
  3,
  "Classic, Tactical, and generic action routes must preserve an active opposite-style session",
);
assert.equal(
  (routesSource.match(/sessionId && !session[\s\S]{0,160}code: "COMBAT_NOT_FOUND"/g) ?? []).length,
  2,
  "Classic and Tactical compatibility routes must reject a missing explicit session instead of importing stale client state",
);
assert.doesNotMatch(
  routesSource,
  /if \(session && session\.style !== "tactical"\)[\s\S]{0,400}abandonForChat/,
  "a Tactical compatibility snapshot must not abandon an active Classic session",
);
assert.match(
  routesSource,
  /mechanics: z\.array\(combatMechanicDefinitionSchema\)\.max\(20\)\.optional\(\)/,
  "Tactical starts must validate generated boss mechanics before phase conversion",
);
assert.match(
  sessionStorageSource,
  /where\(and\(eq\(gameCombatSessions\.sessionId, sessionId\), eq\(gameCombatSessions\.status, "active"\)\)\)/,
  "delayed completion acknowledgements must not revive abandoned or completed sessions",
);
assert.match(
  sessionStorageSource,
  /if \(!session\.canonicalState\.outcome\) \{[\s\S]{0,300}"INVALID_ACTION"/,
  "completion acknowledgements must reject active sessions that have not reached an outcome",
);
assert.match(
  sessionStorageSource,
  /options\?\.replaceActiveSessionId !== activeSession\.sessionId[\s\S]{0,300}"INVALID_ACTION"/,
  "starting another battle must not implicitly abandon an active terminal session",
);
assert.match(
  tacticalCombatUiSource,
  /const replacedSessionId = sessionId;[\s\S]{0,1600}launchBattle\(undefined, resetObjectives, replacedSessionId \?\? undefined\)/,
  "Tactical restart must explicitly identify the active session it intends to replace",
);
assert.match(
  tacticalCombatUiSource,
  /if \(replaceSessionId\) \{[\s\S]{0,700}setSessionId\(replaceSessionId\);[\s\S]{0,300}setStarting\(true\)/,
  "a failed Tactical restart must retain the replaced session for recovery",
);
assert.match(
  tacticalCombatUiSource,
  /sessionId \?\? restartSessionIdRef\.current/,
  "Tactical restart recovery must include the preserved session ID when retreating",
);
assert.match(
  tacticalCombatUiSource,
  /!sessionId \|\| Boolean\(restartRecovery\)/,
  "Tactical restart recovery must refetch the authoritative active session after a lost replacement response",
);
assert.match(
  tacticalCombatUiSource,
  /if \(activeSessionQuery\.isPending \|\| activeSessionQuery\.isFetching\) return;/,
  "Tactical hydration must ignore cached session data while any active-session lookup is refetching",
);
assert.match(
  tacticalCombatUiSource,
  /restorableInitialState &&[\s\S]{0,260}!sessionHydrated[\s\S]{0,260}activeSessionQuery\.isFetching/,
  "Tactical restart must wait for initial snapshot session hydration",
);
assert.match(
  tacticalCombatUiSource,
  /if \(activeSessionQuery\.isError\)[\s\S]{0,700}refetchActiveSession\(\)/,
  "Tactical restart recovery must retry lookup errors without hydrating retained cache data",
);
assert.match(
  tacticalCombatUiSource,
  /disabled=\{restartUnavailable\}/,
  "Tactical toolbar restart must stay disabled until its session identity is safe",
);
assert.match(
  tacticalCombatUiSource,
  /disabled=\{aftermathPending \|\| restartUnavailable\}/,
  "Tactical defeat retry must use the same session hydration guard as toolbar restart",
);
assert.match(
  tacticalCombatUiSource,
  /if \(restartUnavailable \|\| !sessionId\) return;[\s\S]{0,220}handoffCombatEnd\(summary\)/,
  "Tactical terminal handoff must not proceed until a usable session identity is hydrated",
);
assert.match(
  tacticalCombatUiSource,
  /!sessionId && \(!activeSessionQuery\.isFetched \|\| activeSessionQuery\.isError\)/,
  "Tactical terminal auto-handoff must wait for an authoritative session lookup",
);
assert.match(
  tacticalCombatUiSource,
  /disabled=\{aftermathPending \|\| restartUnavailable \|\| !sessionId\}/,
  "Tactical retreat controls must remain disabled while session hydration is unresolved",
);
assert.match(
  tacticalCombatUiSource,
  /restartSessionIdRef\.current = null;[\s\S]{0,500}setSessionId\(null\);[\s\S]{0,300}setState\(null\)/,
  "Tactical stale snapshots must clear their abandoned session before launching a fresh battle",
);
assert.match(
  tacticalCombatUiSource,
  /const restoredSessionAuthorityUnavailable = Boolean\(restorableInitialState\) && !sessionId;/,
  "Restored Tactical snapshots must remain read-only until their server session is verified",
);
assert.match(
  tacticalCombatUiSource,
  /onClick=\{\(\) => void refetchActiveSession\(\)\}/,
  "A failed restored-session lookup must offer an explicit retry without discarding the battlefield",
);
assert.match(
  tacticalCombatUiSource,
  /if \(!liveState \|\| liveState\.outcome \|\| animatingRef\.current \|\| restoredSessionAuthorityUnavailable\) return;/,
  "Tactical actions must not be submitted before restored-session authority is verified",
);
assertBefore(
  routesSource,
  "if (existing && existing.chatId !== body.chatId)",
  "if (!actionMatchesStyle)",
  "generic action preflight must preserve wrong-chat precedence before exposing session style",
);
assertBefore(
  routesSource,
  "if (!actionMatchesStyle)",
  "await adjudicateCombatManeuver",
  "generic wrong-style actions must be rejected before maneuver adjudication invokes the GM",
);
assert.equal(
  (routesSource.match(/!\w+\.canonicalState\.outcome &&\s*maneuverInput/g) ?? []).length,
  3,
  "Classic, Tactical, and generic maneuver routes must reject terminal sessions before invoking the GM",
);
assertBefore(
  gameSurfaceSource,
  "const combatSessionId = summary.sessionId ?? combatSessionIdRef.current",
  "await Promise.all(aftermathWrites)",
  "combat aftermath must claim the terminal session before writing derived state",
);
assert.match(
  sessionStorageSource,
  /async completeAndTransition\(sessionId: string, chatId: string\)/,
  "combat completion must retain an atomic session transition",
);
assert.match(
  sessionStorageSource,
  /completeAndTransition[\s\S]*?latestRows[\s\S]*?orderBy\(desc\(gameCombatSessions\.updatedAt\)\)[\s\S]*?latest\?\.sessionId !== sessionId[\s\S]*?gameActiveState: "exploration"/,
  "combat completion must let only the latest session clean up the chat, including after terminal persistence",
);
assert.match(
  sessionStorageSource,
  /function nextUpdatedAt\(previousUpdatedAt\?: string \| null\): string[\s\S]*?Math\.max\(Date\.now\(\), Number\.isFinite\(previousTimestamp\) \? previousTimestamp \+ 1 : 0\)/,
  "combat session timestamps must advance beyond the prior persisted timestamp",
);
assert.equal(
  (sessionStorageSource.match(/nextUpdatedAt\(session\.updatedAt\)/g) ?? []).length,
  4,
  "combat actions, completion, transition, and abandonment must preserve session timestamp ordering",
);
assert.match(
  sessionStorageSource,
  /previousRows[\s\S]*?orderBy\(desc\(gameCombatSessions\.updatedAt\)\)[\s\S]*?nextUpdatedAt\(previousRows\[0\]\?\.updatedAt\)/,
  "new combat sessions must use a strictly newer per-chat timestamp for latest-session ownership",
);
assert.doesNotMatch(
  sessionStorageSource.slice(
    sessionStorageSource.indexOf("async completeAndTransition"),
    sessionStorageSource.indexOf("\n    /**\n     * Abandon"),
  ),
  /session\.status === "completed"\) return/,
  "the owning completed session must still clear stale combat metadata",
);
assert.match(
  sessionStorageSource,
  /async importLegacySnapshot\(input: CombatSessionStartInput\)[\s\S]{0,600}COMBAT_COMPLETED/,
  "legacy tactical snapshots must not resurrect a completed session",
);
assert.match(
  routesSource,
  /trigger: z\.enum\(\["round_interval", "hp_threshold", "on_hit", "on_attack", "passive"\]\)\.optional\(\)/,
  "generic boss phases must preserve event and passive trigger metadata",
);
assert.match(
  routesSource,
  /detailedInventory\.push\(\{\s*name: item\.name,\s*description: "",\s*quantity: item\.quantity,\s*location: "on_person"/,
  "canonical combat loot missing from detailed player inventory must be persisted",
);
assert.match(
  gameSurfaceSource,
  /fallbackToAllEnemies = elimination && \(!targetIds \|\| targetIds\.length === 0\)/,
  "unresolved generated elimination targets must safely fall back to all enemies",
);
assert.match(
  tacticalCombatUiSource,
  /hydratedSessionRevisionRef\.current === hydrationKey/,
  "restored Tactical sessions must hydrate only once per authoritative revision",
);
assert.match(
  tacticalCombatUiSource,
  /const movedUnitId = ev\.targetId \?\? ev\.actorId/,
  "Tactical movement playback must animate the unit moved by a maneuver",
);
assert.doesNotMatch(
  tacticalCombatUiSource,
  /\[chatId, updateMeta\]/,
  "Tactical snapshot persistence must not depend on the unstable mutation result object",
);
// The active-session endpoint falls back to the latest completed session so a
// refresh can recover the aftermath. Battle components must never treat that
// corpse as a live fight, or the next encounter replays the previous result.
assert.match(
  tacticalCombatUiSource,
  /const sessionMatchesDeclaration =[\s\S]{0,240}\(session\.canonicalState\.startMessageId \?\? null\) === \(startMessageId \?\? null\)/,
  "Tactical recovery must only accept authority for the current declaration",
);
assert.match(
  tacticalCombatUiSource,
  /session\.status === "active" \|\| \(session\.status === "completed" && Boolean\(session\.canonicalState\.outcome\)\)/,
  "a completed Tactical session must be terminal before it can restore",
);
assert.match(
  tacticalCombatUiSource,
  /if \(session\.status === "active"\) persistSnapshot\(canonicalState, session\.sessionId\);/,
  "completed Tactical recovery must not re-persist a terminal snapshot",
);
assert.match(
  tacticalCombatUiSource,
  /if \(session\.status === "completed"\) \{[\s\S]{0,500}endedRef\.current = true;/,
  "a recovered completed session must not auto-refire the aftermath handoff on refresh",
);
// A fresh page load has no local declaration id yet, so an ACTIVE session must
// still match and hydrate (its id is adopted during hydration); only completed
// sessions require strict declaration ownership. Without this, refreshing a live
// battle unwound the chat to exploration and orphaned the active session.
assert.match(
  gameSurfaceSource,
  /surfaceCombatSession\?\.status === "active" && combatStartMessageId === null/,
  "an active session must hydrate on refresh even before the local declaration id is known",
);
assert.match(
  gameSurfaceSource,
  /chatMeta\.gameActiveState === "exploration" &&\s*session\?\.status === "active"/,
  "an active session stranded behind an exploration unwind must be re-adopted",
);
assert.match(
  tacticalCombatUiSource,
  /if \(!liveState \|\| liveState\.outcome \|\| animatingRef\.current \|\| restoredSessionAuthorityUnavailable\) return;/,
  "a recovered completed Tactical session must never submit another action",
);
assert.match(
  tacticalCombatUiSource,
  /activeSessionQuery\.data\?\.session\?\.status === "active"/,
  "only an active session may suppress launching a fresh Tactical battle",
);
assert.match(
  tacticalCombatUiSource,
  /activeSessionQuery\.isFetching \|\|\s*activeSessionQuery\.isError \|\|\s*\(!activeSessionQuery\.isError && activeSessionQuery\.data\?\.session\?\.status === "active"\)/,
  "a failed authority lookup must not launch a second Tactical battle",
);
// Clicking Continue after a defeat completes the session, but the chat metadata
// still said "combat" and the remounting surface auto-started a fresh battle
// against the finished declaration (revived party vs the wounded enemy). A
// terminal session that owns the current declaration must suppress every
// automatic launch path, and the aftermath must move the server game state out
// of combat before anything can refetch it.
assert.match(
  tacticalCombatUiSource,
  /const terminalSessionOwnsDeclaration =[\s\S]{0,400}session\.status === "completed" &&\s*Boolean\(session\.canonicalState\.outcome\)/,
  "a completed session owned by the current declaration must be recognized as terminal",
);
assert.equal(
  (tacticalCombatUiSource.match(/terminalSessionOwnsDeclaration \|\|/g) ?? []).length,
  2,
  "both automatic Tactical launch paths must refuse to replace a terminal owned session",
);
assert.match(
  gameSurfaceSource,
  /await transitionGameState\.mutateAsync\(\{ chatId: combatChatId, newState: "exploration" \}\)/,
  "the combat aftermath must leave combat server-side before chat metadata can re-arm the surface",
);
assert.match(
  gameSurfaceSource,
  /if \(combatAftermathPendingRef\.current\) return;\s*\n\s*if \(chatMeta\.gameActiveState !== "combat"\)/,
  "combat hydration must stand down while the aftermath handoff is completing the session",
);
assert.match(
  tacticalCombatUiSource,
  /if \(d > 1 && !hasLineOfSight\(stagedState\.grid, from, \{ x: u\.x, y: u\.y \}\)\) continue;/,
  "Tactical attack-skill highlights must hide targets outside line of sight",
);
assert.match(
  tacticalCombatUiSource,
  /pointer-events-none absolute z-10 flex aspect-square touch-manipulation[\s\S]{0,500}pointer-events-auto relative flex aspect-square/,
  "Tactical unit hitboxes must not block clicks on neighboring tiles",
);
assert.match(
  tacticalCombatUiSource,
  /const isLivingPartyUnit = unit\.side === "party" && unit\.hp > 0 && liveState\.phase === "player"/,
  "Tactical token selection must recognize every living party unit during player phase",
);
assert.match(
  tacticalCombatUiSource,
  /if \(isDifferentPartyUnit && ui\.kind !== "maneuver" && !isIntentionalSupportTarget\)/,
  "Tactical party switching must happen before target validation for other units",
);
assert.doesNotMatch(
  tacticalCombatUiSource,
  /setInspectTile\(\{ x: unit\.x, y: unit\.y \}\)/,
  "Tactical token clicks must not reopen the blocking inspector card",
);
assert.match(
  gameCombatUiSource,
  /if \(session\.status !== "active" && !isTerminalRecovery\) return;/,
  "Classic recovery must accept only active sessions or completed canonical outcomes",
);
assert.match(
  gameCombatUiSource,
  /if \(isTerminalRecovery && outcome\) \{[\s\S]{0,1300}setPhase\(outcome\);\s*return;/,
  "a completed Classic session must hydrate as a terminal overlay before playable-turn selection",
);
assert.match(
  gameCombatUiSource,
  /if \(activeSessionQuery\.isPending \|\| activeSessionQuery\.isFetching \|\| activeSessionQuery\.isError\) return;/,
  "Classic hydration must ignore retained active-session cache until the authoritative query settles",
);
assert.match(
  gameSurfaceSource,
  /key=\{`\$\{activeChatId\}:classic:\$\{combatStartMessageId \?\? "pending"\}`\}/,
  "Classic combat UI must remount for each combat declaration so terminal summaries cannot bleed across battles",
);
assert.match(
  gameSurfaceSource,
  /key=\{`\$\{activeChatId\}:tactical:\$\{combatStartMessageId \?\? "pending"\}`\}/,
  "Tactical combat UI must remount for each combat declaration so terminal summaries cannot bleed across battles",
);
assert.match(
  gameSurfaceSource,
  /const \[activeCombatStyle, setActiveCombatStyle\] = useState<GameCombatStyle \| null>\(null\)/,
  "a live battle must pin its combat style independently of mutable chat settings",
);
assert.match(
  gameSurfaceSource,
  /useActiveCombatSession\(\s*activeChatId,\s*undefined,/,
  "combat restoration must discover the canonical active session before choosing a style-specific UI",
);
assert.match(
  gameSurfaceSource,
  /useActiveCombatSession\(\s*activeChatId,\s*undefined,\s*chatMeta\.gameActiveState === "combat"/,
  "every restored combat snapshot must check the authoritative session before mounting a battle UI",
);
assert.match(
  gameSurfaceSource,
  /surfaceCombatSessionQuery\.isFetched[\s\S]{0,100}!surfaceCombatSessionQuery\.isFetching[\s\S]{0,100}!surfaceCombatSessionQuery\.isError[\s\S]{0,100}recoveringLegacySnapshot/,
  "legacy snapshot style fallback must wait for the authoritative active-session refetch to settle",
);
assert.match(
  gameSurfaceSource,
  /\(surfaceTacticalStartMessageId \?\? null\) === \(combatStartMessageId \?\? null\)/,
  "Tactical session recovery must use exact normalized declaration ownership",
);
assert.match(
  gameSurfaceSource,
  /surfaceCombatSession\?\.status === "active"[\s\S]{0,220}surfaceCombatSession\?\.status === "completed"[\s\S]{0,130}canonicalState\.outcome/,
  "only active and completed Tactical sessions with an outcome may recover",
);
assert.match(
  gameSurfaceSource,
  /setCombatStartMessageId\(session\.canonicalState\.startMessageId \?\? null\);/,
  "authoritative Tactical session hydration must restore the declaration identity",
);
assert.match(
  gameSurfaceSource,
  /const clearPatch = \{[\s\S]{0,180}gameTacticalCombatSnapshot: null[\s\S]{0,500}queryClient\.setQueryData\(chatKeys\.detail\(chatId\)/,
  "combat snapshot cleanup must clear the React Query chat cache as well as server metadata",
);
const classicCombatRoundSource = exportedFunctionSource(gameHookSource, "useCombatRound");
const tacticalCombatStartSource = exportedFunctionSource(gameHookSource, "useTacticalCombatStart");
const tacticalCombatActionSource = exportedFunctionSource(gameHookSource, "useTacticalCombatAction");
for (const [source, style, name] of [
  [classicCombatRoundSource, "classic", "Classic combat rounds"],
  [tacticalCombatStartSource, "tactical", "Tactical combat starts"],
  [tacticalCombatActionSource, "tactical", "Tactical combat actions"],
] as const) {
  assert.match(
    source,
    new RegExp(`combat-session\", \"active\", variables\\.chatId, \"${style}\"`),
    `${name} must update its style-specific active-session cache`,
  );
  assert.match(
    source,
    /combat-session", "active", variables\.chatId, "any"/,
    `${name} must update the style-agnostic session cache used by GameSurface`,
  );
}
assert.match(
  gameSurfaceSource,
  /const write = combatSnapshotWriteRef\.current\s*\.catch\(\(\) => undefined\)\s*\.then\(\(\) => \{[\s\S]{0,700}game\/combat\/session\/\$\{encodeURIComponent\(sessionId\)\}\/snapshot/,
  "GameSurface combat snapshot writes must serialize through the owning session",
);
assertBefore(
  gameSurfaceSource,
  "if (!surfaceSessionIsRestorable)",
  "if (!surfaceSessionIsTerminalRecovery && (combatParty || combatEnemies) && !recoveringLegacySnapshot) return",
  "a completed authoritative session must win over an already styled local snapshot",
);
assert.match(
  gameCombatUiSource,
  /terminalSummaryRef\.current = summary;\s*setPhase\(outcome\)/,
  "restored Classic terminal sessions must reopen their retryable outcome overlay",
);
assert.match(
  gameCombatUiSource,
  /function firstLivingPartyIndex\(party: Combatant\[\]\): number/,
  "Classic combat must centralize first-living actor selection",
);
assert.match(
  gameCombatUiSource,
  /setActivePlayerIndex\(firstLivingPartyIndex\(session\.canonicalState\.party\)\)/,
  "restored Classic sessions must select the server-controlled living actor",
);
assert.match(
  gameCombatUiSource,
  /setActivePlayerIndex\(firstLivingPartyIndex\(updatedParty\)\)/,
  "Classic round completion must advance past a defeated active actor",
);
assert.match(
  gameCombatUiSource,
  /if \(phase !== "intro"\) return;[\s\S]{0,220}\[animationSpeed, phase\]/,
  "the Classic intro timer must not overwrite a restored terminal phase",
);
assert.match(
  gameCombatUiSource,
  /if \(canonical\.outcome\) \{[\s\S]{0,500}setPhase\(canonical\.outcome\)[\s\S]{0,500}if \(!recoveredTerminal\) setPhase\("player-turn"\)/,
  "Classic stale-revision recovery must preserve a terminal action that committed on the server",
);
assert.match(
  gameSurfaceSource,
  /setActiveCombatStyle\(effectiveCombatStyle\);\s*useGameModeStore\.getState\(\)\.setGameState\("combat"\)/,
  "explicit combat tags must pin the configured style before their combatants mount",
);
assert.match(
  gameSurfaceSource,
  /const snapshot: GameCombatStateSnapshot = \{\s*style:/,
  "persisted Classic snapshots must retain the style that owns the active battle",
);
assert.match(
  tacticalCombatUiSource,
  /const snapshotGenerationRef = useRef\(0\)/,
  "Tactical combat must track snapshot write generations",
);
assert.match(
  tacticalCombatUiSource,
  /snapshotGenerationRef\.current \+= 1;[\s\S]{0,300}snapshotWriteRef\.current = Promise\.resolve\(\)/,
  "Tactical terminal cleanup must invalidate pending snapshot writes without awaiting them",
);
assert.doesNotMatch(
  tacticalCombatUiSource,
  /await snapshotWriteRef\.current\.catch\(\(\) => undefined\)/,
  "Tactical terminal cleanup must not block on a stalled snapshot transport",
);
assert.match(
  tacticalCombatUiSource,
  /onCombatSessionIdChange\?: \(sessionId: string \| null\) => void/,
  "Tactical combat must expose its authoritative session identity",
);
assert.match(
  tacticalCombatUiSource,
  /game\/combat\/session\/\$\{encodeURIComponent\(ownerSessionId\)\}\/snapshot[\s\S]{0,180}style: "tactical"/,
  "Tactical snapshots must use the session-scoped endpoint",
);
assert.match(
  gameCombatUiSource,
  /onCombatSessionIdChange\?: \(sessionId: string \| null\) => void/,
  "Classic combat must expose its authoritative session identity",
);
assert.match(
  gameCombatUiSource,
  /onCombatSessionIdChange\?\.\(combatSessionId\)/,
  "Classic combat must report its authoritative session identity",
);
assert.match(
  gameSurfaceSource,
  /onCombatSessionIdChange=\{handleCombatSessionIdChange\}/,
  "GameSurface must receive session identity from both combat UIs",
);
assert.match(
  routesSource,
  /app\.patch<\{ Params: \{ sessionId: string \} \}>\("\/combat\/session\/:sessionId\/snapshot"[\s\S]{0,500}combatSessionStorage\.patchSnapshot/,
  "the server must expose a session-scoped compatibility snapshot endpoint",
);
assert.match(
  sessionStorageSource,
  /async patchSnapshot\(/,
  "snapshot storage must expose the guarded compatibility snapshot patch",
);
assert.match(
  sessionStorageSource,
  /snapshot !== null && session\.status !== "active"/,
  "snapshot storage must fence non-active sessions",
);
assert.match(
  sessionStorageSource,
  /if \(snapshot !== null && session\.status !== "active"\) return \{ accepted: false \}/,
  "snapshot storage must reject stale snapshot writers",
);
assert.match(
  sessionStorageSource,
  /async patchSnapshot\([\s\S]{0,1200}session\.style !== style[\s\S]{0,120}return \{ accepted: false \}/,
  "snapshot storage must fence cross-style callers",
);
assert.match(
  sessionStorageSource,
  /async abandonForChat\(chatId: string, sessionId\?: string\)[\s\S]{0,5000}gameCombatState: null[\s\S]{0,120}gameTacticalCombatSnapshot: null/,
  "abandon must clear both compatibility snapshots atomically",
);
assert.match(
  gameSurfaceSource,
  /combatSnapshotWriteRef\.current = Promise\.resolve\(\);[\s\S]{0,500}const clearPatch/,
  "GameSurface cleanup must reset the snapshot chain without awaiting it",
);
assert.match(
  tacticalCombatUiSource,
  /startMessageId\?: string \| null[\s\S]{0,1800}startPayload\.startMessageId = startMessageId/,
  "Tactical starts must persist the current combat declaration identity",
);
assert.match(
  routesSource,
  /startMessageId: z\.string\(\)\.min\(1\)\.nullable\(\)\.optional\(\)[\s\S]{0,2600}startMessageId: startMessageId \?\? null/,
  "the server must store Tactical declaration identity in the canonical state",
);
assert.match(
  routesSource,
  /!sessionId[\s\S]{0,260}state\.startMessageId \?\? null[\s\S]{0,220}session\.canonicalState\.startMessageId \?\? null[\s\S]{0,260}COMBAT_SNAPSHOT_INVALID/,
  "the legacy Tactical action route must reject snapshots from a prior declaration",
);
assert.match(
  sessionStorageSource,
  /snapshotStartMessageId[\s\S]{0,520}sessionStartMessageId[\s\S]{0,220}return \{ accepted: false \}/,
  "snapshot storage must fence declaration identity before writing metadata",
);
assert.match(
  gameSurfaceSource,
  /if \(activeCombatStyle !== "classic"\) return;[\s\S]{0,120}if \(!combatSessionId\) return;/,
  "GameSurface compatibility snapshots must be written only for Classic combat",
);
assert.match(
  tacticalTypesSource,
  /interface TacticalCombatState \{[\s\S]{0,160}startMessageId\?: string \| null;/,
  "Tactical state must carry an optional declaration identity for legacy snapshots",
);
assert.match(
  gameSurfaceSource,
  /const restorableTacticalInitialState =[\s\S]{0,500}surfaceSessionIsRestorable[\s\S]{0,280}tacticalInitialState && \(tacticalInitialState\.startMessageId \?\? null\) === \(combatStartMessageId \?\? null\)/,
  "Tactical recovery must prefer matching canonical authority and fence metadata fallback by declaration identity",
);
assert.match(
  tacticalCombatUiSource,
  /const restorableInitialState =\s*initialState && \(initialState\.startMessageId \?\? null\) === \(startMessageId \?\? null\)/,
  "Tactical combat must reject a mismatched snapshot even when a caller bypasses GameSurface",
);
assert.match(
  gameCombatUiSource,
  /for \(const timer of animationTimersRef\.current\) clearTimeout\(timer\)/,
  "Classic combat must cancel delayed animation writes when its battle component unmounts",
);
assert.match(
  tacticalCombatUiSource,
  /aftermathFailed \? \([\s\S]{0,900}void handoffCombatEnd\(summary\)/,
  "Tactical victory and retreat must expose a retry after aftermath persistence fails",
);
assert.match(
  gameSurfaceSource,
  /protection \? resolvedTargetIds\?\.filter\(\(id\) => partyIds\.has\(id\)\)/,
  "generated defend and escort targets must resolve to allies, never to enemies the player is meant to kill",
);
// Generated enemy stats derive from the blueprint HP pool (level = maxHp/20), so a
// solo 650-HP "bridge boss" used to become level 33 with 75 attack against a level
// ~17 party — mathematically unwinnable. The derived level must be capped near the
// party average while the authored HP pool is preserved.
assert.match(
  gameSurfaceSource,
  /const hpLevel = combatLevelFromHp\(maxHp, fallbackLevel\);\s*const level = partyLevelCap !== undefined \? Math\.min\(hpLevel, Math\.max\(1, partyLevelCap\)\) : hpLevel;/,
  "generated enemy stat levels must be capped by the party-derived level cap",
);
assert.match(
  gameSurfaceSource,
  /const partyLevelCap =\s*partyCombatants\.length > 0\s*\? Math\.round\(partyCombatants\.reduce\(\(sum, member\) => sum \+ member\.level, 0\) \/ partyCombatants\.length\) \+ 3/,
  "encounter hydration must compute the enemy level cap from the party's average level",
);
// The top-left map+party overlay's flex box spans the union of both children and
// blankets the battlefield's upper-left quadrant. If the WRAPPER hit-tests, its
// transparent remainder silently swallows tile and unit-token clicks underneath.
assert.match(
  gameSurfaceSource,
  /"pointer-events-none absolute left-3 right-14 z-20 flex min-w-0 items-start gap-2 md:right-auto"/,
  "the map+party overlay wrapper must be pointer-events-none so empty regions cannot block combat clicks",
);
// An empty roster makes `every` vacuously true, so both HP sweeps must require a
// non-empty side before they can declare the fight over.
assert.match(
  combatSessionServiceSource,
  /const enemiesWiped = state\.enemies\.length > 0 && state\.enemies\.every/,
  "an empty enemy list must not read as a Classic victory on its own",
);
assert.match(
  combatSessionServiceSource,
  /const partyWiped = state\.party\.length > 0 && state\.party\.every/,
  "an empty party must not read as wiped in the Classic terminal check",
);
assert.match(
  gameSurfaceSource,
  /const maxHpCandidate = \[hpStat\?\.max, maxHpFromCard, hpFromCard\]\.find\([\s\S]{0,220}value > 0/,
  "new Game Mode encounters must ignore persisted zero HP when choosing party max HP",
);
assert.match(
  gameSurfaceSource,
  /hp: derivedMaxHp,\s*maxHp: derivedMaxHp,/,
  "new Game Mode encounters must initialize every party member at max HP",
);
assert.match(
  tacticalCombatUiSource,
  /const freshParty = party\.map\(\(combatant\) => \{[\s\S]{0,420}return \{ \.\.\.combatant, hp: maxHp, maxHp \}/,
  "Tactical fresh starts and retries must revive a zero-HP party snapshot",
);
assert.doesNotMatch(
  encounterRoutesSource,
  /"kind":"eliminate\|survive_rounds[^\n]*"failAtRound"/,
  "the generic objective example must not hand every generated objective a round deadline",
);

assert.throws(
  () =>
    resolveCombatSessionAction(classic(), "bad-item", {
      style: "classic",
      type: "item",
      itemId: "Invented Bomb",
      targetId: "goblin",
      itemEffect: { name: "Invented Bomb", target: "enemy", type: "damage", description: "bad", power: 1000 },
    }),
  (error: unknown) => error instanceof CombatActionValidationError,
);

const fastHero = { ...unit("hero", "player", 20), hp: 10, speed: 100 };
const usedItem = resolveCombatSessionAction(classic({ party: [fastHero] }), "potion-1", {
  style: "classic",
  type: "item",
  itemId: "Potion",
  targetId: "hero",
  itemEffect: { name: "Client Lies", target: "enemy", type: "damage", description: "ignored", power: 999 },
});
assert.equal(usedItem.canonicalState.inventory?.[0]?.quantity, 0, "canonical item quantity must be consumed");
assert.equal(
  usedItem.events.some((event) => event.kind === "heal" && event.skillName === "Potion"),
  true,
  "canonical item effect must come from the session",
);

const preciseHeal = classic({
  party: [{ ...unit("hero", "player", 10), maxHp: 100, speed: 100 }],
  inventory: [{ name: "Measured Tonic", quantity: 1 }],
  itemEffects: [
    { name: "Measured Tonic", target: "self", type: "heal", description: "Restore exactly ten percent.", power: 0.1 },
  ],
});
const preciseHealResult = resolveCombatSessionAction(preciseHeal, "precise-heal", {
  style: "classic",
  type: "item",
  itemId: "Measured Tonic",
  targetId: "hero",
});
assert.equal(
  preciseHealResult.classicRoundResult?.actions.find((entry) => entry.skillName === "Measured Tonic")?.finalDamage,
  10,
  "Classic healing items must honor generated power instead of name-based potency",
);

const utilitySession = classic({
  party: [{ ...unit("hero", "player", 30), speed: 100 }],
  inventory: [{ name: "Signal Flare", quantity: 1 }],
  itemEffects: [{ name: "Signal Flare", target: "self", type: "utility", description: "Reveal the area." }],
});
const utilityResult = resolveCombatSessionAction(utilitySession, "utility-item", {
  style: "classic",
  type: "item",
  itemId: "Signal Flare",
  targetId: "hero",
});
const utilityAction = utilityResult.classicRoundResult?.actions.find((entry) => entry.skillName === "Signal Flare");
assert.equal(utilityAction?.finalDamage, 0, "utility items must remain mechanically neutral");
assert.equal(utilityAction?.isHeal, undefined, "utility items must not masquerade as healing");

assert.throws(
  () =>
    resolveCombatSessionAction(utilitySession, "bad-self-target", {
      style: "classic",
      type: "item",
      itemId: "Signal Flare",
      targetId: "goblin",
    }),
  (error: unknown) => error instanceof CombatActionValidationError,
  "self-only items must reject non-self targets",
);

const phaseMechanic = {
  name: "War Cry",
  description: "The boss wounds the hero.",
  trigger: "hp_threshold" as const,
  hpThreshold: 100,
  effectType: "damage_one" as const,
  power: 0.25,
};
const phase = {
  id: "phase-1",
  threshold: 100,
  mechanics: [phaseMechanic],
  once: true,
} satisfies CombatBossPhase;
const phaseSession = classic(
  { enemies: [{ ...unit("goblin", "enemy", 100), isBoss: true }], mechanics: [phaseMechanic] },
  [phase],
);
const phaseTelegraph = resolveCombatSessionAction(phaseSession, "phase-telegraph", {
  style: "classic",
  type: "defend",
});
assert.equal(
  phaseTelegraph.events.some((event) => event.kind === "phase"),
  true,
  "boss mechanics must telegraph before resolving",
);
assert.equal(
  phaseTelegraph.events.filter((event) => event.eventId.startsWith("phase:") && event.kind === "damage").length,
  0,
  "telegraphed mechanics must not damage the party immediately",
);
const phaseResult = resolveCombatSessionAction(advanceClassic(phaseSession, phaseTelegraph), "phase-resolve", {
  style: "classic",
  type: "defend",
});
assert.equal(
  phaseResult.events.filter((event) => event.eventId.startsWith("phase:") && event.kind === "damage").length,
  1,
  "phase-owned Classic mechanics must resolve on the following action",
);

function tacticalOnHitPhase(id: string): CombatBossPhase {
  return {
    id,
    trigger: "on_hit",
    mechanics: [],
    once: true,
  };
}

let criticalPhaseResult: ReturnType<typeof resolveCombatSessionAction> | undefined;
for (let seed = 1; seed <= 500 && !criticalPhaseResult; seed++) {
  const hero = { ...tacticalUnit("hero", "party", 1_000), speed: 100, attackRange: { min: 1, max: 2 } };
  const boss = { ...tacticalUnit("boss", "enemy", 1_000), speed: 0, isBoss: true };
  const session = tactical({ seed, actionCounter: 0, units: [hero, boss] });
  session.bossPhases = [tacticalOnHitPhase("critical-hit-phase")];
  const result = resolveCombatSessionAction(session, `critical-hit-${seed}`, {
    style: "tactical",
    type: "attack",
    unitId: "hero",
    targetId: "boss",
  });
  if (result.events.some((event) => event.kind === "crit" && event.targetId === "boss")) criticalPhaseResult = result;
}
assert.ok(criticalPhaseResult, "the deterministic fixture search must find a Tactical critical hit");
assert.equal(
  criticalPhaseResult.events.some((event) => event.kind === "phase" && event.eventId.includes("critical-hit-phase")),
  true,
  "critical damage must trigger Tactical on-hit boss phases",
);

let counterPhaseResult: ReturnType<typeof resolveCombatSessionAction> | undefined;
for (let seed = 1; seed <= 500 && !counterPhaseResult; seed++) {
  const hero = { ...tacticalUnit("hero", "party", 1_000), speed: 100 };
  const boss = { ...tacticalUnit("boss", "enemy", 1_000), x: 1, speed: 1, isBoss: true };
  const session = tactical({ seed, actionCounter: 0, units: [hero, boss] });
  session.bossPhases = [tacticalOnHitPhase("counter-hit-phase")];
  const result = resolveCombatSessionAction(session, `counter-hit-${seed}`, {
    style: "tactical",
    type: "wait",
    unitId: "hero",
  });
  if (result.events.some((event) => event.kind === "counter" && event.targetId === "boss")) counterPhaseResult = result;
}
assert.ok(counterPhaseResult, "the deterministic fixture search must find a Tactical counterattack against the boss");
assert.equal(
  counterPhaseResult.events.some((event) => event.kind === "phase" && event.eventId.includes("counter-hit-phase")),
  true,
  "counter damage must trigger Tactical on-hit boss phases",
);

const ownedPhase = {
  ...phase,
  id: "owned-phase",
  ownerName: "True Boss",
} satisfies CombatBossPhase;
const ownedPhaseSession = classic(
  {
    party: [unit("hero", "player", 1_000)],
    enemies: [
      { ...unit("decoy", "enemy", 1_000), isBoss: true },
      { ...unit("true-boss", "enemy", 1_000), name: "True Boss", isBoss: true },
    ],
    mechanics: [phaseMechanic],
  },
  [ownedPhase],
);
const ownedWarning = resolveCombatSessionAction(ownedPhaseSession, "owned-warning", {
  style: "classic",
  type: "defend",
});
const ownedResolution = resolveCombatSessionAction(
  advanceClassic(ownedPhaseSession, ownedWarning),
  "owned-resolution",
  { style: "classic", type: "defend" },
);
assert.equal(
  ownedResolution.events.some(
    (event) => event.eventId.startsWith("phase:owned-phase:") && event.actorId === "true-boss",
  ),
  true,
  "boss phases must resolve from the enemy named by ownerName",
);

const recurringPhase = { ...phase, id: "recurring-phase", threshold: undefined, round: 1, once: false };
let recurringSession = classic(
  {
    party: [unit("hero", "player", 1_000)],
    enemies: [{ ...unit("goblin", "enemy", 1_000), isBoss: true }],
    mechanics: [phaseMechanic],
  },
  [recurringPhase],
);
const recurringWarning1 = resolveCombatSessionAction(recurringSession, "recurring-warning-1", {
  style: "classic",
  type: "defend",
});
recurringSession = advanceClassic(recurringSession, recurringWarning1);
const recurringHit1 = resolveCombatSessionAction(recurringSession, "recurring-hit-1", {
  style: "classic",
  type: "defend",
});
recurringSession = advanceClassic(recurringSession, recurringHit1);
const recurringWarning2 = resolveCombatSessionAction(recurringSession, "recurring-warning-2", {
  style: "classic",
  type: "defend",
});
recurringSession = advanceClassic(recurringSession, recurringWarning2);
const recurringHit2 = resolveCombatSessionAction(recurringSession, "recurring-hit-2", {
  style: "classic",
  type: "defend",
});
assert.equal(
  recurringWarning1.events.some((event) => event.kind === "phase"),
  true,
);
assert.equal(
  recurringWarning2.events.some((event) => event.kind === "phase"),
  true,
);
assert.equal(
  [recurringHit1, recurringHit2].every(
    (result) =>
      result.events.filter((event) => event.eventId.startsWith("phase:") && event.kind === "damage").length === 1,
  ),
  true,
  "recurring round phases must re-arm after each resolved telegraph",
);

const reinforcement = {
  id: "reinforcement-1",
  name: "Reinforcement",
  hp: 10,
  maxHp: 10,
  attack: 1,
  defense: 0,
  speed: 1,
};
const reinforcementPhase = {
  id: "reinforce",
  threshold: 100,
  mechanics: [],
  reinforcements: [reinforcement],
  once: true,
} satisfies CombatBossPhase;
const reinforcementSession = classic({ enemies: [{ ...unit("goblin", "enemy", 100), isBoss: true }] }, [
  reinforcementPhase,
]);
reinforcementSession.objectives = [
  {
    id: "clear-field",
    kind: "eliminate",
    label: "Clear the field",
    targetIds: ["goblin"],
    includeReinforcements: true,
    progress: 0,
    status: "active",
  },
];
const reinforcementTelegraph = resolveCombatSessionAction(reinforcementSession, "reinforce-warning", {
  style: "classic",
  type: "defend",
});
const reinforcementResult = resolveCombatSessionAction(
  advanceClassic(reinforcementSession, reinforcementTelegraph),
  "reinforce-resolve",
  { style: "classic", type: "defend" },
);
assert.equal(reinforcementResult.status, "active", "a spawned hostile keeps the session active");
assert.equal(
  reinforcementResult.canonicalState.enemies.some((enemy) => enemy.id === "reinforcement-1"),
  true,
);
assert.deepEqual(
  reinforcementResult.objectives?.[0]?.targetIds,
  ["goblin", "reinforcement-1"],
  "all-enemy objectives must include hostile reinforcements",
);

const objectiveProposal: CombatManeuverProposal = {
  outcome: "success",
  rationale: "The hero reaches the objective.",
  difficulty: 0.05,
  effects: [{ type: "objective", objectiveId: "capture", amount: 1 }],
  narration: "The route opens.",
};
const objectiveSession = classic({ enemies: [{ ...unit("guard", "enemy", 100) }] });
objectiveSession.objectives = [
  { id: "capture", kind: "capture", label: "Capture", requiredProgress: 1, progress: 0, status: "active" },
];
const objectiveResult = resolveCombatSessionAction(
  objectiveSession,
  "escape-1",
  { style: "classic", type: "maneuver", instruction: "Reach the exit" },
  objectiveProposal,
);
assert.equal(
  objectiveResult.status,
  "active",
  "terminal combat sessions must remain active until the client acknowledges the aftermath",
);
assert.equal(objectiveResult.result?.outcome, "victory");

const protectedTargetSession = classic({
  party: [unit("hero", "player", 100), { ...unit("ward", "player", 10), hp: 0 }],
  enemies: [unit("guard", "enemy", 100)],
});
protectedTargetSession.objectives = [
  {
    id: "defend-ward",
    kind: "defend",
    label: "Protect the ward",
    targetIds: ["ward"],
    requiredProgress: 1,
    progress: 1,
    status: "active",
  },
];
const protectedTargetResult = resolveCombatSessionAction(protectedTargetSession, "ward-fallen", {
  style: "classic",
  type: "defend",
});
assert.equal(
  protectedTargetResult.objectives?.[0]?.status,
  "failed",
  "a dead defend target must stay failed even when progress had reached its completion threshold",
);
assert.equal(
  protectedTargetResult.result,
  undefined,
  "a downed protection target must not end the battle while the rest of the party still stands",
);
assert.equal(
  protectedTargetResult.canonicalState.outcome,
  undefined,
  "a failed objective is a setback, not a party wipe",
);

const phaseKilledTargetSession = classic(
  {
    party: [unit("hero", "player", 1_000), unit("ward", "player", 1)],
    enemies: [{ ...unit("boss", "enemy", 1_000), isBoss: true }],
  },
  [
    {
      id: "kill-protected-target",
      threshold: 100,
      telegraphedAtRevision: 0,
      mechanics: [{ ...phaseMechanic, name: "Cataclysm", effectType: "damage_all", power: 2 }],
      once: true,
    },
  ],
);
phaseKilledTargetSession.objectives = [
  {
    id: "defend-phase-target",
    kind: "defend",
    label: "Protect the ward from Cataclysm",
    targetIds: ["ward"],
    requiredProgress: 1,
    progress: 1,
    status: "active",
  },
];
const phaseKilledTarget = resolveCombatSessionAction(phaseKilledTargetSession, "phase-kills-ward", {
  style: "classic",
  type: "defend",
});
assert.equal(phaseKilledTarget.canonicalState.party.find((member) => member.id === "ward")?.hp, 0);
assert.equal(
  phaseKilledTarget.objectives?.[0]?.status,
  "failed",
  "boss-phase damage must override same-action defend completion when the protected target dies",
);
assert.equal(
  phaseKilledTarget.result?.outcome,
  "defeat",
  "the Cataclysm wipes the whole party, so defeat must come from the wipe rather than the failed objective",
);

for (const mismatchedAction of [
  { style: "classic", type: "flee" },
  { style: "classic", type: "endTurn" },
  { style: "classic", type: "maneuver", instruction: "Wrong resolver" },
] as unknown as CombatAction[]) {
  assert.throws(
    () => resolveCombatSessionAction(tactical(), `wrong-style-${mismatchedAction.type}`, mismatchedAction),
    (error: unknown) => error instanceof CombatActionValidationError && /style does not match/i.test(error.message),
    `Tactical sessions must reject explicitly Classic ${mismatchedAction.type} actions`,
  );
}

const unresolvedTargetSession = classic({ enemies: [unit("guard", "enemy", 100)] });
unresolvedTargetSession.objectives = [
  {
    id: "bad-target",
    kind: "eliminate",
    label: "Defeat an unresolved target",
    targetIds: ["missing-enemy"],
    progress: 0,
    status: "active",
  },
];
const unresolvedTargetResult = resolveCombatSessionAction(unresolvedTargetSession, "unknown-target", {
  style: "classic",
  type: "defend",
});
assert.equal(
  unresolvedTargetResult.objectives?.[0]?.status,
  "active",
  "unknown objective targets must not be treated as already defeated",
);
assert.equal(unresolvedTargetResult.result, undefined);

const noEnemyObjectiveSession = tactical({
  units: [tacticalUnit("hero", "party"), tacticalUnit("enemy", "enemy", 0)],
});
noEnemyObjectiveSession.objectives = [
  { id: "capture", kind: "capture", label: "Raise the banner", requiredProgress: 1, progress: 0, status: "active" },
];
const noEnemyObjective = resolveCombatSessionAction(
  noEnemyObjectiveSession,
  "capture-after-clear",
  {
    style: "tactical",
    type: "maneuver",
    unitId: "hero",
    instruction: "Raise the banner",
    objectiveId: "capture",
  },
  objectiveProposal,
);
assert.equal(noEnemyObjective.objectives?.[0]?.status, "complete");
assert.equal(noEnemyObjective.result?.outcome, "victory");
assert.equal(
  noEnemyObjective.status,
  "active",
  "non-elimination Tactical objectives must remain actionable after the final enemy falls",
);

const conditionalSession = classic({ enemies: [{ ...unit("marked", "enemy", 1) }] });
conditionalSession.objectives = [
  {
    id: "marked-condition",
    kind: "conditional_eliminate",
    label: "Defeat the marked enemy under the stated condition",
    targetIds: ["marked"],
    condition: "Break the ward first",
    requiredProgress: 1,
    progress: 0,
    status: "active",
  },
];
const unmetCondition = resolveCombatSessionAction(conditionalSession, "conditional-kill", {
  ...attack,
  targetId: "marked",
});
assert.equal(unmetCondition.status, "active", "conditional elimination must not complete from HP alone");
assert.equal(unmetCondition.objectives?.[0]?.status, "active");

const escapeSession = classic({ enemies: [{ ...unit("guard", "enemy", 100) }] });
escapeSession.objectives = [
  { id: "escape", kind: "escape", label: "Reach the exit", requiredProgress: 1, progress: 0, status: "active" },
];
const prematureEscape = resolveCombatSessionAction(escapeSession, "escape-too-early", {
  style: "classic",
  type: "flee",
});
assert.equal(prematureEscape.status, "active", "terminal sessions stay active until the client acknowledges them");
assert.equal(
  prematureEscape.objectives?.[0]?.status,
  "active",
  "escape objectives must reject fleeing before the exit is reached",
);
assert.notEqual(prematureEscape.result?.outcome, "victory", "an unearned retreat must never award the escape victory");
assert.equal(
  prematureEscape.canonicalState.outcome,
  "flee",
  "a retreat must stay resolved instead of dropping the party back into the battle it fled",
);

const deadlineSession = classic({
  party: [unit("hero", "player", 1_000)],
  enemies: [unit("guard", "enemy", 1_000)],
  round: 3,
});
deadlineSession.objectives = [
  {
    id: "interrupt-before-round-three",
    kind: "interrupt",
    label: "Interrupt the ritual",
    requiredProgress: 1,
    failAtRound: 3,
    progress: 0,
    status: "active",
  },
];
const missedDeadline = resolveCombatSessionAction(deadlineSession, "missed-deadline", {
  style: "classic",
  type: "defend",
});
assert.equal(missedDeadline.objectives?.[0]?.status, "failed", "objective deadlines must fail unmet goals");
assert.equal(
  missedDeadline.result,
  undefined,
  "a missed objective deadline must not hand the still-standing party a defeat",
);

const surviveDeadlineSession = classic({
  party: [unit("hero", "player", 1_000)],
  enemies: [unit("guard", "enemy", 1_000)],
  round: 3,
});
surviveDeadlineSession.objectives = [
  {
    id: "survive-three",
    kind: "survive_rounds",
    label: "Survive three rounds",
    requiredProgress: 3,
    failAtRound: 3,
    progress: 0,
    status: "active",
  },
];
const survivedAtDeadline = resolveCombatSessionAction(surviveDeadlineSession, "met-deadline", {
  style: "classic",
  type: "defend",
});
assert.equal(
  survivedAtDeadline.objectives?.[0]?.status,
  "complete",
  "an objective completed on its deadline must win before the deadline failure is applied",
);

const misTargetedDefenceSession = classic({
  party: [unit("hero", "player", 100)],
  enemies: [unit("goblin", "enemy", 1)],
});
misTargetedDefenceSession.objectives = [
  {
    id: "defend-goblin",
    kind: "defend",
    label: "Protect the goblin",
    targetIds: ["goblin"],
    requiredProgress: 1,
    progress: 0,
    status: "active",
  },
];
const misTargetedDefence = resolveCombatSessionAction(misTargetedDefenceSession, "kill-mistargeted-ward", {
  ...attack,
  targetId: "goblin",
});
assert.notEqual(
  misTargetedDefence.objectives?.[0]?.status,
  "failed",
  "a defend target that resolved to an enemy must not fail the objective when the player kills it",
);
assert.equal(
  misTargetedDefence.result?.outcome,
  "victory",
  "killing a mis-targeted protection target must still clear the battle",
);

const openCaptureSession = classic({
  party: [unit("hero", "player", 100)],
  enemies: [unit("goblin", "enemy", 1)],
});
openCaptureSession.objectives = [
  { id: "banner", kind: "capture", label: "Raise the banner", requiredProgress: 3, progress: 0, status: "active" },
];
const openCapture = resolveCombatSessionAction(openCaptureSession, "wipe-with-open-capture", {
  ...attack,
  targetId: "goblin",
});
assert.equal(
  openCapture.objectives?.[0]?.status,
  "complete",
  "an unfinished capture goal is moot once every hostile is down",
);
assert.equal(
  openCapture.result?.outcome,
  "victory",
  "wiping the enemies must win the fight even when a maneuver-driven objective never progressed",
);

const expiredDeadlineSession = classic({
  party: [unit("hero", "player", 100)],
  enemies: [unit("goblin", "enemy", 1)],
  round: 5,
});
expiredDeadlineSession.objectives = [
  {
    id: "interrupt-ritual",
    kind: "interrupt",
    label: "Interrupt the ritual",
    requiredProgress: 1,
    failAtRound: 2,
    progress: 0,
    status: "active",
  },
];
const expiredDeadline = resolveCombatSessionAction(expiredDeadlineSession, "wipe-past-deadline", {
  ...attack,
  targetId: "goblin",
});
assert.notEqual(
  expiredDeadline.objectives?.[0]?.status,
  "failed",
  "an objective deadline must not fire once there are no enemies left to run out of time against",
);
assert.equal(expiredDeadline.result?.outcome, "victory", "an expired deadline must not steal a cleared battlefield");

const mixedObjectiveSession = classic(
  {
    party: [unit("hero", "player", 1_000)],
    enemies: [{ ...unit("goblin", "enemy", 1_000), isBoss: true }],
  },
  [reinforcementPhase],
);
mixedObjectiveSession.objectives = [
  {
    id: "clear-field",
    kind: "eliminate",
    label: "Clear the field",
    targetIds: ["goblin"],
    includeReinforcements: true,
    progress: 0,
    status: "active",
  },
  {
    id: "banner",
    kind: "capture",
    label: "Raise the banner",
    includeReinforcements: true,
    requiredProgress: 1,
    progress: 1,
    status: "complete",
  },
];
const mixedTelegraph = resolveCombatSessionAction(mixedObjectiveSession, "mixed-warning", {
  style: "classic",
  type: "defend",
});
const mixedReinforcement = resolveCombatSessionAction(
  advanceClassic(mixedObjectiveSession, mixedTelegraph),
  "mixed-reinforce",
  { style: "classic", type: "defend" },
);
assert.equal(
  mixedReinforcement.canonicalState.enemies.some((enemy) => enemy.id === "reinforcement-1"),
  true,
  "the reinforcement fixture must actually spawn its hostile",
);
assert.equal(
  mixedReinforcement.objectives?.find((objective) => objective.id === "banner")?.status,
  "complete",
  "hostile reinforcements must not un-complete objectives they cannot reopen",
);

const convertedTriggers = combatBossPhasesFromMechanics([
  { name: "Retaliate", description: "Counter after being hit", trigger: "on_hit", effectType: "damage_one" },
  { name: "Pressure", description: "Escalate after attacking", trigger: "on_attack", effectType: "damage_one" },
  { name: "Aura", description: "A persistent aura", trigger: "passive", effectType: "debuff_party" },
]);
assert.deepEqual(
  convertedTriggers.map((entry) => entry.trigger),
  ["on_hit", "on_attack", "passive"],
  "accepted event and passive mechanics must survive boss-phase conversion",
);

const onHitSession = classic(
  {
    party: [unit("hero", "player", 1_000)],
    enemies: [{ ...unit("boss", "enemy", 1_000), isBoss: true }],
  },
  [convertedTriggers[0]!],
);
const onHitTelegraph = resolveCombatSessionAction(onHitSession, "hit-boss", {
  style: "classic",
  type: "attack",
  targetId: "boss",
});
assert.equal(
  onHitTelegraph.events.some((event) => event.kind === "phase"),
  true,
  "on-hit boss mechanics must telegraph after their owner takes damage",
);

const onAttackSession = classic(
  {
    party: [unit("hero", "player", 1_000)],
    enemies: [{ ...unit("boss", "enemy", 1_000), isBoss: true }],
  },
  [convertedTriggers[1]!],
);
const onAttackTelegraph = resolveCombatSessionAction(onAttackSession, "boss-attacks", {
  style: "classic",
  type: "defend",
});
assert.equal(
  onAttackTelegraph.events.some((event) => event.kind === "phase"),
  true,
  "on-attack boss mechanics must telegraph after their owner attacks",
);

const passiveSession = classic(
  {
    party: [unit("hero", "player", 1_000)],
    enemies: [{ ...unit("boss", "enemy", 1_000), isBoss: true }],
  },
  [convertedTriggers[2]!],
);
const passiveTelegraph = resolveCombatSessionAction(passiveSession, "passive-round", {
  style: "classic",
  type: "defend",
});
assert.equal(
  passiveTelegraph.events.some((event) => event.kind === "phase"),
  true,
  "passive boss mechanics must telegraph once their first round is complete",
);

const movementSession = tactical({
  grid: { width: 4, height: 1, tiles: [["plains", "plains", "plains", "plains"]] },
  units: [
    tacticalUnit("hero", "party"),
    { ...tacticalUnit("ally", "party"), x: 1 },
    { ...tacticalUnit("enemy", "enemy"), x: 3 },
  ],
});
const movementProposal: CombatManeuverProposal = {
  outcome: "success",
  rationale: "The ally is pulled into cover.",
  difficulty: 0.05,
  effects: [{ type: "move", targetId: "ally", tile: { x: 2, y: 0 } }],
  narration: "The ally reaches the new position.",
};
const movementResult = resolveCombatSessionAction(
  movementSession,
  "move-ally",
  {
    style: "tactical",
    type: "maneuver",
    unitId: "hero",
    instruction: "Pull the ally forward",
    targetId: "ally",
    tile: { x: 2, y: 0 },
  },
  movementProposal,
);
const movementEffect = movementResult.events.flatMap((event) => event.effects).find((effect) => effect.type === "move");
assert.equal(movementEffect?.sourceId, "hero");
assert.equal(movementEffect?.targetId, "ally", "movement history must identify the unit that actually moved");

// ── Maneuver proposal normalization ──
// Production failure (2026-07-27): the adjudicator flattened tile coordinates
// onto one effect and the strict schema rejected the whole proposal, so a
// paladin's "heal myself and summon a shield" did nothing at all.
const tacticalNormalizationContext = {
  actorId: "hero",
  style: "tactical" as const,
  units: [
    { id: "hero", name: "Hero", side: "ally" as const, hp: 10 },
    { id: "gob-1", name: "Goblin Scout", side: "enemy" as const, hp: 30 },
  ],
};

const salvaged = normalizeManeuverProposal(
  {
    outcome: "success",
    rationale: "The paladin channels a blessing.",
    difficulty: 60,
    effects: [
      { type: "heal", amount: 8, element: "holy" },
      { type: "status", status: { name: "Sacred Shield", modifier: 2, stat: "defence", duration: 2 } },
      { type: "terrain", x: 1, y: 0, terrain: "rubble" },
    ],
    narration: "Light knits the wound and hardens the air.",
  },
  tacticalNormalizationContext,
);
assert.equal(salvaged.proposal?.effects.length, 3, "one malformed effect must not discard the whole proposal");
assert.deepEqual(salvaged.proposal?.effects[2]?.tile, { x: 1, y: 0 }, "flattened x/y must become a nested tile");
assert.equal(salvaged.proposal?.effects[2]?.terrain, "ruin", "terrain synonyms must map onto the engine's terrains");
assert.equal(salvaged.proposal?.effects[0]?.targetId, "hero", "a target-less heal must default to the actor");
assert.equal(salvaged.proposal?.effects[1]?.status?.stat, "defense");
assert.equal(salvaged.proposal?.effects[1]?.status?.turnsLeft, 2, "status.duration must be read as turnsLeft");
assert.equal(salvaged.proposal?.difficulty, 0.6, "a percentage difficulty must be rescaled");

const namedTargets = normalizeManeuverProposal(
  {
    difficulty: 1,
    effects: [
      { type: "damage", target: "Goblin Scout", amount: 5 },
      { type: "heal", targetId: "myself", amount: 4 },
      { type: "cover" },
    ],
    narration: "",
  },
  tacticalNormalizationContext,
);
assert.equal(namedTargets.proposal?.effects[0]?.targetId, "gob-1", "targets named by unit name must resolve to ids");
assert.equal(namedTargets.proposal?.effects[1]?.targetId, "hero", '"myself" must resolve to the acting unit');
assert.equal(namedTargets.proposal?.effects[2]?.type, "status", "a tile-less cover effect must become a defense buff");
assert.equal(namedTargets.proposal?.effects[2]?.status?.name, "Shielded");
assert.equal(namedTargets.proposal?.difficulty, 0.95, "difficulty 1.0 must clamp rather than reject");

const overCapped = normalizeManeuverProposal(
  {
    effects: [
      ...Array.from({ length: 8 }, () => ({ type: "heal", targetId: "hero", amount: 1 })),
      { type: "telepathy", targetId: "hero" },
    ],
    narration: "",
  },
  tacticalNormalizationContext,
);
assert.equal(overCapped.proposal?.effects.length, 6, "over-long effect lists must be trimmed, not rejected");
assert.ok(
  overCapped.report.dropped.some((entry) => entry.reason.includes("cap")),
  "effects past the cap must be reported as dropped",
);

const unknownType = normalizeManeuverProposal(
  {
    effects: [
      { type: "telepathy", targetId: "hero" },
      { type: "heal", targetId: "hero", amount: 3 },
    ],
    narration: "",
  },
  tacticalNormalizationContext,
);
assert.equal(unknownType.proposal?.effects.length, 1, "an unknown effect type must not take the valid effects with it");
assert.ok(
  unknownType.report.dropped.some((entry) => entry.reason.includes("telepathy")),
  "unknown effect types must be reported as dropped",
);

assert.equal(
  normalizeManeuverProposal({ narration: "nothing happens" }, tacticalNormalizationContext).proposal,
  null,
  "a proposal with no usable effect must return null so keyword resolution can run",
);

// ── Tactical: no usable effect falls back to keyword resolution ──
const strandedSession = tactical({
  units: [{ ...tacticalUnit("hero", "party"), hp: 10 }, tacticalUnit("enemy", "enemy")],
});
const strandedProposal: CombatManeuverProposal = {
  outcome: "success",
  rationale: "The blessing lands on nobody the board knows.",
  difficulty: 0.05,
  effects: [{ type: "heal", targetId: "phantom", amount: 9 }],
  narration: "A blessing gutters out.",
};
const strandedResult = resolveCombatSessionAction(
  strandedSession,
  "stranded-maneuver",
  { style: "tactical", type: "maneuver", unitId: "hero", instruction: "I heal myself with holy light" },
  strandedProposal,
);
assert.ok(
  strandedResult.events.some((event) => event.kind === "heal" && event.targetId === "hero"),
  "an unusable proposal must fall through to keyword resolution instead of doing nothing",
);
assert.equal(
  strandedResult.events.some((event) => event.text.includes("maneuver fails")),
  false,
  "a successful roll must never report a flat failure just because the proposal was unusable",
);

// ── Tactical: adjudication failure (no proposal) still resolves the turn ──
const noProposalResult = resolveCombatSessionAction(
  tactical({ units: [{ ...tacticalUnit("hero", "party"), hp: 10 }, tacticalUnit("enemy", "enemy")] }),
  "no-proposal-maneuver",
  { style: "tactical", type: "maneuver", unitId: "hero", instruction: "I heal myself with holy light" },
);
assert.ok(
  noProposalResult.events.some((event) => event.kind === "heal" && event.targetId === "hero"),
  "a self-heal must land even when no unit was picked and adjudication produced nothing",
);

// ── Tactical: out-of-reach effects explain themselves ──
const reachSession = tactical({
  grid: { width: 6, height: 1, tiles: [["plains", "plains", "plains", "plains", "plains", "plains"]] },
  units: [
    { ...tacticalUnit("hero", "party"), hp: 10 },
    { ...tacticalUnit("ally", "party"), x: 5 },
    { ...tacticalUnit("enemy", "enemy"), x: 4 },
  ],
});
const mixedReachResult = resolveCombatSessionAction(
  reachSession,
  "mixed-reach",
  { style: "tactical", type: "maneuver", unitId: "hero", instruction: "Bless us both" },
  {
    outcome: "success",
    rationale: "Two blessings, one out of reach.",
    difficulty: 0.05,
    effects: [
      { type: "heal", targetId: "hero", amount: 6 },
      { type: "heal", targetId: "ally", amount: 6 },
    ],
    narration: "Light spreads across the line.",
  },
);
assert.ok(
  mixedReachResult.events.some((event) => event.kind === "heal" && event.targetId === "hero"),
  "the reachable half of a maneuver must still apply",
);
assert.ok(
  mixedReachResult.events.some((event) => event.text.includes("could not take effect")),
  "dropped effects must be reported to the player",
);

// ── Classic: self-targeted salvage ──
const woundedClassic = () => classic({ party: [{ ...unit("hero", "player"), hp: 10 }] });
const classicShieldResult = resolveCombatSessionAction(
  woundedClassic(),
  "classic-shield",
  { style: "classic", type: "maneuver", instruction: "I call on my paladin powers to heal myself and raise a shield" },
  {
    outcome: "success",
    rationale: "A paladin's blessing.",
    difficulty: 0.05,
    effects: [
      { type: "heal", amount: 8 },
      { type: "cover" },
      { type: "terrain", tile: { x: 1, y: 1 }, terrain: "ruin" },
    ],
    narration: "Light closes the wound and hardens into a ward.",
  },
);
const classicManeuverEvents = classicShieldResult.events.filter((event) => event.eventId.includes("maneuver"));
assert.ok(
  classicManeuverEvents.some((event) => event.kind === "heal" && event.targetId === "hero"),
  "a Classic heal with no targetId must heal the acting party member",
);
assert.ok(
  classicManeuverEvents.some((event) => event.kind === "status" && event.statusName === "Shielded"),
  "a Classic cover effect must become a defensive status",
);
assert.ok(
  classicManeuverEvents.some((event) => event.text.includes("position counts for little")),
  "grid-only effects must be narrated in Classic rather than dropped silently",
);

// ── Classic: keyword fallback when adjudication produced nothing ──
const classicKeywordResult = resolveCombatSessionAction(woundedClassic(), "classic-keyword", {
  style: "classic",
  type: "maneuver",
  instruction: "I heal myself",
});
assert.ok(
  classicKeywordResult.events.some((event) => event.kind === "heal" && event.targetId === "hero"),
  "Classic keyword resolution must default a self-heal to the acting party member",
);

// ── Determinism: identical input still yields an identical event stream ──
const determinismAction: CombatAction = {
  style: "classic",
  type: "maneuver",
  instruction: "I call on my paladin powers to heal myself and raise a shield",
};
const determinismProposal: CombatManeuverProposal = {
  outcome: "success",
  rationale: "A paladin's blessing.",
  difficulty: 0.05,
  effects: [{ type: "heal", amount: 8 }, { type: "cover" }],
  narration: "Light closes the wound.",
};
assert.deepEqual(
  resolveCombatSessionAction(woundedClassic(), "determinism", determinismAction, determinismProposal).events.map(
    (event) => event.text,
  ),
  resolveCombatSessionAction(woundedClassic(), "determinism", determinismAction, determinismProposal).events.map(
    (event) => event.text,
  ),
  "the same seed and proposal must produce the same events",
);

console.log("Combat session regression passed.");
