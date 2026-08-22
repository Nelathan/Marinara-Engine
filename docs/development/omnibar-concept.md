# Omnibar concept

What the omnibar and Professor Mari should be, decided before the refactor that
gets judged against it.

This is a design document, not a behaviour contract. The contract is
`omnibar-feature-inventory.md`; where this document removes something that file
records, section 6 says so explicitly, because that file requires removals to be
deliberate.

Related: `omnibar-improvement-backlog.md` (the ceiling and its root cause),
`omnibar-workflow-slice-plan.md` (how the current shape was reached).

## 1. Why this exists

The backlog states the ceiling in one line:

> The omnibar is a launcher, and Professor Mari is a room inside it. Every action
> ends in `onClose()`. Every Mari path ends in `setPane("mari")`. She puts
> nothing back into the result list.

Five panes, a persisted `pane`, a quick surface and a work surface are symptoms.
The cause is that one dialog carries two jobs with opposite requirements —
instant deterministic navigation, and slow expensive agent work — and the seam
between them was managed by adding modes.

## 2. What Professor Mari actually is

Design decisions below only make sense against this.

Mari is an agent with a workspace, not a chat assistant. Her tools are `read`,
`grep`, `find`, `ls`, `edit`, `write`, `copy`, `move`, `remove`, `bash`,
`dependency`, `app_data`, `docs_search` and `docs_read`
(`services/professor-mari/workspace-agent.service.ts`). She has a shell sandbox,
a skills service, guided sequences and a change-review service. Her approvals
carry integrity hashes, tarball URLs and expiry
(`MariDependencyInstallApproval`, `MariSensitiveFileApproval`).

Her design language is therefore Claude Code and Cursor, not ChatGPT: the diff is
the artifact, the plan is visible before execution, the run is interruptible, and
tool use is shown rather than hidden. A 7062-line chat surface presents her as
someone to talk to. She is something that edits your library.

Three pieces we would otherwise have designed already exist:

- **A local model.** `LocalSidecarProvider` runs llama.cpp or MLX in process.
- **A floating presence.** `ProfessorMariFloatingAssistantHost` mounts on a
  window event with a localStorage toggle; every editor already dispatches to it.
- **Her state machine.** `professor-mari-visual-state.ts` resolves
  `idle | thinking | explaining | success | warning | shrug`.

The cheap answer tier also exists server-side: `professor-mari-quick.routes.ts`
streams over SSE with a context of 15 sources and 6 capabilities.

## 3. The rules

**R1 — Two jobs, one surface.** The omnibar is an accelerator for everything
deterministic, and it is Mari's home. Nothing else in the app is reachable only
through it.

**R2 — Deterministic first, always.** Ranking is synchronous, instant and free.
Typing never blocks on the network and never waits on a model.

**R3 — Two tiers, both optional, cost always visible.** A cheap tier may answer
without being asked. The full agent needs a deliberate act. Either can be turned
off.

**R4 — The cheap tier defaults to the local sidecar.** A remote cheap model is an
option, not a prerequisite. Onboarding offers a choice once and settings can
change it; the feature never silently spends the user's expensive tokens.

**R5 — Mari never writes silently.** Every Mari-initiated write is a reviewable
proposal. A row the user selected is already consent and runs immediately —
selection is the confirmation.

**R6 — Her state lives above the dialog.** Closing the omnibar does not stop her.
State is read from the server status payload (`active`, `pendingApprovals`,
`history`), never from component state that dies at unmount.

**R7 — One rendering.** The omnibar dialog grows into Mari's surface. There is no
second Mari view to keep in sync.

**R8 — Every row states itself.** Why it is here, and what Enter will do. No
invisible actions, no implicit routing.

**R9 — The cheap answer is an aside, not a row.** It occupies a fixed slot pinned
to the bottom of the panel. It is never ranked, never in the arrow-key cycle, and
never the target of Enter. Rows above it never move.

**R10 — It fires on a pause, and only when nothing deterministic is clear.** It
reuses the existing promotion predicate — question-shaped query, `explain` /
`recommend` / `repair` intent, or no direct hit at score ≥ 250.

**R11 — Escalation is one key and always visible as an offer.**

**R12 — The presence indicator appears when work starts and stays until seen.**
Nothing pending and nothing unseen means no indicator at all.

**R13 — The indicator is the existing floating assistant**, driven by the
existing visual state. `warning` never auto-dismisses. `success` clears when
seen. One instance, with a count when more than one thing waits.

**R14 — Mari's surface is change-first.** A pending change is never something you
have to scroll to find. The conversation is the log, not the product. See R35 for
where the change actually sits — pinned above the composer, not at the top.

**R15 — Every run is interruptible, and the current tool is visible.** No silent
work behind a spinner. An agent holding `bash` and `write` that cannot be stopped
mid-run is a defect.

**R16 — Takeover shows the whole agent.** Plan, diffs, tool log, approvals and
stop. The omnibar is her home, so it does not hand deep inspection to somewhere
else.

## 4. The shape

One dialog. Four regions, only two of them always present.

```
┌─────────────────────────────────────┐
│ input                               │  always
├─────────────────────────────────────┤
│ ranked list — one selection, Enter  │  always
│                                     │
├─────────────────────────────────────┤
│ cheap answer aside (R9)             │  when it has something
└─────────────────────────────────────┘
                 ↓ deliberate act
┌─────────────────────────────────────┐
│ takeover: Mari / browse / proposal  │  replaces list + aside
└─────────────────────────────────────┘
```

State is `selectedIndex` plus `takeover: null | "mari" | "browse" | "proposal"`.
There is no persisted pane. Opening always gives a bare input. Escape leaves a
takeover and returns to the list; Escape from the list closes.

Scope prefixes (`faq:`, `msg:`, …) stay exactly as they are — they are query
text, not state, and they already obey R2 and R8.

Mari's takeover, top to bottom: current plan, pending proposals as diffs,
approvals needing an answer, the tool she is running now with a stop control,
then the transcript.

## 5. Where the ceiling gets raised

R6 removes the root cause the backlog identifies: `GlobalOmnibarHost.tsx:86`
unmounts the dialog on close, so every piece of Mari state dies with it. Reading
from the server payload fixes three backlog items at once — a finished task is
lost, no background lane, no thread across surfaces — and is the precondition for
R12's indicator meaning anything.

This does not make Mari a result source (backlog item 10). That remains a
separate, expensive project, and R2 and R9 are deliberately written so it stays
optional rather than becoming load-bearing.

## 6. Deliberate removals from the inventory

Each line here removes something the behaviour contract records.

- **The five panes and the persisted `pane` state.** Replaced by one takeover
  slot. `browse` and `detail` survive as behaviour, not as modes.
- **`mariReturnPane`, `mariMounted`, `mariChatOpen`, `mariTaskFinished`.**
  Replaced by the takeover slot and the server payload. `mariReturnResultId`
  survives — focus restoration stays in the contract.
- **The `quick` pane as a pane.** The cheap answer becomes the aside (R9); the
  full agent becomes the takeover. The cheap-answer-first cost decision survives;
  only its housing changes.
- **`OmnibarDetailPane` as a separate pane.** The preview already renders in
  three places from one `renderResultPreview` body. Inline expansion of the
  selected row keeps one of those renderings. Choice rows — model, preset,
  persona — must find their picker inside the expansion; this is the one item
  here that is new work rather than deletion.
- **Implicit game-command routing.** Party, quest, scene and encounter requests
  become visible ranked rows under R8. The regex module survives; the silent
  dispatch does not.
- **Escape stepping back through a pane stack.** There is one level to step back
  from. The property that mattered — a streaming answer is never discarded by a
  stray keystroke — is preserved because the aside is not focusable and Escape
  from a takeover does not cancel the run.

## 7. What survives untouched

Ranking and its context bonuses. Scope prefixes. Ghost completion. Intent
parsing. Attach versus detach verbs. Every result source in inventory section 3.
Cross-chat message search and its route. The keyboard and pointer contract in
section 7 — in particular the hover and arrow-key anchoring rules, which R9
exists to protect. Accessibility. The performance constraints, including the
preview thunk and the bundle budget.

## 8. Look, voice and flow

The art direction already exists: a chibi sprite set under
`public/sprites/mari/` with idle, thinking, explaining, shrug, wave, greet,
blink frames and four pointing poses — one sprite per visual state in
`professor-mari-visual-state.ts`. Cute is the established register. The rules
below keep it from costing trust or speed.

**R17 — Persona in `say`, plain in actions.** Mari's character voice
(`MARI_SYSTEM_PROMPT`, seeded from her card: sarcastic, dark-humoured, warm to
new users) applies to what she says. It does not apply to operational text: the
approval prompt, the diff summary, the per-command `reason`, the tool log. Those
stay exact and unstyled.

The reason is not taste. She holds `bash`, `remove`, `write` and dependency
installs. A user must be able to read "Delete 3 lorebook entries?" and trust it
completely. A joke attached to a destructive gate teaches people to skim the one
thing they must not skim. Her protocol already separates `say` from `commands`,
so this is a prompt change, not an architecture change — and it is the only place
where the workspace agent's prompt must diverge from the chat card.

**R18 — One sprite at a time.** At most one Mari sprite is visible in the omnibar
at any moment. It belongs to the aside or the takeover whenever either is open;
otherwise the empty state may hold it. Mari-owned *rows* get a small flat mark,
never a face — a face on a row makes the expensive path louder than the
deterministic ones and biases the eye toward it.

**R19 — Disclosure at first use, attribution always.** Typing can invoke a model,
and that is the genuinely new thing here. Mari using an LLM inside her own
surface is expected; a search box that quietly calls one is not. Nothing is
front-loaded into onboarding: the first time the aside answers, it says where the
answer came from and offers "turn this off" and "change model" in place. People
learn a feature when they meet it. After that the aside always carries the tier
that answered — `Local` or the connection name. No meter, no token counts, no
running total; those belong in settings.

This also means the aside ships without depending on an onboarding flow.

**R20 — Motion on transitions, not ambience.** The sprite animates when something
real changes: work starts, work finishes, attention is needed. Between those it
blinks and holds still. No continuous idle animation next to a list somebody is
reading. `prefers-reduced-motion` removes the animation and keeps the state
change.

**R21 — Proposals are field cards, diff on demand.** A change to a character or
lorebook shows per-field before and after, each acceptable or rejectable on its
own, with the raw diff behind a toggle. `MariEditEasyViewer.tsx` and
`mari-edit-diff.ts` already do most of this — reuse them rather than building a
developer diff view for people editing prose.

## 9. The unasked call, failure and touch

**R22 — The unasked call is its own call, not the Ask-Mari call.** Today's quick
route sends a fixed preamble, the bounded workspace context, the user's
persistent memories, and the complete current value of the focused field
(`<current_field_value>`). That is defensible behind a button. On a timer it is
not.

The unasked tier gets a separate narrow prompt carrying three things: the typed
query, the current surface, and the focused resource's label. Never persistent
memories. Never field contents. Never message text. What it is asking is narrow —
*the user typed this and nothing matched; is there something in Marinara that
does it, or is this a two-line question?* — and the payload should match the
question.

Because the payload is that small, a remote cheap model may answer unasked.
Onboarding states it once (R19).

Implementation note: this is a mode on `professor-mari-quick.routes.ts`, not a
new service. The prompt assembly must skip `memorySections` and
`quickEditTarget` entirely — not truncate them.

**R23 — One delay, tunable, same for both tiers.** After the dead-end predicate
(R10) is met, the aside waits for the input to be idle before calling. Default 3
seconds. It is a knob, not a constant: too short spends money on typing pauses,
too long makes the feature feel absent, and the right value depends on the user's
typing speed and their model's latency.

**R24 — A failed call never degrades the list.** If the sidecar is not running,
the connection fails, or the answer is unusable, the aside says so in one quiet
line and offers the fix as an action when there is one. She uses the `shrug`
sprite. No toast — the user did not ask for this call and must not be interrupted
by its failure. The ranked list is unaffected in every case.

**R25 — `⌘↵` means "take this to Mari", and the target follows what is live.**
With a row selected it continues that row, as it does today. With the aside
answering it escalates the aside into the full agent. One key, one idea, no third
Enter variant to document.

**R26 — Touch is a real layout, not a scaled one.** On small viewports the
omnibar is full screen, the aside rises as a bottom sheet above the on-screen
keyboard, and the presence indicator pins inside the safe area. See
`ios-pwa-safe-area.md`. The inventory's existing mobile-inline preview rendering
is the precedent for the aside sheet.

## 10. One Mari, and the flows

Today the same chat component renders in three places: embedded on Home, as
`ProfessorMariFloatingAssistant` (a dismissible floating window, remembered in
localStorage, openable from any editor), and inside the omnibar pane. That is the
second concept problem, underneath the panes: there is no single answer to "where
is Mari".

**R27 — One Mari, one thread, one window.** The floating window is removed. What
survives of it is the indicator (R13): state, and a click that opens her. Her
session lives above the dialog (R6), so every entry point resumes the same
conversation rather than starting one.

The cost is deliberate and should not be reversed by accident: **Mari can no
longer sit beside an open editor.** She is a place you go, not a companion in the
corner. This follows from choosing a modal takeover over a docked panel, and the
indicator-only floating presence agrees with it.

**R28 — Home's professor tab renders the takeover surface.** `HomeBrowserHub` is
a browser metaphor with tabs and an address bar; Mari is the `marinara/professor`
page. A page is a destination, not a competing window, so the tab stays — it just
renders the same surface the omnibar grows into, on the same thread (R27). What
does not survive is a *different* Mari on Home.

**R29 — No new entry affordances.** `⌘K` and the existing TopBar entry
(`TopBar.tsx:178`, which already handles the mobile path) are the doors. No
per-field button, no per-editor button. Discovery is onboarding plus the two
doors that already exist.

**R30 — Context is disclosed inside the omnibar, not in the editor.** When you
open her with a field focused, a chip in the omnibar says what she picked up —
"Eliza · Description". Reuse `MariContextChip.tsx`. The editor gains nothing.

**R31 — The 15 quick surfaces stay and become omnibar context.**
`character-editor`, `chat-error`, `game-setup` and the rest keep telling her where
you are; the omnibar reads that instead of the floating window. Subject to R22 —
the surface name travels, the field contents do not, unless she was asked.

### The flows

**Navigate.** `⌘K`, type, Enter. No model, no cost, no aside unless the query
dead-ends. This is the common case and nothing above may slow it down.

**Ask.** `⌘K`, type a question. Nothing matches well; after the idle delay the
aside answers from the local tier, labelled. Escape closes; `⌘↵` escalates into
the takeover with the question carried over.

**Edit a field.** Focus Eliza's description, `⌘K`, type "make this shorter". The
handoff carries the field; the chip confirms it; she returns a field card with
before and after; accept applies it. `activeEditorField` and `quickEditTarget`
already implement both ends.

**Long work.** She starts a multi-step change; you close the omnibar. The
indicator appears and stays. She hits a `sensitive_file` approval and stops; the
indicator moves to `warning` and does not dismiss. Clicking it opens the takeover
at the approval.

**Dead end.** The sidecar is down. The aside says so in one line with the fix,
using the `shrug` sprite. The list is untouched and the user keeps navigating.

## 11. What the window looks like

It is not a new window. It is the omnibar, grown — same card, same corners, same
shadow, taller and a little wider. The thing you were typing into becomes the
thing you talk to. A separate "Mari window" is the failure mode this whole
document exists to avoid.

```
┌──────────────────────────────────────────┐
│  (sprite)  Reading Eliza's card…  ⏹   ✕ │  header: pose, one plain line, stop
├──────────────────────────────────────────┤
│                                          │
│  transcript — her `say`, in her voice    │  full, scrolls
│                                          │
│  › ran 4 commands                    ⌄   │  finished tools, collapsed
│  › grep lorebooks/ "silver court"        │  current tool, always visible
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Description                        │  │  pending change, pinned above
│  │ before → after                     │  │  the composer, never scrolls away
│  │              [Reject]   [Accept]   │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│ Eliza · Description        [ type here ] │  the omnibar input, moved down
└──────────────────────────────────────────┘
```

**R32 — The takeover is the omnibar grown.** Same container, animated. No second
surface, no new frame, nothing to keep in sync.

**R33 — The input animates from the top to the bottom and becomes the composer.**
One element, one motion, and it is the signature moment of the design: the
surface visibly changes from a search box into a conversation. Nothing typed is
lost in the transition. Reading order ends where your hands are.

**R34 — One sprite, in the header, pose as status.** `thinking`, `explaining`,
`success`, `warning`, `shrug` — the pose *is* the status indicator. No avatar on
messages. Repeating her face down the transcript is what turns a mascot into a
toy, and it breaks R18. Confining her to one place is precisely what lets a chibi
professor share a surface with a file-deletion prompt.

**R35 — The pending change pins directly above the composer.** Not at the top of
the surface, where a long transcript scrolls it away. It sits where the eyes and
the hands already are, and it is answered like a message. This supersedes the
"diffs at the top" reading of R14.

**R36 — Full transcript. Current tool always visible, finished tools collapse.**
Everything she said stays readable. The tool she is running right now is shown in
full; completed calls fold into one summary line that expands on demand. This is
the Codex CLI pattern and it is the right one: legible while working, calm
afterwards.

**R37 — A prose rewrite is not a code diff.** Red and green on a character
description reads as wrong-and-right. It is a rewrite, not an error. Neutral
before-and-after in the field card; true diff colouring only inside the raw-diff
toggle (R21).

**R38 — The empty state is a greeting, not an empty transcript.** Opening her
with no history shows the greeting pose and three suggestion chips. Reuse
`MariSuggestionChips.tsx`.

**R39 — Field cards have a fixed maximum height.** Character and lorebook prose is
long. Truncate with "show more" so one rewrite cannot push everything else off
the surface.

Cut deliberately, because both Apple and Anthropic would cut them: token
counters, a second sprite, per-message avatars, a separate plan panel, and any
decorative motion while she is working.

## 12. Build order

Each step is useful alone and does not depend on the next.

**1. R17 — split the persona from the operational text.** A prompt edit in
`MARI_SYSTEM_PROMPT` plus plain wording for `reason`, approvals and diff
summaries. No dependencies, no UI, largest trust gain per line changed.

**2. R6 — read Mari's state from the server payload.** Delete `mariTaskFinished`
and the local edge detect. This removes the root cause the backlog identifies,
unblocks three of its items, and is the precondition for the indicator meaning
anything.

**3. R12, R13, R27 — indicator in, floating window out.** Remove
`ProfessorMariFloatingAssistant`, its host, its events, and the 26 `floatingMode`
branches. Keep the indicator, driven by the visual state.

**4. R32–R39 — the takeover, inside the existing component.** Reorder rather than
rebuild: approvals pinned above the composer, tool log collapsed with the current
call visible, one sprite in the header, neutral field cards. Extract while
touching:

- the four approval cards (~550 lines, 2195–2742) — they are moving anyway;
- the skills and memories menus (~660 lines, 2792–3453) — to lazy chunks. Not for
  tidiness: they load today for everyone who opens her, against a hard 500 kB
  in-memory chunk budget, and the takeover needs that room.

Leave the ~3600-line core alone. Splitting it changes nothing a user sees.

**5. The pane collapse.** `session.pane` and its five-variant union become
`takeover`. `OmnibarDetailPane` becomes inline row expansion — the one item here
that is new work, because choice rows use that pane as their picker.

**6. The aside (R3, R4, R9, R10, R19, R22–R24).** The largest new-work cluster in
this document: a narrow server mode on the quick route, the delay knob, tier
attribution, first-use disclosure, failure design, and the mobile bottom sheet.
Deliberately last — everything above is useful without it, and it is the least
proven idea here.

Note for step 4 and R33: the input animating from top to bottom is a desktop
motion. On small viewports the composer is already pinned above the keyboard
(R26), so the transition is a no-op there rather than a second layout.

## 13. Not decided

- Whether the cheap aside is per-keystroke cancellable or debounced-then-final.
- What the onboarding for the cheap tier looks like, beyond that it offers the
  sidecar rather than demanding a choice.
- Whether batch attach and compare keep their grid, or become a multi-select
  mode on the list itself.
- Whether the empty-state sprite greets on every open or once per session.
- What the flat mark on a Mari-owned row looks like.
