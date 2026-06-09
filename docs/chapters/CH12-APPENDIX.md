# Appendix — brief for Claude Code

> Appendix: MLOps Principles

- **Stage:** Operations (accent `#7B61E8`) — use `stageForChapter(12)` / `accentForChapter(12)`.
- **PDF pages:** 490–503  (**14 pages**, 16 headings)
- **Target:** one bespoke diagram per *content* page. Skip pure dividers, the references list, and the "Join our Discord" page.
- **Output file:** `src/diagrams/chapter12.tsx` exporting `const CHAPTER12: PageDiagram[]`, then register it in `src/book.ts`.

## Figures to redraw faithfully (schematic, NOT bitmap)

_None detected in this chapter._

## Named tools introduced here (add to `TOOL_REGISTRY` with real logos)

`Python`, `ZenML`, `Comet ML`, `Comet`, `AWS`, `GitHub`

For each: try its `simple-icons` slug first; if missing, add a fallback pill with the vendor's brand colour (see DESIGN-SYSTEM.md). Specific products = real logos; generic ideas = shape alphabet.

## Sections (from the book's real outline)

- p.490 — 1. Automation or operationalization
- p.492 — 2. Versioning
- p.493 — 3. Experiment tracking
- p.493 — 4. Testing
  - p.493 — Test types
  - p.494 — What do we test?
  - p.494 — Test examples
- p.497 — 5. Monitoring
  - p.497 — Logs
  - p.497 — Metrics
    - p.498 — System metrics
    - p.498 — Model metrics
    - p.498 — Drifts
    - p.501 — Monitoring vs. observability
    - p.502 — Alerts
- p.502 — 6. Reproducibility

## Per-page worksheet (fill archetype + concept, then build the diagram)

Read the **full** cleaned text of each page in `data/pages.clean.json` before drawing — the excerpt below is only a hint. Pick ONE archetype per page from: single-concept · pipeline-flow · architecture · comparison · list-cluster · cycle · hierarchy · code-anatomy · formula-as-blocks · pitfall. No generic unlabeled boxes.

| Page | Section | Archetype (you fill) | First line of the real text (hint) |
|---|---|---|---|
| 490 |  1. Automation or operationalization | _____ | MLOps Principles Building robust and scalable ML systems requires more than creating powerful models. It demands an all-encompassing approach to opera |
| 491 |  1. Automation or operationalization | _____ | • CI/CD: In the final stage, you implement your CI/CD pipelines to enable fast and reliable deployment of your ML code into production. The key advanc |
| 492 |  2. Versioning | _____ | To conclude, CT automates the FTI pipelines, while CI/CD builds, tests, and pushes new versions of the FTI pipeline code to production. 2. Versioning  |
| 493 |  Test types | _____ | 3. Experiment tracking Training ML models is an entirely iterative and experimental process. Unlike traditional software development, it involves runn |
| 494 |  Test examples | _____ | • Stress tests: These tests evaluate the system’s performance and stability under extreme conditions, such as high load or limited resources. They aim |
| 495 |  Test examples | _____ | Also, you can look at your chunking algorithm and assert that it works properly by using various sentences and chunk sizes. When we talk about data te |
| 496 |  Test examples | _____ | • Invariance: Changes in your input should not affect the output—for example, below is an example based on synonym injection: model(text="The advancem |
| 497 |  Metrics | _____ | 5. Monitoring Monitoring is vital for any ML system that reaches production. Traditional software systems are rule-based and deterministic. Thus, once |
| 498 |  Drifts | _____ | System metrics The system metrics are based on monitoring service-level metrics (latency, throughput, error rates) and infrastructure health (CPU/GPU, |
| 499 |  Drifts | _____ | Data drift Data drift, also called feature drift or covariate shift, occurs when the distribution of the produc- tion data deviates from that of the t |
| 500 |  Drifts | _____ | Concept drift In addition to changes in input and output data, their relationship can also shift. This phenom- enon, known as concept drift, makes our |
| 501 |  Monitoring vs. observability | _____ | How to detect and measure drifts Now that we’ve recognized the various types of drift, it’s crucial to understand how to detect and measure it. To do  |
| 502 |  6. Reproducibility | _____ | On the other hand, a system is considered observable if it generates meaningful data about its internal state, which is essential for diagnosing root  |
| 503 |  6. Reproducibility | _____ | The second aspect is based on the non-deterministic nature of ML processes. For example, when training a model from scratch, all the weights are initi |

## Done when

- Every content page in 490–503 has a non-generic diagram with term eyebrow + plain title + 1–2 sentence caption (real terminology) + Operations accent + page number.
- All figures above are redrawn as clean schematics (no bitmaps); architecture figures use real tool logos as nodes.
- `CHAPTER12` is registered in `src/book.ts` and shows in the sidebar + reader.
- `npx tsc -b` and `npm run build` are clean; you screenshot the chapter and self-critique for shape consistency before moving on.
