# Split-view reader — the headline feature

The owner is a visual thinker and **must not miss any text or image** from the book. The reader
shows the **exact book page on the LEFT** and the **diagram on the RIGHT**. The diagram is always
*additive* — it never replaces or summarizes the page.

## Route

`/#/read/:page` — two synced panes. `:page` is the PDF page number (1–523). Prev/Next and the
**← / →** arrow keys move both panes together. Make this the default landing route (`/` → the
first content page, e.g. `/#/read/30`). Keep `/#/chapter/:n`, `/#/page/:n`, `/#/legend`.

## LEFT pane — the exact page (this is the hard requirement)

Show the page **in full, verbatim** with two views the reader can switch between (default to
"Original" so nothing can be missed):

1. **Original page image** — `data/page-images/p{page}.png` (run `node scripts/render-pages.mjs`
   first to generate all 523). This is the printed page exactly: text, figures, tables, equations.
   Zoomable. This guarantees zero loss.
2. **Clean text** — the full `data/pages.clean.json` text for that page, rendered in comfortable
   reading typography (Inter, generous line-height, sensible max-width). This is the complete page
   text, not a summary. If the page has figure images (`figures.json`), show them inline at the
   right spot.

Copy `data/pages.clean.json` and `data/figures.json` into `src/data/` (as already done for
`toc.json`/`chapters.json`) OR `fetch` them as static assets — your call, but the build must stay
a single self-contained file, so importing into the bundle is simplest. Page images are large;
reference them as files in `public/page-images/` and accept that the *single-file* build links to
that folder (document this), **or** keep page images out of the single-file build and only inline
the text view there. Recommended: dev/dir build shows both views; the single-file `Visual-Book.html`
shows the **clean-text** view (always) and links to images if present.

## RIGHT pane — the diagram

- If `diagramForPage(page)` exists, render it (reuse `DiagramCard`, or a slimmer frame): term
  eyebrow, plain title, the diagram canvas, caption, archetype + page chip.
- If no diagram exists yet (page not authored, or a non-content page), show a calm placeholder:
  "Diagram coming for this page" with the page's section name — **never** hide the left page.

## Layout & behaviour

- Desktop: left and right side-by-side (≈50/50, independent vertical scroll). Sidebar still on the
  far left (collapsible).
- Mobile: stack — a segmented toggle "Page / Diagram" (default Page), or page on top and diagram
  below. Keep the full page reachable.
- Sync: changing the page (arrows, Prev/Next, sidebar click) updates both panes to the same page.
- Deep-linkable: `/#/read/123` opens page 123 directly.
- Every page 1–523 is reachable here, including front/back matter — so the reader is the complete
  book, with diagrams layered on top.

## Sidebar (extend to the whole book)

Extend `src/components/Sidebar.tsx` from Chapter 1 only to **all 12 chapters + Appendix**: each
chapter is a collapsible group, stage-coloured, with a page-weight bar (use `chapters.json`
`pageCount`). Section → page links go to `/#/read/{startPage}`. Mark pages that have a diagram
with the stage accent (as today).

## Also deliver (per the original brief, after the reader works)

- **Search** across all titles, captions, and section names → highlight matches, show which
  chapters/pages own a concept.
- **Whole-book map** (`/#/map`): zoomable force-directed graph — chapters as hubs, sections as
  mid-nodes, key concepts as leaves, all stage-coloured; hover preview, click → jumps to that
  page's `/#/read/:page`. (`d3-force` or `react-force-graph`.)
- **"You are here"** progress across the whole book.
