# Omnibar concept — implementation plan

Executable plan for `omnibar-concept.md`. Rule numbers below (R1–R39) refer to
that document; the behaviour contract that must not be broken silently is
`omnibar-feature-inventory.md`.

Eight slices. Each one is independently useful, independently revertible, and
gets its own commit. Later slices depend on earlier ones only where stated.

## Status

Updated 2026-08-23, second implementation run on `feat/omnibar-professor-mari`,
merged with `origin/staging`. Every commit passed `pnpm check` (exit 0).

| Slice | State |
| --- | --- |
| A — persona split (R17) | **Done.** |
| B — state survives close (R6) | **Done.** |
| C — indicator in, floating window out | **Done**, including the dead `floatingMode` branch. |
| D — takeover surface | **Partly done.** Extractions, R35, R36 landed. R34 and R37 open; R38, R39 already satisfied. |
| E — pane collapse | **2 of 3.** E1 choice expansion, E2 Quick pane removed. E3 open. |
| F — the aside | **Done.** |
| G — touch and composer transition | Not started. |
| H — Home's professor tab | Not started. |

### E3, the remaining piece

Replace the narrow-screen `detail` pane with inline preview expansion, collapse
`pane` into `takeover`, and reduce Escape to one level.

On wide screens the preview already renders beside the list without entering the
pane, so this is a narrow-screen change. The blocker is that the preview has to
render *inside* the focused row, and `CommandCenterResultRow` has no slot for
expanded content — so E3 starts by adding one to a shared row component, and
that wants a careful pass rather than a tired one.

### Carried forward

- **R34 — one sprite, no per-message avatars.** Not attempted; it changes every
  message row.
- **R37 — a prose rewrite is not a code diff.** Deliberately not applied to
  `MariEditEasyViewer`, which renders database rows where added-green and
  removed-red are correct. Decided: a **new neutral card for character, persona
  and lorebook prose fields**, with per-field accept and reject. That is R21, and
  it does not exist yet.
- **Choice rows already had a pointer picker.** `CommandCenterResultRow` renders
  an inline segmented control. E1 added the keyboard path and removed the
  detail-pane dependency; it did not introduce the inline picker.
- **The searchable half of R40 is not built.** Typing "gpt" does not yet surface
  *Use GPT-4 for this chat* as a row. That needs option rows to enter the ranked
  set inside `buildOmnibarResults`, before scoring.
- **No draft PR**, by decision.

## Ground rules for every slice

- Validate with `pnpm check`. Capture the real exit code — piping through
  `tail`/`grep` returns the pipe's status and hides failures:
  `pnpm check > /tmp/check.log 2>&1; echo $?`.
- User-visible copy goes in `localization/locales/en.json` with a semantic key and
  `useTranslation`. Never hard-code strings, never copy English into other locales.
- No barrel files, no `index.ts`, direct imports only.
- Client logging stays `console.*`; server logging is the Pino `logger`, never
  `console.*`.
- The bundle budget in `vite.config.ts` is a hard `this.error` at 500 kB per chunk
  measured on in-memory `chunk.code`, which is **not** the number printed in the
  build log. Debug failures with the budget's own numbers.
- Do not revert unrelated work in the tree.
- Every slice that removes a line from the feature inventory updates that file in
  the same commit.

---

## Slice A — Split the persona from operational text (R17)

**Why first:** no dependencies, no UI, and it is the largest trust gain per line
changed. Mari holds `bash`, `remove`, `write` and dependency installs; a user must
be able to read a destructive prompt and trust it exactly.

**Files**
- `packages/server/src/services/professor-mari/workspace-agent.service.ts`
  (`MARI_SYSTEM_PROMPT`, from line 652 — the `Voice:` block).
- `packages/server/src/services/professor-mari/workspace-edit-render.ts` — check
  whether model-authored text reaches change summaries.

**Steps**
1. Keep the `Voice:` block exactly as it is. It governs `say`.
2. Add a sibling block, immediately after it, stating that the voice applies to
   `say` only, and that `reason`, and any text the user reads while approving or
   reviewing a change, must be plain, literal and free of humour, sarcasm and
   persona. Name the fields explicitly so the rule is checkable.
3. Audit the three approval cards in `HomeProfessorMariChat.tsx`
   (`DatabaseWorkspaceApprovalCard`, `DependencyWorkspaceApprovalCard`,
   `SensitiveFileWorkspaceApprovalCard`) for any place a model-authored string is
   rendered inside the approval gate. Payload-derived fields (path, package name,
   hashes, row counts) are fine; a model-written sentence inside the gate is not.
4. If step 3 finds one, move it outside the gate rather than rewriting it.

**Validation**
- `pnpm check`.
- Manually verify: ask Mari to delete something and read the approval text. It
  must state exactly what will happen, with no persona.

**Risk:** low. Prompt-only unless step 3 finds a render path.

---

## Slice B — Read Mari's state from the server payload (R6)

**Why:** this is the root cause the backlog names. `GlobalOmnibarHost.tsx:86`
returns `null` when the omnibar is closed, so every piece of Mari state inside the
dialog dies at unmount. Three backlog items — "a finished task is lost", "give her
a background lane", "one thread across surfaces" — are this one cause.

**Files**
- `packages/client/src/components/layout/GlobalOmnibar.tsx` (`mariTaskFinished`
  around line 402, its edge detect around line 1911).
- `packages/client/src/hooks/use-professor-mari-workspace-status.ts`.
- `packages/shared/src/types/professor-mari-workspace.ts` — the status payload
  already carries `active`, `pendingApprovals` and `history`. Read only; do not
  change the shared contract.

**Steps**
1. Derive "she has finished something you have not seen" from the status payload
   instead of the local edge detect.
2. Delete `mariTaskFinished` and the `pane === "mari"` condition guarding it.
3. Move the status subscription so it is not owned by the dialog. The host is the
   natural place, but the host currently returns `null` when closed — the
   subscription must survive that.
4. Keep polling cheap while the dialog is closed. She only needs a slow heartbeat
   to drive the indicator, not the in-dialog cadence.

**Validation**
- `pnpm check`.
- Manually verify: start a long Mari task, close the omnibar, reopen it, and
  confirm the finished task is still represented.

**Risk:** medium. Moving a subscription above the dialog touches mount lifetime.
Nothing else in this plan works without it.

---

## Slice C — Indicator in, floating window out (R12, R13, R16, R27)

**Depends on B** (the indicator has nothing to show until state survives close).

**Files**
- `packages/client/src/components/chat/ProfessorMariFloatingAssistantHost.tsx`
  (97 lines) — becomes the indicator.
- `packages/client/src/components/chat/professor-mari-floating-events.ts` — remove.
- `packages/client/src/components/chat/HomeProfessorMariChat.tsx` — the
  `ProfessorMariFloatingAssistant` wrapper at line 7060, and 26 `floatingMode` /
  `floatingSmallViewport` branches.
- `packages/client/src/lib/professor-mari-visual-state.ts` — read only. It already
  resolves `idle | thinking | explaining | success | warning | shrug`.

**Steps**
1. Replace the floating window with the indicator: her sprite, corner-pinned
   inside the safe area (see `ios-pwa-safe-area.md`), one instance only, with a
   count when more than one thing is pending.
2. Drive the pose from `resolveProfessorMariVisualState` against the payload from
   slice B.
3. Presence rule (R12): appears when work starts; stays while working; stays after
   finishing until seen; `warning` never auto-dismisses; nothing pending and
   nothing unseen means no indicator at all.
4. It is a `button` with an accessible label, and its state change is announced in
   the existing polite live region. It is not a decorative dot.
5. Motion (R20): animate on state transitions only, plus the idle blink. No
   ambient animation. `prefers-reduced-motion` removes the animation and keeps the
   state change.
6. Click opens the omnibar at whatever needs attention.
7. Remove the `floatingMode` branches and the localStorage flag.

**Deliberate loss:** Mari can no longer sit beside an open editor. Record it in the
feature inventory.

**Validation**
- `pnpm check`.
- Manually verify: indicator appears on task start; survives closing the omnibar;
  `warning` persists through a reload; disappears once nothing is pending; and it
  is reachable and announced with a screen reader.

**Risk:** medium-low. Mostly deletion, but it removes a shipped feature.

---

## Slice D — The takeover surface, inside the existing component (R32–R39)

**Reorder, not rebuild.** The three rules that deliver change-first can all be done
inside `HomeProfessorMariChat.tsx`. Splitting its ~3600-line core changes nothing a
user sees.

**Files**
- `packages/client/src/components/chat/HomeProfessorMariChat.tsx`.
- New: `packages/client/src/components/chat/mari-approval-cards.tsx` (extracted).
- New: `packages/client/src/components/chat/MariSkillsMenu.tsx` and
  `MariMemoriesMenu.tsx` (extracted, lazy).

**Steps**
1. **Extract the approval cards** (~550 lines, currently 2195–2742:
   `DatabaseWorkspaceApprovalCard`, `DependencyWorkspaceApprovalCard`,
   `SensitiveFileWorkspaceApprovalCard`, `WorkspaceApprovalCard`). They move
   anyway under R35, so the extraction is free.
2. **Pin the pending change above the composer** (R35). Not at the top — a long
   transcript scrolls it away. It is answered where the hands already are.
3. **Tool log** (R36): full transcript stays; the current tool call is always
   visible in full; completed calls fold into one summary line that expands.
4. **One sprite in the header** (R34), pose as status. Remove any per-message
   avatar. This is the whole cute budget for the surface.
5. **Field cards** (R21, R37, R39): per-field before and after, each accepted or
   rejected on its own, raw diff behind a toggle, fixed maximum height with "show
   more". Reuse `MariEditEasyViewer.tsx` and `lib/mari-edit-diff.ts`. **Do not
   colour a prose rewrite red and green** — that reads as wrong-and-right. Neutral
   before/after in the card; true diff colouring only inside the raw toggle.
6. **Empty state** (R38): greeting pose plus three suggestion chips. Reuse
   `MariSuggestionChips.tsx`. Never an empty transcript.
7. **Extract the skills and memories menus** (~660 lines, 2792–3453) to lazy
   chunks. Not tidiness: they load today for everyone who opens her, against a
   hard 500 kB budget, and the takeover needs the room.
8. Leave the ~3600-line core alone.

**Validation**
- `pnpm check`, and confirm the bundle budget still passes.
- Manually verify: an approval stays visible with a long transcript; the current
  tool is legible while running; a prose rewrite is not red/green; the empty state
  shows chips.

**Risk:** medium. Largest surface-area slice. Extraction is mechanical; the
reordering is not.

---

## Slice E — Collapse the panes into one takeover slot (R7, R32)

**Depends on D** (the takeover must exist before the panes route into it).

**Files**
- `packages/client/src/lib/command-center.ts` — session state, the five-variant
  `pane` union at 218–222 and the nine fields at 239–248.
- `packages/client/src/components/layout/GlobalOmnibar.tsx` — 127 `pane`
  references.
- `packages/client/src/components/layout/omnibar/OmnibarDetailPane.tsx` — removed.
- `packages/client/src/components/layout/omnibar/OmnibarBrowsePane.tsx` — **kept**,
  as a takeover. It is a grid with batch attach and compare (Slice 11 of the old
  plan), not "just the list".

**Steps**
1. Replace `pane` with `takeover: null | "mari" | "browse" | "proposal"`.
2. Drop `detailOrigin`, `mariDestination`, `mariDetailId` and the open-time
   normalizer that reset `mari` → `results`. Opening always gives a bare input, so
   the normalizer has nothing to normalize.
3. **Keep `mariReturnResultId`.** Focus restoration is in the contract.
4. Keep `mariHandoff` — it already carries capability, resource and field from
   `PROFESSOR_MARI_OPEN_EVENT`, which is the editor flow.
5. Replace `OmnibarDetailPane` with inline expansion of the focused row. **This is
   the one item in the whole plan that is new work rather than deletion**, because
   choice rows (model, preset, persona, capped at 6 plus current) use that pane as
   their picker. The expansion must host those choices.
6. Escape leaves a takeover and returns to the list; Escape from the list closes.
   Escape from a takeover must not cancel a running task — that property is why
   the old pane stack existed.

**Validation**
- `pnpm check`.
- Walk inventory section 7 by hand, every key. Selection stability, hover
  anchoring and `reconcileActiveResultId` are the parts most likely to break
  silently.

**Risk:** high for the keyboard contract. Read inventory section 7 before starting
and again before committing.

---

## Slice F — The cheap answer aside (R3, R4, R9, R10, R19, R22–R24)

**Largest new-work cluster in the plan.** Deliberately last: everything above is
useful without it.

**Files**
- `packages/server/src/routes/professor-mari-quick.routes.ts` — a new narrow mode.
- `packages/server/src/services/professor-mari/workspace-agent.service.ts` — the
  Quick prompt assembly around 2300–2360.
- `packages/client/src/components/layout/GlobalOmnibar.tsx` — the aside slot.
- `packages/client/src/lib/omnibar-results.ts` — reuse `promoteMari`'s predicate.

**Steps**
1. **The narrow server mode (R22).** The unasked call sends the typed query, the
   current surface, and the focused resource's label. It must **skip**
   `memorySections` and `quickEditTarget` entirely — not truncate them. Today's
   quick call sends persistent user memories and the complete current value of the
   focused field; that is defensible behind a button and not on a timer.
2. **Trigger (R10).** Fires only when the dead-end predicate is already true — no
   clear direct hit at score ≥ 250, or a question-shaped query, or an `explain` /
   `recommend` / `repair` intent. Reuse the existing predicate; do not write a
   second heuristic.
3. **Delay (R23).** One idle timer, same for both tiers, default 3 seconds,
   exposed as a tunable rather than a constant. The right value depends on typing
   speed and model latency and must be tuned against real use.
4. **Placement (R9).** A fixed slot pinned to the **bottom** of the panel. Never a
   row, never ranked, never in the arrow-key cycle, never the target of Enter.
   Rows above it must not move — a slot above the list pushes rows down while it
   streams, which is the bug class inventory section 7 exists to prevent.
5. **Escalation (R11, R25).** `⌘↵` means "take this to Mari", and the target
   follows what is live: a selected row continues that row; a live aside escalates
   into the takeover, carrying the question.
6. **Attribution and disclosure (R19).** The aside always carries the tier that
   answered — `Local` or the connection name. Nothing is front-loaded into
   onboarding: the first time it answers, it says where the answer came from and
   offers "turn this off" and "change model" in place. No meter, no token counts.
7. **Default tier (R4).** The local sidecar (`LocalSidecarProvider`). A remote
   cheap model is an option, not a prerequisite.
8. **Failure (R24).** A failed call never degrades the list. One quiet line in the
   aside naming the cause, with the fix as an action where one exists, using the
   `shrug` sprite. No toast — the user did not ask for this call.

**Validation**
- `pnpm check`.
- Manually verify the payload: run with `debugMode` and confirm no memories and no
  field contents appear in the unasked prompt.
- Manually verify: typing never blocks; a dead end answers after the delay; a
  clear hit never triggers a call; killing the sidecar shows the failure line and
  leaves the list working.

**Risk:** high. New network path fired by typing, plus a privacy surface.

---

## Slice G — Touch and the composer transition (R26, R33)

**Files**
- `packages/client/src/components/layout/GlobalOmnibar.tsx`.

**Steps**
1. Full-screen omnibar on small viewports.
2. The aside rises as a bottom sheet above the on-screen keyboard. The inventory's
   existing mobile-inline preview rendering is the precedent.
3. The indicator pins inside the safe area (`ios-pwa-safe-area.md`).
4. On desktop the input animates from the top to the bottom on takeover and
   becomes the composer — one element, one motion, nothing typed is lost. Reuse
   the existing spring (`stiffness: 360, damping: 30`) and honour
   `prefers-reduced-motion`.
5. On small viewports the composer is already pinned above the keyboard, so the
   transition is a no-op there rather than a second layout.

**Risk:** medium. On-screen keyboards and viewport units are where this breaks.

---

## Slice H — Home's professor tab renders the takeover (R28)

**Files**
- `packages/client/src/components/chat/HomeBrowserHub.tsx` — the `professor` tab
  branch around line 1710, plus `professorChatOpen`, `closeProfessor` and
  `completeProfessorExit`.

**Steps**
1. Point the `marinara/professor` page at the same surface the takeover renders,
   on the same thread (R27).
2. Keep the tab. It is a page in a browser metaphor, not a competing window, and
   it is the one place a large persistent surface is justified.
3. What must not survive is a *different* Mari on Home.

**Risk:** low, but it is the app's front page. Verify the tab, its address bar
entry and its exit animation still behave.

---

## Order and commits

`A → B → C → D → E → F → G → H`, one commit each.

A is independent and can land at any time. B unblocks C. D unblocks E. F, G and H
are independent of each other once E is in.

## What this plan does not do

- It does not rebuild the ~3600-line core of `HomeProfessorMariChat.tsx`. If the
  surface still feels wrong after D, that becomes an informed decision instead of
  a guess.
- It does not make Mari a result source (backlog item 10). R2 and R9 are written
  so that stays optional rather than load-bearing.
- It does not split `GlobalOmnibar.tsx` into components. It holds the focus and
  keyboard paths, and rearranging them buys nothing a user can see.
