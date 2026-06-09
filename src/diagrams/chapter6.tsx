// Chapter 6 — Fine-Tuning with Preference Alignment (pp. 258–286). Preference
// datasets (chosen vs rejected triples), generation + evaluation, then RLHF/PPO
// vs DPO, and a practical DPO fine-tune of TwinLlama with Unsloth. Stage =
// Training (amber). Figures 6.1, 6.2, 6.4 (PPO), 6.5 (DPO), 6.6 redrawn.
// pp.287–289 are References (non-content) and are skipped.
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

export const CHAPTER6: PageDiagram[] = [
  /* p258 */
  {
    page: 258, chapter: 6, stage: "training", accent: T, archetype: "single-concept",
    section: "Chapter 6: Fine-Tuning with Preference Alignment",
    term: "PREFERENCE ALIGNMENT", title: "Beyond SFT: align to human preference",
    caption:
      "SFT teaches tasks but misses the nuance of human preferences. Preference alignment adds direct human/AI feedback; this chapter focuses on Direct Preference Optimization (DPO) to refine the model’s voice.",
    diagram: (
      <Frame w={720} h={210}>
        <ModelGlyph x={40} y={60} w={110} h={100} accent={T} />
        <Label x={95} y={175} size={11}>SFT model</Label>
        <Warn x={210} y={90} text="misses preference nuance" />
        <DecisionGlyph x={420} y={70} w={90} h={80} accent={T} mark="DPO" />
        <ModelGlyph x={570} y={60} w={110} h={100} accent={T} />
        <Label x={625} y={175} size={11} weight={700}>aligned</Label>
        <Arrow x1={150} y1={110} x2={418} y2={110} accent={T} animated={false} />
        <Arrow x1={510} y1={110} x2={568} y2={110} accent={T} />
      </Frame>
    ),
  },
  /* p259 — Fig 6.1 same data pipeline */
  {
    page: 259, chapter: 6, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Preference data",
    term: "SAME PIPELINE", title: "Same data stages as instructions (Fig 6.1)",
    caption:
      "Preference datasets follow the same accuracy/diversity/complexity goals and the same stages as instruction datasets — curation through augmentation. Only generation and evaluation differ meaningfully.",
    diagram: (
      <Frame w={760} h={200}>
        {["curation", "dedup", "decontam.", "generation", "evaluation"].map((t, i) => (
          <g key={t}>
            <PipelineGlyph x={12 + i * 150} y={70} w={128} h={62} accent={T} />
            <Label x={76 + i * 150} y={101} weight={600} size={12}>{t}</Label>
            {i < 4 && <Arrow x1={140 + i * 150} y1={101} x2={160 + i * 150} y2={101} accent={T} animated={i === 3} />}
          </g>
        ))}
        <Label x={530} y={165} size={11} color="#5E6B76">generation + evaluation differ most →</Label>
      </Frame>
    ),
  },
  /* p260 — chosen vs rejected */
  {
    page: 260, chapter: 6, stage: "training", accent: T, archetype: "single-concept",
    section: "Preference data",
    term: "DPO TRIPLE", title: "Instruction + chosen + rejected",
    caption:
      "A DPO sample pairs an instruction with one chosen (preferred) and one rejected answer. The rejected answer is as important as the chosen — it defines the behavior to eliminate. Useful for chatbots, moderation, summarization, code, and style.",
    diagram: (
      <Frame w={720} h={220}>
        <LabelBox x={30} y={90} w={170} h={56} text="instruction" accent={T} />
        <LabelBox x={300} y={40} w={210} h={56} text="chosen ✓" sub="preferred" accent={T} strong />
        <LabelBox x={300} y={130} w={210} h={56} text="rejected ✗" sub="behavior to remove" accent={T} />
        <Arrow x1={200} y1={110} x2={298} y2={68} accent={T} />
        <Arrow x1={200} y1={120} x2={298} y2={158} accent={T} animated={false} />
        <Label x={620} y={90} size={11} color="#5E6B76">train to prefer</Label>
        <Label x={620} y={158} size={11} color="#97A0A8">over</Label>
      </Frame>
    ),
  },
  /* p261 — data quantity */
  {
    page: 261, chapter: 6, stage: "training", accent: T, archetype: "comparison",
    section: "Data quantity",
    term: "DATA QUANTITY", title: "Fewer samples than instruction data",
    caption:
      "DPO needs fewer samples than SFT. General-purpose alignment uses millions; the open-source community uses 10k–100k; task-specific alignment (e.g. change writing style) needs 100–10k — and tasks like ‘state who trained you’ need just 200–500.",
    diagram: (
      <Frame w={740} h={220}>
        {[
          ["general-purpose", "millions"],
          ["open-source", "10k – 100k"],
          ["task-specific", "100 – 10k"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 245} y={70} w={210} h={80} text={t as string} sub={sub as string} accent={T} strong={i === 2} />
        ))}
      </Frame>
    ),
  },
  /* p262 — four generation methods */
  {
    page: 262, chapter: 6, stage: "training", accent: T, archetype: "comparison",
    section: "Generating preferences",
    term: "GEN × EVAL", title: "Who generates, who evaluates",
    caption:
      "Four data strategies along two axes (generator × evaluator): human/human (best, costly), human/LLM (rare), LLM/human (good balance), LLM/LLM (fully synthetic, scalable). The book uses generation to create chosen (human) vs rejected (LLM).",
    diagram: (
      <Frame w={720} h={250}>
        <Label x={250} y={30} size={10.5} color="#5E6B76">evaluate: human</Label>
        <Label x={490} y={30} size={10.5} color="#5E6B76">evaluate: LLM</Label>
        <Label x={120} y={90} anchor="end" size={10.5} color="#5E6B76">gen: human</Label>
        <Label x={120} y={170} anchor="end" size={10.5} color="#5E6B76">gen: LLM</Label>
        {[
          ["best, costly", false],
          ["rare", false],
          ["good balance", true],
          ["fully synthetic", false],
        ].map(([t, best], i) => (
          <LabelBox key={i} x={150 + (i % 2) * 240} y={60 + Math.floor(i / 2) * 80} w={210} h={60} text={t as string} accent={T} strong={best as boolean} />
        ))}
      </Frame>
    ),
  },
  /* p263 — temperature for diversity */
  {
    page: 263, chapter: 6, stage: "training", accent: T, archetype: "comparison",
    section: "Tips for data generation",
    term: "DIVERSITY", title: "Temperature trades diversity vs coherence",
    caption:
      "To vary outputs, manipulate temperature: high → creative, diverse (articles); low → focused, deterministic (code). Using multiple LLMs adds variety (e.g. Capybara-Preferences mixes GPT-4 with open-weight models).",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={40} y={70} w={250} h={70} text="low temperature" sub="focused · code" accent={T} />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">↔</Label>
        <LabelBox x={430} y={70} w={250} h={70} text="high temperature" sub="creative · articles" accent={T} strong />
        <Label x={360} y={175} size={11} color="#5E6B76">multiple LLMs → more variety</Label>
      </Frame>
    ),
  },
  /* p264 — absolute vs pairwise */
  {
    page: 264, chapter: 6, stage: "training", accent: T, archetype: "comparison",
    section: "Evaluating preferences",
    term: "EVAL MODES", title: "Absolute scoring vs pairwise ranking",
    caption:
      "LLM evaluation can be absolute (rate each response on a scale — simple but inconsistent) or pairwise (present two responses, pick the better — mimics human comparison, more consistent).",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={40} y={70} w={260} h={70} text="absolute scoring" sub="rate 1–5 each" accent={T} />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={70} w={260} h={70} text="pairwise ranking" sub="A vs B → better one" accent={T} strong />
      </Frame>
    ),
  },
  /* p265 — pairwise judge */
  {
    page: 265, chapter: 6, stage: "training", accent: T, archetype: "single-concept",
    section: "Evaluating preferences",
    term: "PAIRWISE JUDGE", title: "Compare A vs B with reasoning",
    caption:
      "Pairwise ranking suits preference data and correlates best with human judgment. Boost it with a ground-truth answer and chain-of-thought reasoning, or a ‘grading note’ describing the expected answer when no ground truth exists.",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={30} y={50} w={150} h={48} text="answer A" accent={T} />
        <LabelBox x={30} y={120} w={150} h={48} text="answer B" accent={T} />
        <ModelGlyph x={260} y={65} w={100} h={90} accent={T} />
        <Label x={310} y={170} size={11}>judge LLM</Label>
        <LabelBox x={460} y={85} w={220} h={50} text="best answer + reasoning" accent={T} strong />
        <Arrow x1={180} y1={74} x2={258} y2={100} accent={T} animated={false} />
        <Arrow x1={180} y1={144} x2={258} y2={120} accent={T} animated={false} />
        <Arrow x1={360} y1={110} x2={458} y2={110} accent={T} />
      </Frame>
    ),
  },
  /* p266 — eval biases */
  {
    page: 266, chapter: 6, stage: "training", accent: T, archetype: "pitfall",
    section: "Creating our own preference dataset",
    term: "JUDGE BIASES", title: "Position, length, family bias",
    caption:
      "LLM judges have biases: position (favor the first answer — randomize order), length (favor long answers — few-shot calibrate), and family (favor own-family models — use a jury of models).",
    diagram: (
      <Frame w={720} h={220}>
        <ModelGlyph x={290} y={70} w={110} h={100} accent={T} />
        <Label x={345} y={185} size={11}>LLM judge</Label>
        {[["position bias", "randomize order"], ["length bias", "few-shot calibrate"], ["family bias", "use a jury"]].map(([w, fix], i) => (
          <g key={i}>
            <Warn x={40} y={50 + i * 50} text={w as string} />
            <Pill x={490} y={35 + i * 50} text={fix as string} accent={T} w={200} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* p267 — Fig 6.2 preference pipeline */
  {
    page: 267, chapter: 6, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Creating our own preference dataset",
    term: "GEN PIPELINE", title: "Raw text → preference triples (Fig 6.2)",
    caption:
      "The pipeline mirrors Chapter 5 but makes triples: clean → chunk → generate (instruction, generated=rejected, extracted=chosen) → filter by length + punctuation. The chunk is the ground-truth chosen answer, so no LLM judge is needed.",
    diagram: (
      <Frame w={760} h={200}>
        <DocumentGlyph x={10} y={70} w={70} h={70} accent={T} />
        {["clean", "chunk", "generate", "filter"].map((t, i) => (
          <g key={t}>
            <LabelBox x={100 + i * 140} y={78} w={110} h={52} text={t} accent={T} strong={i === 2} />
            <Arrow x1={80 + i * 140} y1={104} x2={98 + i * 140} y2={104} accent={T} animated={i === 0} />
          </g>
        ))}
        <SnapshotGlyph x={660} y={80} w={90} h={50} accent={T} title="triples" usedFor="" />
        <Arrow x1={660} y1={104} x2={658} y2={104} accent={T} />
      </Frame>
    ),
  },
  /* p268 — PreferenceSet class */
  {
    page: 268, chapter: 6, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Creating our own preference dataset",
    term: "PreferenceSet", title: "Triples: instruction + generated + extracted",
    caption:
      "PreferenceSet replaces InstructionAnswerSet, parsing JSON triples of (instruction, generated_answer → rejected, extracted_answer → chosen).",
    diagram: (
      <Frame w={720} h={200}>
        <Code
          x={30}
          y={40}
          w={420}
          lines={[
            { t: "class PreferenceSet:", hi: true },
            { t: "  triples = [(instruction,", hi: false },
            { t: "    generated_answer,  # rejected", hi: true },
            { t: "    extracted_answer)] # chosen", hi: true },
          ]}
        />
        <SnapshotGlyph x={500} y={70} w={200} h={56} accent={T} title="(instr, rej, chosen)" usedFor="" />
      </Frame>
    ),
  },
  /* p269 — reused functions */
  {
    page: 269, chapter: 6, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Creating our own preference dataset",
    term: "REUSED", title: "Load, clean, chunk — reused from Ch. 5",
    caption:
      "load_articles_from_json, clean_text, and extract_substrings are unchanged from Chapter 5: JSON → Hugging Face Dataset, regex cleaning, and sentence-aware chunking into 1,000–2,000-character pieces.",
    diagram: (
      <Frame w={740} h={190}>
        <DocumentGlyph x={20} y={60} w={80} h={70} accent={T} />
        {["load_json", "clean_text", "extract_substrings"].map((t, i) => (
          <g key={t}>
            <LabelBox x={130 + i * 200} y={70} w={180} h={52} text={t} accent={T} />
            {i < 2 && <Arrow x1={310 + i * 200} y1={96} x2={328 + i * 200} y2={96} accent={T} />}
          </g>
        ))}
        <Arrow x1={100} y1={95} x2={128} y2={96} accent={T} />
      </Frame>
    ),
  },
  /* p270 — generate_preference_triples prompt */
  {
    page: 270, chapter: 6, stage: "training", accent: T, archetype: "single-concept",
    section: "Creating our own preference dataset",
    term: "GEN PROMPT", title: "Five triples, verbatim extracted answer",
    caption:
      "generate_preference_triples asks for five triples per chunk: an instruction, a generated answer (the model’s attempt), and an extracted answer copied verbatim from the context — no ellipsis, two separate sentences if needed.",
    diagram: (
      <Frame w={720} h={220}>
        <SnapshotGlyph x={30} y={85} w={140} h={60} accent={T} title="chunk" usedFor="" />
        <ModelGlyph x={250} y={65} w={100} h={90} accent={T} />
        <Label x={300} y={170} size={11}>GPT-4o-mini</Label>
        {[["instruction", false], ["generated → rejected", false], ["extracted → chosen", true]].map(([t, c], i) => (
          <Pill key={i} x={440} y={45 + i * 46} text={t as string} accent={T} w={250} />
        ))}
        <Arrow x1={170} y1={115} x2={248} y2={110} accent={T} />
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={350} y1={110} x2={438} y2={58 + i * 46} accent={T} animated={i === 2} />
        ))}
      </Frame>
    ),
  },
  /* p271 — JSON mode */
  {
    page: 271, chapter: 6, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Creating our own preference dataset",
    term: "JSON MODE", title: "GPT-4o-mini → PreferenceSet",
    caption:
      "GPT-4o-mini runs in JSON mode (max 2,000 tokens, temp 0.7); the system prompt asks for triples; the response is parsed by PreferenceSet.from_json into (instruction, rejected, chosen) tuples.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={430}
          lines={[
            { t: 'model="gpt-4o-mini",', hi: true },
            { t: '  response_format={"type":"json_object"},', hi: true },
            { t: "  max_tokens=2000, temperature=0.7", hi: false },
            { t: "→ PreferenceSet.from_json(...)", hi: false },
          ]}
        />
        <BrandNode x={500} y={75} name="GPT-4o" sub="JSON mode" w={170} />
      </Frame>
    ),
  },
  /* p272 — filters */
  {
    page: 272, chapter: 6, stage: "training", accent: T, archetype: "single-concept",
    section: "Creating our own preference dataset",
    term: "FILTERS", title: "Filter short + malformed answers",
    caption:
      "Two heuristic filters clean the preference set: filter_short_answers drops chosen answers under a min length; filter_answer_format keeps only answers starting uppercase and ending with proper punctuation.",
    diagram: (
      <Frame w={720} h={210}>
        <SnapshotGlyph x={20} y={85} w={150} h={56} accent={T} title="triples" usedFor="" />
        <LabelBox x={240} y={45} w={210} h={48} text="filter_short_answers" accent={T} />
        <LabelBox x={240} y={130} w={210} h={48} text="filter_answer_format" accent={T} />
        <SnapshotGlyph x={520} y={85} w={170} h={56} accent={T} title="clean triples" usedFor="" />
        <Arrow x1={170} y1={110} x2={238} y2={70} accent={T} animated={false} />
        <Arrow x1={170} y1={115} x2={238} y2={154} accent={T} animated={false} />
        <Arrow x1={450} y1={70} x2={518} y2={108} accent={T} animated={false} />
        <Arrow x1={450} y1={154} x2={518} y2={118} accent={T} animated={false} />
      </Frame>
    ),
  },
  /* p273 — create_preference_dataset */
  {
    page: 273, chapter: 6, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Creating our own preference dataset",
    term: "BUILD", title: "Parallel build → prompt/chosen/rejected",
    caption:
      "create_preference_dataset extracts substrings, generates triples in parallel (ThreadPoolExecutor), and returns a Dataset with columns prompt, chosen, and rejected.",
    diagram: (
      <Frame w={740} h={190}>
        <LabelBox x={30} y={70} w={180} h={56} text="ThreadPoolExecutor" accent={T} />
        <LabelBox x={280} y={70} w={160} h={56} text="generate triples" accent={T} />
        <SnapshotGlyph x={500} y={55} w={210} h={86} accent={T} title="prompt · chosen · rejected" usedFor="Dataset" />
        <Arrow x1={210} y1={98} x2={278} y2={98} accent={T} />
        <Arrow x1={440} y1={98} x2={498} y2={98} accent={T} />
      </Frame>
    ),
  },
  /* p274 — filtered to 1467, push */
  {
    page: 274, chapter: 6, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Preference alignment",
    term: "DATASET", title: "2,970 → 1,467 samples → Hub (Fig 6.3)",
    caption:
      "Generation produced 2,970 samples, filtered to 1,467 (mlabonne/llmtwin-dpo). The chosen (extracted) answers sound more casual; the rejected (generated) answers are more formal — exactly the style nudge DPO will apply.",
    diagram: (
      <Frame w={740} h={200}>
        <Pill x={30} y={85} text="2,970 generated" accent={T} w={180} />
        <DecisionGlyph x={260} y={60} w={90} h={80} accent={T} mark="filter" />
        <Pill x={420} y={85} text="1,467 kept" accent={T} w={150} />
        <BrandNode x={600} y={82} name="Hugging Face" sub="llmtwin-dpo" w={130} />
        <Arrow x1={210} y1={100} x2={258} y2={100} accent={T} />
        <Arrow x1={350} y1={100} x2={418} y2={100} accent={T} />
        <Arrow x1={570} y1={105} x2={598} y2={105} accent={T} />
      </Frame>
    ),
  },
  /* p275 — RLHF loop */
  {
    page: 275, chapter: 6, stage: "training", accent: T, archetype: "cycle",
    section: "Reinforcement Learning from Human Feedback",
    term: "RLHF", title: "Reward model + policy, iterated",
    caption:
      "RLHF learns a reward model from human preference comparisons, then optimizes a policy to maximize predicted reward; the improved policy generates new behaviors for fresh human feedback — an iterative loop.",
    diagram: (
      <Frame w={740} h={240}>
        <LabelBox x={60} y={95} w={180} h={56} text="reward model" sub="from preferences" accent={T} />
        <LabelBox x={320} y={30} w={160} h={56} text="policy" sub="optimize (RL)" accent={T} strong />
        <UserGlyph x={560} y={70} w={80} h={80} accent={T} />
        <Label x={600} y={165} size={11}>human feedback</Label>
        <Arrow x1={240} y1={110} x2={320} y2={70} accent={T} />
        <Arrow x1={480} y1={58} x2={560} y2={95} accent={T} animated={false} />
        <Arrow x1={560} y1={130} x2={200} y2={150} accent={T} animated={false} />
        <Label x={360} y={200} size={11} color="#5E6B76">iterate: better policy → better feedback</Label>
      </Frame>
    ),
  },
  /* p276 — Fig 6.4 PPO */
  {
    page: 276, chapter: 6, stage: "training", accent: T, archetype: "architecture",
    section: "Reinforcement Learning from Human Feedback",
    term: "PPO", title: "PPO: reward + KL to a frozen model (Fig 6.4)",
    caption:
      "In PPO, the trained model’s text is scored by a reward model; a KL-divergence term against a frozen copy keeps the token distribution close to the original. Those signals update the trained model’s weights.",
    diagram: (
      <Frame w={740} h={260}>
        <DataStoreGlyph x={330} y={10} w={80} h={70} accent={T} />
        <Label x={370} y={95} size={11}>data</Label>
        <ModelGlyph x={120} y={100} w={100} h={90} accent={T} />
        <Label x={170} y={205} size={11}>frozen model</Label>
        <ModelGlyph x={520} y={100} w={100} h={90} accent={T} />
        <Label x={570} y={205} size={11} weight={700}>trained model</Label>
        <LabelBox x={290} y={110} w={120} h={48} text="KL divergence" accent={T} />
        <LabelBox x={290} y={185} w={120} h={48} text="reward model" accent={T} strong />
        <Arrow x1={360} y1={80} x2={200} y2={120} accent={T} animated={false} />
        <Arrow x1={360} y1={80} x2={560} y2={120} accent={T} animated={false} />
        <Arrow x1={220} y1={150} x2={288} y2={140} accent={T} animated={false} />
        <Arrow x1={520} y1={150} x2={412} y2={150} accent={T} animated={false} />
        <Arrow x1={350} y1={210} x2={520} y2={170} accent={T} />
        <Label x={440} y={235} size={10.5} color={T}>update weights</Label>
      </Frame>
    ),
  },
  /* p277 — DPO intro */
  {
    page: 277, chapter: 6, stage: "training", accent: T, archetype: "single-concept",
    section: "Direct Preference Optimization",
    term: "DPO", title: "No reward model — a direct loss",
    caption:
      "DPO (Rafailov et al., 2023) derives a closed-form optimal policy, turning preference learning into a simple binary cross-entropy loss on the model’s probabilities: raise chosen, lower rejected, stay near a frozen reference. A beta (0–1) controls reference strength (0.1 typical).",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={40} y={80} w={170} h={56} text="chosen ↑ / rejected ↓" accent={T} strong />
        <DecisionGlyph x={290} y={65} w={100} h={90} accent={T} mark="BCE" />
        <Label x={340} y={170} size={11} color="#5E6B76">direct loss</Label>
        <ModelGlyph x={470} y={70} w={100} h={90} accent={T} />
        <Pill x={600} y={95} text="β ≈ 0.1" accent={T} w={100} />
        <Arrow x1={210} y1={108} x2={288} y2={110} accent={T} />
        <Arrow x1={390} y1={110} x2={468} y2={112} accent={T} />
      </Frame>
    ),
  },
  /* p278 — Fig 6.5 DPO */
  {
    page: 278, chapter: 6, stage: "training", accent: T, archetype: "architecture",
    section: "Direct Preference Optimization",
    term: "DPO FLOW", title: "DPO: frozen + trained → scores → DPO (Fig 6.5)",
    caption:
      "DPO greatly simplifies PPO: data flows to a frozen and a trained model; their scores feed a single DPO step that updates the trained model — no separate reward model or RL loop. With adapters, one model serves as both.",
    diagram: (
      <Frame w={740} h={250}>
        <DataStoreGlyph x={330} y={10} w={80} h={70} accent={T} />
        <Label x={370} y={95} size={11}>data</Label>
        <ModelGlyph x={120} y={100} w={100} h={90} accent={T} />
        <Label x={170} y={205} size={11}>frozen model</Label>
        <ModelGlyph x={520} y={100} w={100} h={90} accent={T} />
        <Label x={570} y={205} size={11} weight={700}>trained model</Label>
        <DecisionGlyph x={320} y={115} w={100} h={90} accent={T} mark="DPO" />
        <Arrow x1={360} y1={80} x2={200} y2={120} accent={T} animated={false} />
        <Arrow x1={360} y1={80} x2={560} y2={120} accent={T} animated={false} />
        <Arrow x1={220} y1={155} x2={318} y2={158} accent={T} animated={false} />
        <Arrow x1={520} y1={155} x2={422} y2={158} accent={T} animated={false} />
        <Arrow x1={420} y1={170} x2={520} y2={175} accent={T} />
        <Label x={460} y={228} size={10.5} color={T}>update weights</Label>
      </Frame>
    ),
  },
  /* p279 — DPO vs PPO tradeoff */
  {
    page: 279, chapter: 6, stage: "training", accent: T, archetype: "comparison",
    section: "Implementing DPO",
    term: "DPO vs PPO", title: "Ease vs peak performance",
    caption:
      "PPO-style RLHF has a higher performance ceiling for huge runs but is complex and unstable. DPO is simpler, more stable, more efficient, and delivers most of the benefit — ideal for small teams and the LLM Twin.",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={40} y={70} w={260} h={70} text="PPO / RLHF" sub="higher ceiling · complex" accent={T} />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={70} w={260} h={70} text="DPO" sub="simpler · stable · efficient" accent={T} strong />
      </Frame>
    ),
  },
  /* p280 — DPO setup imports */
  {
    page: 280, chapter: 6, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Implementing DPO",
    term: "SETUP", title: "PatchDPOTrainer + DPOConfig/DPOTrainer",
    caption:
      "Setup mirrors Chapter 5: log in to Hugging Face and Comet ML, apply PatchDPOTrainer() to fix notebook logs, and import DPOConfig and DPOTrainer from TRL (the DPO-specific classes).",
    diagram: (
      <Frame w={740} h={190}>
        <Code
          x={30}
          y={40}
          w={440}
          lines={[
            { t: "from unsloth import PatchDPOTrainer", hi: false },
            { t: "PatchDPOTrainer()", hi: true },
            { t: "from trl import DPOConfig, DPOTrainer", hi: true },
          ]}
        />
        <BrandNode x={520} y={50} name="TRL" w={150} />
        <BrandNode x={520} y={110} name="Comet" w={150} />
      </Frame>
    ),
  },
  /* p281 — load + LoRA rank 64 */
  {
    page: 281, chapter: 6, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Implementing DPO",
    term: "LOAD + PEFT", title: "Load TwinLlama, bump LoRA rank",
    caption:
      "Load the Chapter-5 TwinLlama-3.1-8B (max_seq_length 2,048, LoRA via load_in_4bit=False), then configure PEFT with a higher rank/alpha (64) for more expressive alignment, targeting every linear module.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={45}
          w={430}
          lines={[
            { t: 'FastLanguageModel.from_pretrained(', hi: false },
            { t: '  "mlabonne/TwinLlama-3.1-8B")', hi: true },
            { t: "get_peft_model(r=64, lora_alpha=64,", hi: true },
            { t: "  target_modules=[all linear])", hi: false },
          ]}
        />
        <BrandNode x={500} y={60} name="Meta Llama" sub="TwinLlama 8B" w={200} />
        <Pill x={500} y={130} text="rank 64" accent={T} w={150} />
      </Frame>
    ),
  },
  /* p282 — data prep triples */
  {
    page: 282, chapter: 6, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Implementing DPO",
    term: "DATA PREP", title: "Alpaca on prompt, EOS on answers",
    caption:
      "DPO data prep differs from SFT: only the prompt gets the Alpaca chat template; chosen and rejected answers are just concatenated with the EOS token. A 95%/5% train/test split follows.",
    diagram: (
      <Frame w={740} h={200}>
        <LabelBox x={30} y={80} w={140} h={48} text="prompt" sub="Alpaca template" accent={T} />
        <LabelBox x={220} y={40} w={150} h={44} text="chosen + EOS" accent={T} strong />
        <LabelBox x={220} y={120} w={150} h={44} text="rejected + EOS" accent={T} />
        <DecisionGlyph x={440} y={60} w={90} h={80} accent={T} mark="split" />
        <Pill x={580} y={60} text="train 95%" accent={T} w={130} />
        <Pill x={580} y={120} text="test 5%" accent={T} w={130} />
        <Arrow x1={530} y1={85} x2={578} y2={75} accent={T} animated={false} />
        <Arrow x1={530} y1={115} x2={578} y2={130} accent={T} animated={false} />
      </Frame>
    ),
  },
  /* p283 — DPOTrainer config */
  {
    page: 283, chapter: 6, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Implementing DPO",
    term: "DPOTRAINER", title: "beta 0.5, lr 2e-6, 1 epoch",
    caption:
      "DPOConfig adds beta (0.5 here — higher keeps the model near the reference to avoid over-formal language) and ref_model=None (the adapter-free base is the reference). Learning rate drops to 2e-6 over 1 epoch for a light touch.",
    diagram: (
      <Frame w={740} h={210}>
        <Code
          x={30}
          y={35}
          w={460}
          lines={[
            { t: "DPOTrainer(ref_model=None,", hi: true },
            { t: "  beta=0.5,  # near reference", hi: true },
            { t: "  args=DPOConfig(", hi: false },
            { t: "    learning_rate=2e-6,", hi: false },
            { t: "    num_train_epochs=1))", hi: false },
          ]}
        />
        <Pill x={530} y={70} text="β = 0.5" accent={T} w={150} />
        <Pill x={530} y={115} text="1 epoch · 2e-6" accent={T} w={170} />
      </Frame>
    ),
  },
  /* p284 — DPO vs SFT output */
  {
    page: 284, chapter: 6, stage: "training", accent: T, archetype: "comparison",
    section: "Implementing DPO",
    term: "RESULT", title: "DPO answer: more accurate, less formal",
    caption:
      "Compared to the SFT model, the DPO model’s answer is more accurate (correctly grounds SFT in pre-trained models) and less formal — closer to the blog-post voice the preference data encodes.",
    diagram: (
      <Frame w={720} h={210}>
        <ModelGlyph x={40} y={60} w={100} h={90} accent={T} />
        <Label x={90} y={165} size={11}>SFT</Label>
        <Pill x={190} y={85} text="formal, generic" accent={T} w={180} />
        <Label x={400} y={105} size={16} weight={700} color="#97A0A8">→</Label>
        <ModelGlyph x={460} y={60} w={100} h={90} accent={T} />
        <Label x={510} y={165} size={11} weight={700}>DPO</Label>
        <Pill x={580} y={85} text="accurate, casual" accent={T} w={130} />
      </Frame>
    ),
  },
  /* p285 — DPO metrics: rewards/margins */
  {
    page: 285, chapter: 6, stage: "training", accent: T, archetype: "single-concept",
    section: "Implementing DPO",
    term: "DPO METRICS", title: "Rewards diverge → margin grows (Fig 6.6)",
    caption:
      "DPO adds chosen and rejected reward metrics (mean log-prob difference between trained and reference). The margin (chosen − rejected) should rise then plateau as the model learns to prefer chosen over rejected answers.",
    diagram: (
      <Frame w={720} h={220}>
        <line x1={40} y1={180} x2={680} y2={180} stroke="#CBD3D8" strokeWidth={1.5} />
        <path d="M 40 120 Q 300 90 660 70" fill="none" stroke={T} strokeWidth={3} strokeLinecap="round" />
        <path d="M 40 130 Q 300 150 660 165" fill="none" stroke="#97A0A8" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="6 5" />
        <Label x={620} y={55} size={11} color={T}>chosen ↑</Label>
        <Label x={620} y={182} size={11} color="#97A0A8">rejected ↓</Label>
        <Label x={350} y={205} size={11} weight={600} color={T}>margin = chosen − rejected (grows then plateaus)</Label>
      </Frame>
    ),
  },
  /* p286 — accuracy metric + summary */
  {
    page: 286, chapter: 6, stage: "training", accent: T, archetype: "comparison",
    section: "Summary",
    term: "ACCURACY", title: "Track accuracy — but not to 100%",
    caption:
      "Accuracy is the share of times the model ranks the chosen answer higher; it should rise gradually. Reaching 100% fast means the dataset is too easy. DPO is harder to monitor than SFT but far simpler than PPO.",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={40} y={70} w={250} h={70} text="accuracy rises gradually" sub="ranks chosen > rejected" accent={T} strong />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={70} w={260} h={70} text="100% too fast" sub="dataset too easy" accent={T} />
        <Warn x={440} y={170} text="add harder examples" />
      </Frame>
    ),
  },
];
