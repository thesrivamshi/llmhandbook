# Visual Book — NOTES (decisions + per-chapter log)

Source book: *The LLM Engineer's Handbook* (Labonne & Iusztin, Packt 2024), 523 pages.

## Decisions

- **Page numbering** — we use **PDF page numbers (1–523)** everywhere, because the PDF
  bookmarks and navigation rely on them. The book's *printed* numbers run ~29 pages behind
  (PDF p.30 = printed "Chapter 1, p.1"). Can surface printed numbers in the UI later if wanted.
- **Stage = colour** — chapters map to five phases via `stageForChapter()` in `src/theme.ts`.
- **Tech** — Vite + React + TypeScript + Tailwind v3. Diagrams are React SVG composed from the
  shape alphabet. Everything runs locally with `npm install && npm run dev`; no backend.
- **Tooling note** — figure rasterisation uses Poppler's `pdftoppm`; the PDF skeleton was read
  with `pdfjs-dist`; screenshots use Playwright/Chromium (dev dependency only).

## Phase log

- **Phase 0 — skeleton** ✅
  - `data/toc.json` (298 nested outline nodes, 4 levels), `data/pages.json` (523 pages, raw
    text), `data/chapters.json` (11 chapters + appendix with page spans + heading counts).
- **Cleanup + figures** ✅
  - `data/pages.clean.json` — stripped control chars + 26 running-header/footer variants +
    bare page-number bleed. Original `pages.json` left untouched.
  - `data/figures/` — 104 page PNGs at 150 DPI for every page holding a `Figure N.M` caption
    or reference; `data/figures.json` maps 110 figure ids → page → caption → image.
  - *Known minor issue:* a few figure ids (e.g. 1.4) captured an in-text reference line as the
    "caption" because the reference appears before the real caption. The image still points at
    the right page; will refine caption selection if it matters during redraw.
- **Phase 1 — design system** ✅
  - Tailwind tokens + 3 fonts; 10 shape-alphabet components; `Canvas`/`ShapeTile` helpers;
    `SHAPE_REGISTRY`; `/legend` route; `STYLE.md`.
  - Self-critique fix: ModelGlyph edges were too faint and read as a dot grid (clashing with
    Vector DB). Reworked to a 3‑2‑3 hourglass with visible accent edges. Verified on desktop
    + mobile screenshots.

- **Visual pivot — dark → LIGHT + brand layer** ✅
  - Killed dark mode entirely (no toggle). New warm light theme: `paper #FBFAF6`, white cards,
    soft shadows, ~16px radius, faint warm dot grid. Dialled down mono/ALL-CAPS (mono now reserved
    for page-number chips). Re-tuned stage colours for legibility on white (teal/green/amber/coral/
    violet). Updated `tailwind.config.js`, `src/theme.ts`, `src/index.css`; `THEME.panel`/`hairline`
    kept as light aliases so glyph code didn't need rewiring.
  - **Brand identity layer** added: `src/brand/{icons.ts, registry.ts, BrandIcon.tsx}`. Installed
    `simple-icons` (v16.23, 3442 icons). `BrandIcon` renders the official SVG path in the official
    hex; tools missing from simple-icons get a brand-colour name-pill. Legibility guard tints pale
    logos (HF yellow, LangChain blue) and darkens their labels (`isPale` threshold 0.45).
  - `TOOL_REGISTRY` seeded with the book's stack (21 tools): **14 resolve to real logos**, **7 use
    fallback pills** (Poe the Poet, ZenML, Comet ML, Opik, AWS, AWS SageMaker, OpenAI — none in
    simple-icons; note the `poe` slug is Quora's Poe, a *different* product, so deliberately unused).
  - Rebuilt `/legend`: light shapes + a "Real tools" section showing 12 tools. Verified desktop +
    mobile; type-check clean. Self-critique fix: lowered pale-guard threshold so LangChain's label
    reads clearly.

## Audit fixes — Phase 3 (trust) ✅ (comprehension-focused per owner)

- **Interview answers verified against the book.** Cross-checked all **75** answers against the cited
  page's clean text. **74 were accurate**; fixed **1** (`q11-megapipeline`) which asserted an
  unverifiable reason ("ZenML 3-pipeline free-trial cap") → reworded to the page-supported reasoning.
  Note: `q7-judge-bias` lists the book's canonical position/length/family biases (taught Ch5 p216 /
  Ch6 p266); the Ch7 cited page also flags verbosity/consistency — substantively correct, kept.
  Also noted: the book itself is inconsistent on the eval criteria (p305 "accuracy + style" vs p316
  summary "relevance/coherence/conciseness") — each of our items/diagrams matches its own page.
- Owner re-scoped Phase 3 to comprehension only: **copyright dropped per owner**; dev-hygiene items
  (formal test runner, README) consciously deferred as they don't serve understanding the book.

## Audit fixes — Phase 2 (reader features) ✅ (core)

- **Full-text search** — `Search.tsx` now scans the full `pages.clean.json` text (snippet + highlight,
  tagged "Book text"), the glossary (shown in a top block), plus the existing diagram/section index.
  Any word in the book is now findable. (e.g. "PagedAttention" → glossary + diagrams + p327/p344 text.)
- **Resume last page** — `Read.tsx` saves `vb-last-page` in localStorage; `/` and the catch-all now
  resume there (default 30) via a `Resume` redirect in `main.tsx`.
- **/glossary** — browsable, filterable list of all 73 terms + defs, each linking to its first focus page.
- **/marks** — one place for all bookmarks / notes / highlights across the book, each linking back;
  per-item remove; Export. Sidebar nav: Read · Search · Glossary · Marks · Build · Quiz · Map · Legend.
- **Concept-chip coverage** — `concepts.ts` now matches glossary terms against each page's clean text
  too (not just the caption). Zero-chip diagram pages dropped **108 → 27** of 453. Cross-link target
  lists stay focused (diagram-metadata pages; text pages as fallback).
- **Quiz scoring/review** — `Quiz.tsx` adds a score bar + "N got it / N revisit / rated" line, a
  "review revisit only" filter, and a per-set "reset" (`resetQuiz` in annotations.ts).
- Deferred (lower-priority 2f): ⌘K palette, multi-level image zoom/pan, printed page numbers, navigable Index.

## Audit fixes — Phase 1 (diagram correctness) ✅

- **Grey-box / tool-as-text triage.** A line-level scan found **19** cases (the earlier "~32" was a
  looser heuristic). Most are legitimate **prose** ("tested on Python 3.11.8", "spun up via Docker",
  "alternatives: Scrapy · Crawl4AI", "GPT-4o returns…") and are left per the rule. **3 genuine
  node-as-text cases fixed:**
  - p158 (Ch4): Qdrant was a generic `VectorDBGlyph` + text label → now a `BrandNode` (matches Ch1).
  - p163 (Ch4): the LLM-Twin quadrant pill "Python · LangChain · SBERT" → Python + LangChain
    `BrandNode`s (+ "SBERT · Unstructured" sub), matching the other quadrants' logos.
  - p341 (Ch8): GPTQ / EXL2 `LabelBox`es → `BrandNode` brand pills (alongside ExLlamaV2).
- **Missing content pages authored** (were skipped as if non-content): **p125** (Ch3 summary recap),
  **p316** (Ch7 eval recap), **p380** (Ch9 Superlinked), **p488** (Ch11 end-to-end wrap). **p344 left
  skipped** — one bridging sentence + a References list (references-dominated). Coverage is now
  453 diagrams.
- **Visual sweep (representative, NOT exhaustive).** Eyeballed ~17 pages spanning all 12 chapters
  (p30/41/42/61/125/158/163/242/278/316/341/380/398/446/491/494/499/500). Shape language is
  consistent, ModelGlyph vs VectorDBGlyph stay distinct, named tools use BrandNode, redraws match
  the figures, no overlaps. Caveat: all 449→453 were not individually re-reviewed this pass.

## Split-view reader (headline feature) ✅

- **Page images** — `node scripts/render-pages.mjs` rendered all **523** pages to
  `data/page-images/p{n}.png` (150 DPI). Symlinked into `public/page-images` (served by Vite/dir
  build) and `page-images/` at repo root (so the double-click `Visual-Book.html` Original view
  works too). Single-file build does **not** inline PNGs — it always ships the full clean text and
  links images if the folder is present.
- **`/#/read/:page`** (`src/routes/Read.tsx`) — two synced panes, now the default landing route
  (`/` → `/read/30`). LEFT = the exact page with a toggle: **Original** (the rendered page image,
  click to zoom) or **Clean text** (the full verbatim `pages.clean.json` text, reflowed — wrapped
  lines joined, end-of-line hyphenation repaired, paragraphs split on bullets/short lines; figure
  PNGs spliced inline). Zero words dropped; the image is the lossless guarantee. RIGHT = the page's
  diagram via `DiagramCard`, or a calm "Diagram coming for this page" placeholder (never hides the
  page). Prev/Next + ←/→ keys move both panes; deep-linkable; mobile gets a Page/Diagram segmented
  toggle. Every page 1–523 is reachable.
- **Sidebar** rebuilt (`src/components/Sidebar.tsx`) to the **whole book**: every `chapters.json`
  section is a collapsible, stage-coloured group with a page-weight bar; numbered chapters expand
  to their TOC sections (→ `/read/{startPage}`); the group containing the current page auto-opens.
  Front/back matter + Appendix included. Top nav: Read · Map · Legend.
- `book.ts` gained `PAGES_CLEAN`/`FIGURES`, `cleanTextForPage`, `figuresForPage`, `pageImage`,
  `sectionForPage`, `chapterForPage`, `accentForPage`, `TOTAL_PAGES`. `pages.clean.json` +
  `figures.json` copied into `src/data/`. `Chapter`/`Page` routes de-hardcoded from Ch.1.
- *Build gotcha fixed:* `@rollup/rollup-darwin-arm64` was an empty dir (npm optional-dep bug) →
  `npm install @rollup/rollup-darwin-arm64 --no-save` restored the native binary.

## Search + whole-book map + progress ✅ (final features)

- **Search** (`src/routes/Search.tsx`, `/#/search`) — indexes every authored diagram (title, caption,
  archetype, section) + every TOC section title. Live filtering, match highlighting, a per-chapter
  ownership breakdown ("in Ch4 (3), Ch8 (4)…"), and each result deep-links to `/read/:page`.
- **Whole-book map** (`src/routes/Map.tsx`, `/#/map`) — a custom zoomable/pannable SVG radial graph:
  the book hub at centre, 12 stage-coloured chapter hubs on an inner ring, all 449 diagrams as leaves
  radiating outward. Drag to pan, scroll to zoom, hover for a title tooltip, click a leaf → `/read/:page`,
  click a hub → that chapter's first page. Stage legend + reset in the toolbar. (Custom SVG instead of a
  force-directed lib to keep the single-file build light and dependency-free.)
- **"You are here" progress** — a thin stage-coloured bar in the reader toolbar showing page/523.
- Sidebar top nav now: Read · Search · Map · Legend. All wired in `main.tsx`.

## Per-chapter diagram log (Phase 2)

- **Appendix — MLOps Principles (pp. 490–503)** ✅ (14 diagrams) — **all 12 chapters now complete (449 diagrams)**
  - `src/diagrams/chapter12.tsx` (exported as `CHAPTER12`, registered `DIAGRAMS_BY_CHAPTER[12]`), Operations
    violet. The six principles: automation (manual→CT→CI/CD), versioning, experiment tracking + testing,
    monitoring (logs/metrics/drift), reproducibility. Figures A.1 (CI/CD/CT on FTI) and A.2 (test pyramid)
    redrawn; data-drift + concept-drift drawn as distribution shifts. No new tools.
  - Note: the Appendix has `chapterNumber: null` in chapters.json, so it shows in the reader via
    `diagramForPage` (per-page) but the sidebar lists it as a matter section, not a numbered chapter.
  - `tsc` + build clean; screenshotted pp.491/494/499 — violet stage correct, faithful.

- **Chapter 11 — MLOps and LLMOps (pp. 430–487)** ✅ (58 diagrams — 2nd-largest chapter)
  - `src/diagrams/chapter11.tsx`, **Operations violet** (first violet chapter — final stage). DevOps→MLOps
    →LLMOps theory, deploying ZenML pipelines to AWS, and adding GitHub Actions CI/CD, ZenML CT+alerting,
    Opik prompt monitoring.
  - Figures redrawn: **11.1** DevOps lifecycle (cycle), **11.2** code/data/model triangle, **11.3** DS/MLE/
    MLOps roles, **11.4** trace, **11.5** infra flow, **11.14** CI/CD flow, **11.19** CT pipeline chain,
    **11.20** mega-pipeline anti-pattern, **11.21** monitor-in-business-microservice, plus dashboard shots
    redrawn as concepts. Heavy code-anatomy for the Dockerfile/CI/CD YAML/Opik pages.
  - **`TOOL_REGISTRY`** + Ch.11 tools: Ruff, gitleaks, Pytest, GitLab, CircleCI, Jenkins, DVC, Discord,
    Slack, GitHub Copilot, AWS CloudFormation, Tecton, Featureform, Hopsworks, Qwak (ZenML/GitHub Actions/
    Terraform/Opik/Comet/MongoDB/Qdrant/AWS already present). Registered `DIAGRAMS_BY_CHAPTER[11]`.
  - `tsc` + build clean; screenshotted pp.433/446/464/476 — figures faithful, violet correct.

- **Chapter 10 — Inference Pipeline Deployment (pp. 384–428)** ✅ (45 diagrams)
  - `src/diagrams/chapter10.tsx`, Inference coral (last coral chapter). Deployment criteria, the three
    inference architectures, monolith vs microservices, the LLM Twin SageMaker + FastAPI split, the
    SageMaker deployment code, and autoscaling.
  - Figures redrawn: **10.1** three deployment types, **10.2** monolith vs microservices, **10.3**
    independent scaling, **10.4** LLM Twin microservice deployment, **10.5** SageMaker deploy steps,
    **10.8** autoscaling (ALB + replicas). Many code-anatomy pages for the deploy/inference classes.
  - **`TOOL_REGISTRY`** + Ch.10 tools: Terraform, AWS CloudWatch, BentoML, uvicorn (FastAPI/Docker/
    SageMaker/HF/Comet/AWS ECR/EKS/ECS/bitsandbytes/TGI already present). Registered `DIAGRAMS_BY_CHAPTER[10]`.
  - `tsc` + build clean; screenshotted pp.389/398/405/424 — figures faithful, coral correct.

- **Chapter 9 — RAG Inference Pipeline (pp. 346–379)** ✅ (34 diagrams)
  - `src/diagrams/chapter9.tsx`, Inference coral. The advanced-RAG retrieval module: query expansion +
    self-querying (pre), filtered vector search (retrieval), reranking (post), wired into ContextRetriever
    and an end-to-end rag() flow calling the SageMaker LLM.
  - Figures redrawn: **9.1** full inference architecture, **9.2** ContextRetriever search logic, **9.3**
    process-results flow (aggregate→dedup→rerank→top K), **9.4** routing + conversation memory.
  - **`TOOL_REGISTRY`** + Ch.9 tools: LlamaIndex, Haystack (OpenAI/Qdrant/Sentence Transformers/AWS
    SageMaker/Superlinked/LangChain already present). Registered `DIAGRAMS_BY_CHAPTER[9]`.
  - `tsc` + build clean; screenshotted pp.348/354/368/370 — figures faithful, coral stage correct.

- **Chapter 8 — Inference Optimization (pp. 318–343)** ✅ (26 diagrams)
  - `src/diagrams/chapter8.tsx`, **Inference coral** (first coral chapter — stage 4 of 5). Generation
    optimizations, model parallelism, and quantization. Added a local `GPU` box helper for parallelism.
  - Figures redrawn: **8.1** decoder inference, **8.2** KV cache, **8.3** speculative decoding, **8.4**
    data parallelism, **8.5** pipeline parallelism, **8.6** micro-batching, **8.7** tensor parallelism,
    **8.8** combining, **8.9** FP32/FP16/BF16 bit layouts, **8.10/8.11** absmax/zero-point + outliers.
  - **`TOOL_REGISTRY`** + Ch.8 tools: TensorRT-LLM, NVIDIA, llama.cpp, GPTQ, EXL2, ExLlamaV2, PyTorch,
    DeepSpeed, Megatron-LM, LM Studio, bitsandbytes, Qwen, AWQ, Beam. FlashAttention/PagedAttention/GGUF
    are techniques/formats → drawn as labels/pills.
  - Registered `DIAGRAMS_BY_CHAPTER[8]`. `tsc` + build clean; screenshotted pp.324/328/332/334 — faithful.

- **Chapter 7 — Evaluating LLMs (pp. 290–315)** ✅ (26 diagrams)
  - `src/diagrams/chapter7.tsx`, Training amber (last amber chapter). Model evaluation (general/domain/
    task benchmarks), RAG evaluation, and a hands-on TwinLlama eval with a GPT-4o-mini judge.
  - Figures redrawn: **7.1** Ragas four metrics (faithfulness/answer-relevancy/context-precision/recall
    among Question/Answer/Context/Ground-truth), **7.2** ARES three stages. Final results page is a small
    bar chart comparing SFT/DPO/Instruct on accuracy vs style.
  - **`TOOL_REGISTRY`** + Ch.7 tools: vLLM, Ragas, ARES, lm-eval-harness, lighteval. Benchmark names
    (MMLU, HellaSwag, IFEval, …) are concepts → rendered as stage pills, not brand nodes.
  - Registered `DIAGRAMS_BY_CHAPTER[7]`. `tsc` + build clean; screenshotted pp.302/304/315 — faithful.

- **Chapter 6 — Fine-Tuning with Preference Alignment (pp. 258–286)** ✅ (29 diagrams)
  - `src/diagrams/chapter6.tsx`, Training amber. Preference datasets (chosen vs rejected triples),
    generation + evaluation, RLHF/PPO vs DPO, and a DPO fine-tune of TwinLlama with Unsloth.
  - Figures redrawn: **6.1** shared data pipeline, **6.2** preference-data pipeline, **6.4** PPO (frozen
    + trained models, KL divergence, reward model → update weights), **6.5** DPO (simplified, no reward
    model), **6.6** DPO reward/margin metrics. RLHF drawn as a cycle; gen×eval as a 2×2 matrix.
  - No new tools (reused GPT-4o, Hugging Face, Comet, Meta Llama, TRL, Unsloth). Registered
    `DIAGRAMS_BY_CHAPTER[6]`. `tsc` + build clean; screenshotted pp.260/262/276/278 — PPO/DPO faithful.

- **Chapter 5 — Supervised Fine-Tuning (pp. 206–255)** ✅ (50 diagrams)
  - `src/diagrams/chapter5.tsx`, **Training amber** (first amber chapter — stage 3 of 5). Instruction-
    dataset construction → SFT techniques → training params → a practical Unsloth fine-tune.
  - Figures redrawn: **5.1** post-training data pipeline, **5.6** synthetic-data pipeline, **5.8** when-to-
    fine-tune flowchart (cycle/decision), **5.9** full/LoRA/QLoRA at module level, **5.10** LoRA W + B·A,
    **5.11** the three monitored metrics. Plus formula-as-blocks for full-FT memory (16 B/param), effective
    batch size, and LoRA hyperparameters.
  - **`TOOL_REGISTRY`** + Ch.5 tools: Argilla, Nomic Atlas, RunPod, TGI, TRL, Axolotl, Outlines, Google
    Colab, Lambda Labs, spaCy, NumPy, pandas, Jinja, Gemma, GPT-4o (Unsloth/HF/Meta Llama/Comet present).
  - Registered `DIAGRAMS_BY_CHAPTER[5]`. `tsc` + `npm run build` clean; screenshotted pp.207/236/240/242/
    246/249 — figures faithful, amber stage correct, shapes consistent (ModelGlyph for LLM/reward models,
    SnapshotGlyph for datasets/pairs, DecisionGlyph for routers/factories), every tool a logo or brand pill.

- **Chapter 4 — RAG Feature Pipeline (pp. 128–202)** ✅ (largest chapter — 75 diagrams)
  - **75 page diagrams** (pp.128–202; pp.203–205 are References, skipped). `src/diagrams/chapter4.tsx`,
    Feature/Data green. Covers RAG theory → advanced RAG → the LLM Twin batch feature pipeline.
  - Figures redrawn: **4.1** vanilla RAG architecture, **4.4** CNN image embedding, **4.5** advanced-RAG
    three stages, **4.6** query routing, **4.7** bi-encoder vs cross-encoder, **4.8** re-ranking, **4.9**
    batch RAG feature pipeline, **4.10** batch/stream × small/big quadrant, **4.12** ZenML DAG, **4.13–4.15**
    step metadata, **4.16** VectorBaseDocument entity tree, **4.17** nine-handler family tree.
  - Shape reuse held: VectorDBGlyph = Qdrant/vector DB, ModelGlyph = LLM/encoders, SnapshotGlyph =
    artifacts/chunks, DecisionGlyph = routers/factories/dispatchers, DataStoreGlyph = SQL/warehouse.
    Heavy use of code-anatomy (the `Code` helper) for the OVM/handler/Settings code pages.
  - **`TOOL_REGISTRY`** + Ch.4 tools: Apache Kafka, Apache Flink, Redpanda, RabbitMQ, Bytewax,
    Sentence Transformers, Unstructured, FAISS, LangFuse, CLIP (MongoDB/Qdrant/ZenML/HF/LangChain/
    Pydantic already present). Caught + fixed a grey-box: CLIP wasn’t registered → added a brand pill.
  - Registered `DIAGRAMS_BY_CHAPTER[4]`. `tsc` + `npm run build` clean; screenshotted pp.132/147/154/
    158/163/180/181/192 and self-critiqued — figures faithful, shapes consistent with Ch.1–3, no grey boxes.

- **Chapter 3 — Data Engineering (pp. 84–124)** ✅
  - **41 page diagrams** (pp.84–124; pp.125–127 are References, skipped). `src/diagrams/chapter3.tsx`,
    Feature/Data **green**. The data-collection ETL end to end: crawl → standardize → MongoDB, via
    ZenML, a dispatcher, a crawler class hierarchy, and a hand-rolled ODM.
  - Figures redrawn as schematics: **3.1** ETL architecture (user+links → crawl → MongoDB), **3.2**
    sources→crawlers→categories→warehouse (4 crawlers, 3 doc types), **3.3** get_or_create_user step,
    **3.4** the CrawlerDispatcher routing by domain, **3.5** user artifact metadata, **3.6**
    crawled_links per-domain metadata, **3.7** the Selenium troubleshooting fallback (pitfall).
  - Archetypes used across all 10: pipeline-flow, architecture, code-anatomy (the `Code` helper),
    hierarchy (BaseCrawler tree, Document subclasses), cycle (scroll_page loop), comparison
    (ORM vs ODM, 3 crawl techniques), single-concept, list-cluster (radial CRUD methods), pitfall.
  - **`TOOL_REGISTRY`** + Ch.3 tools: Google Chrome, BeautifulSoup, Scrapy, Crawl4AI, SQLAlchemy,
    SQLModel, mongoengine, MySQL, SQLite, Snowflake, Google BigQuery, Pulumi (Selenium/FastAPI/
    Pydantic/LangChain already present). simple-icons resolves most; BeautifulSoup, Crawl4AI,
    SQLModel, mongoengine use brand pills.
  - Registered `DIAGRAMS_BY_CHAPTER[3]`. `tsc` + build clean; screenshotted pp.87/95/98/101/115/124,
    self-critiqued: shape language consistent with Ch.1–2, figures faithful, every tool a logo/pill.

- **Chapter 2 — Tooling and Installation (pp. 54–81)** ✅
  - **28 page diagrams** (pp.54–81; pp.82–83 are References + the "Join our Discord" page, skipped).
    `src/diagrams/chapter2.tsx`, Foundations teal (same stage as Ch.1). One bespoke diagram per
    content page, no generic boxes.
  - Figures redrawn as clean schematics (never the bitmap — they're dashboard screenshots, so each
    is redrawn as its *meaning*): **2.1** HF model registry (versioned models → Unsloth/SageMaker),
    **2.2/2.3** the digital_data_etl pipeline, **2.4** the run as a DAG (get_or_create_user →
    crawl_links → crawled_links artifact), **2.5** @step anatomy, **2.6** repo folder tree,
    **2.7/2.8** artifact + metadata, **2.9** dataset metadata in code, **2.10** one pipeline / many
    configs, **2.11/2.12** experiment tracker, **2.13** IAM user + access key.
  - Archetypes: list-cluster, single-concept, pipeline-flow, comparison, architecture, hierarchy,
    code-anatomy (new local `Code` helper in the chapter file for annotated snippets).
  - **`TOOL_REGISTRY` expanded** (Ch.2 stack + alternatives): pyenv, uv, Pipenv, Conda, Comet,
    Unsloth, Superlinked, Apache Airflow, Prefect, Metaflow, Dagster, Kubeflow, Argo Workflows,
    Kubernetes, W&B, MLflow, Neptune, Langfuse, LangSmith, Galileo, Milvus, Redis, Weaviate,
    Pinecone, Chroma, pgvector(→PostgreSQL), AWS Bedrock/S3/ECR/EC2/EKS/ECS, Google Cloud, Vertex
    AI, Azure. Resolved via simple-icons where present (Airflow, Prefect, MLflow, Redis, Milvus,
    Kubernetes, Neptune, W&B, Conda, uv, PostgreSQL, Google Cloud); the rest are brand-colour pills.
  - Registered in `src/book.ts` (`DIAGRAMS_BY_CHAPTER[2]`). `tsc` + `vite build` clean. Screenshotted
    pp.57/61/64/67/76/80/81 in the reader and self-critiqued: shape language consistent with Ch.1,
    models vs vector DBs distinct, all named tools carry a logo or brand pill, figures faithful.

- **Chapter 1 — Understanding the LLM Twin (pp. 30–53)** ✅ (first chapter)
  - **23 page diagrams** authored, pages 30–52 (p53 is the references list — skipped). One bespoke
    diagram per content page in `src/diagrams/chapter1.tsx`; no generic unlabeled boxes.
  - Figures redrawn faithfully as clean schematics (no bitmaps): **1.1** (ML-code-is-a-small-piece
    cluster, p38), **1.2** (monolithic batch pitfall, p39), **1.3** (real-time whole-state pitfall,
    p40), **1.5** (FTI architecture, p42), **1.6** (whole LLM Twin system, p47).
  - Architecture figures use **real tool logos as nodes**: GitHub, MongoDB, Qdrant, Comet ML,
    AWS SageMaker, FastAPI, Opik, plus OpenAI/Mistral/Meta Llama on the model-agnostic page.
  - Archetypes used: single-concept, list-cluster, comparison, formula-as-blocks, pipeline-flow,
    pitfall, architecture, hierarchy. Each page has term eyebrow + title + caption + Foundations
    teal accent + page number.
  - New infra: `src/diagrams/parts.tsx` (SVG composition helpers incl. SVG-native `BrandNode`),
    `src/diagrams/types.ts` (PageDiagram type + archetypes), `src/book.ts` (TOC + diagram registry).
  - Reader UI: `/chapter/:n` (scroll), `/page/:n` (big view + Prev/Next + ← / → keys), stage-coloured
    sidebar (sections → pages, page-weight bar), `/legend` wired in. `Canvas` made responsive.
  - Verified: `tsc` clean, `vite build` clean, `npm run dev` boots with no errors, `/chapter/1` and
    `/legend` return HTTP 200. Screenshotted desktop + mobile + 3 page views (FTI, full system, vs ChatGPT).
