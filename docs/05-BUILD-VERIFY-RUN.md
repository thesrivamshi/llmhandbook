# Build, verify, run

## Commands

```bash
npm install                      # first time on this machine
node scripts/render-pages.mjs    # render all 523 page images (one-time, for the reader)
npm run dev                      # http://localhost:5173  (hash routing: /#/read/30)
npx tsc -b                       # type-check; must be clean
npm run build                    # → dist/index.html (single self-contained file)
```

After each build, copy the single file to the repo root for the owner:

```bash
cp dist/index.html Visual-Book.html
```

## Verify each chapter before moving on

1. `npx tsc -b` and `npm run build` both succeed with **no errors**.
2. Screenshot the chapter and a few pages (headless Chromium via Playwright is already a dev
   dependency — see `scripts/shoot-ch1.mjs` / `scripts/screenshot.mjs` for the pattern: start a
   tiny static server over `dist/`, or load the built `file://` with hash routing).
3. **Look at the screenshots** and run the self-critique checklist in
   `docs/03-DIAGRAM-AUTHORING-GUIDE.md`. Fix issues. Only then continue.
4. Append a dated entry to `NOTES.md` (pages covered, figures redrawn, tools added, fixes).

## Notes / gotchas

- Routing is **hash-based** (`HashRouter`) so the single-file build works from `file://`.
- The mounted/working folder may refuse to delete old `dist/` files; if so, build to a temp dir
  (`npx vite build --outDir /tmp/vb --emptyOutDir`) and copy out, as the existing scripts do.
- Page images are big; don't inline them into the single-file build. The single file ships the
  full **clean text** on the left (so it's always complete); the image view is for the dev/dir run.
- Keep `simple-icons` imports to only the tools you use (tree-shakes the bundle).
- Honor `prefers-reduced-motion`; keep keyboard nav + visible focus working.

## Suggested git rhythm

One commit per chapter: `feat(ch5): training chapter diagrams + tools`. Keep `STYLE.md` /
`NOTES.md` updated in the same commit.
