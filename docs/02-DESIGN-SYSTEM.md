# Design system (read with `STYLE.md`)

`STYLE.md` is the full reference. This is the working summary. **Do not redesign it.**

## Theme — single LIGHT theme, no dark mode, no toggle

Warm, colourful, friendly, clean. Tokens (in `tailwind.config.js` + `src/theme.ts` `THEME`):

| token | hex | use |
|---|---|---|
| paper | `#FBFAF6` | page background (faint warm dot grid) |
| surface | `#FFFFFF` | cards / glyph bodies |
| border | `#ECE8DF` | hairlines |
| ink | `#25313C` | primary text |
| ink2 | `#5E6B76` | secondary text |
| faint | `#97A0A8` | tertiary text |

Cards: ~16px radius, soft shadow. Fonts: **Jost** (headings), **Inter** (body), **IBM Plex
Mono** for tiny page-number chips only (mono/ALL-CAPS read "terminal" — keep them rare).
Honor `prefers-reduced-motion`; visible focus rings; responsive to mobile.

## Stage colours (accent = phase). Use `stageForChapter(n)`.

| Stage | Chapters | Accent |
|---|---|---|
| Foundations | 1–2 | `#0EA5B7` teal |
| Feature / Data | 3–4 | `#15A864` green |
| Training | 5–7 | `#EE9613` amber |
| Inference | 8–10 | `#EF5C46` coral |
| Operations | 11 + Appendix | `#7B61E8` violet |

## The shape alphabet (generic concepts) — `src/shapes/primitives.tsx`

One shape = one meaning. Never invent a new shape when one fits.

- **Model / LLM** → connected nodes (neural net) in a rounded box — `ModelGlyph`
- **Data store / DB / warehouse** → cylinder — `DataStoreGlyph`
- **Vector DB / embeddings** → cylinder + dot grid — `VectorDBGlyph`
- **Pipeline / process / step** → rounded rect + flow chevron — `PipelineGlyph`
- **Raw data / document** → page with folded corner — `DocumentGlyph`
- **You / a user** → head-and-shoulders — `UserGlyph`
- **Flow** → animated dashed arrow — `FlowArrow` (use `Arrow` in `parts.tsx`)
- **Decision / dispatcher / router** → diamond — `DecisionGlyph`
- **Snapshot / stored artifact** → dashed badge "→ used for…" — `SnapshotGlyph`
- **Category / tag** → pill chip — `TagGlyph` (use `Pill` in `parts.tsx`)

Model (neural net) and Vector DB (dot-grid cylinder) must stay visually distinct.

## The brand layer (specific named products) — `src/brand/`

When a node is a **specific named product** (ZenML, MongoDB, Qdrant, AWS, SageMaker, Docker,
Hugging Face, FastAPI, …), render its **real logo in its official brand colour**. Generic ideas
use the shape alphabet. That hybrid is the whole look.

- In diagrams, use **`BrandNode`** (SVG, `src/diagrams/parts.tsx`): pass `name="MongoDB"` and it
  resolves the registry entry → real `simple-icons` path in official hex, or a fallback pill.
- Add new tools to **`TOOL_REGISTRY`** (`src/brand/registry.ts`): give a `slug` if `simple-icons`
  has it (check by importing the `siXxx` export), else a `fallbackBrand` hex from the vendor's
  brand page. **Never leave a named tool as a plain grey box.**
- **Priority:** a tool's brand colour wins over the stage colour for that node. Stage colour still
  governs generic glyphs and section framing.
- **Legibility guard** is automatic (`isPale` / `readableLabel`): pale logos get a tinted chip +
  darkened label.

## Composition helpers — `src/diagrams/parts.tsx`

`Arrow(x1,y1,x2,y2,accent,animated)`, `Label`, `BrandNode`, `Pill`, `LabelBox`, `Boundary`
(dashed group frame, `danger` for pitfalls), `Warn` (failure marker). Compose everything onto a
`<Canvas width height>` (responsive SVG with a faint grid). See `src/diagrams/chapter1.tsx`.
