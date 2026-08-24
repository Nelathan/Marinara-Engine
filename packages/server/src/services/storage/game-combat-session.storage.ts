import type {
  CombatActionRequest,
  CombatActionResponse,
  CombatActionRecord,
  CombatBossPhase,
  ClassicCombatState,
  CombatEvent,
  CombatObjectiveState,
  CombatRoundResult,
  CombatSession,
  CombatSessionStartInput,
  CombatSessionStatus,
  CombatState,
  CombatStateView,
  CombatSummary,
  TacticalCombatState,
} from "@marinara-engine/shared";
import { randomInt } from "crypto";
import { and, desc, eq } from "../../db/file-query.js";
import type { DB } from "../../db/connection.js";
import { chats, gameCombatSessions } from "../../db/schema/index.js";
import { newId, now } from "../../utils/id-generator.js";

const MAX_ACTION_HISTORY = 200;

type CombatSessionRow = typeof gameCombatSessions.$inferSelect;

export class CombatSessionStorageError extends Error {
  constructor(
    message: string,
    readonly code:
      | "COMBAT_NOT_FOUND"
      | "COMBAT_WRONG_CHAT"
      | "COMBAT_COMPLETED"
      | "STALE_REVISION"
      | "INVALID_ACTION"
      | "COMBAT_SNAPSHOT_INVALID",
    readonly statusCode: number,
    readonly currentRevision?: number,
    readonly currentState?: CombatStateView,
  ) {
    super(message);
    this.name = "CombatSessionStorageError";
  }
}

export interface CombatActionResolution {
  canonicalState: CombatState;
  objectives?: CombatObjectiveState[];
  bossPhases?: CombatBossPhase[];
  rngCursor: number;
  status?: CombatSessionStatus;
  events: CombatEvent[];
  result?: CombatSummary;
  classicRoundResult?: CombatRoundResult;
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function initialObjectives(input: CombatSessionStartInput): CombatObjectiveState[] {
  if (input.objectives?.length) return input.objectives.map((objective) => ({ ...objective }));
  const targetIds =
    input.style === "tactical"
      ? input.state.units.filter((unit) => unit.side === "enemy").map((unit) => unit.id)
      : input.state.enemies.map((enemy) => enemy.id);
  return [
    {
      id: "eliminate-enemies",
      kind: "eliminate",
      label: "Defeat all enemies",
      targetIds,
      includeReinforcements: true,
      progress: 0,
      status: "active",
    },
  ];
}

function stateView(session: CombatSession): CombatStateView {
  const result = session.actionHistory?.at(-1)?.response.result;
  if (session.style === "tactical") {
    return {
      sessionId: session.sessionId,
      chatId: session.chatId,
      style: "tactical",
      schemaVersion: session.schemaVersion,
      revision: session.revision,
      status: session.status,
      canonicalState: session.canonicalState,
      objectives: session.objectives,
      bossPhases: session.bossPhases,
      ...(result ? { result } : {}),
    };
  }
  return {
    sessionId: session.sessionId,
    chatId: session.chatId,
    style: "classic",
    schemaVersion: session.schemaVersion,
    revision: session.revision,
    status: session.status,
    canonicalState: session.canonicalState,
    objectives: session.objectives,
    bossPhases: session.bossPhases,
    ...(result ? { result } : {}),
  };
}

function rowToSession(row: CombatSessionRow): CombatSession {
  const base = {
    sessionId: row.sessionId,
    chatId: row.chatId,
    schemaVersion: row.schemaVersion,
    revision: row.revision,
    status: row.status,
    seed: row.seed >>> 0,
    rngCursor: row.rngCursor,
    lastActionId: row.lastActionId,
    objectives: parseJson<CombatObjectiveState[]>(row.objectives, []),
    bossPhases: parseJson<CombatBossPhase[]>(row.bossPhases, []),
    actionHistory: parseJson<CombatActionRecord[]>(row.actionHistory, []),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (row.style === "tactical") {
    return {
      ...base,
      style: "tactical",
      canonicalState: parseJson<TacticalCombatState>(row.state, {} as TacticalCombatState),
    };
  }
  return {
    ...base,
    style: "classic",
    canonicalState: parseJson<ClassicCombatState>(row.state, {} as ClassicCombatState),
  };
}

async function selectById(db: DB, sessionId: string) {
  const rows = await db.select().from(gameCombatSessions).where(eq(gameCombatSessions.sessionId, sessionId)).limit(1);
  return rows[0] ?? null;
}

function parseMetadata(raw: string | null | undefined): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function nextUpdatedAt(previousUpdatedAt?: string | null): string {
  const previousTimestamp = Date.parse(previousUpdatedAt ?? "");
  return new Date(Math.max(Date.now(), Number.isFinite(previousTimestamp) ? previousTimestamp + 1 : 0)).toISOString();
}

export function createGameCombatSessionStorage(db: DB) {
  return {
    async create(input: CombatSessionStartInput, options?: { replaceActiveSessionId?: string }) {
      const unitIds = new Set(
        ("units" in input.state ? input.state.units : [...input.state.party, ...input.state.enemies]).map(
          (unit) => unit.id,
        ),
      );
      const unknownTarget = input.objectives
        ?.flatMap((objective) => objective.targetIds ?? [])
        .find((targetId) => !unitIds.has(targetId));
      if (unknownTarget) {
        throw new CombatSessionStorageError(
          `Combat objective target ${unknownTarget} is not present in the encounter`,
          "COMBAT_SNAPSHOT_INVALID",
          400,
        );
      }
      const sessionId = newId();
      const seed = (input.seed ?? randomInt(0, 0x1_0000_0000)) >>> 0;
      const objectives = initialObjectives(input);
      const row = await db.transaction(async (tx) => {
        // Capture timestamps after this transaction acquires the file-store queue. A delayed
        // start must not sort behind a later encounter merely because its request began first.
        // The canonical-session fence orders by updatedAt, so preserve a strict per-chat
        // ordering even when multiple encounters are created within the same millisecond.
        const previousRows = await tx
          .select({ updatedAt: gameCombatSessions.updatedAt })
          .from(gameCombatSessions)
          .where(eq(gameCombatSessions.chatId, input.chatId))
          .orderBy(desc(gameCombatSessions.updatedAt))
          .limit(1);
        const timestamp = nextUpdatedAt(previousRows[0]?.updatedAt);
        const abandonedTimestamp = new Date(Date.parse(timestamp) - 1).toISOString();
        const activeRows = await tx
          .select()
          .from(gameCombatSessions)
          .where(and(eq(gameCombatSessions.chatId, input.chatId), eq(gameCombatSessions.status, "active")))
          .orderBy(desc(gameCombatSessions.updatedAt))
          .limit(1);
        const activeSession = activeRows[0] ? rowToSession(activeRows[0]) : null;
        if (activeSession && options?.replaceActiveSessionId !== activeSession.sessionId) {
          throw new CombatSessionStorageError(
            "An active combat session must be completed or explicitly restarted before starting another battle",
            "INVALID_ACTION",
            409,
            activeSession.revision,
            stateView(activeSession),
          );
        }
        await tx
          .update(gameCombatSessions)
          .set({ status: "abandoned", updatedAt: abandonedTimestamp })
          .where(and(eq(gameCombatSessions.chatId, input.chatId), eq(gameCombatSessions.status, "active")));
        const chatRows = await tx.select().from(chats).where(eq(chats.id, input.chatId)).limit(1);
        const chat = chatRows[0];
        if (chat) {
          const metadata = parseMetadata(chat.metadata);
          await tx
            .update(chats)
            .set({
              metadata: JSON.stringify({
                ...metadata,
                gameCombatState: null,
                gameTacticalCombatSnapshot: null,
              }),
              updatedAt: now(),
            })
            .where(eq(chats.id, input.chatId));
        }
        await tx.insert(gameCombatSessions).values({
          sessionId,
          chatId: input.chatId,
          style: input.style,
          schemaVersion: 1,
          state: JSON.stringify(input.state),
          objectives: JSON.stringify(objectives),
          bossPhases: JSON.stringify(input.bossPhases ?? []),
          seed,
          rngCursor: "actionCounter" in input.state ? input.state.actionCounter : 0,
          revision: 0,
          lastActionId: null,
          status: "active",
          actionHistory: "[]",
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        const insertedRows = await tx
          .select()
          .from(gameCombatSessions)
          .where(eq(gameCombatSessions.sessionId, sessionId))
          .limit(1);
        return insertedRows[0] ?? null;
      });
      if (!row) throw new CombatSessionStorageError("Combat session was not created", "COMBAT_NOT_FOUND", 500);
      return rowToSession(row);
    },

    async get(sessionId: string) {
      const row = await selectById(db, sessionId);
      return row ? rowToSession(row) : null;
    },

    async getActiveForChat(chatId: string) {
      const rows = await db
        .select()
        .from(gameCombatSessions)
        .where(and(eq(gameCombatSessions.chatId, chatId), eq(gameCombatSessions.status, "active")))
        .orderBy(desc(gameCombatSessions.updatedAt))
        .limit(1);
      return rows[0] ? rowToSession(rows[0]) : null;
    },

    async getLatestForChat(chatId: string) {
      const rows = await db
        .select()
        .from(gameCombatSessions)
        .where(eq(gameCombatSessions.chatId, chatId))
        .orderBy(desc(gameCombatSessions.updatedAt))
        .limit(1);
      return rows[0] ? rowToSession(rows[0]) : null;
    },

    async importLegacySnapshot(input: CombatSessionStartInput) {
      const existing = await this.getActiveForChat(input.chatId);
      if (existing) return existing;
      const latest = await this.getLatestForChat(input.chatId);
      if (latest) {
        throw new CombatSessionStorageError(
          "The previous combat session is no longer active; start a new battle before acting",
          "COMBAT_COMPLETED",
          409,
          latest.revision,
          stateView(latest),
        );
      }
      return this.create(input);
    },

    async applyAction(
      chatId: string,
      request: CombatActionRequest,
      resolve: (session: CombatSession) => CombatActionResolution | Promise<CombatActionResolution>,
    ): Promise<{ response: CombatActionResponse; duplicate: boolean }> {
      return db.transaction(async (tx) => {
        const rows = await tx
          .select()
          .from(gameCombatSessions)
          .where(eq(gameCombatSessions.sessionId, request.sessionId))
          .limit(1);
        const row = rows[0];
        if (!row) throw new CombatSessionStorageError("Combat session not found", "COMBAT_NOT_FOUND", 404);
        const session = rowToSession(row);
        if (session.chatId !== chatId) {
          throw new CombatSessionStorageError("Combat session does not belong to this chat", "COMBAT_WRONG_CHAT", 403);
        }
        const duplicate = session.actionHistory?.find((record) => record.actionId === request.actionId);
        if (duplicate) return { response: duplicate.response, duplicate: true };
        if (session.status !== "active") {
          throw new CombatSessionStorageError(
            "Combat session is no longer active",
            "COMBAT_COMPLETED",
            409,
            session.revision,
            stateView(session),
          );
        }
        if (session.revision !== request.expectedRevision) {
          throw new CombatSessionStorageError(
            "Combat state changed; refresh before acting again",
            "STALE_REVISION",
            409,
            session.revision,
            stateView(session),
          );
        }

        const resolved = await resolve(session);
        const revision = session.revision + 1;
        const updatedAt = nextUpdatedAt(session.updatedAt);
        const nextSession = {
          ...session,
          revision,
          status: resolved.status ?? session.status,
          rngCursor: resolved.rngCursor,
          lastActionId: request.actionId,
          canonicalState: resolved.canonicalState,
          objectives: resolved.objectives ?? session.objectives,
          bossPhases: resolved.bossPhases ?? session.bossPhases,
          updatedAt,
        } as CombatSession;
        const response: CombatActionResponse = {
          sessionId: session.sessionId,
          revision,
          actionId: request.actionId,
          state: stateView(nextSession),
          events: resolved.events,
          ...(resolved.result ? { result: resolved.result } : {}),
          ...(resolved.classicRoundResult ? { classicRoundResult: resolved.classicRoundResult } : {}),
        };
        const actionHistory = [
          ...(session.actionHistory ?? []),
          { actionId: request.actionId, revision, action: request.action, response, createdAt: updatedAt },
        ].slice(-MAX_ACTION_HISTORY);

        await tx
          .update(gameCombatSessions)
          .set({
            state: JSON.stringify(resolved.canonicalState),
            objectives: JSON.stringify(resolved.objectives ?? session.objectives),
            bossPhases: JSON.stringify(resolved.bossPhases ?? session.bossPhases),
            rngCursor: resolved.rngCursor,
            revision,
            lastActionId: request.actionId,
            status: resolved.status ?? session.status,
            actionHistory: JSON.stringify(actionHistory),
            updatedAt,
          })
          .where(eq(gameCombatSessions.sessionId, request.sessionId));

        return { response, duplicate: false };
      });
    },

    async complete(sessionId: string) {
      return db.transaction(async (tx) => {
        const rows = await tx
          .select()
          .from(gameCombatSessions)
          .where(eq(gameCombatSessions.sessionId, sessionId))
          .limit(1);
        const row = rows[0];
        if (!row) return null;
        const session = rowToSession(row);
        if (session.status === "completed") return session;
        if (session.status !== "active") {
          throw new CombatSessionStorageError(
            "Combat session was replaced by a newer battle",
            "COMBAT_COMPLETED",
            409,
            session.revision,
            stateView(session),
          );
        }
        if (!session.canonicalState.outcome) {
          throw new CombatSessionStorageError(
            "Combat session cannot be completed before it reaches an outcome",
            "INVALID_ACTION",
            409,
            session.revision,
            stateView(session),
          );
        }

        await tx
          .update(gameCombatSessions)
          .set({ status: "completed", updatedAt: nextUpdatedAt(session.updatedAt) })
          .where(and(eq(gameCombatSessions.sessionId, sessionId), eq(gameCombatSessions.status, "active")));
        const completedRows = await tx
          .select()
          .from(gameCombatSessions)
          .where(eq(gameCombatSessions.sessionId, sessionId))
          .limit(1);
        return completedRows[0] ? rowToSession(completedRows[0]) : null;
      });
    },

    /** Atomically claim a terminal session and leave combat mode. */
    async completeAndTransition(sessionId: string, chatId: string) {
      return db.transaction(async (tx) => {
        const rows = await tx
          .select()
          .from(gameCombatSessions)
          .where(eq(gameCombatSessions.sessionId, sessionId))
          .limit(1);
        const row = rows[0];
        if (!row) throw new CombatSessionStorageError("Combat session not found", "COMBAT_NOT_FOUND", 404);
        const session = rowToSession(row);
        if (session.chatId !== chatId) {
          throw new CombatSessionStorageError("Combat session does not belong to this chat", "COMBAT_WRONG_CHAT", 403);
        }
        // A completion acknowledgement may arrive after the terminal action itself. The owner
        // must still be the chat's most recently updated canonical session: otherwise a stale
        // tab could erase the metadata of a later battle, including one already completed.
        const latestRows = await tx
          .select({ sessionId: gameCombatSessions.sessionId })
          .from(gameCombatSessions)
          .where(eq(gameCombatSessions.chatId, chatId))
          .orderBy(desc(gameCombatSessions.updatedAt))
          .limit(1);
        const latest = latestRows[0];
        if (latest?.sessionId !== sessionId) {
          throw new CombatSessionStorageError(
            "Combat session was replaced by a newer battle",
            "COMBAT_COMPLETED",
            409,
            session.revision,
            stateView(session),
          );
        }
        if (session.status === "abandoned") {
          throw new CombatSessionStorageError(
            "Combat session was replaced by a newer battle",
            "COMBAT_COMPLETED",
            409,
            session.revision,
            stateView(session),
          );
        }
        if (!session.canonicalState.outcome) {
          throw new CombatSessionStorageError(
            "Combat session cannot be completed before it reaches an outcome",
            "INVALID_ACTION",
            409,
            session.revision,
            stateView(session),
          );
        }

        if (session.status === "active") {
          await tx
            .update(gameCombatSessions)
            .set({ status: "completed", updatedAt: nextUpdatedAt(session.updatedAt) })
            .where(and(eq(gameCombatSessions.sessionId, sessionId), eq(gameCombatSessions.status, "active")));
        }
        const chatRows = await tx.select().from(chats).where(eq(chats.id, chatId)).limit(1);
        const chat = chatRows[0];
        if (!chat) throw new CombatSessionStorageError("Chat not found", "COMBAT_NOT_FOUND", 404);
        let metadata: Record<string, unknown> = {};
        try {
          const parsed = JSON.parse(chat.metadata ?? "{}");
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) metadata = parsed;
        } catch {
          metadata = {};
        }
        await tx
          .update(chats)
          .set({
            metadata: JSON.stringify({
              ...metadata,
              gameActiveState: "exploration",
              gameCombatState: null,
              gameTacticalCombatSnapshot: null,
            }),
            updatedAt: now(),
          })
          .where(eq(chats.id, chatId));
        const completedRows = await tx
          .select()
          .from(gameCombatSessions)
          .where(eq(gameCombatSessions.sessionId, sessionId))
          .limit(1);
        return completedRows[0] ? rowToSession(completedRows[0]) : null;
      });
    },

    /**
     * Abandon a combat session and invalidate its compatibility snapshots in one transaction.
     * A supplied sessionId is required for callers that may be holding a stale tab. The no-ID
     * fallback is retained only for chats that have no canonical session row yet.
     */
    async abandonForChat(chatId: string, sessionId?: string) {
      await db.transaction(async (tx) => {
        if (sessionId) {
          const rows = await tx
            .select()
            .from(gameCombatSessions)
            .where(eq(gameCombatSessions.sessionId, sessionId))
            .limit(1);
          const session = rows[0];
          if (!session) throw new CombatSessionStorageError("Combat session not found", "COMBAT_NOT_FOUND", 404);
          if (session.chatId !== chatId) {
            throw new CombatSessionStorageError(
              "Combat session does not belong to this chat",
              "COMBAT_WRONG_CHAT",
              403,
            );
          }
          const newerActive = await tx
            .select({ sessionId: gameCombatSessions.sessionId })
            .from(gameCombatSessions)
            .where(and(eq(gameCombatSessions.chatId, chatId), eq(gameCombatSessions.status, "active")))
            .limit(2);
          if (newerActive.some((row) => row.sessionId !== sessionId)) {
            throw new CombatSessionStorageError(
              "Combat session was replaced by a newer battle",
              "COMBAT_COMPLETED",
              409,
            );
          }
          // Terminal abandon requests are idempotent after the owner check. In particular, an
          // old tab must not clear metadata belonging to a later completed encounter.
          if (session.status !== "active") return;
          await tx
            .update(gameCombatSessions)
            .set({ status: "abandoned", updatedAt: nextUpdatedAt(session.updatedAt) })
            .where(and(eq(gameCombatSessions.sessionId, sessionId), eq(gameCombatSessions.status, "active")));
        } else {
          const activeRows = await tx
            .select({ sessionId: gameCombatSessions.sessionId })
            .from(gameCombatSessions)
            .where(and(eq(gameCombatSessions.chatId, chatId), eq(gameCombatSessions.status, "active")))
            .limit(2);
          if (activeRows.length > 0) {
            throw new CombatSessionStorageError(
              "A combat session ID is required to abandon the active battle",
              "INVALID_ACTION",
              409,
            );
          }
          // Once canonical rows exist, a legacy no-ID request has no unambiguous owner. Keep the
          // fallback only for chats that predate canonical sessions entirely.
          const existingRows = await tx
            .select({ sessionId: gameCombatSessions.sessionId })
            .from(gameCombatSessions)
            .where(eq(gameCombatSessions.chatId, chatId))
            .limit(1);
          if (existingRows.length > 0) return;
        }

        const chatRows = await tx.select().from(chats).where(eq(chats.id, chatId)).limit(1);
        const chat = chatRows[0];
        if (!chat) throw new CombatSessionStorageError("Chat not found", "COMBAT_NOT_FOUND", 404);
        const metadata = parseMetadata(chat.metadata);
        await tx
          .update(chats)
          .set({
            metadata: JSON.stringify({
              ...metadata,
              gameActiveState: "exploration",
              gameCombatState: null,
              gameTacticalCombatSnapshot: null,
            }),
            updatedAt: now(),
          })
          .where(eq(chats.id, chatId));
      });
    },

    /**
     * Persist a compatibility snapshot only while its owning session is active. Terminal clears
     * are accepted for that same session (and only while no newer session is active), so an old
     * request cannot resurrect a battle after completion or replacement.
     */
    async patchSnapshot(
      sessionId: string,
      chatId: string,
      style: "classic" | "tactical",
      snapshot: unknown | null,
    ): Promise<{ accepted: boolean }> {
      return db.transaction(async (tx) => {
        const sessionRows = await tx
          .select()
          .from(gameCombatSessions)
          .where(eq(gameCombatSessions.sessionId, sessionId))
          .limit(1);
        const row = sessionRows[0];
        if (!row) throw new CombatSessionStorageError("Combat session not found", "COMBAT_NOT_FOUND", 404);
        const session = rowToSession(row);
        if (session.chatId !== chatId) {
          throw new CombatSessionStorageError("Combat session does not belong to this chat", "COMBAT_WRONG_CHAT", 403);
        }
        if (session.style !== style) return { accepted: false };

        if (snapshot !== null && session.style === "tactical") {
          const snapshotStartMessageId =
            snapshot && typeof snapshot === "object" && "startMessageId" in snapshot
              ? typeof (snapshot as Record<string, unknown>).startMessageId === "string"
                ? (snapshot as Record<string, unknown>).startMessageId
                : null
              : null;
          const sessionStartMessageId = session.canonicalState.startMessageId ?? null;
          if (snapshotStartMessageId !== sessionStartMessageId) return { accepted: false };
        }

        const activeRows = await tx
          .select({ sessionId: gameCombatSessions.sessionId })
          .from(gameCombatSessions)
          .where(and(eq(gameCombatSessions.chatId, chatId), eq(gameCombatSessions.status, "active")))
          .limit(2);
        const newerActive = activeRows.some((row) => row.sessionId !== sessionId);
        if (snapshot !== null && session.status !== "active") return { accepted: false };
        if (newerActive) return { accepted: false };

        const chatRows = await tx.select().from(chats).where(eq(chats.id, chatId)).limit(1);
        const chat = chatRows[0];
        if (!chat) throw new CombatSessionStorageError("Chat not found", "COMBAT_NOT_FOUND", 404);
        const metadata = parseMetadata(chat.metadata);
        const nextMetadata =
          snapshot === null
            ? { ...metadata, gameCombatState: null, gameTacticalCombatSnapshot: null }
            : {
                ...metadata,
                [style === "classic" ? "gameCombatState" : "gameTacticalCombatSnapshot"]: snapshot,
              };
        await tx
          .update(chats)
          .set({ metadata: JSON.stringify(nextMetadata), updatedAt: now() })
          .where(eq(chats.id, chatId));
        return { accepted: true };
      });
    },

    async deleteForChat(chatId: string) {
      await db.delete(gameCombatSessions).where(eq(gameCombatSessions.chatId, chatId));
    },
  };
}
