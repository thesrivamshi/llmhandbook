// Chapter 7 — Evaluating LLMs (pp. 290–315). Model evaluation (general/domain/
// task-specific benchmarks), RAG evaluation (Ragas, ARES), and a hands-on
// evaluation of TwinLlama with a GPT-4o-mini judge. Stage = Training (amber).
// Figures 7.1 (Ragas) and 7.2 (ARES) redrawn. pp.316–317 are References, skipped.
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

export const CHAPTER7: PageDiagram[] = [
  /* p290 */
  {
    page: 290, chapter: 7, stage: "training", accent: T, archetype: "list-cluster",
    section: "Model evaluation",
    term: "LLM EVAL", title: "Many forms, no single metric",
    caption:
      "LLM evaluation takes many forms — multiple-choice QA, open-ended instructions, real-user feedback — with no unified approach. Whole RAG systems need broader evaluation than a standalone model.",
    diagram: (
      <Frame w={720} h={210}>
        <ModelGlyph x={290} y={75} w={130} h={110} accent={T} />
        <Label x={355} y={45} size={11} weight={700} color={T}>evaluate</Label>
        {["multiple-choice QA", "open-ended", "real-user feedback"].map((t, i) => {
          const pos = [[30, 40], [490, 40], [30, 150]][i];
          return (
            <g key={t}>
              <Pill x={pos[0]} y={pos[1]} text={t} accent={T} w={200} />
              <line x1={355} y1={130} x2={pos[0] + 100} y2={pos[1] + 15} stroke="#ECE8DF" strokeWidth={1.4} />
            </g>
          );
        })}
        <Pill x={490} y={150} text="whole RAG system" accent={T} w={200} />
        <line x1={355} y1={130} x2={590} y2={165} stroke="#ECE8DF" strokeWidth={1.4} />
      </Frame>
    ),
  },
  /* p291 — ML vs LLM eval */
  {
    page: 291, chapter: 7, stage: "training", accent: T, archetype: "comparison",
    section: "Comparing ML and LLM evaluation",
    term: "ML vs LLM", title: "Numbers vs nuance",
    caption:
      "ML evaluation uses clean numerical metrics on structured data, with feature engineering and interpretability. LLM evaluation is subjective — multiple tasks, qualitative judgment, raw text, and limited interpretability.",
    diagram: (
      <Frame w={740} h={220}>
        <LabelBox x={30} y={30} w={300} h={44} text="ML evaluation" accent={T} />
        {["numerical metrics", "feature engineering", "interpretable"].map((t, i) => (
          <Pill key={t} x={40} y={90 + i * 42} text={t} accent={T} w={250} />
        ))}
        <Label x={370} y={120} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={30} w={300} h={44} text="LLM evaluation" accent={T} strong />
        {["many tasks, many evals", "qualitative judgment", "low interpretability"].map((t, i) => (
          <Pill key={t} x={430} y={90 + i * 42} text={t} accent={T} w={270} />
        ))}
      </Frame>
    ),
  },
  /* p292 — three eval phases */
  {
    page: 292, chapter: 7, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "General-purpose LLM evaluations",
    term: "EVAL PHASES", title: "During, after pre-training, after fine-tuning",
    caption:
      "General-purpose evaluation spans three phases: during pre-training (training/validation loss, perplexity, gradient norm), after pre-training (a benchmark suite on the base model), and after fine-tuning (compare base vs tuned scores).",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["during pre-training", "loss · perplexity · grad norm"],
          ["after pre-training", "benchmark suite"],
          ["after fine-tuning", "base vs tuned Δ"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <PipelineGlyph x={20 + i * 245} y={55} w={210} h={90} accent={T} />
            <Label x={125 + i * 245} y={92} weight={700} size={12.5}>{t as string}</Label>
            <Label x={125 + i * 245} y={112} size={10.5} color="#5E6B76">{sub as string}</Label>
            {i < 2 && <Arrow x1={230 + i * 245} y1={100} x2={265 + i * 245} y2={100} accent={T} animated={i === 0} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p293 — benchmarks */
  {
    page: 293, chapter: 7, stage: "training", accent: T, archetype: "list-cluster",
    section: "General-purpose LLM evaluations",
    term: "BENCHMARKS", title: "Pre-training vs fine-tuned benchmarks",
    caption:
      "Pre-trained models use MMLU (knowledge), HellaSwag, ARC-C, Winogrande, PIQA (reasoning). Fine-tuned models add IFEval, Chatbot Arena, AlpacaEval, MT-Bench, GAIA (instruction-following, conversation, agentic).",
    diagram: (
      <Frame w={740} h={230}>
        <Label x={185} y={24} size={11} weight={700} color={T}>PRE-TRAINING</Label>
        {["MMLU", "HellaSwag", "ARC-C", "Winogrande", "PIQA"].map((t, i) => (
          <Pill key={t} x={20 + (i % 2) * 170} y={40 + Math.floor(i / 2) * 44} text={t} accent={T} w={160} />
        ))}
        <Label x={545} y={24} size={11} weight={700} color={T}>FINE-TUNED</Label>
        {["IFEval", "Chatbot Arena", "AlpacaEval", "MT-Bench", "GAIA"].map((t, i) => (
          <Pill key={t} x={400 + (i % 2) * 170} y={40 + Math.floor(i / 2) * 44} text={t} accent={T} w={160} />
        ))}
      </Frame>
    ),
  },
  /* p294 — benchmark flaws */
  {
    page: 294, chapter: 7, stage: "training", accent: T, archetype: "pitfall",
    section: "Domain-specific LLM evaluations",
    term: "FLAWS", title: "Benchmarks are signals, not truth",
    caption:
      "Benchmarks have flaws: public ones can be gamed by training on test-like data; human evaluation favors long, confident, well-formatted answers; private sets are less scrutinized. Treat them as signals — agreement across many raises confidence.",
    diagram: (
      <Frame w={720} h={210}>
        <DecisionGlyph x={290} y={70} w={110} h={100} accent={T} mark="?" />
        <Label x={345} y={185} size={11}>real capability</Label>
        {["public: gameable", "human: long-answer bias", "private: less scrutiny"].map((t, i) => {
          const pos = [[30, 40], [470, 40], [470, 150]][i];
          return <Warn key={t} x={pos[0]} y={pos[1] + 15} text={t} />;
        })}
        <Pill x={30} y={155} text="use as signals →" accent={T} w={200} />
      </Frame>
    ),
  },
  /* p295 — domain leaderboards */
  {
    page: 295, chapter: 7, stage: "training", accent: T, archetype: "list-cluster",
    section: "Domain-specific LLM evaluations",
    term: "DOMAIN BOARDS", title: "Domain-specific leaderboards",
    caption:
      "Domain leaderboards on Hugging Face target depth: Open Medical-LLM (9 medical metrics), BigCodeBench (2 code metrics), Hallucinations (16 tasks), Enterprise Scenarios (6 business use cases).",
    diagram: (
      <Frame w={720} h={220}>
        <BrandNode x={285} y={90} name="Hugging Face" sub="leaderboards" w={170} />
        {[["Open Medical-LLM", 30, 30], ["BigCodeBench", 490, 30], ["Hallucinations", 30, 160], ["Enterprise Scenarios", 470, 160]].map(([t, x, y], i) => (
          <g key={i}>
            <Pill x={x as number} y={y as number} text={t as string} accent={T} w={210} />
            <line x1={370} y1={120} x2={(x as number) + 105} y2={(y as number) + 15} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* p296 — eval principles + libs */
  {
    page: 296, chapter: 7, stage: "training", accent: T, archetype: "single-concept",
    section: "Task-specific LLM evaluations",
    term: "DESIGN", title: "Complex, diverse, practical — run with a library",
    caption:
      "Good evals are complex (distinguish good/bad), diverse (many topics), and practical (easy to run). Language leaderboards (Korean, Portuguese, Arabic) often reuse translated benchmarks. Run them with lm-eval-harness or lighteval.",
    diagram: (
      <Frame w={720} h={210}>
        {["complex", "diverse", "practical"].map((t, i) => (
          <Pill key={t} x={30 + i * 165} y={50} text={t} accent={T} w={150} />
        ))}
        <BrandNode x={120} y={130} name="lm-eval-harness" w={210} />
        <BrandNode x={380} y={130} name="lighteval" w={180} />
      </Frame>
    ),
  },
  /* p297 — task metrics */
  {
    page: 297, chapter: 7, stage: "training", accent: T, archetype: "list-cluster",
    section: "Task-specific LLM evaluations",
    term: "CLASSIC METRICS", title: "ROUGE + classification metrics",
    caption:
      "Task-specific outputs are structured, so classic ML metrics apply: ROUGE (n-gram overlap for summarization), and accuracy, precision, recall, F1 for classification and entity extraction.",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={40} y={80} w={150} h={60} text="ROUGE" sub="summarization" accent={T} />
        <Label x={260} y={110} size={13} weight={700} color="#5E6B76">+</Label>
        {["accuracy", "precision", "recall", "F1"].map((t, i) => (
          <Pill key={t} x={320 + (i % 2) * 200} y={70 + Math.floor(i / 2) * 50} text={t} accent={T} w={180} />
        ))}
      </Frame>
    ),
  },
  /* p298 — MCQ eval modes */
  {
    page: 298, chapter: 7, stage: "training", accent: T, archetype: "comparison",
    section: "Task-specific LLM evaluations",
    term: "MCQ EVAL", title: "Text generation vs log-likelihood",
    caption:
      "Multiple-choice QA can be scored two ways: text generation (model writes A/B/C/D, checked against the answer — mimics real use, more discriminative) or log-likelihood (compare the model’s probabilities over answer texts).",
    diagram: (
      <Frame w={740} h={210}>
        <LabelBox x={40} y={70} w={260} h={70} text="text generation" sub="writes the letter" accent={T} strong />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={70} w={260} h={70} text="log-likelihood" sub="compares probabilities" accent={T} />
      </Frame>
    ),
  },
  /* p299 — structured judge prompt */
  {
    page: 299, chapter: 7, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Task-specific LLM evaluations",
    term: "JUDGE PROMPT", title: "Structured 1–4 evaluation",
    caption:
      "For open-ended tasks, LLM-as-a-judge scores answers on a 1–4 scale with explicit definitions, asking for an explanation then a rating. A ground-truth answer or structured generation (Outlines, JSON mode) makes parsing easy.",
    diagram: (
      <Frame w={720} h={210}>
        <Code
          x={30}
          y={40}
          w={420}
          lines={[
            { t: "You are an evaluator. Score 1–4:", hi: true },
            { t: "  1 not relevant ... 4 detailed", hi: false },
            { t: "Explanation: (analyze)", hi: false },
            { t: "Total rating: (1–4)", hi: true },
          ]}
        />
        <Pill x={500} y={70} text="Outlines / JSON" accent={T} w={180} />
      </Frame>
    ),
  },
  /* p300 — judge biases + system */
  {
    page: 300, chapter: 7, stage: "training", accent: T, archetype: "pitfall",
    section: "RAG evaluation",
    term: "JUDGE BIASES", title: "Judges favor confident, verbose answers",
    caption:
      "Judge LLMs over-rate assertive/verbose answers, lack domain expertise, score inconsistently, and prefer certain styles. Mitigate by combining with other metrics, using multiple judges, and careful prompts.",
    diagram: (
      <Frame w={720} h={210}>
        <ModelGlyph x={290} y={70} w={110} h={100} accent={T} />
        <Label x={345} y={185} size={11}>judge LLM</Label>
        {["verbose bias", "no domain depth", "inconsistent", "style preference"].map((t, i) => {
          const pos = [[30, 40], [470, 40], [30, 150], [470, 150]][i];
          return <Warn key={t} x={pos[0]} y={pos[1] + 5} text={t} />;
        })}
      </Frame>
    ),
  },
  /* p301 — RAG eval dimensions */
  {
    page: 301, chapter: 7, stage: "training", accent: T, archetype: "list-cluster",
    section: "Ragas",
    term: "RAG DIMENSIONS", title: "Evaluate the whole system",
    caption:
      "RAG evaluation extends beyond the model to the system: retrieval accuracy (fetched the right info?), integration quality (used it well?), and factuality + relevance (does the output address the query, grounded in context?).",
    diagram: (
      <Frame w={720} h={210}>
        <PipelineGlyph x={290} y={80} w={140} h={56} accent={T} />
        <Label x={360} y={108} size={12} weight={700}>RAG system</Label>
        {[["retrieval accuracy", 30, 40], ["integration quality", 470, 40], ["factuality + relevance", 250, 165]].map(([t, x, y], i) => (
          <g key={i}>
            <Pill x={x as number} y={y as number} text={t as string} accent={T} w={220} />
            <line x1={360} y1={108} x2={(x as number) + 110} y2={(y as number) + 12} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* p302 — Fig 7.1 Ragas */
  {
    page: 302, chapter: 7, stage: "training", accent: T, archetype: "architecture",
    section: "Ragas",
    term: "RAGAS", title: "Four LLM-assisted RAG metrics (Fig 7.1)",
    caption:
      "Ragas measures four relationships among question, answer, context, and ground truth: faithfulness (answer↔context), answer relevancy (answer↔question), context precision (question↔context ranking), context recall (context↔ground truth).",
    diagram: (
      <Frame w={760} h={240}>
        <LabelBox x={30} y={90} w={130} h={50} text="Question" accent={T} />
        <LabelBox x={250} y={90} w={130} h={50} text="Answer" accent={T} strong />
        <LabelBox x={470} y={90} w={130} h={50} text="Context" accent={T} />
        <SnapshotGlyph x={640} y={92} w={110} h={50} accent={T} title="Ground truth" usedFor="" />
        <Arrow x1={160} y1={115} x2={248} y2={115} accent={T} animated={false} />
        <Arrow x1={380} y1={115} x2={468} y2={115} accent={T} animated={false} />
        <Arrow x1={600} y1={115} x2={638} y2={115} accent={T} animated={false} />
        <Label x={204} y={70} size={10} color={T}>answer relevancy</Label>
        <Label x={424} y={70} size={10} color={T}>faithfulness</Label>
        <Label x={315} y={185} size={10} color={T}>context precision</Label>
        <Label x={680} y={70} size={10} color={T} anchor="end">context recall</Label>
        <path d="M 95 140 Q 315 200 535 140" fill="none" stroke={T} strokeWidth={1.4} strokeDasharray="5 4" />
      </Frame>
    ),
  },
  /* p303 — Ragas MDD + synth */
  {
    page: 303, chapter: 7, stage: "training", accent: T, archetype: "single-concept",
    section: "ARES",
    term: "RAGAS MDD", title: "Synthesize tests, monitor in production",
    caption:
      "Ragas embraces metrics-driven development: it synthetically generates diverse test sets (Evol-Instruct-style evolution) and provides building blocks to monitor RAG quality in production for continuous improvement.",
    diagram: (
      <Frame w={720} h={210}>
        <BrandNode x={30} y={85} name="Ragas" w={150} />
        <LabelBox x={240} y={45} w={200} h={50} text="synthetic test sets" accent={T} />
        <LabelBox x={240} y={120} w={200} h={50} text="production monitoring" accent={T} strong />
        <DecisionGlyph x={520} y={75} w={100} h={80} accent={T} mark="↻" />
        <Label x={570} y={170} size={11} color="#5E6B76">iterate</Label>
        <Arrow x1={180} y1={110} x2={238} y2={70} accent={T} animated={false} />
        <Arrow x1={180} y1={115} x2={238} y2={145} accent={T} />
        <Arrow x1={440} y1={70} x2={518} y2={105} accent={T} animated={false} />
        <Arrow x1={440} y1={145} x2={518} y2={120} accent={T} animated={false} />
      </Frame>
    ),
  },
  /* p304 — Fig 7.2 ARES */
  {
    page: 304, chapter: 7, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Evaluating TwinLlama-3.1-8B",
    term: "ARES", title: "Synthetic data → classifiers → eval (Fig 7.2)",
    caption:
      "ARES runs in three stages: generate synthetic data (default flan-t5-xxl), train high-precision classifiers (default deberta-v3-large), then evaluate RAG with confidence intervals — runnable locally via vLLM.",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["synthetic data", "flan-t5-xxl"],
          ["train classifiers", "deberta-v3"],
          ["RAG eval", "+ confidence"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <PipelineGlyph x={20 + i * 245} y={55} w={210} h={90} accent={T} />
            <Label x={125 + i * 245} y={92} weight={700} size={12.5}>{t as string}</Label>
            <Label x={125 + i * 245} y={112} size={10.5} color="#5E6B76">{sub as string}</Label>
            {i < 2 && <Arrow x1={230 + i * 245} y1={100} x2={265 + i * 245} y2={100} accent={T} animated={i === 0} />}
          </g>
        ))}
        <BrandNode x={560} y={165} name="vLLM" sub="local runs" w={150} />
      </Frame>
    ),
  },
  /* p305 — eval framework */
  {
    page: 305, chapter: 7, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Generating answers",
    term: "EVAL FRAMEWORK", title: "Generate, judge on accuracy + style",
    caption:
      "To evaluate TwinLlama, feed test instructions to each model, generate answers, then have a judge LLM (GPT-4o-mini) score them 1–3 on accuracy (factual) and style (casual blog voice, not formal).",
    diagram: (
      <Frame w={740} h={210}>
        <SnapshotGlyph x={20} y={80} w={140} h={56} accent={T} title="test instructions" usedFor="" />
        <ModelGlyph x={210} y={65} w={90} h={80} accent={T} />
        <Label x={255} y={160} size={11}>models</Label>
        <SnapshotGlyph x={350} y={80} w={120} h={56} accent={T} title="answers" usedFor="" />
        <BrandNode x={520} y={82} name="GPT-4o" sub="judge · 1–3" w={150} />
        <Pill x={530} y={150} text="accuracy + style" accent={T} w={180} />
        <Arrow x1={160} y1={108} x2={208} y2={105} accent={T} />
        <Arrow x1={300} y1={108} x2={348} y2={108} accent={T} />
        <Arrow x1={470} y1={108} x2={518} y2={108} accent={T} />
      </Frame>
    ),
  },
  /* p306 — generate_answers vLLM */
  {
    page: 306, chapter: 7, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Generating answers",
    term: "vLLM GEN", title: "Fast batch generation with vLLM",
    caption:
      "generate_answers formats the test set with the chat template, then uses vLLM (far faster than transformers for batch) with sampling params (temp 0.8, top_p 0.95, min_p 0.05, max 4,096 tokens).",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={430}
          lines={[
            { t: "llm = LLM(model=model_id, max_len=4096)", hi: true },
            { t: "SamplingParams(temperature=0.8,", hi: false },
            { t: "  top_p=0.95, min_p=0.05)", hi: false },
            { t: "outputs = llm.generate(prompts, ...)", hi: false },
          ]}
        />
        <BrandNode x={500} y={75} name="vLLM" sub="fast batch" w={150} />
      </Frame>
    ),
  },
  /* p307 — three models */
  {
    page: 307, chapter: 7, stage: "training", accent: T, archetype: "comparison",
    section: "Evaluating answers",
    term: "THREE MODELS", title: "SFT, DPO, and the instruct baseline",
    caption:
      "Three models generate answers for comparison: TwinLlama-3.1-8B (SFT), TwinLlama-3.1-8B-DPO, and meta-llama/Meta-Llama-3.1-8B-Instruct as a reference point.",
    diagram: (
      <Frame w={740} h={210}>
        {["TwinLlama (SFT)", "TwinLlama-DPO", "Llama-3.1-Instruct"].map((t, i) => (
          <g key={t}>
            <ModelGlyph x={60 + i * 245} y={40} w={80} h={70} accent={T} />
            <Label x={100 + i * 245} y={130} size={11.5} weight={600}>{t}</Label>
            <Arrow x1={100 + i * 245} y1={112} x2={100 + i * 245} y2={150} accent={T} animated={false} />
          </g>
        ))}
        <Label x={370} y={185} size={11} color="#5E6B76">each generates answers for the test set</Label>
      </Frame>
    ),
  },
  /* p308 — accuracy + style scales */
  {
    page: 308, chapter: 7, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Evaluating answers",
    term: "SCALES", title: "1–3 scales for accuracy and style",
    caption:
      "The judge prompt defines two 1–3 scales: accuracy (1 errors → 3 highly accurate) and style (1 too formal → 3 perfectly accessible), with examples of bad vs excellent style to anchor the judgment.",
    diagram: (
      <Frame w={720} h={210}>
        <Code
          x={30}
          y={40}
          w={420}
          lines={[
            { t: "Accuracy:  1 poor → 3 excellent", hi: true },
            { t: "Style:     1 too formal → 3 casual", hi: true },
            { t: "+ example: bad style vs good style", hi: false },
            { t: "→ JSON {accuracy, style}", hi: false },
          ]}
        />
        <Pill x={500} y={70} text="accuracy 1–3" accent={T} w={170} />
        <Pill x={500} y={115} text="style 1–3" accent={T} w={170} />
      </Frame>
    ),
  },
  /* p309 — judge JSON */
  {
    page: 309, chapter: 7, stage: "training", accent: T, archetype: "code-anatomy",
    section: "Evaluating answers",
    term: "JUDGE CALL", title: "GPT-4o-mini judge in JSON mode",
    caption:
      "The prompt is sent to GPT-4o-mini in JSON mode with a system prompt reinforcing accuracy + style evaluation; it returns a short analysis and score per criterion.",
    diagram: (
      <Frame w={740} h={190}>
        <Code
          x={30}
          y={40}
          w={430}
          lines={[
            { t: 'model="gpt-4o-mini",', hi: true },
            { t: '  response_format={"type":"json_object"},', hi: true },
            { t: "  max_tokens=1000, temperature=0.8", hi: false },
          ]}
        />
        <BrandNode x={500} y={70} name="GPT-4o" sub="judge" w={150} />
      </Frame>
    ),
  },
  /* p310 — batching */
  {
    page: 310, chapter: 7, stage: "training", accent: T, archetype: "single-concept",
    section: "Evaluating answers",
    term: "BATCHING", title: "Batch + thread the judge calls",
    caption:
      "evaluate_answers batches instruction-answer pairs (batch_size) and runs them through a ThreadPoolExecutor (num_threads), keeping indices to preserve ordering — speeding up the judging pass.",
    diagram: (
      <Frame w={740} h={210}>
        <SnapshotGlyph x={20} y={85} w={140} h={56} accent={T} title="pairs" usedFor="" />
        <LabelBox x={210} y={85} w={150} h={56} text="batches" accent={T} />
        <LabelBox x={410} y={85} w={170} h={56} text="ThreadPoolExecutor" accent={T} strong />
        <BrandNode x={620} y={87} name="GPT-4o" w={110} />
        <Arrow x1={160} y1={113} x2={208} y2={113} accent={T} />
        <Arrow x1={360} y1={113} x2={408} y2={113} accent={T} />
        <Arrow x1={580} y1={113} x2={618} y2={113} accent={T} animated={false} />
      </Frame>
    ),
  },
  /* p311 — parse scores */
  {
    page: 311, chapter: 7, stage: "training", accent: T, archetype: "pipeline-flow",
    section: "Analyzing results",
    term: "PARSE", title: "JSON → accuracy + style columns",
    caption:
      "Each evaluation JSON is parsed best-effort with json.loads; accuracy and style scores are extracted into new dataset columns, falling back to None on parse/key errors. The dataset is pushed back to the Hub.",
    diagram: (
      <Frame w={740} h={200}>
        <SnapshotGlyph x={20} y={75} w={140} h={56} accent={T} title="evaluation JSON" usedFor="" />
        <LabelBox x={210} y={75} w={130} h={56} text="json.loads" accent={T} />
        <SnapshotGlyph x={400} y={45} w={150} h={48} accent={T} title="accuracy" usedFor="" />
        <SnapshotGlyph x={400} y={120} w={150} h={48} accent={T} title="style" usedFor="" />
        <Warn x={250} y={165} text="None on parse error" />
        <Arrow x1={160} y1={103} x2={208} y2={103} accent={T} />
        <Arrow x1={340} y1={95} x2={398} y2={69} accent={T} animated={false} />
        <Arrow x1={340} y1={110} x2={398} y2={144} accent={T} animated={false} />
      </Frame>
    ),
  },
  /* p312 — analyze: 3 elements */
  {
    page: 312, chapter: 7, stage: "training", accent: T, archetype: "list-cluster",
    section: "Analyzing results",
    term: "ANALYZE", title: "Review answers, explanations, scores",
    caption:
      "Three things to review: model answers (not scalable but catches template/model bugs), the judge’s explanations (understand its reasoning), and the numeric scores (quantitative comparison). Saving intermediate results adds robustness.",
    diagram: (
      <Frame w={720} h={210}>
        <DecisionGlyph x={300} y={75} w={110} h={90} accent={T} mark="review" />
        {[["answers", 30, 40], ["explanations", 490, 40], ["scores", 490, 150]].map(([t, x, y], i) => (
          <g key={i}>
            <Pill x={x as number} y={y as number} text={t as string} accent={T} w={200} />
            <line x1={355} y1={120} x2={(x as number) + 100} y2={(y as number) + 15} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
        <Pill x={30} y={150} text="catches template bugs" accent={T} w={200} />
      </Frame>
    ),
  },
  /* p313 — verbose vs concise */
  {
    page: 313, chapter: 7, stage: "training", accent: T, archetype: "comparison",
    section: "Analyzing results",
    term: "VERBOSITY", title: "Instruct is verbose; DPO is casual",
    caption:
      "On the same instruction, the two TwinLlama models give close, concise answers; Llama-3.1-8B-Instruct is far more verbose with many examples — correct but artificial. DPO simplifies the SFT style without changing content.",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={40} y={70} w={250} h={70} text="Llama-Instruct" sub="long · many examples" accent={T} />
        <Warn x={60} y={160} text="correct but artificial" />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={70} w={260} h={70} text="TwinLlama-DPO" sub="concise · casual voice" accent={T} strong />
      </Frame>
    ),
  },
  /* p314 — judge evaluations */
  {
    page: 314, chapter: 7, stage: "training", accent: T, archetype: "comparison",
    section: "Analyzing results",
    term: "EVALUATIONS", title: "Judge scores per model",
    caption:
      "GPT-4o-mini scored all three accurate (3) but rated style differently: TwinLlama-SFT and Llama-Instruct got style 2 (too formal), while TwinLlama-DPO got style 3 for communicating the concept without being overly formal.",
    diagram: (
      <Frame w={740} h={220}>
        {[
          ["TwinLlama-SFT", "acc 3", "style 2", false],
          ["TwinLlama-DPO", "acc 3", "style 3", true],
          ["Llama-Instruct", "acc 3", "style 2", false],
        ].map(([t, a, s, best], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 245} y={50} w={210} h={50} text={t as string} accent={T} strong={best as boolean} />
            <Pill x={40 + i * 245} y={115} text={a as string} accent={T} w={80} />
            <Pill x={135 + i * 245} y={115} text={s as string} accent={T} w={80} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* p315 — average scores */
  {
    page: 315, chapter: 7, stage: "training", accent: T, archetype: "comparison",
    section: "Summary",
    term: "RESULTS", title: "DPO wins on style, Instruct on accuracy",
    caption:
      "Average scores: Llama-Instruct leads accuracy (2.62, from 10M post-training samples vs our 13k) but trails style (1.86, verbose). TwinLlama-DPO leads style (2.12) — the casual voice we wanted — with comparable accuracy (2.46).",
    diagram: (
      <Frame w={740} h={230}>
        {[
          ["SFT", 2.45, 2.04],
          ["DPO", 2.46, 2.12],
          ["Instruct", 2.62, 1.86],
        ].map(([t, acc, sty], i) => (
          <g key={i}>
            <Label x={90 + i * 220} y={30} size={12} weight={700}>{t as string}</Label>
            <rect x={40 + i * 220} y={180 - ((acc as number) - 1.5) * 90} width={50} height={((acc as number) - 1.5) * 90} rx={4} fill={`${T}99`} />
            <rect x={100 + i * 220} y={180 - ((sty as number) - 1.5) * 90} width={50} height={((sty as number) - 1.5) * 90} rx={4} fill={`${T}40`} stroke={T} strokeWidth={1.5} />
            <Label x={65 + i * 220} y={195} size={9.5} color="#5E6B76">{`acc ${acc}`}</Label>
            <Label x={125 + i * 220} y={195} size={9.5} color="#5E6B76">{`sty ${sty}`}</Label>
          </g>
        ))}
        <line x1={30} y1={180} x2={700} y2={180} stroke="#CBD3D8" strokeWidth={1.4} />
      </Frame>
    ),
  },
  /* p316 — chapter summary / recap */
  {
    page: 316, chapter: 7, stage: "training", accent: T, archetype: "list-cluster",
    section: "Summary",
    term: "CHAPTER RECAP", title: "How we evaluated the model",
    caption:
      "Recap: custom evaluation rested on two techniques (multiple-choice QA + LLM-as-a-judge); RAG systems used two frameworks (Ragas vs ARES — synthetic data in common, context-metrics vs trained classifiers apart); and TwinLlama-3.1-8B was judged on relevance, coherence, and conciseness.",
    diagram: (
      <Frame w={720} h={300}>
        <ModelGlyph x={300} y={120} w={120} h={110} accent={T} />
        <Label x={360} y={245} weight={700}>TwinLlama eval</Label>
        <Label x={150} y={22} size={11} weight={700} color={T}>TECHNIQUES</Label>
        {["multiple-choice QA", "LLM-as-a-judge"].map((t, i) => (
          <g key={t}>
            <Pill x={30} y={45 + i * 50} text={t} accent={T} w={230} />
            <line x1={300} y1={175} x2={260} y2={60 + i * 50} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
        <Label x={585} y={22} size={11} weight={700} color={T}>RAG FRAMEWORKS</Label>
        {["Ragas", "ARES"].map((t, i) => (
          <g key={t}>
            <Pill x={500} y={45 + i * 50} text={t} accent={T} w={210} />
            <line x1={420} y1={175} x2={500} y2={60 + i * 50} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
        {["relevance", "coherence", "conciseness"].map((t, i) => (
          <Pill key={t} x={120 + i * 165} y={262} text={t} accent={T} w={150} />
        ))}
      </Frame>
    ),
  },
];
