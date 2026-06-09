// Appendix — MLOps Principles (pp. 490–503). The six principles: automation,
// versioning, experiment tracking, testing, monitoring, reproducibility.
// Stage = Operations (violet). No book figures except A.1/A.2 (redrawn as
// schematics). p503 ends with the Discord footer (non-content there).
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

const O = STAGES.operations.accent; // violet
const MONO = "'IBM Plex Mono', monospace";

const Frame: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => (
  <Canvas width={w} height={h}>{children}</Canvas>
);

export const CHAPTER12: PageDiagram[] = [
  /* p490 — automation tiers */
  {
    page: 490, chapter: 12, stage: "operations", accent: O, archetype: "pipeline-flow",
    section: "1. Automation or operationalization",
    term: "AUTOMATION", title: "Manual → CT → CI/CD",
    caption:
      "MLOps adoption climbs three tiers: a manual process (data scientist runs each step in notebooks), continuous training (an orchestrator retrains on triggers), and CI/CD (auto build, test, deploy of code/models/pipelines).",
    diagram: (
      <Frame w={740} h={200}>
        {[
          ["manual", "notebooks"],
          ["CT", "orchestrated retrain"],
          ["CI/CD", "auto deploy"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <PipelineGlyph x={20 + i * 245} y={55} w={210} h={90} accent={O} />
            <Label x={125 + i * 245} y={92} weight={700}>{t as string}</Label>
            <Label x={125 + i * 245} y={112} size={11} color="#5E6B76">{sub as string}</Label>
            {i < 2 && <Arrow x1={230 + i * 245} y1={100} x2={265 + i * 245} y2={100} accent={O} animated={i === 0} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p491 — Fig A.1 CI/CD/CT on FTI */
  {
    page: 491, chapter: 12, stage: "operations", accent: O, archetype: "architecture",
    section: "1. Automation or operationalization",
    term: "CI/CD/CT", title: "Automation on the FTI architecture (Fig A.1)",
    caption:
      "CT automates the FTI pipelines (triggered by fresh data or a monitored performance drop); CI/CD builds, tests, and pushes new pipeline code to production. The bottom is the data scientists’ manual experimentation feeding the code repo.",
    diagram: (
      <Frame w={760} h={230}>
        <Boundary x={30} y={20} w={690} h={110} title="automated (CT + CI/CD)" accent={O} />
        {["feature", "training", "inference"].map((t, i) => (
          <g key={t}>
            <PipelineGlyph x={60 + i * 210} y={50} w={160} h={60} accent={O} />
            <Label x={140 + i * 210} y={80} weight={600}>{t}</Label>
            {i < 2 && <Arrow x1={220 + i * 210} y1={80} x2={268 + i * 210} y2={80} accent={O} animated={false} />}
          </g>
        ))}
        <Boundary x={30} y={150} w={690} h={70} title="manual (experimentation)" accent={O} />
        <UserGlyph x={60} y={160} w={50} h={50} accent={O} />
        <Pill x={130} y={170} text="tinker data + model → push code" accent={O} w={320} />
        <Warn x={520} y={185} text="drift / fresh data → trigger CT" />
        <Arrow x1={375} y1={150} x2={375} y2={112} accent={O} animated={false} />
      </Frame>
    ),
  },
  /* p492 — versioning */
  {
    page: 492, chapter: 12, stage: "operations", accent: O, archetype: "comparison",
    section: "2. Versioning",
    term: "VERSIONING", title: "Version code, model, and data separately",
    caption:
      "Track the three dimensions individually: code with Git (commits + SemVer releases), the model via a model registry (SemVer + metadata store), and data with DVC or artifact systems (Comet/W&B/ZenML), stored on S3.",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["code", "Git · GitHub", "GitHub"],
          ["model", "registry · SemVer", "Comet"],
          ["data", "DVC · artifacts", "DVC"],
        ].map(([t, sub, tool], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 245} y={45} w={210} h={56} text={t as string} sub={sub as string} accent={O} />
            <BrandNode x={40 + i * 245} y={120} name={tool as string} w={170} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* p493 — test types */
  {
    page: 493, chapter: 12, stage: "operations", accent: O, archetype: "list-cluster",
    section: "Test types",
    term: "TESTING", title: "Six test types (and experiment tracking)",
    caption:
      "Experiment tracking (Comet/W&B/MLflow) picks the best model. Testing spans six types — unit, integration, system, acceptance, regression, stress — across data, model, and code, run with Pytest.",
    diagram: (
      <Frame w={740} h={200}>
        {["unit", "integration", "system", "acceptance", "regression", "stress"].map((t, i) => (
          <Pill key={t} x={30 + (i % 3) * 235} y={60 + Math.floor(i / 3) * 60} text={t} accent={O} w={215} />
        ))}
      </Frame>
    ),
  },
  /* p494 — Fig A.2 test pyramid */
  {
    page: 494, chapter: 12, stage: "operations", accent: O, archetype: "hierarchy",
    section: "Test examples",
    term: "TEST PYRAMID", title: "Layered tests; regression spans all (Fig A.2)",
    caption:
      "Tests layer from unit → integration → system → acceptance → stress. Regression isn’t a distinct phase — it runs across all levels. You treat each component as a black box and test inputs (types, edge cases) and outputs.",
    diagram: (
      <Frame w={720} h={220}>
        {[
          ["unit", 360],
          ["integration", 320],
          ["system", 280],
          ["acceptance", 240],
          ["stress", 200],
        ].map(([t, w], i) => (
          <g key={i}>
            <rect x={360 - (w as number) / 2} y={30 + i * 34} width={w as number} height={28} rx={6} fill={`${O}26`} stroke={O} strokeWidth={1.4} />
            <Label x={360} y={44 + i * 34} size={11.5} weight={600}>{t as string}</Label>
          </g>
        ))}
        <Label x={360} y={210} size={11} color="#5E6B76">regression testing applies across every layer</Label>
      </Frame>
    ),
  },
  /* p495 — test examples */
  {
    page: 495, chapter: 12, stage: "operations", accent: O, archetype: "list-cluster",
    section: "Test examples",
    term: "WHAT TO TEST", title: "Code, data, and model tests",
    caption:
      "Code tests check functions (text cleaning, chunking). Data tests validate inputs (non-null, allowed categories, encoding). Model tests are trickiest: tensor shapes, loss decreasing, overfit a small batch, device support, early-stopping/checkpoint logic.",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["code", "clean · chunk"],
          ["data", "validity · schema"],
          ["model", "shapes · loss ↓ · overfit"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 245} y={70} w={210} h={70} text={t as string} sub={sub as string} accent={O} strong={i === 2} />
        ))}
      </Frame>
    ),
  },
  /* p496 — behavioral testing */
  {
    page: 496, chapter: 12, stage: "operations", accent: O, archetype: "comparison",
    section: "Test examples",
    term: "BEHAVIORAL", title: "Invariance, directional, minimum functionality",
    caption:
      "Model-agnostic behavioral testing (CheckList) treats the model as a black box: invariance (synonyms shouldn’t change output), directional (some input changes should change output), and minimum functionality (simple cases it must get right).",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["invariance", "output unchanged"],
          ["directional", "output should change"],
          ["min functionality", "must get right"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 245} y={70} w={210} h={70} text={t as string} sub={sub as string} accent={O} strong={i === 2} />
        ))}
      </Frame>
    ),
  },
  /* p497 — monitoring + logs */
  {
    page: 497, chapter: 12, stage: "operations", accent: O, archetype: "single-concept",
    section: "5. Monitoring",
    term: "MONITORING", title: "ML degrades — catch it with logs",
    caption:
      "Unlike deterministic software, ML models degrade as production data drifts from training data. Monitoring detects degradation and triggers retraining. Start by logging everything — configs, queries, results, component start/stop/crash, all tagged.",
    diagram: (
      <Frame w={720} h={200}>
        <ModelGlyph x={40} y={70} w={110} h={90} accent={O} />
        <Label x={95} y={175} size={11}>model</Label>
        <DataStoreGlyph x={250} y={75} w={100} h={80} accent={O} />
        <Label x={300} y={168} size={11}>logs</Label>
        <DecisionGlyph x={430} y={70} w={100} h={90} accent={O} mark="degrade?" />
        <Pill x={580} y={95} text="retrain" accent={O} w={120} />
        <Arrow x1={150} y1={115} x2={248} y2={115} accent={O} />
        <Arrow x1={350} y1={115} x2={428} y2={115} accent={O} />
        <Arrow x1={530} y1={115} x2={578} y2={110} accent={O} />
      </Frame>
    ),
  },
  /* p498 — metrics + drift table */
  {
    page: 498, chapter: 12, stage: "operations", accent: O, archetype: "list-cluster",
    section: "Drifts",
    term: "METRICS + DRIFT", title: "System, model metrics; three drifts",
    caption:
      "Monitor system metrics (latency, throughput, CPU/GPU) and model metrics (accuracy, F1, ROI) over sliding windows. When labels are delayed, drifts act as proxy metrics: data drift P(X), target drift P(y), concept drift P(y|X).",
    diagram: (
      <Frame w={740} h={210}>
        <Pill x={40} y={40} text="system: latency · throughput" accent={O} w={300} />
        <Pill x={40} y={84} text="model: accuracy · F1 · ROI" accent={O} w={300} />
        {[
          ["data drift", "P(X)"],
          ["target drift", "P(y)"],
          ["concept drift", "P(y|X)"],
        ].map(([t, f], i) => (
          <LabelBox key={i} x={400 + (i % 3) * 0} y={40 + i * 50} w={300} h={42} text={t as string} sub={f as string} accent={O} />
        ))}
      </Frame>
    ),
  },
  /* p499 — data drift */
  {
    page: 499, chapter: 12, stage: "operations", accent: O, archetype: "single-concept",
    section: "Drifts",
    term: "DATA DRIFT", title: "Production features shift from training",
    caption:
      "Data drift (covariate shift): the production feature distribution P(X) deviates from training Pref(X), so the model can’t handle the new feature space. A good moment to retrain before performance drops. Target drift shifts the output distribution.",
    diagram: (
      <Frame w={720} h={200}>
        <Label x={170} y={30} size={11} weight={700} color={O}>training Pref(X)</Label>
        <path d="M 40 150 Q 170 40 300 150" fill="none" stroke={O} strokeWidth={3} strokeLinecap="round" />
        <Label x={520} y={30} size={11} weight={700} color="#EF5C46">production P(X)</Label>
        <path d="M 410 150 Q 560 60 690 150" fill="none" stroke="#EF5C46" strokeWidth={3} strokeLinecap="round" strokeDasharray="7 5" />
        <Warn x={360} y={100} text="P(X) ≠ Pref(X)" />
      </Frame>
    ),
  },
  /* p500 — concept drift */
  {
    page: 500, chapter: 12, stage: "operations", accent: O, archetype: "comparison",
    section: "Drifts",
    term: "CONCEPT DRIFT", title: "The input→output relationship shifts",
    caption:
      "Concept drift: the relationship P(y|X) the model learned becomes outdated (e.g. using a US car-buying model in Europe). It can appear gradually, suddenly (an external event), or periodically (recurring events).",
    diagram: (
      <Frame w={740} h={200}>
        {[
          ["gradual", "over time"],
          ["sudden", "external event"],
          ["periodic", "recurring"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 245} y={70} w={210} h={70} text={t as string} sub={sub as string} accent={O} />
        ))}
      </Frame>
    ),
  },
  /* p501 — detect drifts */
  {
    page: 501, chapter: 12, stage: "operations", accent: O, archetype: "single-concept",
    section: "Monitoring vs. observability",
    term: "DETECT DRIFT", title: "Reference vs test window, hypothesis tests",
    caption:
      "Detect drift by comparing a reference window (baseline, from training) with a test window (production) using hypothesis tests: KS (continuous), chi-squared (categorical), or MMD on reduced embeddings for text (e.g. alibi-detect).",
    diagram: (
      <Frame w={720} h={200}>
        <DataStoreGlyph x={40} y={70} w={100} h={80} accent={O} />
        <Label x={90} y={163} size={11}>reference</Label>
        <DataStoreGlyph x={230} y={70} w={100} h={80} accent={O} />
        <Label x={280} y={163} size={11}>test</Label>
        <DecisionGlyph x={420} y={70} w={100} h={80} accent={O} mark="KS/MMD" />
        <Pill x={580} y={95} text="drift?" accent={O} w={120} />
        <Arrow x1={140} y1={100} x2={418} y2={100} accent={O} animated={false} />
        <Arrow x1={330} y1={120} x2={418} y2={120} accent={O} animated={false} />
        <Arrow x1={520} y1={110} x2={578} y2={110} accent={O} />
      </Frame>
    ),
  },
  /* p502 — observability + alerts */
  {
    page: 502, chapter: 12, stage: "operations", accent: O, archetype: "comparison",
    section: "6. Reproducibility",
    term: "ALERTS", title: "Monitor vs observe; alert on thresholds",
    caption:
      "Monitoring collects/visualizes data; observability explains internal state for root-cause. Alert when a metric crosses a static threshold or a drift p-value — tune them to avoid false-positive noise. Channels: Slack, Discord, email, PagerDuty.",
    diagram: (
      <Frame w={740} h={210}>
        <LabelBox x={40} y={40} w={250} h={50} text="monitoring" sub="collect + visualize" accent={O} />
        <LabelBox x={420} y={40} w={260} h={50} text="observability" sub="root cause" accent={O} />
        {["Slack", "Discord", "email", "PagerDuty"].map((t, i) => (
          <Pill key={t} x={40 + i * 175} y={130} text={t} accent={O} w={155} />
        ))}
        <Warn x={300} y={185} text="tune thresholds to avoid false positives" />
      </Frame>
    ),
  },
  /* p503 — reproducibility */
  {
    page: 503, chapter: 12, stage: "operations", accent: O, archetype: "single-concept",
    section: "6. Reproducibility",
    term: "REPRODUCIBILITY", title: "Track inputs + fix the seed",
    caption:
      "Reproducibility means the same input yields identical results. Two requirements: always track the inputs (dataset version + config that produced an asset), and fix a seed for ML’s non-deterministic steps (random init, imputation) — pseudo-random, but controlled.",
    diagram: (
      <Frame w={720} h={200}>
        <SnapshotGlyph x={30} y={80} w={180} h={64} accent={O} title="dataset v + config" usedFor="tracked inputs" />
        <DecisionGlyph x={280} y={65} w={100} h={90} accent={O} mark="seed" />
        <ModelGlyph x={450} y={65} w={100} h={90} accent={O} />
        <Pill x={590} y={95} text="identical result" accent={O} w={120} />
        <Arrow x1={210} y1={112} x2={278} y2={110} accent={O} />
        <Arrow x1={380} y1={110} x2={448} y2={110} accent={O} />
        <Arrow x1={550} y1={110} x2={588} y2={110} accent={O} animated={false} />
      </Frame>
    ),
  },
];
