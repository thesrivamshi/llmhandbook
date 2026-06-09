# Project state — what already exists

A Vite + React + TypeScript + Tailwind app. Everything runs locally; no backend.

## Run / build

```bash
npm install          # first time (regenerates native deps for this machine)
npm run dev          # dev server at http://localhost:5173  (hash routing, e.g. /#/chapter/1)
npm run build        # → ONE self-contained dist/index.html (vite-plugin-singlefile)
```

The double-click deliverable is `dist/index.html`, copied to the repo root as `Visual-Book.html`.

## Data already extracted (in `data/`)

| File | What |
|---|---|
| `toc.json` | full nested outline (298 nodes, 4 levels), each with `startPage` |
| `pages.json` | raw text of all 523 pages |
| `pages.clean.json` | **full, verbatim** page text with running headers + page-number noise removed — this is what the reader's LEFT pane uses |
| `chapters.json` | per-chapter page spans + heading counts (drives sidebar weight bars) |
| `figures.json` | 110 figures → page → caption → image path |
| `figures/p{n}.png` | 104 rendered figure pages (150 DPI) |
| `page-images/p{n}.png` | **not yet generated** — run `node scripts/render-pages.mjs` to render ALL 523 pages for the reader's "original page" view |

Pipeline scripts (re-runnable): `scripts/extract.mjs`, `clean.mjs`, `figures.mjs`,
`render-pages.mjs`, `gen-chapter-docs.mjs`.

## Code map (in `src/`)

| Path | Role |
|---|---|
| `theme.ts` | light tokens (`THEME`), stage colours, `stageForChapter` / `accentForChapter` |
| `shapes/primitives.tsx` | the 10 shape-alphabet glyphs (light-themed) |
| `shapes/index.tsx` | `Canvas`, `ShapeTile`, `SHAPE_REGISTRY` |
| `brand/icons.ts` | `simple-icons` map + colour utils (`isPale`, `readableLabel`, `rgba`) |
| `brand/registry.ts` | `TOOL_REGISTRY` (add new tools here, per chapter) |
| `brand/BrandIcon.tsx` | HTML brand chip (legend); SVG version is `BrandNode` in diagrams |
| `diagrams/types.ts` | `PageDiagram` type + `Archetype` union |
| `diagrams/parts.tsx` | SVG helpers: `Arrow`, `Label`, `BrandNode`, `Pill`, `LabelBox`, `Boundary`, `Warn` |
| `diagrams/chapter1.tsx` | **DONE** — 23 diagrams for pp.30–52. The reference example. |
| `book.ts` | TOC + diagram registry (`DIAGRAMS_BY_CHAPTER`, `diagramForPage`, …) |
| `components/{Sidebar,Layout,DiagramCard}.tsx` | reader chrome |
| `routes/{Chapter,Page,Legend}.tsx` | current routes |

## Routes today

- `/#/chapter/:n` — scroll of a chapter's diagrams
- `/#/page/:n` — single diagram, big, Prev/Next + arrow keys
- `/#/legend` — the shape alphabet + brand layer key

You will **add** `/#/read/:page` (the split-view) per `docs/04-SPLIT-VIEW-READER.md`, and extend the
sidebar to all 12 chapters.

## What's DONE vs TODO

- ✅ Phase 0 (data), design system, brand layer, `/legend`, Chapter 1 (23 diagrams), single-file build.
- ⬜ Render all page images. Build the split-view reader. Chapters 2–11 + Appendix. Whole-book map. Search.
