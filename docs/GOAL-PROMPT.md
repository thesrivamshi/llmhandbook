# Goal prompt — paste this into Claude Code (run it from the `visual-book` repo)

You are continuing **Visual Book**: a local app that turns the 523-page book *The LLM Engineer's
Handbook* into a side-by-side reader — the **exact book page on the left, a hand-built visual
diagram on the right** — for a visual/"shapes" thinker who must not miss any text or image.

Everything you need is written down in this repo. **Read the docs first, in this order, and follow
them exactly. Do not redesign what already exists.**

1. `docs/00-README-START-HERE.md` — the mission, the non-negotiable principles, and the per-chapter
   loop. Start here.
2. `docs/01-PROJECT-STATE.md` — what already exists (data, design system, brand layer, Chapter 1,
   single-file build) and the file map.
3. `docs/02-DESIGN-SYSTEM.md` + `STYLE.md` — the light theme, the shape alphabet, the brand-logo
   layer, the stage colours. One shape = one meaning; specific products use real logos.
4. `docs/03-DIAGRAM-AUTHORING-GUIDE.md` — how to author each page's diagram (archetypes, the
   `PageDiagram` type, the helpers in `src/diagrams/parts.tsx`, the self-critique checklist).
5. `docs/04-SPLIT-VIEW-READER.md` — **build the split-view reader.** Left pane = the exact, full
   page (original page image + complete clean text, never a summary). Right pane = the diagram.
6. `docs/05-BUILD-VERIFY-RUN.md` — install, render page images, type-check, build the single-file
   HTML, screenshot, verify.
7. `docs/chapters/CH01.md … CH12-APPENDIX.md` — one grounded brief per chapter (real sections,
   figures to redraw, tools to add, a per-page worksheet).

## What to do

- **First**, build the split-view reader per doc #5 and run `node scripts/render-pages.mjs` so all
  523 pages are readable (exact text + original image), even before every diagram exists. Extend
  the sidebar to all 12 chapters.
- **Then**, go chapter by chapter — **Chapter 2, then 3, … through 11, then the Appendix** — and
  for each, follow the loop in doc #00 using that chapter's `docs/chapters/CHnn.md`: read the full
  real text in `data/pages.clean.json`, look at every figure PNG, give each content page one
  archetype, compose a bespoke diagram from the shape alphabet + real tool logos, add new tools to
  `TOOL_REGISTRY`, register the chapter in `src/book.ts`, then type-check, build, screenshot, and
  self-critique before moving on. **Chapter 1 is already done — use it as the gold standard, don't
  redo it.**
- **Finally**, add search and the whole-book map per doc #5, keep `STYLE.md`/`NOTES.md` current,
  and after each chapter run `npm run build` and copy `dist/index.html` to `Visual-Book.html`.

## Definition of done

The reader shows the exact page (full text + original image) for **every page 1–523**, **every
content page** has a faithful non-generic diagram in one consistent shape language, the book's
named figures are redrawn cleanly with real tool logos, `/legend` + sidebar + search + map + deep
links all work, and `npm install && npm run dev` starts with no errors. Keep the single light
theme throughout.

## Hard rules

- Never summarize or trim the book on the left — show the **exact** page; the diagram is additive.
- Same idea = same shape, everywhere; never invent a new shape when one fits.
- Every named product gets its real logo or a brand-colour pill — never a grey box.
- Verify (tsc + build + screenshot + self-critique) after every chapter; keep me updated between
  chapters.
```
```
