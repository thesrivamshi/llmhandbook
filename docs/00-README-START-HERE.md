# Visual Book — START HERE (Claude Code orchestration)

You are continuing a project that turns a 523-page book — *The LLM Engineer's Handbook*
(Labonne & Iusztin, Packt 2024) — into a **side-by-side reader**: the exact book page on the
**left**, a hand-built **visual diagram** on the **right**. The owner is a visual/"shapes"
thinker; the diagrams carry the meaning, but **no text or image from the book may be lost.**

## The one non-negotiable principle

**Same idea = same shape, everywhere. Consistency beats decoration.** A model is always the
same glyph; a vector DB is always the same glyph; a named product always shows its real logo.
Read `STYLE.md` and `docs/02-DESIGN-SYSTEM.md` before drawing anything.

## Read these in order

1. `docs/01-PROJECT-STATE.md` — what already exists in this repo, file map, what's done.
2. `docs/02-DESIGN-SYSTEM.md` — the light theme, the shape alphabet, the brand-logo layer, stage colours. (Plus `STYLE.md`.)
3. `docs/03-DIAGRAM-AUTHORING-GUIDE.md` — how to author a chapter's diagrams (archetypes, the `PageDiagram` type, the helpers in `src/diagrams/parts.tsx`, the self-critique loop).
4. `docs/04-SPLIT-VIEW-READER.md` — **build this reader** (exact page text + original page image on the left, diagram on the right). This is the headline feature the owner asked for.
5. `docs/05-BUILD-VERIFY-RUN.md` — install, type-check, build the single-file HTML, screenshot, run.
6. `docs/chapters/CH01.md … CH12-APPENDIX.md` — one grounded brief per chapter (real sections, figures, tools, per-page worksheet).

## The mission, in one paragraph

Build the split-view reader so **all 523 pages** are readable (exact text + original page
image, even pages that don't yet have a custom diagram), then author a **bespoke diagram for
every content page** of every chapter, chapter by chapter, keeping the shape language perfectly
consistent. Chapter 1 is already finished — use it as the gold standard.

## The loop you repeat for every chapter (2 → 11 + Appendix)

For chapter N, open `docs/chapters/CHnn.md` and:

1. **Read the real text.** For each page in the chapter, read the *full* cleaned text from
   `data/pages.clean.json` (the excerpts in the brief are only hints). Look at every figure PNG
   listed in the brief (`data/figures/p{page}.png`).
2. **Classify + design.** Give each content page one archetype and compose a diagram from the
   shape alphabet + brand logos. Redraw the book's figures faithfully as clean schematics (never
   embed the bitmap). Architecture figures use **real tool logos** as nodes.
3. **Add new tools** named in the chapter to `TOOL_REGISTRY` (`src/brand/registry.ts`) — real
   `simple-icons` logo if it exists, else a brand-colour fallback pill. Never a plain grey box.
4. **Wire it up.** Export `CHAPTERn` from `src/diagrams/chapter{n}.tsx` and register it in
   `src/book.ts`.
5. **Verify.** `npx tsc -b` clean, `npm run build` clean. Screenshot the chapter and a few pages,
   then **self-critique**: is the shape language consistent? is each diagram obviously about *that*
   page? is the real page still fully readable on the left? Fix, then commit.
6. **Update logs.** Append a per-chapter entry to `NOTES.md`.

## Definition of done (whole project)

- Reader shows the **exact page** (full text + original page image) for **every** page 1–523.
- **Every content page** of every chapter has a faithful, non-generic diagram in the shared
  shape language; the book's named figures are redrawn cleanly; same concept = same shape.
- `/legend`, the sidebar (all chapters, stage-coloured, page-weight bars), search across
  titles/captions/sections, per-page deep links, and the whole-book map all work.
- `npm install && npm run dev` starts with no errors; `npm run build` emits one self-contained
  `index.html` (delivered as `Visual-Book.html`) that opens by double-click.
- `STYLE.md` and `NOTES.md` are kept current.

## Hard rules

- Never summarize or trim the book on the left pane — show the **exact** page. The diagram is
  additive.
- Never invent a new shape when an existing alphabet shape fits.
- Never leave a named product as a grey box — give it its real logo or a brand pill.
- Keep everything in the **single light theme**. No dark mode, no toggle.
