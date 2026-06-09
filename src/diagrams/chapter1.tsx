// Chapter 1 — Understanding the LLM Twin Concept and Its Architecture (pp. 30–52).
// One bespoke diagram per content page, composed from the shape alphabet + brand
// logos. Stage = Foundations (teal). Figures 1.1, 1.2, 1.3, 1.5 and 1.6 are redrawn
// faithfully as clean schematics (no bitmaps); the architecture figures use real
// tool logos as nodes.
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
const Frame: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => (
  <Canvas width={w} height={h}>{children}</Canvas>
);

export const CHAPTER1: PageDiagram[] = [
  /* ---------------- p30 — opener ---------------- */
  {
    page: 30, chapter: 1, stage: "foundations", accent: A, archetype: "single-concept",
    section: "Understanding the LLM twin concept",
    term: "LLM TWIN", title: "An AI that writes like you",
    caption: "An LLM Twin is a language model fine-tuned on your own digital writing so it reproduces your style, voice, and personality.",
    diagram: (
      <Frame w={640} h={260}>
        <UserGlyph x={20} y={60} w={130} h={130} accent={A} />
        <Label x={85} y={205}>You</Label>
        <DocumentGlyph x={235} y={70} w={150} h={120} accent={A} />
        <Label x={310} y={205}>Your digital writing</Label>
        <ModelGlyph x={470} y={55} w={140} h={140} accent={A} />
        <Label x={540} y={205} weight={700}>Your LLM Twin</Label>
        <Arrow x1={158} y1={125} x2={232} y2={125} accent={A} />
        <Arrow x1={388} y1={125} x2={466} y2={125} accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p31 — chapter roadmap ---------------- */
  {
    page: 31, chapter: 1, stage: "foundations", accent: A, archetype: "list-cluster",
    section: "Understanding the LLM twin concept",
    term: "CHAPTER MAP", title: "What this chapter covers",
    caption: "Chapter 1 moves from the concept, to the product MVP, to the FTI pipeline pattern, and finally to the LLM Twin system architecture.",
    diagram: (
      <Frame w={720} h={290}>
        <LabelBox x={30} y={110} w={160} h={70} text="Chapter 1" sub="the plan" accent={A} strong />
        {["Understand the concept", "Plan the MVP", "Feature / Training / Inference", "System architecture"].map((t, i) => (
          <g key={i}>
            <Pill x={330} y={28 + i * 60} text={t} accent={A} />
            <Arrow x1={192} y1={145} x2={326} y2={43 + i * 60} accent={A} animated={false} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* ---------------- p32 — what makes it your twin ---------------- */
  {
    page: 32, chapter: 1, stage: "foundations", accent: A, archetype: "list-cluster",
    section: "Understanding the LLM twin concept",
    term: "FINE-TUNING DATA", title: "What makes it your twin",
    caption: "Collecting your own digital data — posts, messages, articles, code — and feeding it to an LLM is the one core strategy behind the twin.",
    diagram: (
      <Frame w={680} h={300}>
        {["LinkedIn & X posts", "Messages", "Papers & articles", "Code"].map((t, i) => (
          <g key={i}>
            <Pill x={30} y={30 + i * 62} text={t} accent={A} w={170} />
            <Arrow x1={200} y1={45 + i * 62} x2={430} y2={150} accent={A} animated={i === 0} />
          </g>
        ))}
        <ModelGlyph x={440} y={80} w={150} h={150} accent={A} />
        <Label x={515} y={245} weight={700}>Your LLM Twin</Label>
      </Frame>
    ),
  },
  /* ---------------- p33 — why it matters ---------------- */
  {
    page: 33, chapter: 1, stage: "foundations", accent: A, archetype: "list-cluster",
    section: "Understanding the LLM twin concept",
    term: "WHY IT MATTERS", title: "Three reasons to build one",
    caption: "A twin builds your brand, automates your writing, and helps brainstorm — and it is fine-tuned only on your own data, by design.",
    diagram: (
      <Frame w={660} h={300}>
        <ModelGlyph x={30} y={70} w={130} h={130} accent={A} />
        <Label x={95} y={215} weight={700}>LLM Twin</Label>
        {["Build your brand", "Automate writing", "Brainstorm ideas"].map((t, i) => (
          <g key={i}>
            <Pill x={320} y={40 + i * 56} text={t} accent={A} w={200} />
            <Arrow x1={162} y1={135} x2={316} y2={55 + i * 56} accent={A} animated={false} />
          </g>
        ))}
        <g>
          <rect x={320} y={232} width={300} height={34} rx={17} fill="rgba(14,165,183,0.10)" stroke={A} strokeWidth={1.6} strokeDasharray="6 5" />
          <Label x={470} y={249} size={12.5} weight={600} color={A}>Trained only on your own data ✓</Label>
        </g>
      </Frame>
    ),
  },
  /* ---------------- p34 — why not ChatGPT (comparison) ---------------- */
  {
    page: 34, chapter: 1, stage: "foundations", accent: A, archetype: "comparison",
    section: "Understanding the LLM twin concept",
    term: "VS CHATGPT", title: "Why not just use ChatGPT?",
    caption: "A general chatbot is generic and wordy and risks hallucination and tedious manual prompting; the twin keeps your original voice.",
    diagram: (
      <Frame w={700} h={320}>
        <BrandNode x={30} y={40} name="OpenAI" sub="ChatGPT — generic" />
        {["Not your voice", "Hallucination risk", "Manual prompting"].map((t, i) => (
          <g key={i}><Warn x={45} y={120 + i * 46} text={t} /></g>
        ))}
        <Label x={350} y={160} size={20} weight={700} color="#97A0A8">vs</Label>
        <ModelGlyph x={470} y={30} w={130} h={120} accent={A} />
        <Label x={535} y={165} weight={700}>Your LLM Twin</Label>
        {["Your style & voice", "Grounded by RAG"].map((t, i) => (
          <g key={i}><Pill x={450} y={195 + i * 46} text={t} accent={A} w={170} /></g>
        ))}
      </Frame>
    ),
  },
  /* ---------------- p35 — data-centric, model-agnostic ---------------- */
  {
    page: 35, chapter: 1, stage: "foundations", accent: A, archetype: "single-concept",
    section: "Planning the MVP of the LLM twin product",
    term: "DESIGN PRINCIPLE", title: "Data-centric, model-agnostic",
    caption: "Keep the architecture model-agnostic and centred on your data, so you can swap in any LLM that exposes a fine-tuning interface.",
    diagram: (
      <Frame w={700} h={300}>
        <DataStoreGlyph x={20} y={70} w={140} h={140} accent={A} />
        <Label x={90} y={225} weight={700}>Your data</Label>
        <Label x={90} y={243} size={11} color="#5E6B76">(fixed centre)</Label>
        <DecisionGlyph x={210} y={95} w={110} h={110} accent={A} mark="↔" />
        <Label x={265} y={215} size={11.5} color="#5E6B76">swap model</Label>
        <Arrow x1={162} y1={140} x2={216} y2={150} accent={A} />
        {["OpenAI", "Mistral", "Meta Llama"].map((n, i) => (
          <g key={n}>
            <BrandNode x={420} y={28 + i * 84} name={n} />
            <Arrow x1={322} y1={150} x2={416} y2={53 + i * 84} accent={A} animated={false} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* ---------------- p36 — MVP as value / effort ---------------- */
  {
    page: 36, chapter: 1, stage: "foundations", accent: A, archetype: "formula-as-blocks",
    section: "Planning the MVP of the LLM twin product",
    term: "MVP", title: "Maximize value ÷ effort",
    caption: "With a tiny team and modest resources, the MVP picks the features that maximize product value relative to the effort poured in.",
    diagram: (
      <Frame w={680} h={280}>
        <LabelBox x={50} y={56} w={230} h={56} text="Product value" accent={A} strong />
        <line x1={50} y1={140} x2={280} y2={140} stroke={A} strokeWidth={3} strokeLinecap="round" />
        <LabelBox x={50} y={168} w={230} h={56} text="Effort & resources" accent={A} sub="3 people · laptops · funding" />
        <Label x={335} y={140} size={26} weight={700} color="#5E6B76">=</Label>
        <LabelBox x={420} y={95} w={210} h={90} text="MVP" sub="first valuable iteration" accent={A} strong />
      </Frame>
    ),
  },
  /* ---------------- p37 — the FTI pattern ---------------- */
  {
    page: 37, chapter: 1, stage: "foundations", accent: A, archetype: "pipeline-flow",
    section: "Building ML systems with feature/training/inference pipelines",
    term: "FTI PATTERN", title: "The pattern at the core",
    caption: "Every ML system can be reduced to three pipelines — feature, training, inference — the way classic software splits into DB, logic, and UI.",
    diagram: (
      <Frame w={720} h={230}>
        {[["Feature", 15], ["Training", 250], ["Inference", 485]].map(([t, x], i) => (
          <g key={i}>
            <PipelineGlyph x={x as number} y={50} w={210} h={120} accent={A} />
            <Label x={(x as number) + 105} y={185} weight={700}>{t as string}</Label>
            {i < 2 && <Arrow x1={(x as number) + 196} y1={110} x2={(x as number) + 250} y2={110} accent={A} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* ---------------- p38 — Figure 1.1 redraw ---------------- */
  {
    page: 38, chapter: 1, stage: "foundations", accent: A, archetype: "list-cluster",
    section: "The problem with building ML systems",
    term: "ML SYSTEM PARTS", title: "ML code is a small piece (Fig 1.1)",
    caption: "A production ML system is mostly everything around the model: data collection and verification, serving, monitoring, automation, and more.",
    diagram: (
      <Frame w={740} h={360}>
        <ModelGlyph x={300} y={130} w={140} h={130} accent={A} />
        <Label x={370} y={200} weight={700} color="#25313C">ML code</Label>
        {[
          ["Data collection", 30, 24], ["Data verification", 250, 24], ["Config", 470, 24], ["Automation", 600, 24],
          ["Feature engineering", 20, 150], ["Resource mgmt", 560, 150],
          ["Testing & debug", 20, 210], ["Model analysis", 560, 210],
          ["Serving infra", 60, 312], ["Monitoring", 290, 312], ["Metadata mgmt", 470, 312], ["Process mgmt", 620, 312],
        ].map(([t, x, y], i) => (
          <g key={i}>
            <line x1={370} y1={195} x2={(x as number) + 50} y2={(y as number) + 15} stroke="#ECE8DF" strokeWidth={1.4} />
            <Pill x={x as number} y={y as number} text={t as string} accent={A} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* ---------------- p39 — Figure 1.2 redraw (monolith) ---------------- */
  {
    page: 39, chapter: 1, stage: "foundations", accent: A, archetype: "pitfall",
    section: "The issue with previous solutions",
    term: "MONOLITH", title: "The monolithic batch pipeline (Fig 1.2)",
    caption: "Older ML apps couple feature creation, training, and inference into one batch component — fixing training-serving skew but impossible to split across teams.",
    diagram: (
      <Frame w={740} h={300}>
        <DataStoreGlyph x={10} y={70} w={120} h={130} accent={A} />
        <Label x={70} y={215} size={12}>Training data</Label>
        <Boundary x={160} y={50} w={420} h={170} title="One monolithic component" accent={A} danger />
        {[["Create features", 180], ["Train model", 330], ["Make predictions", 440]].map(([t, x], i) => (
          <g key={i}>
            <LabelBox x={x as number} y={110} w={120} h={56} text={t as string} accent={A} />
            {i < 2 && <Arrow x1={(x as number) + 120} y1={138} x2={(x as number) + 150} y2={138} accent={A} animated={false} />}
          </g>
        ))}
        <Arrow x1={132} y1={135} x2={178} y2={138} accent={A} />
        <Warn x={300} y={250} text="can't share work across teams · no streaming" />
      </Frame>
    ),
  },
  /* ---------------- p40 — Figure 1.3 redraw (real-time) ---------------- */
  {
    page: 40, chapter: 1, stage: "foundations", accent: A, archetype: "pitfall",
    section: "The issue with previous solutions",
    term: "REAL-TIME PITFALL", title: "Passing the whole state (Fig 1.3)",
    caption: "A stateless real-time system forces the client to transmit the entire state (name, age, history…) in the request just to compute features.",
    diagram: (
      <Frame w={720} h={280}>
        <UserGlyph x={20} y={70} w={120} h={120} accent={A} />
        <Label x={80} y={205}>Client</Label>
        <LabelBox x={210} y={95} w={170} h={64} text="Whole client state" sub="name, age, history…" accent={A} strong />
        <LabelBox x={430} y={100} w={120} h={54} text="Features" accent={A} />
        <ModelGlyph x={580} y={70} w={120} h={120} accent={A} />
        <Label x={640} y={205}>Model</Label>
        <Arrow x1={142} y1={130} x2={208} y2={127} accent={A} />
        <Arrow x1={380} y1={127} x2={428} y2={127} accent={A} />
        <Arrow x1={550} y1={127} x2={578} y2={127} accent={A} />
        <Warn x={295} y={205} text="must transfer full state every request" />
      </Frame>
    ),
  },
  /* ---------------- p41 — the core problem ---------------- */
  {
    page: 41, chapter: 1, stage: "foundations", accent: A, archetype: "pitfall",
    section: "The issue with previous solutions",
    term: "THE PROBLEM", title: "How to get features at inference?",
    caption: "The core question: how do you access the features to make a prediction from just an ID, without passing them in the client request?",
    diagram: (
      <Frame w={700} h={260}>
        <Pill x={20} y={110} text="user ID only" accent={A} w={140} />
        <DecisionGlyph x={210} y={70} w={120} h={120} accent={A} mark="?" />
        <Label x={270} y={205} size={11.5} color="#5E6B76">where are the features?</Label>
        <ModelGlyph x={420} y={70} w={120} h={120} accent={A} />
        <LabelBox x={580} y={105} w={100} h={50} text="Prediction" accent={A} />
        <Arrow x1={160} y1={130} x2={216} y2={130} accent={A} />
        <Arrow x1={328} y1={130} x2={418} y2={130} accent={A} />
        <Arrow x1={540} y1={130} x2={578} y2={130} accent={A} />
        <Warn x={270} y={40} text="features can't ride along in the request" />
      </Frame>
    ),
  },
  /* ---------------- p42 — Figure 1.5 redraw (FTI solution) ---------------- */
  {
    page: 42, chapter: 1, stage: "foundations", accent: A, archetype: "architecture",
    section: "The solution – ML pipelines for ML systems",
    term: "FTI ARCHITECTURE", title: "Feature, Training, Inference (Fig 1.5)",
    caption: "The FTI pattern splits any ML system into three pipelines connected by two shared stores: a feature store and a model registry.",
    diagram: (
      <Frame w={740} h={350}>
        <PipelineGlyph x={30} y={20} w={190} h={96} accent={A} />
        <Label x={125} y={66} weight={700}>Feature pipeline</Label>
        <PipelineGlyph x={275} y={20} w={190} h={96} accent={A} />
        <Label x={370} y={66} weight={700}>Training pipeline</Label>
        <PipelineGlyph x={520} y={20} w={190} h={96} accent={A} />
        <Label x={615} y={66} weight={700}>Inference pipeline</Label>
        <DataStoreGlyph x={120} y={200} w={150} h={130} accent={A} />
        <Label x={195} y={344} weight={600}>Feature store</Label>
        <DataStoreGlyph x={450} y={200} w={150} h={130} accent={A} />
        <Label x={525} y={344} weight={600}>Model registry</Label>
        {/* feature pipe -> feature store */}
        <Arrow x1={125} y1={118} x2={185} y2={205} accent={A} />
        {/* feature store -> training */}
        <Arrow x1={235} y1={235} x2={350} y2={118} accent={A} />
        {/* training -> model registry */}
        <Arrow x1={420} y1={118} x2={500} y2={205} accent={A} />
        {/* feature store -> inference */}
        <Arrow x1={250} y1={250} x2={560} y2={118} accent={A} animated={false} />
        {/* model registry -> inference */}
        <Arrow x1={575} y1={205} x2={605} y2={120} accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p43 — the feature pipeline ---------------- */
  {
    page: 43, chapter: 1, stage: "foundations", accent: A, archetype: "pipeline-flow",
    section: "The solution – ML pipelines for ML systems",
    term: "FEATURE PIPELINE", title: "Raw data → features → store",
    caption: "The feature pipeline takes raw data, processes it into features and labels, and writes them to a feature store that versions and shares them.",
    diagram: (
      <Frame w={720} h={250}>
        <DocumentGlyph x={20} y={55} w={140} h={120} accent={A} />
        <Label x={90} y={190}>Raw data</Label>
        <PipelineGlyph x={250} y={65} w={190} h={100} accent={A} />
        <Label x={345} y={115} weight={700}>Feature pipeline</Label>
        <DataStoreGlyph x={520} y={45} w={150} h={140} accent={A} />
        <Label x={595} y={200} weight={600}>Feature store</Label>
        <Label x={595} y={218} size={10.5} color="#5E6B76">version · track · share</Label>
        <Arrow x1={162} y1={115} x2={248} y2={115} accent={A} />
        <Arrow x1={440} y1={115} x2={518} y2={115} accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p44 — the three interfaces ---------------- */
  {
    page: 44, chapter: 1, stage: "foundations", accent: A, archetype: "architecture",
    section: "Benefits of the FTI architecture",
    term: "THE INTERFACE", title: "Three pipelines, one stable contract",
    caption: "Whatever the complexity, the interfaces never change: features land in the feature store, models land in the registry, inference reads both.",
    diagram: (
      <Frame w={740} h={340}>
        {/* row 1 */}
        <LabelBox x={20} y={24} w={150} h={56} text="Feature pipeline" accent={A} />
        <Arrow x1={170} y1={52} x2={250} y2={52} accent={A} animated={false} />
        <Label x={210} y={36} size={10.5} color="#5E6B76">features & labels</Label>
        <DataStoreGlyph x={250} y={8} w={110} h={92} accent={A} />
        <Label x={305} y={112} size={11.5} weight={600}>Feature store</Label>
        {/* row 2 */}
        <Arrow x1={305} y1={120} x2={305} y2={150} accent={A} animated={false} />
        <LabelBox x={250} y={150} w={150} h={56} text="Training pipeline" accent={A} />
        <Arrow x1={400} y1={178} x2={480} y2={178} accent={A} animated={false} />
        <Label x={440} y={162} size={10.5} color="#5E6B76">model</Label>
        <DataStoreGlyph x={480} y={134} w={110} h={92} accent={A} />
        <Label x={535} y={238} size={11.5} weight={600}>Model registry</Label>
        {/* row 3 */}
        <LabelBox x={250} y={262} w={150} h={56} text="Inference pipeline" accent={A} strong />
        <Arrow x1={305} y1={206} x2={305} y2={262} accent={A} animated={false} />
        <Arrow x1={535} y1={226} x2={400} y2={290} accent={A} animated={false} />
        <Arrow x1={400} y1={290} x2={470} y2={290} accent={A} />
        <LabelBox x={470} y={264} w={120} h={52} text="Predictions" accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p45 — high-level, tech-agnostic ---------------- */
  {
    page: 45, chapter: 1, stage: "foundations", accent: A, archetype: "hierarchy",
    section: "Designing the system architecture of the LLM twin",
    term: "DESIGN STEP", title: "High-level, tech-agnostic first",
    caption: "Before tooling, define each component's scope, interface, and interconnectivity — keeping the design language- and platform-agnostic.",
    diagram: (
      <Frame w={720} h={230}>
        <rect x={20} y={26} width={680} height={30} rx={15} fill="rgba(14,165,183,0.10)" stroke={A} strokeWidth={1.4} />
        <Label x={360} y={41} size={12} weight={600} color={A}>scope · interface · interconnectivity — agnostic for now</Label>
        {["Data collection", "Feature", "Training", "Inference"].map((t, i) => (
          <g key={i}>
            <LabelBox x={25 + i * 172} y={100} w={150} h={70} text={t} accent={A} />
            {i < 3 && <Arrow x1={175 + i * 172} y1={135} x2={197 + i * 172} y2={135} accent={A} animated={false} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* ---------------- p46 — system requirements ---------------- */
  {
    page: 46, chapter: 1, stage: "foundations", accent: A, archetype: "list-cluster",
    section: "How to design the LLM twin architecture using the FTI pipeline design",
    term: "REQUIREMENTS", title: "What the system must do",
    caption: "The twin needs a REST inference API with real-time RAG and autoscaling, plus full LLMOps: dataset and model versioning, experiment tracking, CT/CI/CD, and monitoring.",
    diagram: (
      <Frame w={740} h={340}>
        <ModelGlyph x={300} y={130} w={140} h={130} accent={A} />
        <Label x={370} y={200} weight={700}>LLM Twin system</Label>
        <Label x={150} y={18} size={11.5} weight={700} color={A}>INFERENCE</Label>
        {["REST API", "Real-time vector DB", "Autoscaling"].map((t, i) => (
          <g key={i}>
            <Pill x={30} y={40 + i * 50} text={t} accent={A} w={210} />
            <line x1={300} y1={195} x2={240} y2={55 + i * 50} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
        <Label x={600} y={18} size={11.5} weight={700} color={A}>LLMOps</Label>
        {["Dataset versioning", "Model versioning", "Experiment tracking", "CT / CI / CD", "Prompt monitoring"].map((t, i) => (
          <g key={i}>
            <Pill x={500} y={40 + i * 50} text={t} accent={A} w={210} />
            <line x1={440} y1={195} x2={500} y2={55 + i * 50} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* ---------------- p47 — Figure 1.6 redraw WITH logos ---------------- */
  {
    page: 47, chapter: 1, stage: "foundations", accent: A, archetype: "architecture",
    section: "How to design the LLM twin architecture using the FTI pipeline design",
    term: "LLM TWIN SYSTEM", title: "The whole system, end to end (Fig 1.6)",
    caption: "Four pipelines wired together: data collection crawls sources into MongoDB; the feature pipeline fills Qdrant; training writes to a model registry; inference serves RAG answers over an API.",
    diagram: (
      <Frame w={760} h={470}>
        {/* TL — data collection */}
        <Boundary x={16} y={26} w={356} h={188} title="Data collection" accent={A} />
        <Pill x={34} y={52} text="Medium · Substack · LinkedIn" accent={A} w={210} />
        <BrandNode x={34} y={92} name="GitHub" w={150} />
        <PipelineGlyph x={196} y={70} w={70} h={70} accent={A} />
        <Label x={231} y={150} size={10.5} weight={600}>ETL</Label>
        <BrandNode x={236} y={150} name="MongoDB" sub="NoSQL warehouse" w={132} />
        <Arrow x1={186} y1={108} x2={198} y2={105} accent={A} animated={false} />
        <Arrow x1={250} y1={140} x2={290} y2={150} accent={A} animated={false} />
        {/* TR — feature pipeline */}
        <Boundary x={388} y={26} w={356} h={188} title="Feature pipeline" accent={A} />
        <Pill x={404} y={52} text="clean · chunk · embed" accent={A} w={170} />
        <BrandNode x={404} y={96} name="Qdrant" sub="vector DB (RAG)" w={150} />
        <SnapshotGlyph x={560} y={86} w={170} h={70} accent={A} title="instruct dataset" usedFor="training" />
        {/* BL — training pipeline */}
        <Boundary x={16} y={250} w={356} h={196} title="Training pipeline" accent={A} />
        <BrandNode x={34} y={278} name="Comet ML" sub="experiment tracker" w={160} />
        <BrandNode x={34} y={336} name="AWS SageMaker" sub="fine-tune compute" w={180} />
        <DataStoreGlyph x={250} y={290} w={110} h={120} accent={A} />
        <Label x={305} y={420} size={11} weight={600}>Model registry</Label>
        <Arrow x1={216} y1={350} x2={258} y2={350} accent={A} animated={false} />
        {/* BR — inference pipeline */}
        <Boundary x={388} y={250} w={356} h={196} title="Inference pipeline" accent={A} />
        <ModelGlyph x={404} y={284} w={108} h={108} accent={A} />
        <Label x={458} y={400} size={11} weight={700}>LLM Twin</Label>
        <BrandNode x={540} y={284} name="FastAPI" sub="REST API" w={150} />
        <BrandNode x={540} y={344} name="Opik" sub="prompt monitoring" w={170} />
        {/* cross-quadrant flows */}
        <Arrow x1={368} y1={150} x2={400} y2={120} accent={A} animated={false} />
        <Arrow x1={566} y1={150} x2={560} y2={250} accent={A} animated={false} />
        <Arrow x1={305} y1={410} x2={430} y2={284} accent={A} animated={false} />
        <Arrow x1={512} y1={330} x2={538} y2={310} accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p48 — data collection pipeline ---------------- */
  {
    page: 48, chapter: 1, stage: "foundations", accent: A, archetype: "pipeline-flow",
    section: "Data collection pipeline",
    term: "DATA COLLECTION", title: "Crawl → ETL → warehouse",
    caption: "An ETL pipeline crawls Medium, Substack, LinkedIn, and GitHub, standardizes the text, and loads it into MongoDB acting as the data warehouse.",
    diagram: (
      <Frame w={720} h={300}>
        {["Medium", "Substack", "LinkedIn"].map((t, i) => (
          <Pill key={t} x={20} y={40 + i * 52} text={t} accent={A} w={130} />
        ))}
        <BrandNode x={20} y={196} name="GitHub" w={130} />
        <PipelineGlyph x={250} y={90} w={170} h={100} accent={A} />
        <Label x={335} y={140} weight={700}>ETL pipeline</Label>
        <BrandNode x={500} y={115} name="MongoDB" sub="NoSQL warehouse" w={190} />
        {[40, 92, 144, 210].map((y, i) => (
          <Arrow key={i} x1={152} y1={y + 15} x2={248} y2={140} accent={A} animated={i === 0} />
        ))}
        <Arrow x1={420} y1={140} x2={498} y2={140} accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p49 — feature pipeline specifics ---------------- */
  {
    page: 49, chapter: 1, stage: "foundations", accent: A, archetype: "pipeline-flow",
    section: "Feature pipeline",
    term: "FEATURE PIPELINE", title: "Clean, chunk, embed → two snapshots",
    caption: "Articles, posts, and code are cleaned, chunked, and embedded — saving a cleaned snapshot for fine-tuning and an embedded snapshot in Qdrant for RAG.",
    diagram: (
      <Frame w={760} h={330}>
        {["Articles", "Posts", "Code"].map((t, i) => (
          <Pill key={t} x={20} y={50 + i * 52} text={t} accent={A} w={110} />
        ))}
        {["Clean", "Chunk", "Embed"].map((t, i) => (
          <g key={t}>
            <LabelBox x={170 + i * 120} y={120} w={104} h={50} text={t} accent={A} />
            {i < 2 && <Arrow x1={274 + i * 120} y1={145} x2={290 + i * 120} y2={145} accent={A} animated={false} />}
          </g>
        ))}
        {[50, 102, 154].map((y, i) => (
          <Arrow key={i} x1={130} y1={y + 15} x2={168} y2={145} accent={A} animated={i === 0} />
        ))}
        <SnapshotGlyph x={540} y={36} w={200} h={74} accent={A} title="cleaned data" usedFor="fine-tuning" />
        <BrandNode x={560} y={150} name="Qdrant" sub="embedded → RAG" w={180} />
        <Label x={620} y={210} size={10.5} color="#5E6B76">logical feature store</Label>
        <Arrow x1={534} y1={140} x2={560} y2={90} accent={A} animated={false} />
        <Arrow x1={534} y1={150} x2={558} y2={175} accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p50 — training pipeline ---------------- */
  {
    page: 50, chapter: 1, stage: "foundations", accent: A, archetype: "pipeline-flow",
    section: "Training pipeline",
    term: "TRAINING PIPELINE", title: "Fine-tune → model registry",
    caption: "When a new instruct dataset is ready, the training pipeline fine-tunes the LLM, tracking experiments with Comet ML, and stores the weights in a model registry.",
    diagram: (
      <Frame w={720} h={300}>
        <SnapshotGlyph x={20} y={100} w={180} h={74} accent={A} title="instruct dataset" usedFor="fine-tuning" />
        <ModelGlyph x={280} y={70} w={130} h={130} accent={A} />
        <Label x={345} y={215} weight={700}>Fine-tune LLM</Label>
        <BrandNode x={250} y={20} name="Comet ML" sub="experiment tracker" w={190} />
        <DataStoreGlyph x={530} y={70} w={150} h={140} accent={A} />
        <Label x={605} y={225} weight={600}>Model registry</Label>
        <Arrow x1={200} y1={137} x2={278} y2={135} accent={A} />
        <Arrow x1={345} y1={68} x2={345} y2={70} accent={A} animated={false} />
        <Arrow x1={410} y1={135} x2={528} y2={135} accent={A} />
      </Frame>
    ),
  },
  /* ---------------- p51 — inference pipeline ---------------- */
  {
    page: 51, chapter: 1, stage: "foundations", accent: A, archetype: "architecture",
    section: "Inference pipeline",
    term: "INFERENCE PIPELINE", title: "RAG answers over a REST API",
    caption: "Inference loads the fine-tuned LLM from the registry and the vector DB for RAG, answers client queries through a REST API, and logs everything to prompt monitoring.",
    diagram: (
      <Frame w={760} h={330}>
        <DataStoreGlyph x={20} y={30} w={120} h={110} accent={A} />
        <Label x={80} y={152} size={11} weight={600}>Model registry</Label>
        <BrandNode x={20} y={190} name="Qdrant" sub="vector DB · RAG" w={170} />
        <ModelGlyph x={290} y={90} w={130} h={130} accent={A} />
        <Label x={355} y={235} weight={700}>LLM Twin</Label>
        <BrandNode x={500} y={70} name="FastAPI" sub="REST API" w={150} />
        <UserGlyph x={660} y={70} w={90} h={100} accent={A} />
        <Label x={705} y={185} size={11}>Client</Label>
        <BrandNode x={500} y={210} name="Opik" sub="prompt monitoring" w={180} />
        <Arrow x1={140} y1={95} x2={288} y2={130} accent={A} animated={false} />
        <Arrow x1={190} y1={215} x2={288} y2={175} accent={A} animated={false} />
        <Arrow x1={420} y1={150} x2={498} y2={130} accent={A} />
        <Arrow x1={650} y1={125} x2={658} y2={120} accent={A} />
        <Arrow x1={420} y1={200} x2={520} y2={210} accent={A} animated={false} />
      </Frame>
    ),
  },
  /* ---------------- p52 — scaling per pipeline ---------------- */
  {
    page: 52, chapter: 1, stage: "foundations", accent: A, archetype: "comparison",
    section: "Final thoughts on the FTI design and the LLM twin architecture",
    term: "SCALING", title: "Each pipeline scales its own way",
    caption: "Data and feature pipelines scale horizontally on CPU/RAM, the training pipeline scales vertically with more GPUs, and inference scales horizontally with client requests.",
    diagram: (
      <Frame w={720} h={250}>
        {[
          ["Data & feature", "horizontal", "CPU / RAM"],
          ["Training", "vertical", "more GPUs"],
          ["Inference", "horizontal", "client requests"],
        ].map(([t, mode, by], i) => (
          <g key={i}>
            <PipelineGlyph x={20 + i * 235} y={40} w={200} h={92} accent={A} />
            <Label x={120 + i * 235} y={86} weight={700}>{t as string}</Label>
            <Pill x={45 + i * 235} y={150} text={`${mode} · ${by}`} accent={A} w={150} />
          </g>
        ))}
      </Frame>
    ),
  },
];
