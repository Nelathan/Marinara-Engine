# Marinara Engine — Documentation language packs

This orphan branch holds the translated in-app documentation, one folder per
language code (`es/`, …), each mirroring the English `docs/` folder and file
names 1:1 with a generated `manifest.json`.

The app downloads the selected language from this branch into its data folder
(Settings → General → Documentation Language). This branch is never part of a
user install: launchers fetch only `main`/`staging`, and the installer clones a
single tag, so translations add zero checkout size.

## Updating a pack

1. Edit or add files under `<lang>/`, keeping paths identical to `docs/` on
   `staging`. Translate prose, headings, and link text only — code blocks,
   paths, URLs, and link targets (including `#fragments`) stay byte-identical.
2. From an Engine checkout, run:
   - `node scripts/docs-i18n/build-manifest.mjs <path-to>/<lang> --source-commit <engine-sha>`
   - `node scripts/docs-i18n/validate-pack.mjs <path-to>/<lang>`
3. Commit content and manifest together.

See `CONTRIBUTING.md § Translated documentation` on `staging` for the full
rules, including the per-file English fallback that makes partial packs safe.
