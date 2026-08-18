# Omnibar Completion & Recovery — Design (Slices 6 & 10)

## Status

Design draft for discussion. No code yet. Grounds Slice 6 (completion actions)
and Slice 10 (recovery) of `omnibar-workflow-slice-plan.md` in what already
exists, and names the open decisions.

## What already exists

### Completion contract (usable as-is)

`packages/shared/src/types/professor-mari-workspace.ts`:

- `ProfessorMariCompletion` union: `open-resource` (with resource),
  `show-field` (resource + field), `show-review` (optional reviewId),
  `return-to-source`.
- `PROFESSOR_MARI_CAPABILITY_CATALOG` maps every capability to a default
  completion kind: `create`→`open-resource`, `edit`/`repair`→`show-review`,
  `explain`/`recommend`→`return-to-source`, `navigate`→`open-resource`.

Gap: the client only special-cases `return-to-source`
(`HomeProfessorMariChat.tsx:3599`). No bounded completion-action row is
rendered for the other kinds, so after Mari edits a greeting the user has no
one-click "Review changes" / "Open field" in the omnibar shell.

### Recovery — exists, but for Mari's own failures

`HomeProfessorMariChat.tsx`: `ProfessorMariRecovery` +
`classifyProfessorMariFailure` + `retryRecovery` + the recovery notice UI
handle the case where *Mari's own request* fails (network, etc.). This is not
Slice 10. Slice 10 wants `fix this` / `retry` to act on the **app's** visible
error (a failed image gen, a broken connection).

Gap: there is no general app-error bus. The omnibar only reads one coarse
signal — a data-source fetch failure pointing at a single `diagnostics` id
(`GlobalOmnibar.tsx:~1140`). The capability catalog already reserves a
`chat-error` entry point for `repair`, but nothing populates a structured
"last failed action" the omnibar can turn into `fix this`.

## Proposed model

### Slice 6 — completion actions

Render a bounded action row in the omnibar Mari pane when a task reports
completion. Derive the actions **deterministically** from the completion kind +
the handoff context we already carry (resource, field, activeChat):

| Completion kind | Actions shown (max 3) |
| --- | --- |
| `open-resource` | Open resource · Return to results |
| `show-field` | Open field · Review changes · Return |
| `show-review` | Review changes · Open resource · Return |
| `return-to-source` | Return to source (current behavior) |

Reuse existing editor/review surfaces — no new review system. "Return"
reuses the existing `leaveDetail` / `mariReturnResultId` path already wired.

### Slice 10 — app-error recovery

Add a tiny shared "last recoverable app error" slot (one Zustand value, like
`activeEditorField`): `{ message, code?, failedAction?, retry?: () => void }`.
Failing surfaces (image gen, connection test, data source) set it; it is
transient and self-clears. The omnibar then:

- Shows it as a contextual result when open with no/`fix`/`retry` query.
- `fix this` → primary result runs `retry()` if present, else opens the
  relevant setup, else `Continue with Mari` with the error attached (the
  `chat-error` entry point + `error` context field already exist).

## Decisions (agreed 2026-08-18)

1. **Completion trigger: deterministic mapping.** Actions come from the
   existing capability→completion map plus the context already carried in the
   handoff. No Mari-side event for now. Revisit only if multi-step work proves
   the mapping too coarse.

2. **Slice 10 scope: small bus.** Add the transient `lastAppError` slot and
   wire image generation + connection test. Do not wire every surface app-wide
   until an error taxonomy is agreed.

   As built: the bus and the connection paths (`useTestConnection`,
   `useTestMessage`) are wired. **Image generation was not wired** — it has no
   isolated failure hook; the failure paths inside `use-generate.ts` are
   swallowed `catch {}` blocks spread across the streaming flow. Wiring it needs
   a decision about which of those failures is the user-visible one. Adding it
   later is a one-line `setLastAppError` call at that point.

3. **Retry ownership: identifier + tiny registry.** The error slot stores a
   retry-action id; the omnibar maps it to a known retry action. The store
   stays serializable and holds no component closures.
