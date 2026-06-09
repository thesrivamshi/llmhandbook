// Chapter 5 — Supervised Fine-Tuning (pp. 206–255). Building an instruction
// dataset (curation → dedup → decontamination → quality eval → exploration →
// generation/augmentation), then SFT techniques (full, LoRA, QLoRA), training
// parameters, and a practical Unsloth fine-tune. Stage = Training (amber).
// Figures 5.1, 5.6, 5.8, 5.9, 5.10, 5.11 redrawn as schematics.
// pp.256–257 are References (non-content) and are skipped.
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

const T = STAGES.training.accent; // amber
const MONO = "'IBM Plex Mono', monospace";

const Frame: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => (
  <Canvas width={w} height={h}>{children}</Canvas>
);

const Code: React.FC<{ x: number; y: number; w: number; lines: { t: string; hi?: boolean }[]; size?: number }> = ({
  x, y, w, lines, size = 12,
}) => {
  const lh = size + 7;
  const h = lines.length * lh + 18;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="#FFFFFF" stroke="#ECE8DF" strokeWidth={1.5} />
      {lines.map((l, i) => (
        <text key={i} x={x + 14} y={y + 16 + i * lh} fontFamily={MONO} fontSize={size} fill={l.hi ? T : "#25313C"} fontWeight={l.hi ? 700 : 500}>
          {l.t}
        </text>
      ))}
    </g>
  );
};

export const CHAPTER5: PageDiagram[] = [
  /* p206 */
  {
    page: 206, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "Chapter 5: Supervised Fine-Tuning",
    term: "SFT", title: "Base model → instruction-following assistant",
    caption:
      "SFT re-trains a pre-trained base model (which only predicts the next token) on curated instruction-answer pairs, teaching it a chat format and adapting its knowledge to targeted tasks or domains.",
    diagram: (
      <Frame w={720} h={220}>
        <ModelGlyph x={30} y={60} w={120} h={110} accent={T} />
        <Label x={90} y={185} size={11}>base model</Label>
        <Label x={90} y={48} size={10} color="#5E6B76">next-token only</Label>
        <SnapshotGlyph x={230} y={80} w={180} h={70} accent={T} title="instruction-answer pairs" usedFor="SFT" />
        <ModelGlyph x={480} y={55} w={130} h={120} accent={T} />
        <Label x={545} y={190} weight={700}>assistant</Label>
        <Arrow x1={150} y1={115} x2={228} y2={115} accent={T} />
        <Arrow x1={410} y1={115} x2={478} y2={115} accent={T} />
      </Frame>
    ),
  },
  /* p207 — Fig 5.1 data pipeline */
  {
    page: 207, chapter: 5, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "General framework",
    term: "DATA PIPELINE", title: "The post-training data pipeline (Fig 5.1)",
    caption:
      "Building an instruction dataset is the hardest part of fine-tuning. The pipeline curates data, then deduplicates, decontaminates, evaluates quality, and explores it — with generation and augmentation when data is scarce.",
    diagram: (
      <Frame w={760} h={210}>
        {["curation", "dedup", "decontam.", "quality eval", "exploration"].map((t, i) => (
          <g key={t}>
            <PipelineGlyph x={12 + i * 150} y={70} w={128} h={66} accent={T} />
            <Label x={76 + i * 150} y={103} weight={600} size={12}>{t}</Label>
            {i < 4 && <Arrow x1={140 + i * 150} y1={103} x2={160 + i * 150} y2={103} accent={T} animated={i === 0} />}
          </g>
        ))}
        <Label x={380} y={175} size={11} color="#5E6B76">+ generation · augmentation when data is scarce</Label>
      </Frame>
    ),
  },
  /* p208 — sample structure */
  {
    page: 208, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "General framework",
    term: "SAMPLE", title: "System + instruction → output",
    caption:
      "An instruction sample pairs an instruction (the model input, optionally with a system meta-prompt and input data) with an output (the expected answer). High-quality data is accurate, diverse, and complex.",
    diagram: (
      <Frame w={720} h={230}>
        <LabelBox x={30} y={40} w={300} h={44} text="system" sub="meta-prompt (optional)" accent={T} />
        <LabelBox x={30} y={95} w={300} h={44} text="instruction" sub="task + input" accent={T} strong />
        <LabelBox x={30} y={150} w={300} h={44} text="output" sub="expected answer" accent={T} />
        {["accurate", "diverse", "complex"].map((t, i) => (
          <Pill key={t} x={450} y={50 + i * 56} text={t} accent={T} w={200} />
        ))}
        <Label x={550} y={30} size={11} weight={700} color={T}>QUALITY</Label>
      </Frame>
    ),
  },
  /* p209 — data quantity */
  {
    page: 209, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "Data quantity",
    term: "DATA QUANTITY", title: "How many samples? It depends",
    caption:
      "The Hugging Face Hub hosts many instruction datasets to borrow from. Big models (≈70B) can fine-tune on as few as 1,000 high-quality samples (LIMA); smaller models need more just to learn the chat template.",
    diagram: (
      <Frame w={720} h={210}>
        <BrandNode x={30} y={85} name="Hugging Face" sub="dataset hub" w={200} />
        <ModelGlyph x={300} y={40} w={90} h={80} accent={T} />
        <Label x={345} y={130} size={11}>70B model</Label>
        <Pill x={460} y={55} text="≈1,000 samples (LIMA)" accent={T} w={230} />
        <ModelGlyph x={300} y={130} w={70} h={60} accent={T} />
        <Label x={335} y={200} size={10.5}>7B</Label>
        <Pill x={460} y={140} text="more — to learn the template" accent={T} w={250} />
        <Arrow x1={230} y1={120} x2={298} y2={90} accent={T} animated={false} />
        <Arrow x1={390} y1={80} x2={458} y2={70} accent={T} animated={false} />
        <Arrow x1={370} y1={160} x2={458} y2={155} accent={T} animated={false} />
      </Frame>
    ),
  },
  /* p210 — quantity by model type */
  {
    page: 210, chapter: 5, stage: "training", accent: T, archetype: "comparison",
    section: "Data quantity",
    term: "SAMPLE COUNTS", title: "General vs task vs domain",
    caption:
      "General-purpose models need ≈1M+ samples (Llama 3 used ~10M). Task-specific models need 100–100k. Domain-specific varies — broad fields like medicine/law need much, narrower ones less.",
    diagram: (
      <Frame w={740} h={230}>
        {[
          ["general-purpose", "≈ 1M+ samples", true],
          ["task-specific", "100 – 100k", false],
          ["domain-specific", "varies by domain", false],
        ].map(([t, sub, big], i) => (
          <LabelBox key={i} x={20 + i * 245} y={70} w={210} h={84} text={t as string} sub={sub as string} accent={T} strong={big as boolean} />
        ))}
      </Frame>
    ),
  },
  /* p211 — data curation */
  {
    page: 211, chapter: 5, stage: "training", accent: T, archetype: "comparison",
    section: "Rule-based filtering",
    term: "CURATION", title: "Task vs domain curation",
    caption:
      "Task-specific curation collects examples of the task (summary pairs, translations). Domain-specific curation needs subject-matter experts and specialized corpora. Few-shot prompting is an alternative to fine-tuning for tasks.",
    diagram: (
      <Frame w={720} h={220}>
        <LabelBox x={40} y={40} w={260} h={50} text="task-specific" sub="collect task examples" accent={T} />
        <LabelBox x={40} y={120} w={260} h={50} text="domain-specific" sub="experts + specialized corpora" accent={T} />
        <DecisionGlyph x={400} y={75} w={100} h={90} accent={T} mark="↗" />
        <Pill x={540} y={95} text="few-shot prompting" accent={T} w={170} />
        <Label x={620} y={75} size={10.5} color="#5E6B76">(alternative)</Label>
        <Arrow x1={300} y1={120} x2={398} y2={120} accent={T} animated={false} />
        <Arrow x1={500} y1={115} x2={538} y2={110} accent={T} animated={false} />
      </Frame>
    ),
  },
  /* p212 — rule-based filtering */
  {
    page: 212, chapter: 5, stage: "training", accent: T, archetype: "list-cluster",
    section: "Rule-based filtering",
    term: "RULE FILTERS", title: "Length, keyword, format checks",
    caption:
      "Rule-based filtering applies explicit rules fast and at scale: length filtering (drop too-short/too-long), keyword exclusion (profanity, off-topic), and format checking (valid code/JSON). Fast and transparent, but can miss nuance.",
    diagram: (
      <Frame w={720} h={210}>
        <DecisionGlyph x={290} y={70} w={110} h={100} accent={T} mark="rules" />
        {[["length filter", 30, 40], ["keyword exclusion", 470, 40], ["format check", 470, 140]].map(([t, x, y], i) => (
          <g key={i}>
            <Pill x={x as number} y={y as number} text={t as string} accent={T} w={210} />
            <line x1={345} y1={120} x2={(x as number) + 100} y2={(y as number) + 15} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
        <Warn x={120} y={160} text="binary pass/fail can miss nuance" />
      </Frame>
    ),
  },
  /* p213 — deduplication */
  {
    page: 213, chapter: 5, stage: "training", accent: T, archetype: "comparison",
    section: "Data deduplication",
    term: "DEDUP", title: "Exact, fuzzy, semantic deduplication",
    caption:
      "Duplicates cause overfitting and inflated metrics. Exact dedup hashes entries (MD5/SHA-256); fuzzy dedup uses MinHash signatures + Jaccard similarity; semantic dedup embeds text and compares vectors, optionally clustering.",
    diagram: (
      <Frame w={740} h={220}>
        {[
          ["exact", "MD5 / SHA-256 hash"],
          ["fuzzy", "MinHash + Jaccard"],
          ["semantic", "embeddings + cosine"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 245} y={70} w={210} h={80} text={t as string} sub={sub as string} accent={T} strong={i === 2} />
        ))}
      </Frame>
    ),
  },
  /* p214 — decontamination */
  {
    page: 214, chapter: 5, stage: "training", accent: T, archetype: "pitfall",
    section: "Data decontamination",
    term: "DECONTAMINATION", title: "Remove train∩eval overlap",
    caption:
      "Decontamination ensures the training set shares no identical or near-identical samples with the evaluation set — using exact matching, near-duplicate detection (MinHash, n-grams, embeddings), and provenance tracking — to prevent leaked, inflated scores.",
    diagram: (
      <Frame w={720} h={230}>
        <Boundary x={40} y={50} w={220} h={140} title="training set" accent={T} />
        <Boundary x={300} y={50} w={220} h={140} title="eval set" accent={T} />
        <circle cx={280} cy={120} r={36} fill="rgba(238,150,19,0.18)" stroke="#EF5C46" strokeWidth={2} />
        <Warn x={280} y={120} />
        <Label x={280} y={210} size={11} color="#EF5C46">overlap → leak → removed from train</Label>
        <Arrow x1={560} y1={120} x2={520} y2={120} accent={T} animated={false} />
        <Pill x={560} y={105} text="remove" accent={T} w={120} />
      </Frame>
    ),
  },
  /* p215 — quality evaluation methods */
  {
    page: 215, chapter: 5, stage: "training", accent: T, archetype: "list-cluster",
    section: "Data quality evaluation",
    term: "QUALITY EVAL", title: "Four ways to judge quality",
    caption:
      "Quality evaluation assesses accuracy, diversity, and complexity. Methods scale from human annotation (accurate, costly) to LLM-as-a-judge, reward models, and trained classifiers.",
    diagram: (
      <Frame w={720} h={220}>
        <LabelBox x={290} y={85} w={140} h={56} text="quality eval" accent={T} strong />
        {[["human annotation", 30, 30], ["LLM-as-a-judge", 470, 30], ["reward model", 30, 150], ["classifier", 470, 150]].map(([t, x, y], i) => (
          <g key={i}>
            <Pill x={x as number} y={y as number} text={t as string} accent={T} w={210} />
            <line x1={360} y1={113} x2={(x as number) + 105} y2={(y as number) + 15} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* p216 — LLM-as-judge biases */
  {
    page: 216, chapter: 5, stage: "training", accent: T, archetype: "pitfall",
    section: "Data quality evaluation",
    term: "LLM JUDGE", title: "Judge scores 1–4, but watch the biases",
    caption:
      "An LLM judge scores each instruction-answer pair (1–4). Known biases: position bias (favors answer A — randomize order), length bias (favors long answers — normalize), and intra-model favoritism (prefers its own family — use several models).",
    diagram: (
      <Frame w={720} h={230}>
        <SnapshotGlyph x={30} y={85} w={150} h={60} accent={T} title="answer pair" usedFor="" />
        <ModelGlyph x={250} y={70} w={100} h={90} accent={T} />
        <Label x={300} y={175} size={11}>LLM judge</Label>
        <Pill x={420} y={50} text="score 1–4" accent={T} w={130} />
        <Arrow x1={180} y1={115} x2={248} y2={115} accent={T} />
        <Arrow x1={350} y1={110} x2={418} y2={70} accent={T} animated={false} />
        {["position bias", "length bias", "intra-model favoritism"].map((t, i) => (
          <Warn key={t} x={440} y={115 + i * 32} text={t} />
        ))}
      </Frame>
    ),
  },
  /* p217 — reward model */
  {
    page: 217, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "Data quality evaluation",
    term: "REWARD MODEL", title: "A linear head on a decoder LLM",
    caption:
      "A reward model takes an instruction-answer pair and returns a score, built by adding a linear head on a decoder LLM (Gemma, Llama). ArmoRM-Llama3-8B adds regression + gating layers to output multiple dimensions (helpfulness, correctness…). A jury of LLMs reduces bias.",
    diagram: (
      <Frame w={720} h={220}>
        <SnapshotGlyph x={20} y={85} w={150} h={60} accent={T} title="instruction + answer" usedFor="" />
        <ModelGlyph x={230} y={65} w={110} h={100} accent={T} />
        <Label x={285} y={180} size={11}>decoder LLM</Label>
        <LabelBox x={400} y={88} w={130} h={50} text="linear head" accent={T} strong />
        <Pill x={580} y={95} text="scores" accent={T} w={120} />
        <Arrow x1={170} y1={115} x2={228} y2={115} accent={T} />
        <Arrow x1={340} y1={115} x2={398} y2={113} accent={T} />
        <Arrow x1={530} y1={113} x2={578} y2={113} accent={T} />
      </Frame>
    ),
  },
  /* p218 — classifier for quality */
  {
    page: 218, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "Data exploration",
    term: "CLASSIFIER", title: "Encoder-only classifier at scale",
    caption:
      "Allen AI’s RewardBench compares reward models on HF. A cheaper option: encoder-only classifiers (e.g. fineweb-edu-classifier — a head on snowflake-arctic-embed-m, trained on 450k Llama-3-annotated samples) — fast, scalable, less accurate on nuance.",
    diagram: (
      <Frame w={720} h={210}>
        <SnapshotGlyph x={30} y={80} w={150} h={60} accent={T} title="sample" usedFor="" />
        <ModelGlyph x={240} y={60} w={100} h={90} accent={T} />
        <Label x={290} y={165} size={11}>encoder + head</Label>
        <DecisionGlyph x={420} y={70} w={90} h={80} accent={T} mark="✓/✗" />
        <Pill x={560} y={95} text="quality label" accent={T} w={150} />
        <Arrow x1={180} y1={110} x2={238} y2={108} accent={T} />
        <Arrow x1={340} y1={108} x2={418} y2={110} accent={T} />
        <Arrow x1={510} y1={110} x2={558} y2={110} accent={T} />
        <Label x={300} y={30} size={10.5} color="#5E6B76">fast · scalable to millions</Label>
      </Frame>
    ),
  },
  /* p219 — data exploration tools */
  {
    page: 219, chapter: 5, stage: "training", accent: T, archetype: "list-cluster",
    section: "Data exploration",
    term: "EXPLORATION", title: "Inspect manually + statistically (Fig 5.4)",
    caption:
      "Exploration mixes manual inspection (Argilla for collaborative review) with statistical analysis: NLTK/spaCy tokenize, Matplotlib/Seaborn visualize vocabulary diversity, biases, and concept representation.",
    diagram: (
      <Frame w={720} h={210}>
        <DataStoreGlyph x={300} y={70} w={110} h={100} accent={T} />
        <Label x={355} y={185} size={11}>dataset</Label>
        <BrandNode x={20} y={40} name="Argilla" sub="manual review" w={190} />
        <BrandNode x={20} y={120} name="spaCy" sub="tokenize" w={150} />
        <BrandNode x={500} y={40} name="NumPy" sub="stats" w={150} />
        <Pill x={500} y={120} text="Matplotlib · histograms" accent={T} w={210} />
        <Arrow x1={210} y1={70} x2={300} y2={100} accent={T} animated={false} />
        <Arrow x1={210} y1={150} x2={300} y2={140} accent={T} animated={false} />
        <Arrow x1={410} y1={100} x2={498} y2={70} accent={T} animated={false} />
        <Arrow x1={410} y1={140} x2={498} y2={140} accent={T} animated={false} />
      </Frame>
    ),
  },
  /* p220 — topic clustering */
  {
    page: 220, chapter: 5, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Data generation",
    term: "TOPIC CLUSTERING", title: "Embed → reduce → cluster (Fig 5.5)",
    caption:
      "Topic clustering groups similar samples to reveal themes and balance coverage. HF text-clustering embeds with Sentence Transformers, reduces with UMAP, clusters with DBSCAN, and LLM-labels each cluster. Nomic Atlas visualizes it.",
    diagram: (
      <Frame w={740} h={210}>
        <BrandNode x={20} y={80} name="Sentence Transformers" sub="embed" w={190} />
        <LabelBox x={240} y={82} w={110} h={56} text="UMAP" sub="reduce" accent={T} />
        <LabelBox x={380} y={82} w={110} h={56} text="DBSCAN" sub="cluster" accent={T} />
        <BrandNode x={530} y={84} name="Nomic Atlas" sub="visualize" w={190} />
        <Arrow x1={210} y1={108} x2={238} y2={108} accent={T} />
        <Arrow x1={350} y1={110} x2={378} y2={110} accent={T} />
        <Arrow x1={490} y1={110} x2={528} y2={110} accent={T} />
      </Frame>
    ),
  },
  /* p221 — synthetic data generation */
  {
    page: 221, chapter: 5, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Data generation",
    term: "SYNTHETIC DATA", title: "Seed prompts → LLM → new samples",
    caption:
      "When data is scarce, generate synthetic samples: start from carefully designed seed prompts (a taxonomy, as in Alpaca), have an LLM produce instruction-answer pairs, then validate them — scalable and cheaper than manual creation.",
    diagram: (
      <Frame w={740} h={210}>
        <SnapshotGlyph x={20} y={80} w={160} h={64} accent={T} title="seed prompts" usedFor="taxonomy" />
        <ModelGlyph x={250} y={60} w={110} h={100} accent={T} />
        <Label x={305} y={172} size={11}>LLM</Label>
        <LabelBox x={420} y={82} w={130} h={56} text="validate" accent={T} />
        <SnapshotGlyph x={580} y={84} w={150} h={56} accent={T} title="new pairs" usedFor="" />
        <Arrow x1={180} y1={112} x2={248} y2={110} accent={T} />
        <Arrow x1={360} y1={110} x2={418} y2={110} accent={T} />
        <Arrow x1={550} y1={110} x2={578} y2={110} accent={T} />
      </Frame>
    ),
  },
  /* p222 — controlled generation */
  {
    page: 222, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "Data augmentation",
    term: "CONTROL", title: "Control attributes, structure the output",
    caption:
      "Synthetic generation lets you control complexity, length, tone, and topic, and address dataset gaps/biases. Structured generation (e.g. Outlines) forces a specific format. Risk: inheriting the generator model’s biases.",
    diagram: (
      <Frame w={720} h={220}>
        <ModelGlyph x={40} y={60} w={110} h={100} accent={T} />
        <Label x={95} y={175} size={11}>generator LLM</Label>
        {["complexity", "length", "tone", "topic"].map((t, i) => (
          <Pill key={t} x={250 + (i % 2) * 150} y={50 + Math.floor(i / 2) * 52} text={t} accent={T} w={140} />
        ))}
        <BrandNode x={560} y={150} name="Outlines" sub="structured output" w={150} />
        <Arrow x1={150} y1={110} x2={248} y2={90} accent={T} animated={false} />
      </Frame>
    ),
  },
  /* p223 — Evol-Instruct */
  {
    page: 223, chapter: 5, stage: "training", accent: T, archetype: "list-cluster",
    section: "Data augmentation",
    term: "EVOL-INSTRUCT", title: "Evolve instructions deeper and broader",
    caption:
      "Evol-Instruct evolves simple instructions into harder ones. In-depth: add constraints, deepen, concretize, add reasoning steps, complicate input. In-breadth: generate rarer, long-tailed new instructions for diversity.",
    diagram: (
      <Frame w={740} h={250}>
        <Pill x={290} y={20} text="in-depth evolving" accent={T} w={180} />
        {["constraints", "deepening", "concretizing", "reasoning steps", "complicate input"].map((t, i) => (
          <Pill key={t} x={20 + (i % 3) * 245} y={70 + Math.floor(i / 3) * 52} text={t} accent={T} w={220} />
        ))}
        <Pill x={500} y={122} text="in-breadth → diversity" accent={T} w={220} />
      </Frame>
    ),
  },
  /* p224 — Evol prompt steps */
  {
    page: 224, chapter: 5, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Data augmentation",
    term: "EVOL PROMPT", title: "Rewrite instructions in four steps",
    caption:
      "The AutoEvol prompt makes GPT-4o rewrite an instruction more complex in four steps: list methods → make a plan → execute (add 10–20 words) → review. UltraFeedback is a sibling that improves answer quality instead.",
    diagram: (
      <Frame w={740} h={210}>
        {["list methods", "make plan", "execute", "review"].map((t, i) => (
          <g key={t}>
            <LabelBox x={15 + i * 185} y={70} w={160} h={60} text={`${i + 1}. ${t}`} accent={T} />
            {i < 3 && <Arrow x1={175 + i * 185} y1={100} x2={198 + i * 185} y2={100} accent={T} animated={i === 0} />}
          </g>
        ))}
        <Label x={370} y={165} size={11} color="#5E6B76">GPT-4o returns a more complex instruction</Label>
      </Frame>
    ),
  },
  /* p225 — our dataset: backtranslation */
  {
    page: 225, chapter: 5, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Creating our own instruction dataset",
    term: "BACKTRANSLATION", title: "Raw text → 3 instruction-answer pairs",
    caption:
      "For our scarce, unstructured articles: chunk each, then use an LLM (backtranslation + rephrasing) to turn each chunk into instruction-answer pairs that imitate the author’s style — generating multiple pairs per chunk to grow the set.",
    diagram: (
      <Frame w={740} h={210}>
        <DocumentGlyph x={20} y={70} w={90} h={80} accent={T} />
        <Label x={65} y={163} size={11}>article</Label>
        <LabelBox x={150} y={80} w={110} h={56} text="chunk" accent={T} />
        <ModelGlyph x={300} y={60} w={100} h={90} accent={T} />
        <Label x={350} y={170} size={11}>LLM rephrase</Label>
        {[0, 1, 2].map((i) => (
          <SnapshotGlyph key={i} x={470} y={35 + i * 56} w={200} h={48} accent={T} title={`pair ${i + 1}`} usedFor="" />
        ))}
        <Arrow x1={110} y1={110} x2={148} y2={108} accent={T} />
        <Arrow x1={260} y1={108} x2={298} y2={108} accent={T} />
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={400} y1={105} x2={468} y2={59 + i * 56} accent={T} animated={i === 0} />
        ))}
      </Frame>
    ),
  },
  /* p226 — Fig 5.6 synthetic pipeline */
  {
    page: 226, chapter: 5, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Creating our own instruction dataset",
    term: "GEN PIPELINE", title: "Clean → chunk → generate → filter (Fig 5.6)",
    caption:
      "The synthetic pipeline: clean raw text (regex), chunk into 1000–2000 characters, generate instruction-answer pairs with GPT-4o-mini in JSON mode, filter by rules → an instruction dataset. JSON mode forces valid structured output.",
    diagram: (
      <Frame w={760} h={210}>
        <DocumentGlyph x={10} y={70} w={70} h={70} accent={T} />
        {["clean", "chunk", "generate", "filter"].map((t, i) => (
          <g key={t}>
            <LabelBox x={100 + i * 140} y={78} w={110} h={52} text={t} accent={T} strong={i === 2} />
            <Arrow x1={80 + i * 140} y1={104} x2={98 + i * 140} y2={104} accent={T} animated={i === 0} />
          </g>
        ))}
        <SnapshotGlyph x={660} y={80} w={90} h={50} accent={T} title="dataset" usedFor="" />
        <Arrow x1={660} y1={104} x2={658} y2={104} accent={T} />
        <BrandNode x={520} y={150} name="GPT-4o" sub="JSON mode" w={150} />
      </Frame>
    ),
  },
  /* p227 — load_articles_from_json */
  {
    page: 227, chapter: 5, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Creating our own instruction dataset",
    term: "LOAD", title: "JSON → Hugging Face Dataset",
    caption:
      "load_articles_from_json reads the raw JSON and builds a Hugging Face Dataset, extracting id, content, platform, author_id, author_full_name, and link from each article.",
    diagram: (
      <Frame w={720} h={200}>
        <Code
          x={30}
          y={45}
          w={380}
          lines={[
            { t: "def load_articles_from_json(path):", hi: true },
            { t: "  data = json.load(...)", hi: false },
            { t: "  return Dataset.from_dict(", hi: false },
            { t: "    {id, content, platform, ...})", hi: false },
          ]}
        />
        <BrandNode x={470} y={80} name="Hugging Face" sub="Dataset" w={200} />
        <Arrow x1={410} y1={95} x2={468} y2={100} accent={T} />
      </Frame>
    ),
  },
  /* p228 — raw dataframe */
  {
    page: 228, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "Creating our own instruction dataset",
    term: "RAW DATA", title: "76 articles as a dataframe",
    caption:
      "Loaded as a pandas dataframe, the raw dataset is one row per crawled article (76 rows) with columns id, content, platform, author_id, author_full_name, link — the starting material for generation.",
    diagram: (
      <Frame w={720} h={210}>
        <BrandNode x={30} y={90} name="pandas" sub="dataframe" w={160} />
        <Boundary x={250} y={40} w={440} h={150} title="76 articles" accent={T} />
        {["id", "content", "platform", "author", "link"].map((t, i) => (
          <Pill key={t} x={265 + (i % 3) * 145} y={70 + Math.floor(i / 3) * 56} text={t} accent={T} w={130} />
        ))}
        <Arrow x1={190} y1={120} x2={248} y2={115} accent={T} />
      </Frame>
    ),
  },
  /* p229 — clean_text */
  {
    page: 229, chapter: 5, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Creating our own instruction dataset",
    term: "CLEAN TEXT", title: "Regex clean: strip junk + whitespace",
    caption:
      "clean_text removes non-alphanumeric characters (keeping apostrophes and basic punctuation), collapses repeated whitespace to a single space, and strips leading/trailing whitespace.",
    diagram: (
      <Frame w={720} h={190}>
        <Code
          x={30}
          y={40}
          w={420}
          lines={[
            { t: "def clean_text(text):", hi: true },
            { t: "  re.sub(r\"[^\\w\\s.,!?']\", \" \", text)", hi: false },
            { t: "  re.sub(r\"\\s+\", \" \", text)", hi: false },
            { t: "  return text.strip()", hi: false },
          ]}
        />
        <SnapshotGlyph x={500} y={65} w={180} h={56} accent={T} title="clean text" usedFor="" />
        <Arrow x1={450} y1={90} x2={498} y2={92} accent={T} />
      </Frame>
    ),
  },
  /* p230 — extract_substrings chunking */
  {
    page: 230, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "Creating our own instruction dataset",
    term: "CHUNKING", title: "Sentences grouped to 1000–2000 chars",
    caption:
      "extract_substrings cleans each article, splits into sentences with a regex (avoiding abbreviations), then concatenates sentences into chunks between 1,000 and 2,000 characters — tuned to the information density of the text.",
    diagram: (
      <Frame w={720} h={200}>
        <DocumentGlyph x={30} y={65} w={90} h={80} accent={T} />
        <LabelBox x={160} y={75} w={140} h={56} text="regex split" sub="sentences" accent={T} />
        <LabelBox x={350} y={75} w={170} h={56} text="group 1k–2k chars" accent={T} />
        <SnapshotGlyph x={560} y={78} w={140} h={50} accent={T} title="chunks" usedFor="" />
        <Arrow x1={120} y1={105} x2={158} y2={103} accent={T} />
        <Arrow x1={300} y1={103} x2={348} y2={103} accent={T} />
        <Arrow x1={520} y1={103} x2={558} y2={103} accent={T} />
      </Frame>
    ),
  },
  /* p231 — generation prompt */
  {
    page: 231, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "Creating our own instruction dataset",
    term: "GEN PROMPT", title: "Five pairs per chunk, in the author’s style",
    caption:
      "generate_instruction_answer_pairs grounds the model in a chunk and asks for five self-contained instruction-answer pairs whose answers imitate the author’s writing style — returned as JSON.",
    diagram: (
      <Frame w={720} h={210}>
        <SnapshotGlyph x={30} y={80} w={140} h={60} accent={T} title="chunk (context)" usedFor="" />
        <ModelGlyph x={250} y={60} w={100} h={90} accent={T} />
        <Label x={300} y={170} size={11}>LLM</Label>
        {[0, 1, 2, 3, 4].map((i) => (
          <Pill key={i} x={440} y={25 + i * 38} text={`pair ${i + 1}`} accent={T} w={130} />
        ))}
        <Label x={620} y={110} size={10.5} color="#5E6B76">imitate author style</Label>
        <Arrow x1={170} y1={110} x2={248} y2={108} accent={T} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Arrow key={i} x1={350} y1={105} x2={438} y2={44 + i * 38} accent={T} animated={i === 0} />
        ))}
      </Frame>
    ),
  },
  /* p232 — OpenAI JSON mode */
  {
    page: 232, chapter: 5, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Creating our own instruction dataset",
    term: "JSON MODE", title: "GPT-4o-mini in JSON mode",
    caption:
      "The system + user prompt is sent to GPT-4o-mini in JSON mode (max 1,200 tokens, temperature 0.7 for diversity); the output is parsed by InstructionAnswerSet.from_json into instruction-answer tuples.",
    diagram: (
      <Frame w={740} h={210}>
        <Code
          x={30}
          y={45}
          w={430}
          lines={[
            { t: "client.chat.completions.create(", hi: false },
            { t: '  model="gpt-4o-mini",', hi: true },
            { t: '  response_format={"type":"json_object"},', hi: true },
            { t: "  max_tokens=1200, temperature=0.7)", hi: false },
          ]}
        />
        <BrandNode x={500} y={60} name="GPT-4o" sub="JSON mode" w={170} />
        <SnapshotGlyph x={500} y={130} w={210} h={50} accent={T} title="InstructionAnswerSet" usedFor="" />
      </Frame>
    ),
  },
  /* p233 — ThreadPoolExecutor */
  {
    page: 233, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "Creating our own instruction dataset",
    term: "PARALLEL", title: "ThreadPoolExecutor, max_workers=4",
    caption:
      "create_instruction_dataset extracts substrings then generates pairs concurrently with a ThreadPoolExecutor. max_workers defaults to 4 — higher values tend to hit OpenAI rate limits and throttle.",
    diagram: (
      <Frame w={720} h={220}>
        <LabelBox x={30} y={90} w={150} h={56} text="ThreadPoolExecutor" sub="max_workers=4" accent={T} strong />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <Pill x={290} y={25 + i * 46} text={`extract ${i + 1}`} accent={T} w={150} />
            <BrandNode x={500} y={20 + i * 46} name="GPT-4o" w={150} />
            <Arrow x1={180} y1={118} x2={288} y2={40 + i * 46} accent={T} animated={i === 0} />
            <Arrow x1={440} y1={40 + i * 46} x2={498} y2={40 + i * 46} accent={T} animated={false} />
          </g>
        ))}
        <Warn x={120} y={170} text="too many workers → rate limits" />
      </Frame>
    ),
  },
  /* p234 — main: push to hub */
  {
    page: 234, chapter: 5, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Creating our own instruction dataset",
    term: "PUBLISH", title: "Split and push 3,335 pairs (Fig 5.7)",
    caption:
      "main loads the raw data, creates the instruction dataset, makes a train/test split (10% test), and pushes it to the Hugging Face Hub. The process yielded 3,335 pairs (mlabonne/llmtwin) for under $0.50.",
    diagram: (
      <Frame w={740} h={200}>
        <LabelBox x={20} y={75} w={120} h={56} text="create" accent={T} />
        <DecisionGlyph x={200} y={60} w={90} h={80} accent={T} mark="split" />
        <SnapshotGlyph x={340} y={40} w={150} h={48} accent={T} title="train 90%" usedFor="" />
        <SnapshotGlyph x={340} y={120} w={150} h={48} accent={T} title="test 10%" usedFor="" />
        <BrandNode x={540} y={78} name="Hugging Face" sub="3,335 pairs" w={180} />
        <Arrow x1={140} y1={103} x2={198} y2={100} accent={T} />
        <Arrow x1={290} y1={90} x2={338} y2={64} accent={T} animated={false} />
        <Arrow x1={290} y1={110} x2={338} y2={144} accent={T} animated={false} />
        <Arrow x1={490} y1={100} x2={538} y2={100} accent={T} />
      </Frame>
    ),
  },
  /* p235 — SFT defined */
  {
    page: 235, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "When to fine-tune",
    term: "WHAT SFT DOES", title: "Turn a base model into a useful assistant",
    caption:
      "SFT re-trains a pre-trained model on instruction-answer pairs to turn a next-token base model into an assistant — to boost general performance, instill knowledge, focus on tasks, or adopt a voice.",
    diagram: (
      <Frame w={720} h={210}>
        <ModelGlyph x={40} y={60} w={120} h={100} accent={T} />
        <Label x={100} y={175} size={11}>base (next-token)</Label>
        <DecisionGlyph x={290} y={70} w={100} h={80} accent={T} mark="SFT" />
        {["general boost", "new knowledge", "task focus", "a voice"].map((t, i) => (
          <Pill key={t} x={460} y={25 + i * 44} text={t} accent={T} w={200} />
        ))}
        <Arrow x1={160} y1={110} x2={288} y2={110} accent={T} />
        {[0, 1, 2, 3].map((i) => (
          <Arrow key={i} x1={390} y1={110} x2={458} y2={45 + i * 44} accent={T} animated={false} />
        ))}
      </Frame>
    ),
  },
  /* p236 — Fig 5.8 flowchart */
  {
    page: 236, chapter: 5, stage: "training", accent: T, archetype: "cycle",
    section: "When to fine-tune",
    term: "WHEN TO FINE-TUNE", title: "Prompt first, fine-tune if needed (Fig 5.8)",
    caption:
      "Start with prompt engineering, then evaluate. Good enough on cost/latency? You’re done. If not, can you build an instruction dataset? If yes, fine-tuning is an option; if no, reduce scope. Beware catastrophic forgetting.",
    diagram: (
      <Frame w={740} h={240}>
        <LabelBox x={20} y={90} w={140} h={50} text="prompt eng." accent={T} />
        <LabelBox x={190} y={90} w={120} h={50} text="evaluate" accent={T} />
        <DecisionGlyph x={340} y={70} w={100} h={90} accent={T} mark="good?" />
        <LabelBox x={490} y={30} w={120} h={46} text="solved" accent={T} strong />
        <DecisionGlyph x={500} y={110} w={100} h={80} accent={T} mark="data?" />
        <LabelBox x={640} y={120} w={90} h={46} text="fine-tune" accent={T} strong />
        <Arrow x1={160} y1={115} x2={188} y2={115} accent={T} />
        <Arrow x1={310} y1={115} x2={338} y2={115} accent={T} />
        <Arrow x1={420} y1={95} x2={488} y2={55} accent={T} animated={false} />
        <Arrow x1={420} y1={130} x2={498} y2={145} accent={T} animated={false} />
        <Arrow x1={600} y1={145} x2={638} y2={143} accent={T} />
        <Label x={455} y={78} size={10} color={T}>yes</Label>
        <Label x={455} y={150} size={10} color="#97A0A8">no</Label>
      </Frame>
    ),
  },
  /* p237 — dataset formats */
  {
    page: 237, chapter: 5, stage: "training", accent: T, archetype: "list-cluster",
    section: "Chat templates",
    term: "FORMATS", title: "Alpaca, ShareGPT, OpenAI, …",
    caption:
      "Instruction datasets are stored in standard JSONL formats: Alpaca (instruction/input/output, single-turn), ShareGPT and OpenAI (conversation lists, multi-turn), OASST, and raw text (continual pre-training).",
    diagram: (
      <Frame w={720} h={220}>
        {["Alpaca", "ShareGPT", "OpenAI", "OASST", "raw text"].map((t, i) => (
          <Pill key={t} x={30 + (i % 3) * 230} y={40 + Math.floor(i / 3) * 70} text={t} accent={T} w={210} />
        ))}
        <Label x={360} y={190} size={11} color="#5E6B76">single-turn (Alpaca) vs multi-turn (ShareGPT/OpenAI)</Label>
      </Frame>
    ),
  },
  /* p238 — ChatML template */
  {
    page: 238, chapter: 5, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Chat templates",
    term: "CHAT TEMPLATE", title: "ChatML special tokens",
    caption:
      "A chat template structures the pairs with special tokens. ChatML wraps each turn in <|im_start|> … <|im_end|> and names the speaker (system/user/assistant). Base models have no template, so you can pick any.",
    diagram: (
      <Frame w={720} h={210}>
        <Code
          x={30}
          y={35}
          w={500}
          lines={[
            { t: "<|im_start|>system", hi: true },
            { t: "You are a helpful assistant<|im_end|>", hi: false },
            { t: "<|im_start|>user", hi: true },
            { t: "...<|im_end|>", hi: false },
            { t: "<|im_start|>assistant", hi: true },
          ]}
        />
        {["system", "user", "assistant"].map((t, i) => (
          <Pill key={t} x={560} y={45 + i * 48} text={t} accent={T} w={130} />
        ))}
      </Frame>
    ),
  },
  /* p239 — Jinja templates */
  {
    page: 239, chapter: 5, stage: "training", accent: T, archetype: "comparison",
    section: "Chat templates",
    term: "JINJA TEMPLATES", title: "Whitespace matters — use Jinja",
    caption:
      "Every whitespace and line break in a chat template matters; a wrong character breaks tokenization. Use reliable Jinja templates (Transformers) — Alpaca, ChatML, Llama 3, Phi-3, Gemma — which also share one template for train + inference.",
    diagram: (
      <Frame w={720} h={220}>
        <BrandNode x={280} y={20} name="Jinja" sub="reliable templates" w={170} />
        {["Alpaca", "ChatML", "Llama 3", "Phi-3", "Gemma"].map((t, i) => (
          <Pill key={t} x={30 + (i % 3) * 235} y={90 + Math.floor(i / 3) * 52} text={t} accent={T} w={210} />
        ))}
        <Warn x={500} y={180} text="one char off → wrong tokenization" />
      </Frame>
    ),
  },
  /* p240 — Fig 5.9 three SFT techniques */
  {
    page: 240, chapter: 5, stage: "training", accent: T, archetype: "comparison",
    section: "Full fine-tuning",
    term: "SFT TECHNIQUES", title: "Full, LoRA, QLoRA (Fig 5.9)",
    caption:
      "SFT converges on three techniques: full fine-tuning (16-bit, all weights trainable), LoRA (16-bit, frozen weights + trainable A·B), and QLoRA (4-bit quantized frozen weights + trainable A·B).",
    diagram: (
      <Frame w={740} h={240}>
        {[
          ["Full", "16-bit · all trainable", false],
          ["LoRA", "16-bit · frozen W + A·B", false],
          ["QLoRA", "4-bit · frozen + A·B", true],
        ].map(([t, sub, q], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 245} y={50} w={210} h={70} text={t as string} sub={sub as string} accent={T} strong={q as boolean} />
            <ModelGlyph x={75 + i * 245} y={135} w={70} h={60} accent={T} />
            {i > 0 && <Pill x={140 + i * 245} y={150} text="A·B" accent={T} w={56} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p241 — full FT memory formula */
  {
    page: 241, chapter: 5, stage: "training", accent: T, archetype: "formula-as-blocks",
    section: "Full fine-tuning",
    term: "MEMORY", title: "16 bytes/param → 112 GB for 7B",
    caption:
      "Full fine-tuning memory ≈ parameters (4B) + gradients (4B) + optimizer states (8B, Adam) + activations per parameter = 16 bytes/param in fp32 → ~112 GB for a 7B model. It’s also destructive (catastrophic forgetting).",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["params", "4B"],
          ["gradients", "4B"],
          ["optimizer", "8B"],
          ["activations", "~"],
        ].map(([t, b], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 150} y={55} w={120} h={64} text={t as string} sub={b as string} accent={T} />
            {i < 3 && <Label x={150 + i * 150} y={87} size={20} weight={700} color="#97A0A8">+</Label>}
          </g>
        ))}
        <Label x={370} y={155} size={13} weight={700} color={T}>= 16 bytes/param · 112 GB (7B)</Label>
      </Frame>
    ),
  },
  /* p242 — Fig 5.10 LoRA */
  {
    page: 242, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "LoRA",
    term: "LORA", title: "Freeze W, train low-rank A·B (Fig 5.10)",
    caption:
      "LoRA freezes the pre-trained weight matrix W and adds two small trainable matrices A and B whose product is a low-rank update. Far fewer trainable parameters, non-destructive, and tasks switch by swapping LoRA weights.",
    diagram: (
      <Frame w={720} h={220}>
        <LabelBox x={60} y={70} w={120} h={90} text="W" sub="frozen · pre-trained" accent={T} />
        <Label x={230} y={115} size={22} weight={700} color="#97A0A8">+</Label>
        <LabelBox x={300} y={60} w={90} h={50} text="B" sub="d×r" accent={T} strong />
        <LabelBox x={300} y={120} w={90} h={50} text="A" sub="r×d" accent={T} strong />
        <Label x={460} y={115} size={20} weight={700} color="#97A0A8">→</Label>
        <ModelGlyph x={540} y={70} w={110} h={90} accent={T} />
        <Label x={595} y={175} size={11} weight={600}>W′ = W + B·A</Label>
        <Label x={345} y={205} size={10.5} color={T}>trainable, low rank r</Label>
      </Frame>
    ),
  },
  /* p243 — LoRA hyperparams */
  {
    page: 243, chapter: 5, stage: "training", accent: T, archetype: "formula-as-blocks",
    section: "LoRA",
    term: "LORA CONFIG", title: "Rank r, alpha α, target modules",
    caption:
      "W′ = W + B·A. Key hyperparameters: rank r (size of the matrices; common 8–256), alpha α (scaling, often 2r), optional dropout. Target modules start at Q/V attention, often extended to K, O, MLP, and output layers.",
    diagram: (
      <Frame w={720} h={210}>
        <Label x={360} y={40} size={16} weight={700} color={T}>W′ = W + B·A</Label>
        {[
          ["rank r", "8 – 256"],
          ["alpha α", "≈ 2r"],
          ["dropout", "0 – 0.1"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={40 + i * 220} y={80} w={190} h={70} text={t as string} sub={sub as string} accent={T} />
        ))}
        <Label x={360} y={180} size={11} color="#5E6B76">target: Q · V → K · O · MLP · output</Label>
      </Frame>
    ),
  },
  /* p244 — QLoRA */
  {
    page: 244, chapter: 5, stage: "training", accent: T, archetype: "comparison",
    section: "QLoRA",
    term: "QLORA", title: "4-bit quantization + adapters",
    caption:
      "QLoRA quantizes the frozen base to 4-bit NormalFloat (NF4) and trains only LoRA adapters, with double quantization and paged optimizers — cutting peak GPU memory up to ~75% vs LoRA, at ~30% slower training and minimal quality loss.",
    diagram: (
      <Frame w={740} h={220}>
        <LabelBox x={40} y={60} w={250} h={56} text="LoRA" sub="16-bit · 15.6 GB" accent={T} />
        <Label x={360} y={110} size={18} weight={700} color="#97A0A8">→</Label>
        <LabelBox x={440} y={60} w={260} h={56} text="QLoRA" sub="4-bit NF4 · 9.3 GB" accent={T} strong />
        <Pill x={440} y={140} text="double quant · paged optim" accent={T} w={260} />
        <Pill x={40} y={140} text="≈ 30% slower, ~same quality" accent={T} w={250} />
      </Frame>
    ),
  },
  /* p245 — learning rate scheduler */
  {
    page: 245, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "Batch size",
    term: "LEARNING RATE", title: "Warmup, then decay (linear/cosine)",
    caption:
      "The learning rate is the key hyperparameter (≈1e-5 start). A scheduler warms up (e.g. 5% of steps from 0) then decays — linear or cosine over the rest. Too low → stuck; too high → diverges.",
    diagram: (
      <Frame w={720} h={220}>
        <line x1={40} y1={180} x2={680} y2={180} stroke="#CBD3D8" strokeWidth={1.5} />
        <line x1={40} y1={40} x2={40} y2={180} stroke="#CBD3D8" strokeWidth={1.5} />
        <Label x={20} y={100} size={10} color="#5E6B76" anchor="end">LR</Label>
        <path d="M 40 170 L 120 60 Q 400 80 660 160" fill="none" stroke={T} strokeWidth={3} strokeLinecap="round" />
        <Label x={90} y={45} size={10.5} color={T}>warmup</Label>
        <Label x={450} y={70} size={10.5} color={T}>cosine decay</Label>
        <circle cx={120} cy={60} r={5} fill={T} />
      </Frame>
    ),
  },
  /* p246 — effective batch formula */
  {
    page: 246, chapter: 5, stage: "training", accent: T, archetype: "formula-as-blocks",
    section: "Maximum length and packing",
    term: "BATCH SIZE", title: "Effective batch = batch × accum × GPUs",
    caption:
      "Larger batches give more stable gradients but cost memory. Gradient accumulation fakes a big batch by accumulating gradients over mini-batches: effective batch = per-device batch × accumulation steps × #GPUs (e.g. 4 × 4 × 2 = 32).",
    diagram: (
      <Frame w={740} h={200}>
        {[
          ["batch", "4"],
          ["accum steps", "4"],
          ["GPUs", "2"],
        ].map(([t, b], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 180} y={55} w={150} h={64} text={t as string} sub={b as string} accent={T} />
            {i < 2 && <Label x={170 + i * 180} y={87} size={20} weight={700} color="#97A0A8">×</Label>}
          </g>
        ))}
        <Label x={620} y={87} size={22} weight={700} color="#97A0A8">= 32</Label>
      </Frame>
    ),
  },
  /* p247 — packing */
  {
    page: 247, chapter: 5, stage: "training", accent: T, archetype: "single-concept",
    section: "Optimizers",
    term: "PACKING", title: "Pack short samples into one slot",
    caption:
      "Packing fills each batch slot (e.g. 1,024 tokens) with multiple short samples instead of one — improving efficiency on short-sequence datasets. Attention masks stop the model attending across packed samples.",
    diagram: (
      <Frame w={720} h={210}>
        <Label x={120} y={40} size={11} weight={700} color="#5E6B76">without packing</Label>
        <rect x={40} y={60} width={90} height={30} rx={6} fill={`${T}26`} stroke={T} strokeWidth={1.5} />
        <rect x={140} y={60} width={300} height={30} rx={6} fill="none" stroke="#CBD3D8" strokeWidth={1.4} strokeDasharray="5 4" />
        <Label x={520} y={75} size={10.5} color="#97A0A8" anchor="start">wasted</Label>
        <Label x={120} y={130} size={11} weight={700} color={T}>with packing</Label>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={40 + i * 102} y={150} width={92} height={30} rx={6} fill={`${T}26`} stroke={T} strokeWidth={1.5} />
        ))}
      </Frame>
    ),
  },
  /* p248 — gradient checkpointing */
  {
    page: 248, chapter: 5, stage: "training", accent: T, archetype: "comparison",
    section: "Fine-tuning in practice",
    term: "MEMORY TRICKS", title: "Weight decay + gradient checkpointing",
    caption:
      "Weight decay (≈0.01) penalizes large weights for generalization. Gradient checkpointing saves only some activations and recomputes the rest in the backward pass — trading compute for memory. AdamW 8-bit cuts optimizer memory.",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={40} y={70} w={280} h={70} text="gradient checkpointing" sub="save few activations, recompute" accent={T} strong />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">⇄</Label>
        <Pill x={420} y={60} text="less memory" accent={T} w={250} />
        <Warn x={440} y={120} text="more compute (recompute)" />
      </Frame>
    ),
  },
  /* p249 — model selection + libraries */
  {
    page: 249, chapter: 5, stage: "training", accent: T, archetype: "list-cluster",
    section: "Fine-tuning in practice",
    term: "PICK A MODEL", title: "License, budget, performance — and a library",
    caption:
      "Choose a base model by license (commercial use?), budget (smaller = cheaper), and performance (benchmarks). The book picks Llama 3.1 8B. Fine-tuning libraries: TRL (Hugging Face), Axolotl, and Unsloth.",
    diagram: (
      <Frame w={740} h={220}>
        {["license", "budget", "performance"].map((t, i) => (
          <Pill key={t} x={30 + i * 165} y={40} text={t} accent={T} w={150} />
        ))}
        <BrandNode x={520} y={30} name="Meta Llama" sub="Llama 3.1 8B" w={200} />
        <BrandNode x={30} y={130} name="TRL" w={150} />
        <BrandNode x={210} y={130} name="Axolotl" w={150} />
        <BrandNode x={390} y={130} name="Unsloth" w={150} />
        <Label x={620} y={150} size={11} color="#5E6B76">2–5× faster, 80% less mem</Label>
      </Frame>
    ),
  },
  /* p250 — load model */
  {
    page: 250, chapter: 5, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Fine-tuning in practice",
    term: "LOAD MODEL", title: "FastLanguageModel.from_pretrained",
    caption:
      "Unsloth’s FastLanguageModel loads the base model + tokenizer with a max_seq_length (2,048). load_in_4bit toggles QLoRA (quantized) vs LoRA — the book uses LoRA (load_in_4bit=False) for faster, higher-quality training.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={450}
          lines={[
            { t: "model, tokenizer = FastLanguageModel", hi: true },
            { t: "  .from_pretrained(", hi: false },
            { t: '    "meta-llama/Meta-Llama-3.1-8B",', hi: false },
            { t: "    max_seq_length=2048,", hi: false },
            { t: "    load_in_4bit=False)  # LoRA", hi: true },
          ]}
        />
        <BrandNode x={520} y={75} name="Unsloth" w={150} />
        <BrandNode x={520} y={135} name="Meta Llama" w={170} />
      </Frame>
    ),
  },
  /* p251 — LoRA config */
  {
    page: 251, chapter: 5, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Fine-tuning in practice",
    term: "PEFT CONFIG", title: "rank 32, alpha 32, all linear layers",
    caption:
      "get_peft_model adds LoRA with rank 32 (large enough to copy writing style + knowledge), alpha 32, no dropout/bias for speed, targeting every linear layer (q/k/v/o/gate/up/down projections) to maximize quality.",
    diagram: (
      <Frame w={720} h={200}>
        <Code
          x={30}
          y={40}
          w={420}
          lines={[
            { t: "FastLanguageModel.get_peft_model(", hi: true },
            { t: "  r=32, lora_alpha=32,", hi: false },
            { t: "  lora_dropout=0,", hi: false },
            { t: "  target_modules=[q,k,v,o,gate,up,down])", hi: true },
          ]}
        />
        <Pill x={490} y={70} text="rank 32" accent={T} w={150} />
        <Pill x={490} y={115} text="all linear layers" accent={T} w={180} />
      </Frame>
    ),
  },
  /* p252 — prepare data */
  {
    page: 252, chapter: 5, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Fine-tuning in practice",
    term: "DATA PREP", title: "Upsample with FineTome, apply Alpaca",
    caption:
      "The small llmtwin set (3k) is concatenated with 10k FineTome samples so the model learns the chat template, then mapped to the Alpaca template with an explicit EOS token so the model learns to stop.",
    diagram: (
      <Frame w={740} h={210}>
        <SnapshotGlyph x={20} y={40} w={150} h={50} accent={T} title="llmtwin (3k)" usedFor="" />
        <SnapshotGlyph x={20} y={110} w={170} h={50} accent={T} title="FineTome (10k)" usedFor="" />
        <DecisionGlyph x={250} y={70} w={90} h={80} accent={T} mark="⊕" />
        <LabelBox x={400} y={82} w={170} h={56} text="Alpaca template" sub="+ EOS token" accent={T} strong />
        <SnapshotGlyph x={600} y={84} w={120} h={52} accent={T} title="ready" usedFor="" />
        <Arrow x1={170} y1={65} x2={248} y2={100} accent={T} animated={false} />
        <Arrow x1={190} y1={135} x2={248} y2={120} accent={T} animated={false} />
        <Arrow x1={340} y1={110} x2={398} y2={110} accent={T} />
        <Arrow x1={570} y1={110} x2={598} y2={110} accent={T} />
      </Frame>
    ),
  },
  /* p253 — SFTTrainer config */
  {
    page: 253, chapter: 5, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Fine-tuning in practice",
    term: "SFTTRAINER", title: "The training hyperparameters",
    caption:
      "SFTTrainer holds the run: learning rate 3e-4 with a linear scheduler, batch 2 × 8 accumulation (effective 16), 3 epochs, adamw_8bit, weight_decay 0.01, packing on — reported to Comet ML.",
    diagram: (
      <Frame w={740} h={210}>
        <Code
          x={30}
          y={35}
          w={460}
          lines={[
            { t: "TrainingArguments(", hi: false },
            { t: "  learning_rate=3e-4, lr=linear,", hi: true },
            { t: "  batch=2, grad_accum=8,  # eff 16", hi: false },
            { t: "  num_train_epochs=3,", hi: false },
            { t: '  optim="adamw_8bit", report_to="comet_ml")', hi: true },
          ]}
        />
        <BrandNode x={530} y={90} name="Comet" sub="track" w={170} />
      </Frame>
    ),
  },
  /* p254 — save + push */
  {
    page: 254, chapter: 5, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Fine-tuning in practice",
    term: "SAVE", title: "Test, merge, push to the Hub",
    caption:
      "After training (≈50 min on an A100), a quick inference check confirms no tokenizer/template errors, then the model is saved merged (16-bit) and pushed to the Hugging Face Hub as mlabonne/TwinLlama-3.1-8B.",
    diagram: (
      <Frame w={740} h={200}>
        <ModelGlyph x={30} y={60} w={110} h={100} accent={T} />
        <Label x={85} y={175} size={11}>fine-tuned</Label>
        <LabelBox x={210} y={85} w={130} h={50} text="quick test" accent={T} />
        <LabelBox x={390} y={85} w={150} h={50} text="merge 16-bit" accent={T} />
        <BrandNode x={580} y={85} name="Hugging Face" sub="TwinLlama-3.1-8B" w={150} />
        <Arrow x1={140} y1={110} x2={208} y2={110} accent={T} />
        <Arrow x1={340} y1={110} x2={388} y2={110} accent={T} />
        <Arrow x1={540} y1={110} x2={578} y2={110} accent={T} />
      </Frame>
    ),
  },
  /* p255 — three metrics */
  {
    page: 255, chapter: 5, stage: "training", accent: T, archetype: "comparison",
    section: "Summary",
    term: "MONITOR", title: "Watch three training metrics (Fig 5.11)",
    caption:
      "Monitor in Comet ML: training loss (should fall then plateau; spikes = trouble), validation loss (should track training with a small gap; rising = overfitting), and gradient norm (stable/decreasing = converging; use clipping if it spikes).",
    diagram: (
      <Frame w={740} h={220}>
        {[
          ["training loss", "fall → plateau"],
          ["validation loss", "small gap; rising = overfit"],
          ["gradient norm", "stable = converging"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 245} y={70} w={210} h={80} text={t as string} sub={sub as string} accent={T} strong={i === 0} />
        ))}
      </Frame>
    ),
  },
];
