# Professor Mari in the Omnibar

Bring the full Professor Mari agent into the Global Omnibar as a native `mari`
pane. Reuse the existing `HomeProfessorMariChat` component; do not rebuild agent
logic. Keep the old Home page and floating-assistant mounts working unchanged.

## Principle

The input bar is the constant. The surface slides between `search` and `mari`
states; you never "open" a separate window. Mari becomes a third destination on
the same pane track as `results`/`detail`.

## Anatomy mapping

| Omnibar slot | In `mari` pane |
|---|---|
| Header input | Mari composer (attach + send/stop inline) |
| Left icon | Magnifier ⇄ Mari peek avatar crossfade |
| Back icon | Return to `results` |
| Filter toolbar row | Context/control strip: connection · skills · memories · history |
| Body (full width) | Transcript; chips, guided plans, action cards render inline |
| Detail aside (desktop) | Workspace timeline/activity + trust strip; collapses on mobile |
| Footer | Mari send-hint replaces keyboard hints |

## Flows

1. **Search -> Mari (morph).** `Ask Professor Mari` fallback row collapses the
   results list into a transcript; the typed query becomes the first user bubble.
2. **Result -> Mari (context rides along).** Detail aside resource shrinks into a
   composer context chip; Mari holds that bounded context.
3. **Mari -> Result (round trip).** Action-result `Open`/`Review` slides back to
   the `detail` pane for that resource instead of closing the dialog.
4. **Seam.** Reuse the existing `results`/`detail` slide transition for `mari`.

## Composer position

Descending handoff: on the flow-1 morph, the input bar animates from top to
bottom and the transcript fills the space above it. One layout animation; buys
conventional chat posture.

## Build order

1. Add `mari` to `OmnibarPane`; render `<HomeProfessorMariChat embeddedTab>` with
   a new `omnibarMode` styling flag in the pane body. Rewire `Ask Professor Mari`
   entry points to switch pane instead of `requestProfessorMariOpen` + close.
2. Descending handoff transition (input top -> bottom) + icon crossfade.
3. Context chip on the Result -> Mari path.
4. Round-trip: action-result `Open`/`Review` -> `detail` pane.
5. Theming pass so it reads as one surface; keep old mounts untouched.

## Non-goals

- No change to agent logic, command execution, or the server routes.
- No removal of the Home page or floating-assistant Mari mounts.
