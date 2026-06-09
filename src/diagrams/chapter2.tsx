// Chapter 2 — Tooling and Installation (pp. 54–81). One bespoke diagram per
// content page, composed from the shape alphabet + real tool logos. Stage =
// Foundations (teal, same as Ch.1). Figures 2.1–2.13 are dashboard screenshots;
// each is redrawn as a clean schematic of its MEANING (registry, DAG, artifact,
// metadata, metrics, IAM), never the bitmap. pp.82–83 are References + Discord
// (non-content) and are intentionally skipped.
import React from "react";
import {
  Canvas,
  ModelGlyph,
  DataStoreGlyph,
  VectorDBGlyph,
  PipelineGlyph,
  DocumentGlyph,
  UserGlyph,
  DecisionGlyph,
  SnapshotGlyph,
} from "../shapes";
import { Arrow, Label, BrandNode, Pill, LabelBox, Boundary, Warn } from "./parts";
import { STAGES } from "../theme";
import type { PageDiagram } from "./types";

const A = STAGES.foundations.accent; // teal
const MONO = "'IBM Plex Mono', monospace";

const Frame: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => (
  <Canvas width={w} height={h}>{children}</Canvas>
);

// A small monospace code surface for code-anatomy pages.
const Code: React.FC<{ x: number; y: number; w: number; lines: { t: string; hi?: boolean }[]; size?: number }> = ({
  x,
  y,
  w,
  lines,
  size = 12,
}) => {
  const lh = size + 7;
  const h = lines.length * lh + 18;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="#FFFFFF" stroke="#ECE8DF" strokeWidth={1.5} />
      {lines.map((l, i) => (
        <text
          key={i}
          x={x + 14}
          y={y + 16 + i * lh}
          fontFamily={MONO}
          fontSize={size}
          fill={l.hi ? A : "#25313C"}
          fontWeight={l.hi ? 700 : 500}
        >
          {l.t}
        </text>
      ))}
    </g>
  );
};

export const CHAPTER2: PageDiagram[] = [
  /* ---------------- p54 — chapter roadmap ---------------- */
  {
    page: 54, chapter: 2, stage: "foundations", accent: A, archetype: "list-cluster",
    section: "Chapter 2: Tooling and Installation",
    term: "TECH STACK", title: "The four pillars of the stack",
    caption:
      "The chapter walks the whole tech stack in four blocks: the Python ecosystem, the MLOps/LLMOps tools, the databases, and AWS — all runnable locally with Docker.",
    diagram: (
      <Frame w={720} h={300}>
        <LabelBox x={40} y={115} w={170} h={70} text="Chapter 2" sub="the tooling tour" accent={A} strong />
        {["Python ecosystem", "MLOps / LLMOps tools", "Databases (NoSQL + vector)", "Preparing for AWS"].map((t, i) => (
          <g key={i}>
            <Pill x={350} y={26 + i * 62} text={t} accent={A} w={300} />
            <Arrow x1={212} y1={150} x2={346} y2={41 + i * 62} accent={A} animated={i === 0} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* ---------------- p55 — three fundamental Python tools ---------------- */
  {
    page: 55, chapter: 2, stage: "foundations", accent: A, archetype: "list-cluster",
    section: "Python ecosystem and project installation",
    term: "PYTHON BASICS", title: "Every Python project needs three tools",
    caption:
      "Any Python project rests on three fundamentals: an interpreter (managed with pyenv), a dependency manager (Poetry), and a task-execution tool (Poe the Poet).",
    diagram: (
      <Frame w={720} h={250}>
        {[
          ["pyenv", "interpreter · versions", 30],
          ["Poetry", "dependencies + venv", 270],
          ["Poe the Poet", "task execution", 510],
        ].map(([n, sub, x], i) => (
          <g key={i}>
            <BrandNode x={x as number} y={70} name={n as string} sub={sub as string} w={185} />
            <Label x={(x as number) + 92} y={150} size={11} color="#5E6B76">{`#${i + 1}`}</Label>
            {i < 2 && <Label x={(x as number) + 210} y={95} size={20} color="#97A0A8">+</Label>}
          </g>
        ))}
        <Label x={360} y={200} size={12.5} weight={600} color={A}>tested on Python 3.11.8</Label>
      </Frame>
    ),
  },
  /* ---------------- p56 — pyenv picks the version ---------------- */
  {
    page: 56, chapter: 2, stage: "foundations", accent: A, archetype: "single-concept",
    section: "Poetry: dependency and virtual environment management",
    term: "PYENV", title: "One Python version per project",
    caption:
      "pyenv manages multiple Python versions; a .python-version file in the repo makes pyenv select 3.11.8 locally whenever you work inside that folder.",
    diagram: (
      <Frame w={720} h={260}>
        <BrandNode x={30} y={100} name="pyenv" sub="version manager" w={170} />
        <DecisionGlyph x={250} y={70} w={110} h={110} accent={A} mark="↳" />
        <Label x={305} y={196} size={11} color="#5E6B76">.python-version</Label>
        {["3.10", "3.11.8 ✓", "3.12"].map((t, i) => (
          <g key={i}>
            <Pill x={450} y={40 + i * 62} text={t} accent={A} w={150} />
            <Arrow x1={362} y1={125} x2={446} y2={55 + i * 62} accent={A} animated={i === 1} />
          </g>
        ))}
        <Arrow x1={202} y1={125} x2={248} y2={125} accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p57 — Poetry: lockfile + venv ---------------- */
  {
    page: 57, chapter: 2, stage: "foundations", accent: A, archetype: "pipeline-flow",
    section: "Poetry: dependency and virtual environment management",
    term: "POETRY", title: "Pin, lock, isolate",
    caption:
      "Poetry reads pyproject.toml (version ranges), resolves it into a poetry.lock of exact versions, and installs everything into an isolated virtual environment — no “works on my machine”.",
    diagram: (
      <Frame w={740} h={250}>
        <DocumentGlyph x={20} y={55} w={120} h={110} accent={A} />
        <Label x={80} y={180} size={11.5} font={MONO}>pyproject.toml</Label>
        <BrandNode x={210} y={85} name="Poetry" sub="resolve" w={150} />
        <SnapshotGlyph x={400} y={50} w={170} h={70} accent={A} title="poetry.lock" usedFor="exact versions" />
        <PipelineGlyph x={420} y={140} w={150} h={70} accent={A} />
        <Label x={495} y={175} size={12} weight={600}>isolated venv</Label>
        <Arrow x1={142} y1={110} x2={206} y2={115} accent={A} />
        <Arrow x1={362} y1={105} x2={398} y2={90} accent={A} animated={false} />
        <Arrow x1={362} y1={120} x2={418} y2={170} accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p58 — Poetry vs alternatives ---------------- */
  {
    page: 58, chapter: 2, stage: "foundations", accent: A, archetype: "comparison",
    section: "Poe the Poet: task execution tool",
    term: "ALTERNATIVES", title: "Why Poetry over the rest",
    caption:
      "Venv and Conda isolate but don’t manage dependencies; Pipenv is similar to Poetry but slower; uv is a Rust-built, blazing-fast contender worth watching.",
    diagram: (
      <Frame w={720} h={290}>
        <BrandNode x={275} y={20} name="Poetry" sub="chosen" w={170} />
        {[
          ["Conda", "no dep mgmt", 20, 120],
          ["Pipenv", "slower", 200, 120],
          ["uv", "Rust · very fast", 380, 120],
        ].map(([n, sub, x, y], i) => (
          <BrandNode key={i} x={x as number} y={y as number} name={n as string} sub={sub as string} w={170} />
        ))}
        <Warn x={45} y={205} text="Venv / Conda: isolation only, no lockfile" />
        <Pill x={560} y={132} text="watch uv ↑" accent={A} w={140} />
      </Frame>
    ),
  },
  /* ---------------- p59 — Poe the Poet façade ---------------- */
  {
    page: 59, chapter: 2, stage: "foundations", accent: A, archetype: "single-concept",
    section: "MLOps and LLMOps tooling",
    term: "POE THE POET", title: "One façade over every CLI command",
    caption:
      "Poe the Poet sits on top of Poetry: long CLI commands are declared once in pyproject.toml and run by a short alias, acting as out-of-the-box documentation.",
    diagram: (
      <Frame w={720} h={280}>
        {["black .", "pytest", "python main.py", "run-digital-data-etl"].map((t, i) => (
          <g key={i}>
            <Label x={40} y={50 + i * 50} anchor="start" size={11.5} font={MONO} color="#5E6B76">{t}</Label>
          </g>
        ))}
        <BrandNode x={250} y={105} name="Poe the Poet" sub="task façade" w={200} />
        {["poe format", "poe test", "poe start"].map((t, i) => (
          <Pill key={i} x={520} y={60 + i * 56} text={t} accent={A} w={170} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <Arrow key={i} x1={240} y1={46 + i * 50} x2={248} y2={140} accent={A} animated={i === 0} />
        ))}
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={452} y1={135} x2={516} y2={75 + i * 56} accent={A} animated={false} />
        ))}
      </Frame>
    ),
  },
  /* ---------------- p60 — Hugging Face model registry (Fig 2.1) ---------------- */
  {
    page: 60, chapter: 2, stage: "foundations", accent: A, archetype: "architecture",
    section: "Hugging Face: model registry",
    term: "MODEL REGISTRY", title: "A single source of truth for models (Fig 2.1)",
    caption:
      "A model registry centrally stores models with version history, metadata, and metrics. The book uses Hugging Face so fine-tuned LLM Twin models integrate with Unsloth (fine-tune) and SageMaker (inference).",
    diagram: (
      <Frame w={740} h={300}>
        <Boundary x={30} y={40} w={300} h={210} title="Hugging Face registry" accent={A} />
        <BrandNode x={48} y={58} name="Hugging Face" w={160} />
        {["TwinLlama-3.1-8B", "TwinLlama-3.1-8B-DPO"].map((t, i) => (
          <g key={i}>
            <ModelGlyph x={50} y={116 + i * 58} w={50} h={50} accent={A} />
            <Label x={112} y={141 + i * 58} anchor="start" size={11} font={MONO}>{t}</Label>
          </g>
        ))}
        <Label x={180} y={238} size={11} color="#5E6B76">versioned · metadata · metrics</Label>
        <BrandNode x={420} y={80} name="Unsloth" sub="fine-tune" w={170} />
        <BrandNode x={420} y={170} name="AWS SageMaker" sub="inference" w={200} />
        <Arrow x1={332} y1={130} x2={416} y2={105} accent={A} animated={false} />
        <Arrow x1={332} y1={160} x2={416} y2={195} accent={A} animated={false} />
      </Frame>
    ),
  },
  /* ---------------- p61 — ZenML stack ---------------- */
  {
    page: 61, chapter: 2, stage: "foundations", accent: A, archetype: "architecture",
    section: "ZenML: orchestrator, artifacts, and metadata",
    term: "ZENML STACK", title: "The glue between ML and MLOps",
    caption:
      "ZenML bridges ML and MLOps with a “stack”: it abstracts the Python code from the infrastructure, so an orchestrator, remote storage, and a container registry can be swapped per cloud without vendor lock-in.",
    diagram: (
      <Frame w={740} h={300}>
        <BrandNode x={40} y={120} name="ZenML" sub="cloud-agnostic glue" w={180} />
        <Boundary x={300} y={30} w={400} h={240} title="A ZenML stack (AWS example)" accent={A} />
        <BrandNode x={320} y={60} name="AWS SageMaker" sub="orchestrator + compute" w={250} />
        <BrandNode x={320} y={130} name="AWS S3" sub="remote artifact storage" w={250} />
        <BrandNode x={320} y={200} name="AWS ECR" sub="container registry" w={250} />
        <Arrow x1={222} y1={145} x2={316} y2={85} accent={A} animated={false} />
        <Arrow x1={222} y1={150} x2={316} y2={155} accent={A} />
        <Arrow x1={222} y1={155} x2={316} y2={225} accent={A} animated={false} />
      </Frame>
    ),
  },
  /* ---------------- p62 — orchestrator + @pipeline/@step ---------------- */
  {
    page: 62, chapter: 2, stage: "foundations", accent: A, archetype: "code-anatomy",
    section: "Orchestrator",
    term: "ORCHESTRATOR", title: "@pipeline calls @step units",
    caption:
      "An orchestrator schedules and coordinates pipelines in the right order. In ZenML a function becomes a pipeline with @pipeline and a unit of work becomes a step with @step.",
    diagram: (
      <Frame w={740} h={250}>
        <Code
          x={30}
          y={40}
          w={400}
          lines={[
            { t: "from zenml import pipeline, step", hi: false },
            { t: "", hi: false },
            { t: "@pipeline", hi: true },
            { t: "def digital_data_etl(name, links):", hi: false },
            { t: "    user = get_or_create_user(name)", hi: false },
            { t: "    crawl_links(user, links)", hi: false },
          ]}
        />
        <Label x={470} y={60} anchor="start" size={11.5} weight={700} color={A}>@pipeline</Label>
        <Label x={470} y={78} anchor="start" size={11} color="#5E6B76">high-level workflow</Label>
        <PipelineGlyph x={470} y={95} w={230} h={64} accent={A} />
        <Label x={470} y={190} anchor="start" size={11.5} weight={700} color={A}>@step</Label>
        <Label x={470} y={208} anchor="start" size={11} color="#5E6B76">one modular unit · own machine</Label>
      </Frame>
    ),
  },
  /* ---------------- p63 — digital_data_etl pipeline (Fig 2.2) ---------------- */
  {
    page: 63, chapter: 2, stage: "foundations", accent: A, archetype: "pipeline-flow",
    section: "Orchestrator",
    term: "ETL PIPELINE", title: "The digital_data_etl pipeline (Fig 2.2)",
    caption:
      "The digital_data_etl pipeline gets or creates the user, then crawls the provided links. It runs with poe run-digital-data-etl and shows up in the ZenML dashboard with its run status and stack.",
    diagram: (
      <Frame w={740} h={230}>
        <UserGlyph x={20} y={55} w={100} h={100} accent={A} />
        <Label x={70} y={170} size={11.5} font={MONO}>user_full_name</Label>
        <PipelineGlyph x={190} y={60} w={180} h={90} accent={A} />
        <Label x={280} y={100} weight={700}>get_or_create_user</Label>
        <PipelineGlyph x={430} y={60} w={180} h={90} accent={A} />
        <Label x={520} y={100} weight={700}>crawl_links</Label>
        <Pill x={645} y={88} text="ZenML run" accent={A} w={80} />
        <Arrow x1={122} y1={105} x2={186} y2={105} accent={A} />
        <Arrow x1={372} y1={105} x2={426} y2={105} accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p64 — the run is a DAG (Fig 2.3 / 2.4) ---------------- */
  {
    page: 64, chapter: 2, stage: "foundations", accent: A, archetype: "architecture",
    section: "Orchestrator",
    term: "DAG", title: "A run is a directed acyclic graph (Fig 2.4)",
    caption:
      "Opening a pipeline run reveals its steps, outputs, and insights as a directed acyclic graph (DAG): get_or_create_user feeds crawl_links, which emits the crawled_links artifact.",
    diagram: (
      <Frame w={740} h={250}>
        <LabelBox x={40} y={95} w={180} h={60} text="get_or_create_user" accent={A} />
        <LabelBox x={290} y={95} w={150} h={60} text="crawl_links" accent={A} />
        <SnapshotGlyph x={520} y={90} w={190} h={70} accent={A} title="crawled_links" usedFor="artifact" />
        <Label x={130} y={185} size={11} color="#5E6B76">user</Label>
        <Arrow x1={220} y1={125} x2={288} y2={125} accent={A} />
        <Arrow x1={440} y1={125} x2={518} y2={125} accent={A} />
        <Label x={370} y={40} size={11.5} weight={600} color={A}>acyclic: data only flows forward →</Label>
      </Frame>
    ),
  },
  /* ---------------- p65 — defining a @step (Fig 2.5) ---------------- */
  {
    page: 65, chapter: 2, stage: "foundations", accent: A, archetype: "code-anatomy",
    section: "Orchestrator",
    term: "ZENML STEP", title: "A @step is a normal function",
    caption:
      "A ZenML step is an ordinary Python function decorated with @step; its Annotated return type names the output, which ZenML turns into a tracked artifact. The dashboard even aggregates each step’s logs.",
    diagram: (
      <Frame w={740} h={230}>
        <Code
          x={30}
          y={35}
          w={430}
          lines={[
            { t: "@step", hi: true },
            { t: "def get_or_create_user(", hi: false },
            { t: "    user_full_name: str", hi: false },
            { t: ") -> Annotated[UserDocument, \"user\"]:", hi: true },
            { t: "    ...", hi: false },
            { t: "    return user", hi: false },
          ]}
        />
        <Label x={500} y={55} anchor="start" size={11} color="#5E6B76">decorator → step</Label>
        <Label x={500} y={130} anchor="start" size={11} color="#5E6B76">named return →</Label>
        <SnapshotGlyph x={500} y={145} w={200} h={64} accent={A} title="user" usedFor="artifact" />
      </Frame>
    ),
  },
  /* ---------------- p66 — decouple logic from the orchestrator ---------------- */
  {
    page: 66, chapter: 2, stage: "foundations", accent: A, archetype: "architecture",
    section: "Orchestrator",
    term: "DECOUPLING", title: "Keep logic out of the orchestrator",
    caption:
      "All application and domain logic lives in the llm_engineering module; steps import only what they need and pipelines just glue steps together — so ZenML can be swapped without touching the logic.",
    diagram: (
      <Frame w={740} h={280}>
        <LabelBox x={250} y={20} w={220} h={56} text="pipelines/" sub="glue steps together" accent={A} />
        <LabelBox x={250} y={110} w={220} h={56} text="steps/" sub="thin @step wrappers" accent={A} />
        <Boundary x={210} y={195} w={310} h={70} title="llm_engineering (your logic)" accent={A} />
        <Label x={365} y={235} size={12} weight={600}>application + domain logic</Label>
        <Arrow x1={360} y1={76} x2={360} y2={108} accent={A} animated={false} />
        <Arrow x1={360} y1={166} x2={360} y2={195} accent={A} animated={false} />
        <BrandNode x={560} y={32} name="ZenML" sub="swappable" w={150} />
        <Arrow x1={558} y1={57} x2={472} y2={48} accent={A} animated={false} />
        <Label x={620} y={120} size={11} color="#5E6B76">swap orchestrator</Label>
        <Label x={620} y={136} size={11} color="#5E6B76">without touching logic</Label>
      </Frame>
    ),
  },
  /* ---------------- p67 — repo folder structure (Fig 2.6) ---------------- */
  {
    page: 67, chapter: 2, stage: "foundations", archetype: "hierarchy", accent: A,
    section: "Orchestrator",
    term: "REPO LAYOUT", title: "The repository folder structure (Fig 2.6)",
    caption:
      "The decoupled design is mirrored in the LLM-Engineers-Handbook repo layout: ZenML lives in pipelines/ and steps/, all logic in llm_engineering/, plus configs/, tools/, and the .github/ CI workflows.",
    diagram: (
      <Frame w={720} h={300}>
        <BrandNode x={30} y={20} name="GitHub" sub="LLM-Engineers-Handbook" w={260} />
        {[
          "llm_engineering/  — app + domain logic",
          "pipelines/  — ZenML pipelines",
          "steps/  — ZenML steps",
          "configs/  — pipeline YAML configs",
          "tools/  — run.py CLI",
          ".github/  — CI/CD workflows",
        ].map((t, i) => (
          <g key={i}>
            <line x1={60} y1={90} x2={60} y2={108 + i * 34} stroke="#ECE8DF" strokeWidth={1.4} />
            <line x1={60} y1={108 + i * 34} x2={84} y2={108 + i * 34} stroke="#ECE8DF" strokeWidth={1.4} />
            <Label x={92} y={108 + i * 34} anchor="start" size={12.5} font={MONO} color="#25313C">{t}</Label>
          </g>
        ))}
      </Frame>
    ),
  },
  /* ---------------- p68 — what is an artifact (Fig 2.7) ---------------- */
  {
    page: 68, chapter: 2, stage: "foundations", accent: A, archetype: "single-concept",
    section: "Artifacts and metadata",
    term: "ARTIFACT", title: "Every step output is an artifact",
    caption:
      "ZenML turns any step output into an artifact — a file produced in the ML lifecycle (datasets, models, checkpoints, logs). Artifacts are versioned, sharable, and carry metadata so you know what’s inside without downloading.",
    diagram: (
      <Frame w={720} h={250}>
        <LabelBox x={40} y={95} w={150} h={60} text="@step output" accent={A} />
        <Arrow x1={190} y1={125} x2={258} y2={125} accent={A} />
        <SnapshotGlyph x={260} y={85} w={200} h={80} accent={A} title="artifact" usedFor="reproduce / deploy" />
        {["versioned", "sharable", "+ metadata"].map((t, i) => (
          <Pill key={i} x={520} y={60 + i * 56} text={t} accent={A} w={160} />
        ))}
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={462} y1={125} x2={516} y2={75 + i * 56} accent={A} animated={i === 2} />
        ))}
      </Frame>
    ),
  },
  /* ---------------- p69 — artifact metadata for observability (Fig 2.8) ---------------- */
  {
    page: 69, chapter: 2, stage: "foundations", accent: A, archetype: "single-concept",
    section: "Artifacts and metadata",
    term: "METADATA", title: "Metadata makes artifacts observable (Fig 2.8)",
    caption:
      "Opening the crawled_links artifact’s Metadata tab shows the domains crawled for an author, links per domain, and how many succeeded — observability without opening the data itself.",
    diagram: (
      <Frame w={720} h={250}>
        <SnapshotGlyph x={40} y={90} w={190} h={80} accent={A} title="crawled_links" usedFor="artifact" />
        <Arrow x1={232} y1={130} x2={300} y2={130} accent={A} />
        <Boundary x={300} y={40} w={380} h={180} title="Metadata tab" accent={A} />
        {[
          ["domains crawled", "medium, substack, github"],
          ["links / domain", "42, 18, 7"],
          ["successful", "61 / 67"],
        ].map(([k, v], i) => (
          <g key={i}>
            <Label x={320} y={80 + i * 46} anchor="start" size={12} weight={600} color={A}>{k as string}</Label>
            <Label x={320} y={98 + i * 46} anchor="start" size={11.5} font={MONO} color="#5E6B76">{v as string}</Label>
          </g>
        ))}
      </Frame>
    ),
  },
  /* ---------------- p70 — adding metadata in code (Fig 2.9) ---------------- */
  {
    page: 70, chapter: 2, stage: "foundations", accent: A, archetype: "code-anatomy",
    section: "Artifacts and metadata",
    term: "DATASET METADATA", title: "Attach metadata in the step (Fig 2.9)",
    caption:
      "Metadata is added manually inside the step: add_output_metadata precomputes useful facts about the instruct_datasets artifact (categories, split size, samples per split) for discovery across the business.",
    diagram: (
      <Frame w={740} h={240}>
        <Code
          x={30}
          y={35}
          w={420}
          lines={[
            { t: "@step", hi: true },
            { t: "def generate_instruction_dataset(...):", hi: false },
            { t: "    datasets = ...", hi: false },
            { t: "    ctx = get_step_context()", hi: false },
            { t: "    ctx.add_output_metadata(", hi: true },
            { t: "        \"instruct_datasets\", meta)", hi: false },
          ]}
        />
        <SnapshotGlyph x={490} y={45} w={210} h={64} accent={A} title="instruct_datasets" usedFor="fine-tuning" />
        {["data_categories", "test_split_size", "num_samples / split"].map((t, i) => (
          <Label key={i} x={500} y={135 + i * 26} anchor="start" size={11.5} font={MONO} color="#5E6B76">{`• ${t}`}</Label>
        ))}
      </Frame>
    ),
  },
  /* ---------------- p71 — load artifact by UUID ---------------- */
  {
    page: 71, chapter: 2, stage: "foundations", accent: A, archetype: "single-concept",
    section: "Artifacts and metadata",
    term: "VERSIONING", title: "Fetch any artifact version by UUID",
    caption:
      "Each artifact version is addressable by a Universally Unique Identifier (UUID); Client().get_artifact_version(uuid).load() pulls back the exact version from the ZenML dashboard or CLI.",
    diagram: (
      <Frame w={720} h={230}>
        {[0, 1, 2].map((i) => (
          <SnapshotGlyph key={i} x={40 + i * 22} y={50 + i * 18} w={200} h={64} accent={A} title={`instruct_datasets v${i + 1}`} usedFor="" />
        ))}
        <Label x={120} y={150} size={11} font={MONO} color="#5E6B76">8bba35c4-…-08046efc9fdc</Label>
        <DecisionGlyph x={330} y={70} w={100} h={100} accent={A} mark="UUID" />
        <BrandNode x={500} y={90} name="ZenML" sub="get_artifact_version().load()" w={200} />
        <Arrow x1={262} y1={110} x2={328} y2={120} accent={A} />
        <Arrow x1={430} y1={120} x2={498} y2={115} accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p72 — config-driven runs ---------------- */
  {
    page: 72, chapter: 2, stage: "foundations", accent: A, archetype: "pipeline-flow",
    section: "How to run and configure a ZenML pipeline",
    term: "RUN & CONFIG", title: "Inject config at runtime, no code change",
    caption:
      "tools/run.py exposes a CLI (wrapped by poe) that injects a YAML config into a pipeline at runtime via with_options — so the same pipeline runs with different parameters, fully reproducibly.",
    diagram: (
      <Frame w={740} h={240}>
        <Label x={90} y={50} size={11.5} font={MONO} color="#5E6B76">poetry poe run-digital-data-etl</Label>
        <LabelBox x={30} y={70} w={150} h={56} text="tools/run.py" sub="CLI" accent={A} />
        <DocumentGlyph x={250} y={55} w={110} h={100} accent={A} />
        <Label x={305} y={170} size={11.5} font={MONO}>config.yaml</Label>
        <PipelineGlyph x={440} y={65} w={180} h={90} accent={A} />
        <Label x={530} y={105} weight={700}>digital_data_etl</Label>
        <Arrow x1={180} y1={100} x2={248} y2={105} accent={A} />
        <Arrow x1={360} y1={105} x2={438} y2={108} accent={A} />
        <Label x={400} y={90} size={10.5} color="#5E6B76">with_options()</Label>
      </Frame>
    ),
  },
  /* ---------------- p73 — one pipeline, many configs (Fig 2.10) ---------------- */
  {
    page: 73, chapter: 2, stage: "foundations", accent: A, archetype: "list-cluster",
    section: "How to run and configure a ZenML pipeline",
    term: "CONFIGS", title: "One pipeline, many configs (Fig 2.10)",
    caption:
      "Each YAML config supplies parameters (user_full_name, links) to the same pipeline; swapping the config file scrapes a different author — Maxime vs Paul — without changing any code.",
    diagram: (
      <Frame w={720} h={250}>
        {[
          "digital_data_etl_maxime.yaml",
          "digital_data_etl_paul.yaml",
        ].map((t, i) => (
          <g key={i}>
            <DocumentGlyph x={30} y={55 + i * 90} w={90} h={80} accent={A} />
            <Label x={135} y={95 + i * 90} anchor="start" size={11} font={MONO}>{t}</Label>
            <Arrow x1={400} y1={125} x2={470} y2={125} accent={A} animated={i === 0} />
            <line x1={120} y1={95 + i * 90} x2={360} y2={125} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
        <PipelineGlyph x={360} y={80} w={40} h={40} accent={A} />
        <BrandNode x={470} y={100} name="ZenML" sub="parametrized at runtime" w={210} />
      </Frame>
    ),
  },
  /* ---------------- p74 — orchestrator landscape ---------------- */
  {
    page: 74, chapter: 2, stage: "foundations", accent: A, archetype: "comparison",
    section: "Comet ML: experiment tracker",
    term: "ORCHESTRATORS", title: "Why ZenML over other orchestrators",
    caption:
      "Airflow, Prefect, Metaflow, Dagster, and Kubeflow are all capable orchestrators, but only ZenML offers the stack feature that avoids cloud vendor lock-in — the best trade-off of ease, features, and cost.",
    diagram: (
      <Frame w={740} h={290}>
        <BrandNode x={280} y={20} name="ZenML" sub="chosen · stack = no lock-in" w={220} />
        {[
          ["Apache Airflow", 20, 110],
          ["Prefect", 200, 110],
          ["Metaflow", 380, 110],
          ["Dagster", 560, 110],
          ["Kubeflow", 290, 200],
        ].map(([n, x, y], i) => (
          <BrandNode key={i} x={x as number} y={y as number} name={n as string} w={170} />
        ))}
        <Label x={120} y={185} size={11} color="#5E6B76">capable, but no stack abstraction →</Label>
      </Frame>
    ),
  },
  /* ---------------- p75 — experiment tracker (Fig 2.11/2.12) ---------------- */
  {
    page: 75, chapter: 2, stage: "foundations", accent: A, archetype: "single-concept",
    section: "Opik: prompt monitoring",
    term: "EXPERIMENT TRACKER", title: "Comet ML compares every run (Fig 2.11)",
    caption:
      "Training is iterative: an experiment tracker logs metrics, hyperparameters, and system metrics (GPU/CPU/memory) across parallel runs so you can compare them and pick the best model. Alternatives: W&B, MLflow, Neptune.",
    diagram: (
      <Frame w={740} h={290}>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <ModelGlyph x={30} y={30 + i * 80} w={56} h={56} accent={A} />
            <Label x={100} y={58 + i * 80} anchor="start" size={11} color="#5E6B76">{`run #${i + 1}`}</Label>
            <Arrow x1={170} y1={58 + i * 80} x2={250} y2={140} accent={A} animated={i === 0} />
          </g>
        ))}
        <BrandNode x={250} y={115} name="Comet" sub="experiment tracker" w={200} />
        {["loss · grad norm", "hyperparameters", "GPU / CPU / mem"].map((t, i) => (
          <Pill key={i} x={500} y={50 + i * 56} text={t} accent={A} w={200} />
        ))}
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={452} y1={140} x2={498} y2={65 + i * 56} accent={A} animated={false} />
        ))}
      </Frame>
    ),
  },
  /* ---------------- p76 — Opik prompt monitoring ---------------- */
  {
    page: 76, chapter: 2, stage: "foundations", accent: A, archetype: "pipeline-flow",
    section: "Qdrant: vector database",
    term: "PROMPT MONITORING", title: "Opik groups chained prompts into traces",
    caption:
      "Prompts can’t use plain text logs: an LLM app chains prompts and outputs into a trace where each prompt depends on the previous. Opik (by Comet) groups these traces into a debuggable dashboard. Alternatives: Langfuse, LangSmith, Galileo.",
    diagram: (
      <Frame w={740} h={260}>
        <Boundary x={30} y={40} w={420} h={120} title="one trace" accent={A} />
        {["prompt", "→ prompt", "→ output"].map((t, i) => (
          <g key={i}>
            <LabelBox x={50 + i * 135} y={75} w={120} h={50} text={t} accent={A} />
            {i < 2 && <Arrow x1={170 + i * 135} y1={100} x2={185 + i * 135} y2={100} accent={A} animated={false} />}
          </g>
        ))}
        <BrandNode x={520} y={80} name="Opik" sub="trace dashboard" w={190} />
        <Arrow x1={452} y1={100} x2={518} y2={105} accent={A} />
        <Label x={240} y={195} size={11} color="#5E6B76">each prompt depends on the previous → not plain logs</Label>
      </Frame>
    ),
  },
  /* ---------------- p77 — MongoDB → Qdrant ---------------- */
  {
    page: 77, chapter: 2, stage: "foundations", accent: A, archetype: "architecture",
    section: "Setting up an AWS account, an access key, and the CLI",
    term: "DATABASES", title: "MongoDB for raw data, Qdrant for vectors",
    caption:
      "Raw crawled text lands in MongoDB (flexible NoSQL); after processing and embedding it is stored in Qdrant, the vector DB used for RAG. Both run locally via Docker. Qdrant won on the RPS/latency/index trade-off (see Superlinked’s comparison).",
    diagram: (
      <Frame w={740} h={260}>
        <BrandNode x={30} y={100} name="MongoDB" sub="raw text · NoSQL" w={190} />
        <PipelineGlyph x={280} y={85} w={150} h={80} accent={A} />
        <Label x={355} y={125} size={12} weight={600}>process + embed</Label>
        <BrandNode x={490} y={100} name="Qdrant" sub="vectors · RAG" w={190} />
        <Arrow x1={222} y1={130} x2={278} y2={125} accent={A} />
        <Arrow x1={432} y1={125} x2={488} y2={125} accent={A} />
        <BrandNode x={300} y={200} name="Superlinked" sub="vector-DB comparison" w={220} />
        <Label x={120} y={70} size={11} color="#5E6B76">both spun up locally via Docker</Label>
      </Frame>
    ),
  },
  /* ---------------- p78 — IAM user + access keys (Fig 2.13) ---------------- */
  {
    page: 78, chapter: 2, stage: "foundations", accent: A, archetype: "single-concept",
    section: "Setting up an AWS account, an access key, and the CLI",
    term: "AWS IAM", title: "An IAM user with an access key (Fig 2.13)",
    caption:
      "To reach AWS programmatically you create an IAM user and generate an access key (id + secret). The test account uses AdministratorAccess for simplicity, but production should follow least privilege — and keys must be stored safely.",
    diagram: (
      <Frame w={720} h={250}>
        <UserGlyph x={30} y={70} w={100} h={100} accent={A} />
        <Label x={80} y={185} size={11.5}>IAM user</Label>
        <SnapshotGlyph x={210} y={85} w={210} h={74} accent={A} title="access key" usedFor="programmatic AWS" />
        <Label x={315} y={172} size={11} font={MONO} color="#5E6B76">id + secret</Label>
        <BrandNode x={500} y={95} name="AWS" sub="resources via API" w={190} />
        <Arrow x1={132} y1={120} x2={208} y2={120} accent={A} />
        <Arrow x1={420} y1={120} x2={498} y2={120} accent={A} />
        <Warn x={250} y={215} text="store keys safely · prefer least privilege" />
      </Frame>
    ),
  },
  /* ---------------- p79 — SageMaker is a managed ML platform ---------------- */
  {
    page: 79, chapter: 2, stage: "foundations", accent: A, archetype: "single-concept",
    section: "SageMaker: training and inference compute",
    term: "SAGEMAKER", title: "Managed compute to train and deploy",
    caption:
      "After configuring the AWS CLI, the book uses SageMaker — a fully managed service that builds, trains, and deploys ML models at scale, handling the underlying infrastructure so you focus on the model.",
    diagram: (
      <Frame w={720} h={240}>
        <BrandNode x={40} y={95} name="AWS SageMaker" sub="fully managed" w={220} />
        {["build", "train (GPU clusters)", "deploy (REST API)"].map((t, i) => (
          <g key={i}>
            <Pill x={330} y={40 + i * 60} text={t} accent={A} w={250} />
            <Arrow x1={262} y1={120} x2={326} y2={55 + i * 60} accent={A} animated={i === 1} />
          </g>
        ))}
        <Label x={150} y={155} size={11} color="#5E6B76">infrastructure handled for you</Label>
      </Frame>
    ),
  },
  /* ---------------- p80 — SageMaker vs Bedrock ---------------- */
  {
    page: 80, chapter: 2, stage: "foundations", accent: A, archetype: "comparison",
    section: "Why AWS SageMaker?",
    term: "VS BEDROCK", title: "SageMaker vs Bedrock",
    caption:
      "Bedrock is serverless: pre-trained models behind an API, priced per call, easy but limited customization. SageMaker is a full platform — pay-as-you-go compute you customize completely, even paying for idle endpoints.",
    diagram: (
      <Frame w={720} h={290}>
        <BrandNode x={40} y={30} name="AWS Bedrock" sub="serverless" w={210} />
        {["pre-trained models only", "priced per API call", "easy · limited control"].map((t, i) => (
          <Pill key={i} x={30} y={100 + i * 50} text={t} accent={A} w={240} />
        ))}
        <Label x={360} y={150} size={20} weight={700} color="#97A0A8">vs</Label>
        <BrandNode x={470} y={30} name="AWS SageMaker" sub="full platform" w={220} />
        {["fully customizable", "pay-as-you-go compute", "pays even when idle"].map((t, i) => (
          <Pill key={i} x={460} y={100 + i * 50} text={t} accent={A} w={240} />
        ))}
      </Frame>
    ),
  },
  /* ---------------- p81 — control vs convenience spectrum ---------------- */
  {
    page: 81, chapter: 2, stage: "foundations", accent: A, archetype: "comparison",
    section: "Summary",
    term: "CONTROL SPECTRUM", title: "From managed to full control",
    caption:
      "The choice is a spectrum: Bedrock is fully managed, SageMaker balances control and convenience, and EKS/ECS give complete (cheaper) control via Kubernetes. The book picks SageMaker to expose the engineering Bedrock hides.",
    diagram: (
      <Frame w={740} h={230}>
        <defs>
          <linearGradient id="ctrl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0EA5B7" stopOpacity="0.15" />
            <stop offset="1" stopColor="#0EA5B7" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <rect x={40} y={70} width={660} height={16} rx={8} fill="url(#ctrl)" stroke={A} strokeWidth={1.4} />
        <Label x={60} y={110} anchor="start" size={11} color="#5E6B76">managed / convenient</Label>
        <Label x={680} y={110} anchor="end" size={11} color="#5E6B76">full control / cheaper</Label>
        <BrandNode x={40} y={130} name="AWS Bedrock" w={170} />
        <BrandNode x={285} y={130} name="AWS SageMaker" sub="chosen — the balance" w={210} />
        <BrandNode x={540} y={130} name="AWS EKS" sub="+ ECS · Kubernetes" w={160} />
        <circle cx={62} cy={78} r={6} fill={A} />
        <circle cx={360} cy={78} r={7} fill={A} stroke="#FFFFFF" strokeWidth={2} />
        <circle cx={620} cy={78} r={6} fill={A} />
      </Frame>
    ),
  },
];
