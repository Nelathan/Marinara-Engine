# Translation glossaries

One working glossary per language pack: the register, terminology, typography,
UI-label, and QA conventions each pack shipped with. These are contributor
documents for whoever edits a pack next — human or agent — so a small mirror
change doesn't have to reverse-engineer a language's rules from 125 files.

They live on this branch deliberately. The first-generation glossaries were
working files in a temporary workspace and were destroyed twice by machine
cleanup — the second loss unrecoverable. Committing them next to the packs they
govern ends that failure mode. Nothing here is downloaded by the app: packs are
fetched per `<lang>/manifest.json`, and this folder is outside every pack
directory.

## Ground rules

- **The pack is the ground truth.** Each glossary documents the conventions as
  shipped, verified against the pack; where a pack is internally inconsistent,
  the glossary says so ("known pack residuals") instead of pretending.
- **Update the glossary in the same PR as the pack change** whenever an edit
  sets a new precedent (a new term, a new label-gloss ruling, a typography
  call). A glossary that lags its pack is worse than none.
- **Provenance:** these are second-generation documents, re-derived 2026-09-01
  from three sources — the shipped packs, each pack's original PR decision
  write-up, and the terminology notes of the 2026-09-01 mirror cycle — after
  the original working glossaries were lost. Rules carried from the originals
  that the pack itself cannot evidence are marked as recorded rulings.

## Files

`glossary-<code>.md` for each shipped pack: es, de, fr, pt-br, pl, ru, ja, ko,
zh-hans, hi.

`glossary-ar-draft.md` is different: Arabic has **no pack yet** (the cycle is
held pending an explicit maintainer go-ahead). The draft preserves the Arabic
conventions worked out during the RTL viewer scoping so the eventual cycle
doesn't start from zero. It prescribes; it cannot yet cite a pack.
