# Omnibar feature inventory

What the omnibar does today, written down before any refactor so nothing is lost
by accident. This is a behaviour contract, not a design document: if a change
removes a line from this file, that removal must be deliberate.

Scope: `packages/client/src/components/layout/GlobalOmnibar.tsx`, the panes under
`components/layout/omnibar/`, the `lib/omnibar-*.ts` modules, and the server
route that backs cross-chat message search.

Related documents: `omnibar-workflow-slice-plan.md` (why the 11 slices exist),
`omnibar-completion-recovery-design.md`, `omnibar-command-center-professor-mari-plan.md`,
`omnibar-improvement-backlog.md` (what to build next, and why).

## 1. Panes

The dialog has five panes, held in the persisted session state (`pane`).

| Pane | Purpose | Entered by |
| --- | --- | --- |
| `results` | The ranked result list. The default. | Open, or Escape from any other pane |
| `browse` | Grid of one category, with compare and batch attach. | A category chip with an empty query, or the Browse button |
| `detail` | The preview panel for one result. | `→`, a rich row on a touch device, or a browse row |
| `mari` | Professor Mari's work surface. | The Mari button, `⌘↵`, a row's Sparkles button, a Mari-owned row, or "Continue in Full Mari" from `quick` |
| `quick` | One cheap answer for a typed question, with a reversible edit proposal. | Choosing "Ask Professor Mari" with a query typed |

Rules that must survive:

- A persisted `mari` pane is reset to `results` on open. The omnibar always
  reopens on search; a Mari conversation resumes only on explicit re-entry.
- Escape steps back one pane at a time and only closes from `results`. `quick`
  leaves through the same path as `mari`, so Escape and the back arrow agree and
  a streaming answer is never discarded by a stray keystroke.
- `quick` and `mari` both replace the search header. Leaving the input mounted
  under `quick` let one keystroke re-enter `results` and abort the stream.
- Leaving `detail` or `mari` restores focus to the row it came from
  (`mariReturnResultId`), falling back to the input.
- The detail panel renders in three places (mobile inline, browse inline, and
  the external panel above 88rem) from one `renderResultPreview` body.
- The external panel only appears when the result is "rich": media, prose,
  facts, a control, or lazily fetched detail.

## 2. Query handling

- Input is deferred (`useDeferredValue`) so typing paints before the
  search, rank and present pipeline reruns.
- **Scope prefixes** (`lib/omnibar-scope.ts`): `faq:`, `docs:`, `msg:`, `chat:`,
  `char:`, `persona:`, `lore:`, `preset:`, `conn:`, `agent:`, `set:`, plus long
  and plural aliases. The colon is required. Everything downstream sees only the
  text after the prefix. A bare prefix with no query lists that whole category.
- **Inline ghost completion**: the first ranked title is completed after the
  cursor, accepted with Tab. With a chat open, an action verb completes to the
  whole sentence ("add el" → "add Eliza to this chat").
- **Intent parsing** (`lib/omnibar-search.ts`): verbs are classified as
  `navigate`, `action`, `create`, `explain`, `recommend` or `repair`, and an
  object kind in the query ("add character eliza") narrows the search to that
  kind. A bare verb matches nothing by text and is answered by the verb
  suggestion builder instead.
- **Removal versus attach**: `remove`, `drop`, `detach`, `disable` and
  `turn off` are detaching verbs. "disable Tavern" never offers to attach it.

## 3. Result sources

Every builder is pure and lives in `lib/omnibar-results.ts` unless noted.

| Source | Builder | Notes |
| --- | --- | --- |
| Entities: chats, characters, personas, lorebooks, presets, connections, agents | `lib/omnibar-entity-rows.ts` | `preview` stays a thunk, built only for the focused row |
| App commands and personal extensions | `data.commands` | Extension commands come from `personal-extension-contributions` |
| Settings destinations | `lib/omnibar-settings.ts` | 6 sections and 25 named controls, each deep-linking to a tab and control id |
| Quick controls | `buildOmnibarControlResults` | Theme and presence as choices; 9 toggles |
| Active-chat controls | `buildOmnibarChatControlResults` | Model, preset, persona (choices, capped at 6 plus the current value) and an agents toggle. These edit the chat in place — nothing navigates away |
| FAQ | `buildOmnibarSearchResults` | Ids are `faq:<id>`; opens the FAQ viewer modal |
| Documentation | `useDocsCommandSearchProvider` | Passage search; opens the docs viewer at the match |
| Messages in the open chat | `buildOmnibarMessageResults` | Client-side over the shared transcript cache; 3-character minimum, 6 results |
| Messages in every other chat | `buildOmnibarGlobalMessageResults` | Server-backed; see section 6 |
| Professor Mari's own conversations | `buildOmnibarMariChatResults` | They sit behind an internal marker and are absent from the chat list |
| Slash commands | `buildOmnibarSlashResults` | Chat surface only. Choosing one types it into the chat input rather than running it, so arguments stay visible |
| Context rows | `buildOmnibarContextResults` | "What am I on?": the open editor, the current chat and everything attached to it, the last error, an unfinished creation session |
| Idle rows | `buildOmnibarIdleResults` | Unfinished setup first (capped at 2), then recents, then surface commands |
| Verb, attach and detach suggestions | `buildOmnibarVerbSuggestions`, `buildOmnibarAddSuggestions`, `buildOmnibarRemovalSuggestions` | Answer a half-typed sentence |
| Creation proposal | `lib/omnibar-creation-proposal.ts` | Nothing is created until accepted |
| Chat-to-world extraction | `lib/omnibar-chat-extraction.ts` | Lorebook, characters, locations or campaign |
| Game commands | `lib/omnibar-game-commands.ts` | Party, quest, scene and encounter topics go to Mari with the live game state. Dice are deliberately absent — see section 11 |
| "Ask Professor Mari" fallback | `buildOmnibarSearchResults` | Always last unless promoted. With a query typed it opens the Quick pane, not the Work pane: one Mari door, cheap answer first, escalated by "Continue in Full Mari". Cost is stated in the Quick header, never on the row |
| "Continue with Mari" | `buildOmnibarContinueResult` | Only when Mari is active or has pending approvals |

De-duplication is by result id, first source wins. Message rows from the open
chat and from the global search share an id shape on purpose, so a hit is never
listed twice.

## 4. Ranking

Score is the source score plus a context bonus plus an intent bonus, then the
shared command ranking (recency and pins) reorders it.

- Text scoring prefers exact title, then prefix, then whole word, then substring.
- Context bonuses, highest first: the open resource (80, or "unsaved changes"
  when the editor is dirty), the current settings target (80), something used by
  the active chat (55), something related to a current error (50), available
  setup (35), the current screen (30), pinned (25), recent (15). The winning
  reason becomes the row's context label.
- Pins are ignored while a query is typed, so typing always beats a pin.
- "Ask Professor Mari" is promoted above the hits when the query reads like a
  question, when the intent is explain, recommend or repair, or when nothing
  matched well — unless one result is a clear direct hit (score ≥ 250 with a
  navigate, action or create intent).

## 5. Actions

Typed actions (`OmnibarAction`) dispatch through `runResultAction`; results
without one fall through to the generic open path.

- `open-mari-chat`, `slash`, `goto-message`, `add-to-chat`, `detach-from-chat`,
  `refine-query`, `personal-extension`, `open-docs`, `open-faq`.
- Direct active-chat actions: "add Eliza" with a chat open attaches instead of
  opening, but only when the result is unambiguous.
- Attach and detach reuse the drag-and-drop payload and its block rules, so the
  omnibar can never make an assignment a drop would refuse.
- Every navigation passes the dirty-editor confirmation.
- Batch attach: a same-kind browse selection attaches to the active chat in one
  payload. Compare sends 2 to 5 selected items to Mari.
- Preview actions per category: start chat, edit, add to or remove from this
  chat, activate persona, set default preset, enable or disable, resume chat,
  open documentation, continue with Mari.

## 6. Cross-chat message search

- Route: `GET /api/chats/search/messages?q=&limit=` (static path, matched ahead
  of `/:id/messages`). Query capped at 200 characters, limit clamped to 1..50,
  default 20.
- `collectMessageSearchHits` in `services/storage/chats.storage.ts` is pure and
  self-checked in `chats.storage.test.ts`. It walks the whole message list in
  order, counting a per-chat position for **every** message — system and hidden
  rows included — because `messageNumber` is the absolute position the
  goto-message jump takes. Only visible rows in visible chats are returned.
- Matching is a literal, case-insensitive substring. It deliberately does not
  use `like()`, whose `%` and `_` are wildcards.
- The snippet is windowed around the match, not cut from the start.
- Professor Mari's chats are excluded inside the search, before the cap, so they
  cannot crowd out ordinary hits.
- The client only calls it at 3 characters or more, and never for a scope other
  than `msg:`.
- Choosing a hit in another chat opens that chat and then jumps: the goto request
  is keyed by chat id and survives the switch.
- Known ceiling, marked `ponytail:` in the source: one full in-memory pass per
  query. Add an index if a large library makes typing lag.

## 7. Keyboard and pointer

This is the part most likely to break silently. All of it must survive.

- `↑`/`↓` move the selection; `Home`/`End` jump to the ends. Not in browse.
- `Enter` chooses. On a toggle row it flips the toggle; on a choice row it opens
  the detail pane.
- `⌘↵` / `Ctrl+↵` continues the selected result with Mari, skipping the detail
  pane. Not offered for admin-only rows.
- `→` opens the detail pane for a choice or rich row; `←` returns focus to the
  input from a focused row.
- `Tab` accepts the ghost completion when there is one; otherwise it cycles
  focus inside the dialog (the dialog traps focus).
- `Escape` steps back one pane, then closes.
- In browse, `↓` moves focus into the grid and `Enter` activates the first cell.
- Native browser autocomplete is off on the input, because its popup steals the
  arrow keys.
- **Hover needs genuinely new screen coordinates.** Keyboard navigation scrolls
  the list under a resting cursor and the browser fires a mousemove for the row
  that slid beneath it; treating that as hover drags the selection back.
- **Arrow keys anchor on the highlight, not on DOM focus.** Hover moves the
  highlight without moving focus, so counting from the focused row would jump.
- The selection is pinned across re-renders by `reconcileActiveResultId`; the
  input's `onChange` must never null it.
- The active row is kept in view with `scrollIntoView({ block: "nearest" })`.

## 8. State and persistence

- Session state (`query`, `filter`, `pane`, `activeResultId`, `detailOrigin`,
  `browseSelectedId`, `browseLimit`, `detailResultId`, `mariReturnResultId`)
  survives a close and reopen, except the `mari` pane reset above.
- Command ranking (recency and pins) is persisted separately.
- UI-store slots the omnibar reads: `activeEditorField`, `lastAppError`,
  `creationSession`, the open-detail ids per resource kind, the settings target.

## 9. Accessibility

- The dialog is modal, labelled, and traps focus.
- A polite live region announces result counts, loading, and partial failure.
- Groups are sections with labelled headings.
- Every icon-only button has an accessible label.
- Motion respects `prefers-reduced-motion` throughout.

## 10. Performance constraints

- `preview` is always a thunk. Building preview data eagerly for every entity
  undoes the whole point.
- Row lookups are keyed by result id; a linear scan per rendered row showed up
  on large libraries.
- `chatControls` depends on the stable `mutateAsync` functions, not on the
  mutation objects, which are new every render.
- The bundle budget in `vite.config.ts` is a hard `this.error`, not a warning:
  500 kB per chunk, 1000 kB per entry. It measures `chunk.code` in memory, which
  is **not** the size printed in the build log — the same GameSurface chunk reads
  492 kB to the budget and 509 kB in the log. Debug budget failures with the
  budget's own numbers.
- The panes (`OmnibarMariPane`, `OmnibarBrowsePane`, `OmnibarDetailPane`) are
  lazy and mounted behind `Suspense`.

## 11. Deliberate non-features

Do not "fix" these; each was a decision.

- No "switch to game mode" action: game mode has a setup wizard and there is no
  safe one-call mode setter.
- The completion-action catalog never emits `show-field`. That branch is
  unreachable — do not re-add it.
- Image generation failures are not wired into error recovery: they are
  swallowed `catch {}` blocks with no single user-visible point.
- Message search does not rank by relevance, only by recency.
- **The omnibar does not roll dice.** It once did, and the branch was removed.
  The game input bar already has a Dices button with eight presets and a custom
  notation field, on the only screen where an omnibar roll was ever offered, and
  its roll queues onto your turn so the model sees the result — the omnibar's
  did not. Restoring it would also restore a dynamic-import rule, because a
  static import of the game stores from here breaks the bundle budget.
