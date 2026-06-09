# Visual Book — Shape Alphabet (STYLE.md)

The non-negotiable principle: **one shape = one meaning, everywhere.** Never draw an
ad-hoc shape when one of these fits. Colour is never decorative — **the accent colour of a
shape always encodes the book's phase** (see Stage colours below).

Live reference: run the app and open **`/legend`**.

---

## Surface theme — LIGHT (tokens)

Single light theme, no dark mode, no toggle. The vibe is warm, colourful, friendly and
clean. Defined in `tailwind.config.js` and mirrored for SVG in `src/theme.ts` (`THEME`).

| Token | Hex | Use |
|---|---|---|
| `paper` | `#FBFAF6` | page background (warm off-white) |
| `surface` | `#FFFFFF` | cards / glyph bodies |
| `border` | `#ECE8DF` | hairlines / card borders |
| `ink` | `#25313C` | primary text |
| `ink2` | `#5E6B76` | secondary text |
| `faint` | `#97A0A8` | tertiary text |

Cards: soft shadow `0 1px 2px rgba(30,40,50,.05), 0 10px 30px rgba(30,40,50,.06)`, ~16px
radius. Background is a **very faint warm dot grid** (26px). Keep it airy.

Fonts: **Jost** (headings), **Inter** (body + most labels). **IBM Plex Mono** is reserved
for tiny page-number chips only — monospace + ALL-CAPS read "terminal", so they're dialled
right down.

> `THEME.panel` / `THEME.hairline` survive as **aliases** (now `#FFFFFF` / light grey) so the
> glyph code didn't need rewiring — but new code should use the named light tokens.

## Stage colours (accent = phase) — re-tuned for white

Defined in `src/theme.ts`. Map a chapter number to its stage with `stageForChapter(n)` /
`accentForChapter(n)`.

| Stage | Chapters | Accent |
|---|---|---|
| Foundations | Ch 1–2 | `#0EA5B7` teal |
| Feature / Data | Ch 3–4 | `#15A864` green |
| Training | Ch 5–7 | `#EE9613` amber |
| Inference | Ch 8–10 | `#EF5C46` coral |
| Operations | Ch 11 + Appendix | `#7B61E8` violet |

## Brand identity layer (the hybrid look)

The signature of the look: **specific named products show their REAL logo in their official
brand colour; generic concepts use the abstract shape alphabet.**

- **`<BrandIcon name="…" />`** (or `slug="…"`) — `src/brand/BrandIcon.tsx`. Renders the official
  `simple-icons` SVG path in the icon's official hex (read from the data, never hardcoded).
- **`<BrandMark slug="…" />`** — just the logo mark, for placing inside diagrams.
- **Fallback** (tool not in simple-icons): a white name-pill with the tool's name in its brand
  colour + a coloured left border + a brand dot. A tool is **never** a plain grey box.
- **Legibility guard** (`isPale`, `readableLabel` in `src/brand/icons.ts`): if a brand colour is
  too pale to read on white (luminance > 0.45 — catches Hugging Face yellow, LangChain blue),
  the logo keeps its brand colour but sits on a low-opacity tinted chip and the label is pulled
  toward ink so it stays readable.
- **Priority rule:** a tool's brand colour **wins over** the stage colour for that specific
  node. The stage colour still governs generic glyphs and section framing.
- **`TOOL_REGISTRY`** (`src/brand/registry.ts`) is the living list of this book's stack; add to
  it as each chapter introduces new tools. Fallback brand hexes are best-effort approximations of
  the vendor's primary colour (the official SVG can be dropped in later); resolved tools take
  their exact official hex from `simple-icons`.
  - The registry now holds **~110 tools** spanning all 12 chapters (the full LLM-engineering stack +
    every named alternative). Most **resolve to real `simple-icons` logos** (Python, Poetry, Docker,
    Hugging Face, MongoDB, Qdrant, GitHub, GitHub Actions, Selenium, FastAPI, Pydantic, LangChain,
    Mistral, Meta, Kafka, Flink, RabbitMQ, vLLM, PyTorch, NVIDIA, Terraform, Ruff, Pytest, GitLab,
    CircleCI, Jenkins, DVC, Discord, MLflow, W&B, Redis, Milvus, Snowflake, BigQuery, Qwen, LM Studio,
    Google Cloud/Colab/Chrome, spaCy, NumPy, pandas, Jinja, Anaconda, uv, Scrapy, Haystack, …).
  - The rest use **brand-colour fallback pills** (no `simple-icons` entry): ZenML, Comet ML, Opik, AWS
    + its sub-services (SageMaker, Bedrock, S3, ECR, EC2, EKS, ECS, CloudWatch, CloudFormation), OpenAI/
    GPT-4o, Bytewax, Redpanda, GGUF formats (GPTQ, EXL2, ExLlamaV2), llama.cpp, bitsandbytes, TGI,
    TensorRT-LLM, DeepSpeed, Megatron-LM, Ragas, ARES, Argilla, Nomic Atlas, RunPod, Unsloth, CLIP,
    Superlinked, LlamaIndex, BentoML, gitleaks, Qwak, Hopsworks, Tecton, Featureform, …
  - **Never a plain grey box** — every named product resolves to a logo or a brand pill (verified by
    screenshot self-critique each chapter; a stray unregistered name like CLIP was caught + fixed).

Logos are trademarks of their owners, used purely to identify the real product.

---

## The shapes

All glyphs live in `src/shapes/primitives.tsx`. Each is a self-contained SVG `<g>` that
draws inside a box and accepts an `accent` colour, so the same component works standalone in
the legend **and** composed onto a `<Canvas>` to build real diagrams.

**Shared props (every glyph):** `accent: string` (required), `x?`, `y?`, `w?`, `h?`
(placement box; default `0,0,120,120`). On light: bodies are **white with a soft accent tint**,
strokes are the **accent** (thick + round so shapes feel friendly), and the neural-net nodes are
**filled accent**. The *meaningful* mark is always the accent.

| # | Component | Meaning | Picture | Extra props |
|---|---|---|---|---|
| 1 | `ModelGlyph` | **Model / LLM** | a stack of connected nodes (a little neural net) in a rounded box | — |
| 2 | `DataStoreGlyph` | **Data store / DB / warehouse** | a cylinder | — |
| 3 | `VectorDBGlyph` | **Vector DB / embeddings** | a cylinder overlaid with a dot grid | — |
| 4 | `PipelineGlyph` | **Pipeline / process / step** | a rounded rectangle with a small flow chevron | — |
| 5 | `DocumentGlyph` | **Raw data / document** | a page glyph with a folded corner | — |
| 6 | `UserGlyph` | **You / a user** | a simple head-and-shoulders figure | — |
| 7 | `FlowArrow` | **Flow (data moving)** | an arrow; dashes animate so data appears to move | `x1,y1,x2,y2`, `animated` |
| 8 | `DecisionGlyph` | **Decision / dispatcher / router** | a diamond | `mark` (text inside, default `?`) |
| 9 | `SnapshotGlyph` | **Snapshot / stored artifact** | a dashed-border badge with a title + "→ used for…" | `title`, `usedFor` |
| 10 | `TagGlyph` | **Category / tag** | a pill chip | `text` |

### Notes per shape

- **ModelGlyph** — nodes are arranged in a **3‑2‑3 hourglass** with accent-tinted edges so it
  always reads as a *network*, never a dot grid (which is reserved for Vector DB).
- **DataStoreGlyph vs VectorDBGlyph** — both are cylinders; the **dot grid** is the *only*
  thing that distinguishes a vector store from a plain data store. Keep that contrast.
- **PipelineGlyph** — the small **flow chevron** (`›`) is what separates a "process/step" from a
  generic box. Always include it.
- **FlowArrow** — animation is a moving `stroke-dashoffset` (CSS class `flow-dash`). It is
  automatically held still under `prefers-reduced-motion`.
- **SnapshotGlyph** — the dashed border + the literal "→ used for…" line is what marks
  something as a *stored artifact / version*, distinct from a live data store.

---

## Composition helpers (`src/shapes/index.tsx`)

- **`<Canvas width height>`** — a sized `<svg>` with a faint blueprint grid; compose glyphs
  onto it by passing `x/y/w/h`. This is how Phase 2 diagrams will be built.
- **`<ShapeTile glyph accent>`** — wraps a single glyph in its own square `<svg>`; used by the
  legend grid.
- **`SHAPE_REGISTRY`** — the canonical list (key, name, meaning, props, render). It drives
  `/legend` and this document. Add a shape here and it appears in both.

## Accessibility & motion

`prefers-reduced-motion` is honoured globally (`src/index.css`): flow dashes stop and
transitions collapse. Focus is always visible (cyan focus ring). Layout is responsive down to
~390px (verified on `/legend`).
