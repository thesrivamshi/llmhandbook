// Chapter 11 — MLOps and LLMOps (pp. 430–487). DevOps → MLOps → LLMOps theory,
// deploying the LLM Twin pipelines to AWS (MongoDB/Qdrant/ZenML cloud, Docker,
// ECR, SageMaker), and adding LLMOps: GitHub Actions CI/CD, ZenML CT + alerting,
// Opik prompt monitoring. Stage = Operations (violet) — first violet chapter.
// Figures 11.1–11.21 redrawn. pp.488–489 are References, skipped.
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

const Code: React.FC<{ x: number; y: number; w: number; lines: { t: string; hi?: boolean }[]; size?: number }> = ({
  x, y, w, lines, size = 12,
}) => {
  const lh = size + 7;
  const h = lines.length * lh + 18;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="#FFFFFF" stroke="#ECE8DF" strokeWidth={1.5} />
      {lines.map((l, i) => (
        <text key={i} x={x + 14} y={y + 16 + i * lh} fontFamily={MONO} fontSize={size} fill={l.hi ? O : "#25313C"} fontWeight={l.hi ? 700 : 500}>
          {l.t}
        </text>
      ))}
    </g>
  );
};

export const CHAPTER11: PageDiagram[] = [
  /* p430 */
  {
    page: 430, chapter: 11, stage: "operations", accent: O, archetype: "hierarchy",
    section: "Chapter 11: MLOps and LLMOps",
    term: "LLMOPS", title: "LLMOps builds on MLOps builds on DevOps",
    caption:
      "LLMOps automates the LLM lifecycle — prompt monitoring/versioning, guardrails, feedback loops, and scaling. It’s a specialization of MLOps, which extends DevOps to make data and models first-class citizens.",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={40} y={120} w={200} h={60} text="DevOps" sub="ship software" accent={O} />
        <LabelBox x={270} y={80} w={200} h={60} text="MLOps" sub="+ data + models" accent={O} />
        <LabelBox x={500} y={40} w={200} h={60} text="LLMOps" sub="+ prompts + scale" accent={O} strong />
        <Arrow x1={240} y1={140} x2={270} y2={120} accent={O} animated={false} />
        <Arrow x1={470} y1={100} x2={500} y2={80} accent={O} animated={false} />
      </Frame>
    ),
  },
  /* p431 — chapter goals */
  {
    page: 431, chapter: 11, stage: "operations", accent: O, archetype: "list-cluster",
    section: "The path to LLMOps",
    term: "GOALS", title: "Deploy to AWS, add CI/CD, CT, monitoring",
    caption:
      "The chapter deploys all ZenML pipelines to AWS, then adds a CI/CD pipeline (GitHub Actions) for code integrity, a CT pipeline (ZenML) to automate training, and a monitoring pipeline (Opik) for prompts and answers.",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={270} y={85} w={180} h={56} text="LLM Twin ops" accent={O} strong />
        {[["deploy to AWS", 30, 30], ["CI/CD", 520, 30], ["CT pipeline", 30, 155], ["monitoring", 520, 155]].map(([t, x, y], i) => (
          <g key={i}>
            <Pill x={x as number} y={y as number} text={t as string} accent={O} w={180} />
            <line x1={360} y1={113} x2={(x as number) + 90} y2={(y as number) + 15} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* p432 — DevOps */
  {
    page: 432, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "The DevOps lifecycle",
    term: "DEVOPS", title: "Automate build, test, deploy, monitor",
    caption:
      "DevOps automates shipping software at scale — building, testing, deploying, monitoring — with collaboration, rapid feedback, and continuous delivery, boosting efficiency, quality, and security.",
    diagram: (
      <Frame w={720} h={200}>
        {["build", "test", "deploy", "monitor"].map((t, i) => (
          <g key={t}>
            <PipelineGlyph x={20 + i * 175} y={70} w={150} h={70} accent={O} />
            <Label x={95 + i * 175} y={108} weight={700}>{t}</Label>
            {i < 3 && <Arrow x1={170 + i * 175} y1={105} x2={195 + i * 175} y2={105} accent={O} animated={i === 0} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p433 — Fig 11.1 DevOps lifecycle cycle */
  {
    page: 433, chapter: 11, stage: "operations", accent: O, archetype: "cycle",
    section: "The core DevOps concepts",
    term: "LIFECYCLE", title: "The eight DevOps stages (Fig 11.1)",
    caption:
      "The DevOps lifecycle is an infinite loop: plan → code → build → test → release → deploy → operate → monitor — Dev feeding Ops and feedback flowing back.",
    diagram: (
      <Frame w={740} h={250}>
        {["plan", "code", "build", "test", "release", "deploy", "operate", "monitor"].map((t, i) => {
          const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const cx = 370 + Math.cos(angle) * 180;
          const cy = 125 + Math.sin(angle) * 90;
          return (
            <g key={t}>
              <Pill x={cx - 50} y={cy - 15} text={t} accent={O} w={100} />
              {i < 7 && (() => {
                const a2 = ((i + 1) / 8) * Math.PI * 2 - Math.PI / 2;
                return <Arrow x1={370 + Math.cos(angle) * 130} y1={125 + Math.sin(angle) * 65} x2={370 + Math.cos(a2) * 130} y2={125 + Math.sin(a2) * 65} accent={O} animated={i === 0} />;
              })()}
            </g>
          );
        })}
      </Frame>
    ),
  },
  /* p434 — core concepts */
  {
    page: 434, chapter: 11, stage: "operations", accent: O, archetype: "list-cluster",
    section: "MLOps",
    term: "DEVOPS CORE", title: "Environments, version control, CI/CD",
    caption:
      "Core DevOps concepts: deployment environments (dev → staging → prod), version control (GitHub/GitLab), CI (build + test on each change), and CD (auto-provision + deploy). Tools: GitHub Actions, GitLab CI/CD, CircleCI, Jenkins.",
    diagram: (
      <Frame w={740} h={220}>
        {["dev", "staging", "prod"].map((t, i) => (
          <g key={t}>
            <LabelBox x={20 + i * 160} y={40} w={140} h={48} text={t} accent={O} strong={i === 2} />
            {i < 2 && <Arrow x1={160 + i * 160} y1={64} x2={178 + i * 160} y2={64} accent={O} animated={false} />}
          </g>
        ))}
        {["GitHub Actions", "GitLab", "CircleCI", "Jenkins"].map((t, i) => (
          <BrandNode key={t} x={20 + (i % 2) * 250} y={120 + Math.floor(i / 2) * 56} name={t} w={230} />
        ))}
      </Frame>
    ),
  },
  /* p435 — Fig 11.2 data/model/code */
  {
    page: 435, chapter: 11, stage: "operations", accent: O, archetype: "architecture",
    section: "MLOps",
    term: "MLOPS", title: "Code, data, and model all trigger builds (Fig 11.2)",
    caption:
      "In DevOps everything centers on code; in MLOps a build can be triggered by a change in code, data, OR model — and changing one affects the others. MLOps tracks all three for reproducibility and control.",
    diagram: (
      <Frame w={720} h={230}>
        {[
          ["code", 360, 50],
          ["data", 180, 180],
          ["model", 540, 180],
        ].map(([t, x, y], i) => (
          <LabelBox key={i} x={(x as number) - 75} y={(y as number) - 25} w={150} h={50} text={t as string} accent={O} strong={i === 0} />
        ))}
        <Arrow x1={300} y1={90} x2={210} y2={160} accent={O} animated={false} />
        <Arrow x1={255} y1={185} x2={465} y2={185} accent={O} animated={false} />
        <Arrow x1={510} y1={160} x2={420} y2={90} accent={O} animated={false} />
      </Frame>
    ),
  },
  /* p436 — MLOps components */
  {
    page: 436, chapter: 11, stage: "operations", accent: O, archetype: "list-cluster",
    section: "MLOps core components",
    term: "COMPONENTS", title: "Registry, feature store, metadata, orchestrator",
    caption:
      "Beyond source control + CI/CD, MLOps revolves around a model registry (Comet/W&B/MLflow), a feature store (Hopsworks/Tecton/Featureform), an ML metadata store, and a pipeline orchestrator (ZenML/Airflow/Dagster).",
    diagram: (
      <Frame w={740} h={220}>
        {[
          ["model registry", "Comet · MLflow"],
          ["feature store", "Hopsworks · Tecton"],
          ["metadata store", "track lineage"],
          ["orchestrator", "ZenML · Airflow"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + (i % 2) * 370} y={40 + Math.floor(i / 2) * 90} w={350} h={70} text={t as string} sub={sub as string} accent={O} />
        ))}
      </Frame>
    ),
  },
  /* p437 — MLOps principles */
  {
    page: 437, chapter: 11, stage: "operations", accent: O, archetype: "list-cluster",
    section: "MLOps principles",
    term: "SIX PRINCIPLES", title: "What guides robust ML systems",
    caption:
      "Six tool-agnostic MLOps principles: automation (CT + CI/CD), versioning (code/model/data), experiment tracking, testing (data + models), monitoring (drift, metrics), and reproducibility (seeds, tracked configs).",
    diagram: (
      <Frame w={740} h={210}>
        {["automation", "versioning", "experiment tracking", "testing", "monitoring", "reproducibility"].map((t, i) => (
          <Pill key={t} x={30 + (i % 3) * 230} y={60 + Math.floor(i / 3) * 60} text={t} accent={O} w={210} />
        ))}
      </Frame>
    ),
  },
  /* p438 — Fig 11.3 roles */
  {
    page: 438, chapter: 11, stage: "operations", accent: O, archetype: "comparison",
    section: "ML vs. MLOps engineering",
    term: "ROLES", title: "DS vs MLE vs MLOps (Fig 11.3)",
    caption:
      "Three roles: the Data Scientist builds the model, the ML Engineer wraps it in a modular layer (DB, API), and the MLOps Engineer places it on infrastructure — enabling automation, monitoring, and versioning in production.",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["Data Scientist", "builds models"],
          ["ML Engineer", "modular layer · API"],
          ["MLOps Engineer", "infrastructure"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 245} y={70} w={210} h={70} text={t as string} sub={sub as string} accent={O} strong={i === 2} />
            {i < 2 && <Arrow x1={230 + i * 245} y1={105} x2={265 + i * 245} y2={105} accent={O} animated={false} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p439 — intermediate vs generic layer */
  {
    page: 439, chapter: 11, stage: "operations", accent: O, archetype: "architecture",
    section: "LLMOps",
    term: "LAYERS", title: "From proof of concept to product",
    caption:
      "The ML engineer’s intermediate layer (stateful, DB-backed, API-exposed) turns a proof of concept into a product; the MLOps engineer’s generic infrastructure layer (scalability, latency, cost) ships it to production.",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={120} y={30} w={460} h={50} text="DS model (proof of concept)" accent={O} />
        <LabelBox x={120} y={95} w={460} h={50} text="ML engineer: modular layer (DB + API)" accent={O} />
        <LabelBox x={120} y={160} w={460} h={50} text="MLOps engineer: infrastructure" accent={O} strong />
        <Arrow x1={350} y1={80} x2={350} y2={93} accent={O} animated={false} />
        <Arrow x1={350} y1={145} x2={350} y2={158} accent={O} animated={false} />
      </Frame>
    ),
  },
  /* p440 — LLMOps at scale */
  {
    page: 440, chapter: 11, stage: "operations", accent: O, archetype: "list-cluster",
    section: "Guardrails",
    term: "AT SCALE", title: "LLMOps is MLOps at scale",
    caption:
      "Training LLMs from scratch explodes the data/model dimensions: trillions of tokens, billions of parameters, multi-GPU clusters, and huge cost (~$100M for GPT-4). So most teams fine-tune foundation models instead.",
    diagram: (
      <Frame w={720} h={210}>
        {[
          ["13T tokens", "data"],
          ["billions params", "model"],
          ["multi-GPU", "compute"],
          ["~$100M", "cost"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 178} y={70} w={158} h={70} text={t as string} sub={sub as string} accent={O} strong={i === 3} />
        ))}
      </Frame>
    ),
  },
  /* p441 — input guardrails */
  {
    page: 441, chapter: 11, stage: "operations", accent: O, archetype: "pitfall",
    section: "Guardrails",
    term: "INPUT GUARDRAILS", title: "Protect the input side",
    caption:
      "Input guardrails defend against three risks: leaking private info to external APIs, model jailbreaking (e.g. prompt injection / malicious SQL), and accepting violent or unethical prompts.",
    diagram: (
      <Frame w={720} h={210}>
        <UserGlyph x={30} y={70} w={80} h={80} accent={O} />
        <DecisionGlyph x={180} y={70} w={100} h={80} accent={O} mark="guard" />
        <ModelGlyph x={560} y={70} w={100} h={80} accent={O} />
        {["private info leak", "jailbreak / injection", "unethical prompt"].map((t, i) => (
          <Warn key={t} x={340} y={55 + i * 40} text={t} />
        ))}
        <Arrow x1={110} y1={110} x2={178} y2={110} accent={O} />
        <Arrow x1={280} y1={110} x2={558} y2={110} accent={O} animated={false} />
      </Frame>
    ),
  },
  /* p442 — output guardrails */
  {
    page: 442, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "Prompt monitoring",
    term: "OUTPUT GUARDRAILS", title: "Catch bad outputs (latency cost)",
    caption:
      "Output guardrails catch empty/malformed, toxic, hallucinated, or leaked-info responses. Tools: Galileo Protect, OpenAI Moderation API. The cost is added latency — and a retry mechanism doubles response time unless run in parallel.",
    diagram: (
      <Frame w={720} h={210}>
        <ModelGlyph x={30} y={70} w={100} h={80} accent={O} />
        <DecisionGlyph x={200} y={70} w={100} h={80} accent={O} mark="guard" />
        <LabelBox x={360} y={85} w={150} h={50} text="clean output" accent={O} strong />
        {["empty", "toxic", "hallucination", "leaked info"].map((t, i) => (
          <Pill key={t} x={540} y={30 + i * 44} text={t} accent={O} w={160} />
        ))}
        <Arrow x1={130} y1={110} x2={198} y2={110} accent={O} />
        <Arrow x1={300} y1={110} x2={358} y2={110} accent={O} />
      </Frame>
    ),
  },
  /* p443 — latency metrics */
  {
    page: 443, chapter: 11, stage: "operations", accent: O, archetype: "list-cluster",
    section: "Prompt monitoring",
    term: "LATENCY METRICS", title: "TTFT, TBT, TPS, TPOT, total",
    caption:
      "Because tokens stream, latency is measured many ways: Time To First Token, Time Between Tokens, Tokens Per Second, Time Per Output Token, and Total Latency. Token counts also drive serving cost.",
    diagram: (
      <Frame w={740} h={200}>
        {["TTFT", "TBT", "TPS", "TPOT", "Total"].map((t, i) => (
          <Pill key={t} x={20 + i * 145} y={80} text={t} accent={O} w={130} />
        ))}
        <Label x={370} y={150} size={11} color="#5E6B76">+ track total tokens → cost</Label>
      </Frame>
    ),
  },
  /* p444 — Fig 11.4 trace */
  {
    page: 444, chapter: 11, stage: "operations", accent: O, archetype: "pipeline-flow",
    section: "Deploying the LLM Twin’s pipelines to the cloud",
    term: "TRACE", title: "Log the full trace (Fig 11.4)",
    caption:
      "Prompt monitoring logs the full trace from user input to answer — every intermediate step (query rewrite, retrieval, final prompt) with its latency, tokens, and cost — so a failure points to the exact faulty step. Tools: Langfuse, Opik.",
    diagram: (
      <Frame w={740} h={200}>
        {["input", "rewrite", "retrieve", "prompt", "answer"].map((t, i) => (
          <g key={t}>
            <LabelBox x={15 + i * 148} y={75} w={125} h={52} text={t} accent={O} strong={i === 4} />
            {i < 4 && <Arrow x1={140 + i * 148} y1={101} x2={163 + i * 148} y2={101} accent={O} animated={i === 0} />}
          </g>
        ))}
        <Label x={370} y={160} size={11} color="#5E6B76">each step: latency · tokens · cost</Label>
      </Frame>
    ),
  },
  /* p445 — infra to deploy */
  {
    page: 445, chapter: 11, stage: "operations", accent: O, archetype: "architecture",
    section: "Understanding the infrastructure",
    term: "INFRASTRUCTURE", title: "MongoDB, Qdrant, ZenML cloud → AWS",
    caption:
      "To go fully cloud: serverless MongoDB + Qdrant, and the ZenML cloud, which spins up the AWS resources — ECR (Docker images), S3 (artifacts/models), and SageMaker (orchestrator).",
    diagram: (
      <Frame w={740} h={210}>
        <BrandNode x={20} y={40} name="MongoDB" w={150} />
        <BrandNode x={20} y={110} name="Qdrant" w={150} />
        <BrandNode x={250} y={75} name="ZenML" sub="cloud" w={150} />
        {["AWS ECR", "AWS S3", "AWS SageMaker"].map((t, i) => (
          <BrandNode key={t} x={480} y={30 + i * 56} name={t} w={200} />
        ))}
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={400} y1={110} x2={478} y2={53 + i * 56} accent={O} animated={i === 0} />
        ))}
      </Frame>
    ),
  },
  /* p446 — Fig 11.5 infra flow */
  {
    page: 446, chapter: 11, stage: "operations", accent: O, archetype: "architecture",
    section: "Understanding the infrastructure",
    term: "INFRA FLOW", title: "Build → ECR → SageMaker jobs (Fig 11.5)",
    caption:
      "Flow: build a Docker image from the ZenML code, push to ECR; trigger a pipeline; each ZenML step becomes a SageMaker job on an EC2 VM that pulls the image, runs in a container, and reads/writes S3, MongoDB, Qdrant.",
    diagram: (
      <Frame w={760} h={210}>
        <BrandNode x={20} y={85} name="Docker" sub="image" w={130} />
        <BrandNode x={180} y={85} name="AWS ECR" w={130} />
        <BrandNode x={340} y={85} name="AWS SageMaker" sub="EC2 jobs" w={170} />
        <DataStoreGlyph x={560} y={30} w={80} h={64} accent={O} />
        <VectorDBGlyph x={660} y={120} w={80} h={70} accent={O} />
        <Arrow x1={150} y1={110} x2={178} y2={110} accent={O} />
        <Arrow x1={310} y1={110} x2={338} y2={110} accent={O} />
        <Arrow x1={510} y1={100} x2={558} y2={70} accent={O} animated={false} />
        <Arrow x1={510} y1={120} x2={658} y2={150} accent={O} animated={false} />
      </Frame>
    ),
  },
  /* p447 — setup MongoDB */
  {
    page: 447, chapter: 11, stage: "operations", accent: O, archetype: "pipeline-flow",
    section: "Setting up MongoDB",
    term: "MONGODB", title: "Free M0 cluster on AWS Frankfurt",
    caption:
      "Create a free M0 MongoDB cluster named ‘twin’ on AWS (eu-central-1), connect to verify, allow access from anywhere, and put the connection string into DATABASE_HOST in .env.",
    diagram: (
      <Frame w={720} h={190}>
        <BrandNode x={30} y={80} name="MongoDB" sub="M0 free · AWS" w={180} />
        <DecisionGlyph x={290} y={70} w={90} h={80} accent={O} mark="connect" />
        <DocumentGlyph x={460} y={65} w={90} h={80} accent={O} />
        <Label x={505} y={160} size={11} font={MONO}>DATABASE_HOST</Label>
        <Arrow x1={210} y1={105} x2={288} y2={105} accent={O} />
        <Arrow x1={380} y1={105} x2={458} y2={105} accent={O} />
      </Frame>
    ),
  },
  /* p448 — MongoDB connection */
  {
    page: 448, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "Setting up Qdrant",
    term: "CONNECT", title: "Local → cloud MongoDB",
    caption:
      "Once DATABASE_HOST points to the cloud cluster (with network access opened), the project reads and writes from the cloud MongoDB instead of the local one. Keep all services in the same AWS region.",
    diagram: (
      <Frame w={720} h={190}>
        <BrandNode x={40} y={80} name="MongoDB" sub="local" w={170} />
        <Label x={320} y={105} size={16} weight={700} color="#97A0A8">→</Label>
        <BrandNode x={420} y={80} name="MongoDB" sub="cloud (eu-central-1)" w={210} />
      </Frame>
    ),
  },
  /* p449 — setup Qdrant */
  {
    page: 449, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "Setting up Qdrant",
    term: "QDRANT", title: "Free Qdrant cluster + dashboard (Fig 11.6)",
    caption:
      "Create a free Qdrant cluster (GCP, Frankfurt) named ‘twin’, generate an access token, and open the dashboard — empty now, populated with collections after the pipelines run.",
    diagram: (
      <Frame w={720} h={190}>
        <BrandNode x={40} y={80} name="Qdrant" sub="free · GCP" w={180} />
        <DecisionGlyph x={300} y={65} w={90} h={80} accent={O} mark="token" />
        <VectorDBGlyph x={470} y={60} w={90} h={90} accent={O} />
        <Label x={515} y={165} size={11}>dashboard</Label>
        <Arrow x1={220} y1={105} x2={298} y2={105} accent={O} />
        <Arrow x1={390} y1={105} x2={468} y2={105} accent={O} />
      </Frame>
    ),
  },
  /* p450 — Qdrant env + ZenML intro */
  {
    page: 450, chapter: 11, stage: "operations", accent: O, archetype: "code-anatomy",
    section: "Setting up the ZenML cloud",
    term: "QDRANT ENV", title: "Point .env at the cloud cluster",
    caption:
      "Set USE_QDRANT_CLOUD=true plus the cloud URL and API key in .env, then run the end-to-end data pipeline against cloud MongoDB + Qdrant. Next: the ZenML cloud.",
    diagram: (
      <Frame w={720} h={190}>
        <Code
          x={40}
          y={45}
          w={440}
          lines={[
            { t: "USE_QDRANT_CLOUD=true", hi: true },
            { t: "QDRANT_CLOUD_URL=<endpoint>", hi: false },
            { t: "QDRANT_APIKEY=<token>", hi: false },
          ]}
        />
        <BrandNode x={520} y={75} name="Qdrant" w={150} />
      </Frame>
    ),
  },
  /* p451 — ZenML stack */
  {
    page: 451, chapter: 11, stage: "operations", accent: O, archetype: "architecture",
    section: "Setting up the ZenML cloud",
    term: "ZENML STACK", title: "Orchestrator + storage + registry",
    caption:
      "A ZenML stack is the infrastructure set: an orchestrator, object storage, and container registry. Switching stacks (local ↔ aws-stack) swaps the whole environment the pipelines run on.",
    diagram: (
      <Frame w={740} h={210}>
        <BrandNode x={30} y={90} name="ZenML" sub="stack" w={150} />
        <Boundary x={250} y={40} w={460} h={150} title="aws-stack" accent={O} />
        {["SageMaker orchestrator", "S3 storage", "ECR registry"].map((t, i) => (
          <Pill key={t} x={270} y={60 + i * 42} text={t} accent={O} w={420} />
        ))}
        <Arrow x1={180} y1={115} x2={248} y2={115} accent={O} />
      </Frame>
    ),
  },
  /* p452 — CloudFormation deploy */
  {
    page: 452, chapter: 11, stage: "operations", accent: O, archetype: "pipeline-flow",
    section: "Setting up the ZenML cloud",
    term: "CLOUDFORMATION", title: "ZenML provisions AWS via CloudFormation",
    caption:
      "Deploying the aws-stack opens AWS CloudFormation (an IaC tool) that creates IAM roles, an S3 bucket, an ECR repo, and SageMaker as orchestrator — all in a few clicks. (Terraform is the more controllable alternative.)",
    diagram: (
      <Frame w={740} h={200}>
        <BrandNode x={30} y={85} name="ZenML" w={130} />
        <BrandNode x={200} y={85} name="AWS CloudFormation" w={210} />
        {["IAM", "S3", "ECR", "SageMaker"].map((t, i) => (
          <Pill key={t} x={450} y={30 + i * 42} text={t} accent={O} w={150} />
        ))}
        <Arrow x1={160} y1={110} x2={198} y2={110} accent={O} />
        {[0, 1, 2, 3].map((i) => (
          <Arrow key={i} x1={410} y1={110} x2={448} y2={45 + i * 42} accent={O} animated={false} />
        ))}
      </Frame>
    ),
  },
  /* p453 — Dockerfile base */
  {
    page: 453, chapter: 11, stage: "operations", accent: O, archetype: "code-anatomy",
    section: "Containerize the code using Docker",
    term: "DOCKERFILE", title: "Base image + env + Poetry",
    caption:
      "The Dockerfile starts from python:3.11-slim-bullseye, sets env vars (workspace, no bytecode, unbuffered, Poetry version), and prepares a non-interactive build.",
    diagram: (
      <Frame w={720} h={190}>
        <Code
          x={40}
          y={45}
          w={430}
          lines={[
            { t: "FROM python:3.11-slim-bullseye", hi: true },
            { t: "ENV WORKSPACE_ROOT=/app/", hi: false },
            { t: "ENV POETRY_VERSION=1.8.3", hi: false },
          ]}
        />
        <BrandNode x={510} y={75} name="Docker" w={150} />
      </Frame>
    ),
  },
  /* p454 — install Chrome */
  {
    page: 454, chapter: 11, stage: "operations", accent: O, archetype: "code-anatomy",
    section: "Containerize the code using Docker",
    term: "SYSTEM DEPS", title: "Install Chrome + build tools",
    caption:
      "The image installs Google Chrome (for Selenium crawlers) via its signing key + repo, plus build-essential, gcc, and libs — cleaning apt lists afterward to keep the image small.",
    diagram: (
      <Frame w={720} h={190}>
        <Code
          x={40}
          y={45}
          w={420}
          lines={[
            { t: "apt-get install google-chrome-stable", hi: true },
            { t: "build-essential, gcc, libnss3-dev", hi: false },
            { t: "rm -rf /var/lib/apt/lists/*", hi: false },
          ]}
        />
        <BrandNode x={500} y={75} name="Google Chrome" w={180} />
      </Frame>
    ),
  },
  /* p455 — Poetry install + caching */
  {
    page: 455, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "Containerize the code using Docker",
    term: "LAYER CACHING", title: "Copy code last for fast rebuilds",
    caption:
      "Poetry installs deps (no venv, no dev, no cache) + the poethepoet plugin. Key trick: install deps before copying code — Docker layers are cached, so changing code (the last layer) rebuilds fast.",
    diagram: (
      <Frame w={720} h={210}>
        {["base + system deps", "install dependencies", "COPY code (last)"].map((t, i) => (
          <g key={t}>
            <rect x={60 + i * 0} y={40 + i * 48} width={500 - i * 0} height={40} rx={8} fill={`${O}${i === 2 ? "40" : "1A"}`} stroke={O} strokeWidth={i === 2 ? 2 : 1.4} />
            <Label x={310} y={60 + i * 48} size={12} weight={i === 2 ? 700 : 500}>{t}</Label>
          </g>
        ))}
        <Label x={310} y={195} size={11} color="#5E6B76">cached layers → rebuild only the code layer</Label>
      </Frame>
    ),
  },
  /* p456 — build + auth ECR */
  {
    page: 456, chapter: 11, stage: "operations", accent: O, archetype: "pipeline-flow",
    section: "Containerize the code using Docker",
    term: "BUILD", title: "Build the image, authenticate to ECR (Fig 11.7)",
    caption:
      "Build the llmtwin image (linux/amd64, for the Chrome installer), then authenticate Docker to ECR with aws ecr get-login-password piped into docker login.",
    diagram: (
      <Frame w={720} h={190}>
        <BrandNode x={40} y={80} name="Docker" sub="build llmtwin" w={170} />
        <DecisionGlyph x={300} y={65} w={90} h={80} accent={O} mark="login" />
        <BrandNode x={460} y={80} name="AWS ECR" w={170} />
        <Arrow x1={210} y1={105} x2={298} y2={105} accent={O} />
        <Arrow x1={390} y1={105} x2={458} y2={105} accent={O} />
      </Frame>
    ),
  },
  /* p457 — tag + push */
  {
    page: 457, chapter: 11, stage: "operations", accent: O, archetype: "pipeline-flow",
    section: "Run the pipelines on AWS",
    term: "PUSH", title: "Tag and push to ECR (Fig 11.9)",
    caption:
      "Tag llmtwin with the ECR URL and docker push it. Repeating these manual steps for every code change is tedious and error-prone — which the CD pipeline will automate.",
    diagram: (
      <Frame w={720} h={190}>
        <Code
          x={40}
          y={55}
          w={420}
          lines={[
            { t: "docker tag llmtwin ${ECR_URL}:latest", hi: true },
            { t: "docker push ${ECR_URL}:latest", hi: false },
          ]}
        />
        <BrandNode x={510} y={75} name="AWS ECR" w={170} />
      </Frame>
    ),
  },
  /* p458 — switch stack + config */
  {
    page: 458, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "Run the pipelines on AWS",
    term: "AWS STACK", title: "Switch stack, point to the image",
    caption:
      "Set the aws-stack, update each config’s docker.parent_image to the ECR URL (skip_build), export .env to ZenML secrets, and set the orchestrator asynchronous — then run the pipeline on AWS.",
    diagram: (
      <Frame w={720} h={200}>
        <Code
          x={40}
          y={50}
          w={440}
          lines={[
            { t: "zenml stack set aws-stack", hi: true },
            { t: "config.docker.parent_image = <ECR URL>", hi: false },
            { t: "poe export-settings-to-zenml", hi: false },
          ]}
        />
        <BrandNode x={520} y={80} name="ZenML" w={150} />
      </Frame>
    ),
  },
  /* p459 — run pipeline */
  {
    page: 459, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "Run the pipelines on AWS",
    term: "RUN", title: "end-to-end-data on the cloud (Fig 11.10)",
    caption:
      "poe run-end-to-end-data-pipeline runs all data-related pipelines in a single ZenML run on AWS; the dashboard visualizes the pipeline state in real time.",
    diagram: (
      <Frame w={720} h={180}>
        <Label x={140} y={55} size={11} font={MONO} color="#5E6B76">poe run-end-to-end-data-pipeline</Label>
        <PipelineGlyph x={250} y={75} w={220} h={70} accent={O} />
        <Label x={360} y={110} weight={700}>ZenML run (AWS)</Label>
        <BrandNode x={540} y={80} name="ZenML" sub="dashboard" w={150} />
        <Arrow x1={470} y1={110} x2={538} y2={110} accent={O} />
      </Frame>
    ),
  },
  /* p460 — step metadata */
  {
    page: 460, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "Run the pipelines on AWS",
    term: "STEP DETAILS", title: "Inspect runs in ZenML + SageMaker (Fig 11.11/11.12)",
    caption:
      "Clicking any step in ZenML reveals its code, metadata, and logs. For deeper detail, SageMaker’s Processing column lists the jobs that execute each ZenML pipeline step.",
    diagram: (
      <Frame w={720} h={190}>
        <BrandNode x={40} y={80} name="ZenML" sub="step metadata + logs" w={210} />
        <Label x={350} y={105} size={16} weight={700} color="#97A0A8">→</Label>
        <BrandNode x={420} y={80} name="AWS SageMaker" sub="processing jobs" w={230} />
      </Frame>
    ),
  },
  /* p461 — ResourceLimitExceeded */
  {
    page: 461, chapter: 11, stage: "operations", accent: O, archetype: "pitfall",
    section: "Troubleshooting the ResourceLimitExceeded error",
    term: "QUOTA ERROR", title: "Request EC2 quota for ml.t3.medium",
    caption:
      "A ResourceLimitExceeded error means your AWS account can’t access the default ml.t3.medium EC2 VMs. Fix it by requesting a quota increase in Service Quotas (free, a few clicks, up to ~1 day).",
    diagram: (
      <Frame w={720} h={190}>
        <Warn x={120} y={70} text="ResourceLimitExceeded" />
        <DecisionGlyph x={290} y={75} w={100} h={80} accent={O} mark="quota" />
        <BrandNode x={460} y={90} name="AWS SageMaker" sub="ml.t3.medium" w={200} />
        <Arrow x1={200} y1={110} x2={288} y2={115} accent={O} />
        <Arrow x1={390} y1={115} x2={458} y2={115} accent={O} />
      </Frame>
    ),
  },
  /* p462 — quotas */
  {
    page: 462, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "Troubleshooting the ResourceLimitExceeded error",
    term: "SERVICE QUOTAS", title: "Bump the quota above zero (Fig 11.13)",
    caption:
      "In Service Quotas → Amazon SageMaker → ml.t3.medium, if the applied quota is 0, request an increase. Approval is free but may take hours to a day.",
    diagram: (
      <Frame w={720} h={180}>
        <Pill x={40} y={85} text="quota = 0" accent={O} w={150} />
        <Arrow x1={200} y1={100} x2={300} y2={100} accent={O} />
        <DecisionGlyph x={300} y={60} w={90} h={80} accent={O} mark="request" />
        <Pill x={460} y={85} text="quota > 0 ✓" accent={O} w={170} />
        <Arrow x1={390} y1={100} x2={458} y2={100} accent={O} />
      </Frame>
    ),
  },
  /* p463 — adding LLMOps */
  {
    page: 463, chapter: 11, stage: "operations", accent: O, archetype: "architecture",
    section: "LLM Twin’s CI/CD pipeline flow",
    term: "ADD LLMOPS", title: "CI/CD + CT + monitoring",
    caption:
      "Adding LLMOps automates everything: a CI/CD pipeline (GitHub Actions) for code, a CT pipeline (ZenML) for data/training, and a prompt-monitoring pipeline (Opik) — supporting collaboration, saving time, reducing errors.",
    diagram: (
      <Frame w={740} h={200}>
        {[
          ["CI/CD", "GitHub Actions"],
          ["CT", "ZenML"],
          ["monitoring", "Opik"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 245} y={70} w={210} h={70} text={t as string} sub={sub as string} accent={O} strong={i === 0} />
        ))}
      </Frame>
    ),
  },
  /* p464 — Fig 11.14 CI/CD flow */
  {
    page: 464, chapter: 11, stage: "operations", accent: O, archetype: "architecture",
    section: "LLM Twin’s CI/CD pipeline flow",
    term: "CI/CD FLOW", title: "PR → CI → merge → CD (Fig 11.14)",
    caption:
      "On a PR, CI runs (formatting, linting, gitleaks, tests) before merge into staging/production. On merge, CD builds a new Docker image and pushes it to ECR for the next pipeline runs.",
    diagram: (
      <Frame w={760} h={210}>
        {["feature", "staging", "production"].map((t, i) => (
          <g key={t}>
            <LabelBox x={20 + i * 250} y={40} w={150} h={44} text={t} accent={O} strong={i === 2} />
            {i < 2 && <Arrow x1={170 + i * 250} y1={62} x2={268 + i * 250} y2={62} accent={O} animated={false} />}
            {i < 2 && <Label x={219 + i * 250} y={48} size={9.5} color={O}>PR · CI</Label>}
          </g>
        ))}
        <LabelBox x={250} y={130} w={250} h={50} text="CD → build Docker → ECR" accent={O} />
        <Arrow x1={250} y1={84} x2={300} y2={128} accent={O} animated={false} />
      </Frame>
    ),
  },
  /* p465 — formatting vs linting */
  {
    page: 465, chapter: 11, stage: "operations", accent: O, archetype: "comparison",
    section: "More on linting errors",
    term: "RUFF CHECKS", title: "Formatting vs linting (Ruff)",
    caption:
      "Formatting errors are stylistic (indentation, line length, spacing) — about readability. Linting errors are deeper issues (unused imports, undefined names, == vs is None) — about correctness. Ruff does both, fast (Rust).",
    diagram: (
      <Frame w={720} h={200}>
        <LabelBox x={40} y={70} w={250} h={70} text="formatting" sub="style · readability" accent={O} />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={70} w={260} h={70} text="linting" sub="potential bugs" accent={O} />
        <BrandNode x={280} y={155} name="Ruff" sub="does both" w={170} />
      </Frame>
    ),
  },
  /* p466 — GitHub Actions components */
  {
    page: 466, chapter: 11, stage: "operations", accent: O, archetype: "hierarchy",
    section: "Quick overview of GitHub Actions",
    term: "GH ACTIONS", title: "Workflows → jobs → steps",
    caption:
      "GitHub Actions automates workflows in YAML (.github/workflows). A workflow contains jobs (on a runner), jobs contain steps (actions or shell commands); actions are reusable; runners are the servers.",
    diagram: (
      <Frame w={740} h={210}>
        <LabelBox x={290} y={20} w={160} h={44} text="workflow" accent={O} strong />
        <LabelBox x={290} y={90} w={160} h={44} text="job" accent={O} />
        <LabelBox x={290} y={160} w={160} h={40} text="step" accent={O} />
        <BrandNode x={520} y={20} name="GitHub Actions" w={190} />
        <Arrow x1={370} y1={64} x2={370} y2={88} accent={O} animated={false} />
        <Arrow x1={370} y1={134} x2={370} y2={158} accent={O} animated={false} />
        <Pill x={60} y={95} text="runner (Linux/Win/mac)" accent={O} w={200} />
      </Frame>
    ),
  },
  /* p467 — CI pipeline */
  {
    page: 467, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "The CI pipeline",
    term: "CI PIPELINE", title: "A QA job and a test job",
    caption:
      "The CI pipeline has two jobs: QA (formatting + linting via Ruff, plus a gitleaks secret scan) and test (run the suite with Pytest). Both must pass for the PR to merge.",
    diagram: (
      <Frame w={720} h={200}>
        <LabelBox x={40} y={70} w={250} h={70} text="QA job" sub="Ruff + gitleaks" accent={O} strong />
        <LabelBox x={420} y={70} w={250} h={70} text="test job" sub="Pytest" accent={O} />
        <BrandNode x={60} y={155} name="Ruff" w={120} />
        <BrandNode x={440} y={155} name="Pytest" w={120} />
      </Frame>
    ),
  },
  /* p468 — CI YAML */
  {
    page: 468, chapter: 11, stage: "operations", accent: O, archetype: "code-anatomy",
    section: "GitHub Actions CI YAML file",
    term: "CI YAML", title: "Triggered on pull_request",
    caption:
      "ci.yaml triggers on pull_request, uses a concurrency group (cancel-in-progress) to avoid redundant runs, and defines the qa and test jobs — each on ubuntu-latest.",
    diagram: (
      <Frame w={720} h={190}>
        <Code
          x={40}
          y={45}
          w={460}
          lines={[
            { t: "name: CI", hi: false },
            { t: "on: pull_request", hi: true },
            { t: "concurrency: cancel-in-progress: true", hi: false },
            { t: "jobs: qa, test  # ubuntu-latest", hi: true },
          ]}
        />
      </Frame>
    ),
  },
  /* p469 — QA steps */
  {
    page: 469, chapter: 11, stage: "operations", accent: O, archetype: "pipeline-flow",
    section: "GitHub Actions CI YAML file",
    term: "QA STEPS", title: "gitleaks → lint → format",
    caption:
      "After checkout + Python + Poetry, the qa job runs gitleaks (secret scan), then lint-check and format-check (both Ruff). Fast static-analysis steps run first; slower tests after.",
    diagram: (
      <Frame w={740} h={190}>
        {["gitleaks", "lint", "format"].map((t, i) => (
          <g key={t}>
            <LabelBox x={40 + i * 220} y={75} w={170} h={56} text={t} accent={O} />
            {i < 2 && <Arrow x1={210 + i * 220} y1={103} x2={258 + i * 220} y2={103} accent={O} animated={i === 0} />}
          </g>
        ))}
        <BrandNode x={300} y={150} name="gitleaks" w={160} />
      </Frame>
    ),
  },
  /* p470 — test job */
  {
    page: 470, chapter: 11, stage: "operations", accent: O, archetype: "code-anatomy",
    section: "GitHub Actions CI YAML file",
    term: "TEST JOB", title: "Install all deps, run Pytest",
    caption:
      "The test job installs full dependencies (poetry install --without aws) and runs the suite with poetry poe test. If any QA or test step fails, the PR can’t be merged.",
    diagram: (
      <Frame w={720} h={190}>
        <Code
          x={40}
          y={50}
          w={420}
          lines={[
            { t: "poetry install --without aws", hi: false },
            { t: "poetry poe test", hi: true },
          ]}
        />
        <BrandNode x={510} y={75} name="Pytest" w={150} />
      </Frame>
    ),
  },
  /* p471 — CD pipeline */
  {
    page: 471, chapter: 11, stage: "operations", accent: O, archetype: "pipeline-flow",
    section: "The CD pipeline",
    term: "CD PIPELINE", title: "Setup → AWS login → build → push",
    caption:
      "On push to main, the CD pipeline (cd.yaml) automates the manual Docker steps: set up Docker, log in to AWS, build the image, and push it to ECR.",
    diagram: (
      <Frame w={740} h={190}>
        {["setup Docker", "AWS login", "build image", "push ECR"].map((t, i) => (
          <g key={t}>
            <LabelBox x={15 + i * 185} y={75} w={160} h={56} text={t} accent={O} strong={i === 3} />
            {i < 3 && <Arrow x1={175 + i * 185} y1={103} x2={198 + i * 185} y2={103} accent={O} animated={i === 0} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p472 — CD YAML creds */
  {
    page: 472, chapter: 11, stage: "operations", accent: O, archetype: "code-anatomy",
    section: "The CD pipeline",
    term: "CD YAML", title: "Configure AWS creds, login to ECR",
    caption:
      "cd.yaml triggers on push to main, sets up docker buildx, configures AWS credentials from repo secrets, and logs in to Amazon ECR before building.",
    diagram: (
      <Frame w={740} h={190}>
        <Code
          x={40}
          y={45}
          w={460}
          lines={[
            { t: "on: push: branches: [main]", hi: true },
            { t: "configure-aws-credentials (secrets)", hi: false },
            { t: "amazon-ecr-login", hi: true },
          ]}
        />
        <BrandNode x={520} y={75} name="AWS ECR" w={170} />
      </Frame>
    ),
  },
  /* p473 — CD build + tags */
  {
    page: 473, chapter: 11, stage: "operations", accent: O, archetype: "code-anatomy",
    section: "The CD pipeline",
    term: "CD BUILD", title: "Build + push with SHA and latest tags",
    caption:
      "build-push-action builds from the Dockerfile and pushes to ECR with two tags: the commit SHA (traceability) and latest (always-current image).",
    diagram: (
      <Frame w={740} h={190}>
        <BrandNode x={40} y={80} name="Docker" sub="buildx" w={150} />
        <BrandNode x={400} y={80} name="AWS ECR" w={150} />
        {["latest", "<sha>"].map((t, i) => (
          <Pill key={t} x={220} y={70 + i * 48} text={t} accent={O} w={120} />
        ))}
        <Arrow x1={190} y1={105} x2={398} y2={105} accent={O} />
      </Frame>
    ),
  },
  /* p474 — test CI/CD */
  {
    page: 474, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "Test out the CI/CD pipeline",
    term: "TEST CI/CD", title: "Fork, set secrets, open a PR",
    caption:
      "To test: fork the repo, then add four GitHub secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_ECR_NAME — repo name only). A PR triggers CI; merging triggers CD.",
    diagram: (
      <Frame w={720} h={190}>
        <BrandNode x={40} y={85} name="GitHub" sub="fork" w={150} />
        <DecisionGlyph x={290} y={70} w={90} h={80} accent={O} mark="PR" />
        <Pill x={450} y={70} text="CI runs" accent={O} w={150} />
        <Pill x={450} y={120} text="merge → CD" accent={O} w={170} />
        <Arrow x1={190} y1={110} x2={288} y2={110} accent={O} />
        <Arrow x1={380} y1={100} x2={448} y2={85} accent={O} animated={false} />
        <Arrow x1={380} y1={120} x2={448} y2={130} accent={O} animated={false} />
      </Frame>
    ),
  },
  /* p475 — secrets + CT intro */
  {
    page: 475, chapter: 11, stage: "operations", accent: O, archetype: "list-cluster",
    section: "The CT pipeline",
    term: "GH SECRETS", title: "Four repository secrets (Fig 11.18)",
    caption:
      "The CD pipeline reads four GitHub Actions secrets: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_ECR_NAME — stored securely and used only by the workflow.",
    diagram: (
      <Frame w={720} h={210}>
        {["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_ECR_NAME"].map((t, i) => (
          <Pill key={t} x={30 + (i % 2) * 350} y={60 + Math.floor(i / 2) * 60} text={t} accent={O} w={330} />
        ))}
      </Frame>
    ),
  },
  /* p476 — Fig 11.19 CT pipeline */
  {
    page: 476, chapter: 11, stage: "operations", accent: O, archetype: "architecture",
    section: "The CT pipeline",
    term: "CT PIPELINE", title: "Chain every pipeline (Fig 11.19)",
    caption:
      "Continuous training chains all pipelines: data collection → feature → instruct dataset → training → deploy → inference. The FTI architecture + using ZenML from day 0 made this automation natural.",
    diagram: (
      <Frame w={760} h={210}>
        {["data", "feature", "dataset", "training", "deploy", "inference"].map((t, i) => (
          <g key={t}>
            <PipelineGlyph x={10 + i * 125} y={75} w={108} h={62} accent={O} />
            <Label x={64 + i * 125} y={108} weight={600} size={11}>{t}</Label>
            {i < 5 && <Arrow x1={118 + i * 125} y1={106} x2={135 + i * 125} y2={106} accent={O} animated={i === 0} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p477 — initial triggers */
  {
    page: 477, chapter: 11, stage: "operations", accent: O, archetype: "list-cluster",
    section: "Initial triggers",
    term: "TRIGGERS", title: "Manual, REST API, scheduled",
    caption:
      "Three trigger types start the data collection pipeline: manual (CLI/dashboard — one action runs the whole system), REST API (HTTP, e.g. a watcher for new articles), and scheduled (cron, e.g. hourly). The LLM Twin uses manual.",
    diagram: (
      <Frame w={720} h={200}>
        {[
          ["manual", "CLI / dashboard"],
          ["REST API", "HTTP request"],
          ["scheduled", "cron"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 235} y={70} w={210} h={70} text={t as string} sub={sub as string} accent={O} strong={i === 0} />
        ))}
      </Frame>
    ),
  },
  /* p478 — master pipeline */
  {
    page: 478, chapter: 11, stage: "operations", accent: O, archetype: "code-anatomy",
    section: "Trigger downstream pipelines",
    term: "MASTER PIPELINE", title: "end_to_end_data chains them",
    caption:
      "A master end_to_end_data pipeline sequentially chains the others (each waits for the previous via wait_for): digital_data_etl → feature_engineering → generate_instruct_datasets → training → deploy.",
    diagram: (
      <Frame w={720} h={190}>
        <Code
          x={40}
          y={45}
          w={460}
          lines={[
            { t: "@pipeline def end_to_end_data(...):", hi: true },
            { t: "  digital_data_etl(...)", hi: false },
            { t: "  feature_engineering(wait_for=ids)", hi: true },
            { t: "  generate_instruct_datasets(); training()", hi: false },
          ]}
        />
      </Frame>
    ),
  },
  /* p479 — Fig 11.20 monolith pipeline pitfall */
  {
    page: 479, chapter: 11, stage: "operations", accent: O, archetype: "pitfall",
    section: "Trigger downstream pipelines",
    term: "ANTI-PATTERN", title: "One mega-pipeline is harder to debug (Fig 11.20)",
    caption:
      "Compressing all steps into a single pipeline (done here to fit ZenML’s 3-pipeline free-trial cap) is an anti-pattern — usually you keep each pipeline isolated and use triggers, which is easier to understand, debug, and monitor.",
    diagram: (
      <Frame w={720} h={190}>
        <Boundary x={40} y={50} w={640} h={90} title="one mega-pipeline" accent={O} danger />
        {["data", "feature", "dataset", "train", "deploy"].map((t, i) => (
          <Pill key={t} x={60 + i * 125} y={80} text={t} accent={O} w={110} />
        ))}
        <Warn x={300} y={165} text="harder to debug + monitor" />
      </Frame>
    ),
  },
  /* p480 — independent triggers */
  {
    page: 480, chapter: 11, stage: "operations", accent: O, archetype: "pipeline-flow",
    section: "Prompt monitoring",
    term: "INDEPENDENT", title: "Pipelines triggering pipelines",
    caption:
      "With a self-hosted/licensed ZenML, each pipeline runs independently and triggers the next: digital_data_etl calls trigger_pipeline('feature_engineering') — cleaner isolation than one monolith.",
    diagram: (
      <Frame w={720} h={190}>
        <LabelBox x={40} y={80} w={200} h={56} text="digital_data_etl" accent={O} />
        <DecisionGlyph x={300} y={65} w={90} h={80} accent={O} mark="trigger" />
        <LabelBox x={460} y={80} w={210} h={56} text="feature_engineering" accent={O} strong />
        <Arrow x1={240} y1={108} x2={298} y2={105} accent={O} />
        <Arrow x1={390} y1={105} x2={458} y2={108} accent={O} />
      </Frame>
    ),
  },
  /* p481 — Opik @track */
  {
    page: 481, chapter: 11, stage: "operations", accent: O, archetype: "code-anatomy",
    section: "Prompt monitoring",
    term: "OPIK @track", title: "Decorate each step into one trace",
    caption:
      "Opik’s @track decorator logs the input/output of each function (preprocess, generate, postprocess) and aggregates them into one trace for the llm_chain — giving full visibility for debugging.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={40}
          y={45}
          w={460}
          lines={[
            { t: "@track def preprocess_input(text): ...", hi: false },
            { t: "@track def generate_response(prompt): ...", hi: true },
            { t: "@track def postprocess_output(resp): ...", hi: false },
            { t: "@track(name='llm_chain') def llm_chain(...)", hi: true },
          ]}
        />
        <BrandNode x={520} y={75} name="Opik" w={150} />
      </Frame>
    ),
  },
  /* p482 — trace metadata */
  {
    page: 482, chapter: 11, stage: "operations", accent: O, archetype: "code-anatomy",
    section: "Prompt monitoring",
    term: "METADATA", title: "Tag the trace, add scores",
    caption:
      "opik_context.update_current_trace attaches tags, metadata (e.g. num_tokens), and feedback_scores (user feedback, LLM-judge score) to the trace for richer monitoring.",
    diagram: (
      <Frame w={720} h={190}>
        <Code
          x={40}
          y={45}
          w={440}
          lines={[
            { t: "opik_context.update_current_trace(", hi: true },
            { t: '  tags=["inference_pipeline"],', hi: false },
            { t: "  metadata={num_tokens},", hi: false },
            { t: "  feedback_scores=[...])", hi: true },
          ]}
        />
        <SnapshotGlyph x={510} y={75} w={170} h={56} accent={O} title="rich trace" usedFor="" />
      </Frame>
    ),
  },
  /* p483 — Fig 11.21 monitor in business microservice */
  {
    page: 483, chapter: 11, stage: "operations", accent: O, archetype: "architecture",
    section: "Prompt monitoring",
    term: "WHERE", title: "Monitor in the business microservice (Fig 11.21)",
    caption:
      "Since the LLM microservice has a narrow scope, the business microservice (the FastAPI server from Chapter 10) coordinates the end-to-end flow — the right place to add Opik monitoring.",
    diagram: (
      <Frame w={740} h={200}>
        <Boundary x={30} y={40} w={340} h={130} title="business microservice (FastAPI)" accent={O} />
        <BrandNode x={50} y={85} name="Opik" sub="monitor" w={150} />
        <Boundary x={420} y={40} w={290} h={130} title="LLM microservice" accent={O} />
        <ModelGlyph x={470} y={70} w={90} h={70} accent={O} />
        <Arrow x1={370} y1={105} x2={418} y2={105} accent={O} />
      </Frame>
    ),
  },
  /* p484 — Opik in LLM Twin */
  {
    page: 484, chapter: 11, stage: "operations", accent: O, archetype: "code-anatomy",
    section: "Prompt monitoring",
    term: "rag() @track", title: "Track rag() and call_llm_service()",
    caption:
      "Decorating rag() (the entry point) and call_llm_service() captures the full request trace and the exact prompt/response — the modular code makes end-to-end logging trivial.",
    diagram: (
      <Frame w={720} h={190}>
        <Code
          x={40}
          y={45}
          w={440}
          lines={[
            { t: "@track def call_llm_service(query, ctx):", hi: true },
            { t: "@track def rag(query):", hi: true },
            { t: "  documents = retriever.search(query)", hi: false },
            { t: "  return call_llm_service(query, context)", hi: false },
          ]}
        />
        <BrandNode x={510} y={75} name="Opik" w={150} />
      </Frame>
    ),
  },
  /* p485 — granularity */
  {
    page: 485, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "Prompt monitoring",
    term: "GRANULARITY", title: "Trace critical functions, find the balance",
    caption:
      "You can add more granularity by decorating search() or the self-query generate(). But over-monitoring adds noise — a good rule of thumb is to trace the critical functions (rag, call_llm_service) and deepen only when needed.",
    diagram: (
      <Frame w={720} h={200}>
        <LabelBox x={40} y={80} w={250} h={56} text="critical: rag, call_llm" accent={O} strong />
        <Label x={320} y={105} size={16} weight={700} color="#97A0A8">↔</Label>
        <LabelBox x={400} y={80} w={280} h={56} text="everything → noise" accent={O} />
        <Warn x={430} y={160} text="too much monitoring hides signal" />
      </Frame>
    ),
  },
  /* p486 — three to monitor */
  {
    page: 486, chapter: 11, stage: "operations", accent: O, archetype: "list-cluster",
    section: "Alerting",
    term: "MONITOR THREE", title: "Model config, tokens, step duration",
    caption:
      "Constantly monitor three things: model configuration (model IDs, temperature), total number of tokens (drives cost; a sudden rise signals a bug), and the duration of each step (to find bottlenecks).",
    diagram: (
      <Frame w={720} h={200}>
        {[
          ["model config", "ids · temperature"],
          ["total tokens", "→ cost"],
          ["step duration", "→ bottlenecks"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 235} y={70} w={210} h={70} text={t as string} sub={sub as string} accent={O} />
        ))}
      </Frame>
    ),
  },
  /* p487 — alerting */
  {
    page: 487, chapter: 11, stage: "operations", accent: O, archetype: "single-concept",
    section: "Summary",
    term: "ALERTING", title: "ZenML alerter → Slack/Discord/email",
    caption:
      "ZenML makes alerting easy: add on_failure/on_success callbacks to a pipeline, get the alerter from the active stack, and post a message to Slack, Discord, or email when a run fails or finishes.",
    diagram: (
      <Frame w={720} h={200}>
        <PipelineGlyph x={40} y={75} w={180} h={70} accent={O} />
        <Label x={130} y={115} weight={700}>pipeline</Label>
        <BrandNode x={290} y={85} name="ZenML" sub="alerter" w={150} />
        {["Slack", "Discord", "email"].map((t, i) => (
          <Pill key={t} x={500} y={50 + i * 48} text={t} accent={O} w={150} />
        ))}
        <Arrow x1={220} y1={110} x2={288} y2={110} accent={O} />
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={440} y1={110} x2={498} y2={65 + i * 48} accent={O} animated={i === 0} />
        ))}
      </Frame>
    ),
  },
];
