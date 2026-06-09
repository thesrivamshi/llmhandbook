# Diagram authoring guide

Goal: a **bespoke** diagram for every content page that is obviously about *that* page — never a
generic unlabeled box. Chapter 1 (`src/diagrams/chapter1.tsx`) is the worked example; mirror it.

## The data shape — `PageDiagram` (`src/diagrams/types.ts`)

```ts
{ page, chapter, stage, accent, archetype, term, title, caption, section, diagram }
```

- `term` — short eyebrow, e.g. `"FTI ARCHITECTURE"`.
- `title` — plain title, e.g. `"Feature, Training, Inference"`.
- `caption` — 1–2 sentences in the book's real terminology (not dumbed down).
- `accent` — `STAGES.<stage>.accent` (set by chapter).
- `diagram` — JSX composed on a `<Canvas width height>` from the alphabet + `BrandNode`.

A chapter file exports `const CHAPTERn: PageDiagram[]`. Register it in `src/book.ts`
(`DIAGRAMS_BY_CHAPTER`).

## Pick ONE archetype per page

`single-concept` · `pipeline-flow` · `architecture` · `comparison` · `list-cluster` · `cycle`
· `hierarchy` · `code-anatomy` · `formula-as-blocks` · `pitfall`.

Quick guide: definition page → single-concept; "steps" → pipeline-flow; system with stores →
architecture; A vs B → comparison; N things into one → list-cluster; a loop (RLHF, CI/CD) →
cycle; a tree → hierarchy; annotated code → code-anatomy; an equation → formula-as-blocks;
an anti-pattern → pitfall (use `Boundary danger` + `Warn`).

## Process per page

1. Read the **full** cleaned text (`data/pages.clean.json`). Identify the 1 key concept.
2. If the page has a figure (listed in `docs/chapters/CHnn.md`), open `data/figures/p{page}.png`
   and **reconstruct its meaning** in the shape alphabet — do not embed the bitmap.
3. Choose the archetype; compose with `parts.tsx` helpers; name specific tools via `BrandNode`.
4. Keep it clean: ~3–7 elements. Label things. Let arrows animate (they respect reduced-motion).

## Coordinates / canvas

`<Canvas width={W} height={H}>` gives a responsive SVG (it scales to the container, preserves
aspect). Typical `W≈640–760`. Place glyphs with `x,y,w,h`; connect with
`<Arrow x1 y1 x2 y2 accent={A} />`. Look at Chapter 1 for spacing conventions.

## Self-critique checklist (run before finishing a chapter)

- [ ] Same concept drawn with the same shape as in earlier chapters?
- [ ] Model glyph still distinct from Vector DB glyph?
- [ ] Every named product shows its real logo / brand pill (no grey boxes)?
- [ ] Is each diagram obviously about its page **without** reading the caption?
- [ ] Stage accent correct for the chapter?
- [ ] The book's figures redrawn faithfully (right components, right connections)?
- [ ] Nothing overlaps; labels legible at the reader's render size?
- [ ] Left pane still shows the **full** page text + original image (diagram never replaces text)?

## Coverage rule

Author a diagram for **every content page**. Skip only true non-content pages (blank dividers,
the references list, the "Join our Discord" page). If a page is dense, prefer a clear
single-concept diagram of its main idea over cramming everything in — but never skip it.
