// Chapter 10 — Inference Pipeline Deployment (pp. 384–428). Deployment-type
// criteria, the three inference architectures, monolith vs microservices, the
// LLM Twin microservice split (SageMaker LLM + FastAPI business), the SageMaker
// deployment code, and autoscaling. Stage = Inference (coral). Figures 10.1–10.8
// redrawn. pp.429 is References, skipped.
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

const I = STAGES.inference.accent; // coral
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
        <text key={i} x={x + 14} y={y + 16 + i * lh} fontFamily={MONO} fontSize={size} fill={l.hi ? I : "#25313C"} fontWeight={l.hi ? 700 : 500}>
          {l.t}
        </text>
      ))}
    </g>
  );
};

export const CHAPTER10: PageDiagram[] = [
  /* p384 */
  {
    page: 384, chapter: 10, stage: "inference", accent: I, archetype: "single-concept",
    section: "Chapter 10: Inference Pipeline Deployment",
    term: "DEPLOYMENT", title: "Where the model meets users",
    caption:
      "Deployment is where the model adds business value — but LLMs need expensive compute and fresh features. A good deployment strategy balances latency, throughput, and cost, applying inference optimizations and MLOps best practices.",
    diagram: (
      <Frame w={720} h={200}>
        <ModelGlyph x={40} y={60} w={120} h={100} accent={I} />
        <Label x={100} y={175} size={11}>fine-tuned LLM</Label>
        <PipelineGlyph x={250} y={75} w={180} h={70} accent={I} />
        <Label x={340} y={113} weight={700}>deployment</Label>
        <UserGlyph x={520} y={70} w={90} h={90} accent={I} />
        <Label x={565} y={175} size={11}>users</Label>
        <Arrow x1={160} y1={110} x2={248} y2={110} accent={I} />
        <Arrow x1={430} y1={110} x2={518} y2={110} accent={I} />
      </Frame>
    ),
  },
  /* p385 — 4 requirements */
  {
    page: 385, chapter: 10, stage: "inference", accent: I, archetype: "list-cluster",
    section: "Throughput and latency",
    term: "FOUR PILLARS", title: "Throughput, latency, data, infrastructure",
    caption:
      "Every ML deployment trades off four requirements: throughput (requests/sec), latency (time per request), data (format, volume), and infrastructure (hardware, networking). They interact and shape the user experience.",
    diagram: (
      <Frame w={720} h={210}>
        {["throughput", "latency", "data", "infrastructure"].map((t, i) => (
          <LabelBox key={t} x={20 + i * 175} y={70} w={155} h={70} text={t} accent={I} strong={i < 2} />
        ))}
      </Frame>
    ),
  },
  /* p386 — throughput vs latency */
  {
    page: 386, chapter: 10, stage: "inference", accent: I, archetype: "formula-as-blocks",
    section: "Data",
    term: "TRADEOFF", title: "Latency and throughput interact",
    caption:
      "Without batching, lower latency = higher throughput (100ms → 10 RPS, 10ms → 100 RPS). With batching it flips: 20 requests in 100ms = 200 RPS — higher latency can mean higher throughput.",
    diagram: (
      <Frame w={740} h={200}>
        <LabelBox x={40} y={70} w={280} h={70} text="no batching" sub="↓ latency → ↑ throughput" accent={I} />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={70} w={280} h={70} text="batching" sub="↑ latency → ↑ throughput" accent={I} strong />
      </Frame>
    ),
  },
  /* p387 — infra cost tradeoff */
  {
    page: 387, chapter: 10, stage: "inference", accent: I, archetype: "single-concept",
    section: "Data",
    term: "INFRA + COST", title: "Low latency can waste capacity",
    caption:
      "High throughput needs scalable, distributed GPU infra; low latency needs fast hardware. Optimizing for low latency while batching often under-utilizes hardware (idle compute) — raising per-request cost.",
    diagram: (
      <Frame w={720} h={200}>
        <LabelBox x={40} y={70} w={230} h={70} text="low latency" sub="fast hw, may idle" accent={I} />
        <Label x={320} y={105} size={16} weight={700} color="#97A0A8">↔</Label>
        <LabelBox x={400} y={70} w={230} h={70} text="high throughput" sub="scalable, distributed" accent={I} />
        <Warn x={120} y={170} text="idle compute → higher cost/request" />
      </Frame>
    ),
  },
  /* p388 — questions */
  {
    page: 388, chapter: 10, stage: "inference", accent: I, archetype: "list-cluster",
    section: "Understanding inference deployment types",
    term: "ASK FIRST", title: "Questions before choosing a deployment",
    caption:
      "Before picking a deployment type, ask: how does the user interact (chatbot vs hidden classifier)? How fresh must predictions be? What is the traffic pattern — steady or spiky?",
    diagram: (
      <Frame w={720} h={210}>
        <DecisionGlyph x={300} y={70} w={110} h={100} accent={I} mark="?" />
        {["interaction style", "prediction freshness", "traffic pattern"].map((t, i) => {
          const pos = [[30, 40], [490, 40], [260, 165]][i];
          return (
            <g key={t}>
              <Pill x={pos[0]} y={pos[1]} text={t} accent={I} w={200} />
              <line x1={355} y1={120} x2={pos[0] + 100} y2={pos[1] + 15} stroke="#ECE8DF" strokeWidth={1.4} />
            </g>
          );
        })}
      </Frame>
    ),
  },
  /* p389 — Fig 10.1 three types */
  {
    page: 389, chapter: 10, stage: "inference", accent: I, archetype: "comparison",
    section: "Online real-time inference",
    term: "THREE TYPES", title: "Real-time, async, batch (Fig 10.1)",
    caption:
      "Three deployment architectures: online real-time (synchronous HTTP, client waits), asynchronous (queued, client polls or is notified), and offline batch transform (pull from storage, process in bulk, store results).",
    diagram: (
      <Frame w={740} h={220}>
        {[
          ["online real-time", "sync · client waits"],
          ["asynchronous", "queue · poll/notify"],
          ["offline batch", "storage → bulk → storage"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 245} y={70} w={210} h={80} text={t as string} sub={sub as string} accent={I} strong={i === 0} />
        ))}
      </Frame>
    ),
  },
  /* p390 — real-time REST vs gRPC */
  {
    page: 390, chapter: 10, stage: "inference", accent: I, archetype: "comparison",
    section: "Asynchronous inference",
    term: "REAL-TIME", title: "REST vs gRPC, synchronously",
    caption:
      "Online real-time uses a server over HTTP — REST (JSON, accessible but slower, public) or gRPC (protobuf, faster but rigid, internal). The client sends a request and waits for the result in the same response.",
    diagram: (
      <Frame w={740} h={210}>
        <UserGlyph x={40} y={70} w={80} h={80} accent={I} />
        <LabelBox x={250} y={45} w={230} h={48} text="REST" sub="JSON · accessible · public" accent={I} />
        <LabelBox x={250} y={120} w={230} h={48} text="gRPC" sub="protobuf · fast · internal" accent={I} />
        <ModelGlyph x={560} y={70} w={100} h={90} accent={I} />
        <Label x={610} y={170} size={11}>ML service</Label>
        <Arrow x1={120} y1={100} x2={248} y2={70} accent={I} />
        <Arrow x1={480} y1={70} x2={558} y2={100} accent={I} />
        <Arrow x1={560} y1={130} x2={130} y2={130} accent={I} animated={false} />
      </Frame>
    ),
  },
  /* p391 — async */
  {
    page: 391, chapter: 10, stage: "inference", accent: I, archetype: "architecture",
    section: "Offline batch transform",
    term: "ASYNCHRONOUS", title: "Queue requests, poll or notify",
    caption:
      "Asynchronous inference queues requests; the ML service processes them at its own rhythm (a fixed number of machines), so it absorbs traffic spikes without timeouts. The client polls or is notified when results are ready.",
    diagram: (
      <Frame w={740} h={210}>
        <UserGlyph x={30} y={70} w={80} h={80} accent={I} />
        <DataStoreGlyph x={180} y={70} w={90} h={80} accent={I} />
        <Label x={225} y={163} size={11}>queue</Label>
        <ModelGlyph x={340} y={70} w={100} h={80} accent={I} />
        <Label x={390} y={163} size={11}>ML service</Label>
        <SnapshotGlyph x={520} y={85} w={190} h={56} accent={I} title="results" usedFor="poll / notify" />
        <Arrow x1={110} y1={110} x2={178} y2={110} accent={I} />
        <Arrow x1={270} y1={110} x2={338} y2={110} accent={I} />
        <Arrow x1={440} y1={110} x2={518} y2={110} accent={I} />
      </Frame>
    ),
  },
  /* p392 — batch transform */
  {
    page: 392, chapter: 10, stage: "inference", accent: I, archetype: "architecture",
    section: "Monolithic versus microservices architecture in model serving",
    term: "BATCH TRANSFORM", title: "Storage → bulk process → storage",
    caption:
      "Batch transform pulls data from storage (S3, BigQuery), processes it in one big high-throughput operation, and writes results back. The client reads results from storage later — cheapest, but always delayed.",
    diagram: (
      <Frame w={740} h={200}>
        <DataStoreGlyph x={30} y={60} w={100} h={90} accent={I} />
        <Label x={80} y={163} size={11}>data storage</Label>
        <ModelGlyph x={230} y={70} w={100} h={80} accent={I} />
        <DataStoreGlyph x={420} y={60} w={100} h={90} accent={I} />
        <Label x={470} y={163} size={11}>results storage</Label>
        <UserGlyph x={600} y={70} w={80} h={80} accent={I} />
        <Arrow x1={130} y1={105} x2={228} y2={110} accent={I} />
        <Arrow x1={330} y1={110} x2={418} y2={105} accent={I} />
        <Arrow x1={520} y1={105} x2={598} y2={110} accent={I} animated={false} />
      </Frame>
    ),
  },
  /* p393 — Fig 10.2 monolith vs microservices */
  {
    page: 393, chapter: 10, stage: "inference", accent: I, archetype: "comparison",
    section: "Monolithic versus microservices architecture in model serving",
    term: "MONOLITH vs MICRO", title: "One service or many (Fig 10.2)",
    caption:
      "The ML service can be monolithic (LLM + business logic bundled) or microservices (LLM service and business logic split, communicating over REST/gRPC). This shapes how it’s implemented, maintained, and scaled.",
    diagram: (
      <Frame w={740} h={220}>
        <Boundary x={30} y={40} w={300} h={140} title="monolith" accent={I} />
        <LabelBox x={70} y={85} w={220} h={56} text="LLM + business logic" accent={I} strong />
        <Boundary x={400} y={40} w={310} h={140} title="microservices" accent={I} />
        <LabelBox x={420} y={70} w={130} h={44} text="LLM service" accent={I} />
        <LabelBox x={420} y={125} w={130} h={44} text="business" accent={I} />
        <Arrow x1={485} y1={114} x2={485} y2={123} accent={I} animated={false} />
      </Frame>
    ),
  },
  /* p394 — monolith pitfall */
  {
    page: 394, chapter: 10, stage: "inference", accent: I, archetype: "pitfall",
    section: "Microservices architecture",
    term: "MONOLITH", title: "Can’t scale GPU and CPU apart",
    caption:
      "A monolith is simple to start but can’t scale components independently: the LLM needs GPU, the business logic is CPU/I/O-bound, so the GPU sits idle during business logic and vice versa — wasting money and locking the tech stack.",
    diagram: (
      <Frame w={720} h={200}>
        <Boundary x={40} y={50} w={360} h={110} title="one service" accent={I} danger />
        <LabelBox x={70} y={85} w={140} h={48} text="LLM (GPU)" accent={I} />
        <LabelBox x={230} y={85} w={150} h={48} text="business (CPU)" accent={I} />
        <Warn x={460} y={75} text="GPU idle during CPU work" />
        <Warn x={460} y={125} text="shared tech stack" />
      </Frame>
    ),
  },
  /* p395 — Fig 10.3 microservices scale */
  {
    page: 395, chapter: 10, stage: "inference", accent: I, archetype: "architecture",
    section: "Microservices architecture",
    term: "INDEPENDENT SCALE", title: "Scale each service on its own hardware (Fig 10.3)",
    caption:
      "Microservices scale independently: the GPU-hungry LLM service scales horizontally on expensive GPU machines, while the business logic runs on cheap CPU machines — optimizing resource use and cost.",
    diagram: (
      <Frame w={740} h={210}>
        <Boundary x={30} y={40} w={300} h={150} title="LLM service (GPU)" accent={I} />
        {[0, 1, 2].map((i) => (
          <ModelGlyph key={i} x={50 + i * 90} y={75} w={70} h={60} accent={I} />
        ))}
        <Label x={180} y={165} size={10.5} color="#5E6B76">scale ×N on GPUs</Label>
        <Boundary x={400} y={40} w={310} h={150} title="business (CPU)" accent={I} />
        <LabelBox x={470} y={90} w={170} h={50} text="REST API" accent={I} />
        <Arrow x1={330} y1={110} x2={400} y2={110} accent={I} />
      </Frame>
    ),
  },
  /* p396 — choosing */
  {
    page: 396, chapter: 10, stage: "inference", accent: I, archetype: "comparison",
    section: "Choosing between monolithic and microservices architectures",
    term: "CHOOSING", title: "Start monolith, design for the split",
    caption:
      "Monolith suits small teams/simple apps; microservices suit large systems with differing scaling needs (GPU-heavy LLMs). A common path: start monolithic but keep modules decoupled (separate Python modules/packages) so the split is cheap later.",
    diagram: (
      <Frame w={740} h={200}>
        <LabelBox x={40} y={70} w={260} h={70} text="monolith" sub="simple · small teams" accent={I} />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">→</Label>
        <LabelBox x={420} y={70} w={280} h={70} text="microservices" sub="scalable · complex" accent={I} strong />
        <Label x={370} y={175} size={11} color="#5E6B76">design modular to migrate cheaply</Label>
      </Frame>
    ),
  },
  /* p397 — LLM Twin strategy */
  {
    page: 397, chapter: 10, stage: "inference", accent: I, archetype: "architecture",
    section: "Exploring the LLM Twin’s inference pipeline deployment strategy",
    term: "STRATEGY", title: "Online real-time + microservices",
    caption:
      "The LLM Twin uses online real-time (low-latency chatbot) with a microservice split: a FastAPI REST API holds the business + RAG logic, and a separate LLM microservice runs the model — so the GPU box can be upgraded (A10G → A100) without touching the API.",
    diagram: (
      <Frame w={740} h={210}>
        <UserGlyph x={30} y={70} w={80} h={80} accent={I} />
        <BrandNode x={170} y={85} name="FastAPI" sub="business + RAG" w={190} />
        <ModelGlyph x={440} y={65} w={100} h={90} accent={I} />
        <Label x={490} y={165} size={11}>LLM microservice</Label>
        <BrandNode x={580} y={85} name="AWS SageMaker" w={130} />
        <Arrow x1={110} y1={110} x2={168} y2={110} accent={I} />
        <Arrow x1={360} y1={110} x2={438} y2={110} accent={I} />
        <Arrow x1={540} y1={110} x2={578} y2={110} accent={I} animated={false} />
      </Frame>
    ),
  },
  /* p398 — Fig 10.4 deployment architecture */
  {
    page: 398, chapter: 10, stage: "inference", accent: I, archetype: "architecture",
    section: "Exploring the LLM Twin’s inference pipeline deployment strategy",
    term: "DEPLOY ARCH", title: "Business microservice ⇄ LLM microservice (Fig 10.4)",
    caption:
      "The business microservice runs the RAG retrieval + augmentation, calls the LLM microservice (SageMaker) for generation, and sends the prompt trace to the prompt-monitoring pipeline (Comet, Chapter 11).",
    diagram: (
      <Frame w={760} h={230}>
        <Boundary x={20} y={40} w={360} h={170} title="business microservice (FastAPI)" accent={I} />
        <UserGlyph x={36} y={90} w={60} h={60} accent={I} />
        <VectorDBGlyph x={140} y={70} w={70} h={70} accent={I} />
        <LabelBox x={240} y={90} w={120} h={50} text="prompt" accent={I} />
        <Boundary x={420} y={40} w={200} h={120} title="LLM microservice" accent={I} />
        <ModelGlyph x={460} y={70} w={110} h={80} accent={I} />
        <BrandNode x={650} y={50} name="AWS SageMaker" w={100} />
        <BrandNode x={420} y={175} name="Comet" sub="prompt monitoring" w={200} />
        <Arrow x1={360} y1={110} x2={418} y2={110} accent={I} />
        <Arrow x1={520} y1={160} x2={520} y2={172} accent={I} animated={false} />
      </Frame>
    ),
  },
  /* p399 — FTI interface */
  {
    page: 399, chapter: 10, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "Exploring the LLM Twin’s inference pipeline deployment strategy",
    term: "FTI INTERFACE", title: "Features from Qdrant, model from registry",
    caption:
      "Per the FTI architecture, the inference pipeline needs two inputs: real-time RAG features from the Qdrant online store, and the fine-tuned LLM pulled from the model registry. The flow: query → retrieve → prompt → LLM → monitor → answer.",
    diagram: (
      <Frame w={740} h={210}>
        <BrandNode x={20} y={50} name="Qdrant" sub="features" w={160} />
        <BrandNode x={20} y={120} name="Hugging Face" sub="model registry" w={180} />
        <PipelineGlyph x={260} y={75} w={200} h={80} accent={I} />
        <Label x={360} y={115} weight={700}>inference pipeline</Label>
        <LabelBox x={540} y={90} w={150} h={50} text="answer" accent={I} strong />
        <Arrow x1={180} y1={80} x2={258} y2={100} accent={I} animated={false} />
        <Arrow x1={200} y1={150} x2={258} y2={130} accent={I} animated={false} />
        <Arrow x1={460} y1={115} x2={538} y2={115} accent={I} />
      </Frame>
    ),
  },
  /* p400 — SageMaker components */
  {
    page: 400, chapter: 10, stage: "inference", accent: I, archetype: "list-cluster",
    section: "The training versus the inference pipeline",
    term: "SAGEMAKER", title: "Endpoint, model, config, component",
    caption:
      "A SageMaker deployment has four parts: endpoint (the API), model (trained artifact), endpoint configuration (hardware/instances), and inference component (connects model + config to the endpoint).",
    diagram: (
      <Frame w={740} h={200}>
        {["endpoint", "model", "config", "inference component"].map((t, i) => (
          <LabelBox key={t} x={20 + i * 180} y={70} w={160} h={70} text={t} accent={I} strong={i === 0} />
        ))}
      </Frame>
    ),
  },
  /* p401 — training vs inference */
  {
    page: 401, chapter: 10, stage: "inference", accent: I, archetype: "comparison",
    section: "Deploying the LLM Twin service",
    term: "TRAIN vs INFER", title: "Different data, output, infrastructure",
    caption:
      "Training reads batched offline data (ZenML artifacts), outputs weights to the registry, needs many GPUs. Inference reads a low-latency online DB (Qdrant), outputs predictions to users, needs less compute. Shared preprocessing avoids training-serving skew.",
    diagram: (
      <Frame w={740} h={220}>
        <LabelBox x={30} y={40} w={300} h={44} text="training" accent={I} />
        {["offline batch data", "→ model weights", "many GPUs"].map((t, i) => (
          <Pill key={t} x={40} y={95 + i * 40} text={t} accent={I} w={250} />
        ))}
        <Label x={370} y={120} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={40} w={300} h={44} text="inference" accent={I} strong />
        {["online low-latency DB", "→ predictions", "less compute"].map((t, i) => (
          <Pill key={t} x={430} y={95 + i * 40} text={t} accent={I} w={270} />
        ))}
      </Frame>
    ),
  },
  /* p402 — HF DLC */
  {
    page: 402, chapter: 10, stage: "inference", accent: I, archetype: "single-concept",
    section: "What are Hugging Face’s DLCs?",
    term: "HF DLC", title: "A Docker image powered by TGI",
    caption:
      "Hugging Face Deep Learning Containers (DLCs) are Docker images pre-loaded with transformers/datasets/tokenizers and a serving stack powered by TGI — so deploying an LLM needs no complex environment setup.",
    diagram: (
      <Frame w={720} h={200}>
        <BrandNode x={40} y={85} name="Docker" sub="HF DLC image" w={180} />
        <BrandNode x={290} y={85} name="TGI" sub="serving engine" w={170} />
        <ModelGlyph x={520} y={65} w={100} h={90} accent={I} />
        <Label x={570} y={165} size={11}>LLM served</Label>
        <Arrow x1={220} y1={110} x2={288} y2={110} accent={I} />
        <Arrow x1={460} y1={110} x2={518} y2={110} accent={I} />
      </Frame>
    ),
  },
  /* p403 — DLC features */
  {
    page: 403, chapter: 10, stage: "inference", accent: I, archetype: "list-cluster",
    section: "Configuring SageMaker roles",
    term: "DLC FEATURES", title: "What the DLC gives you",
    caption:
      "The DLC/TGI stack ships tensor parallelism, flash-attention-optimized transformers, bitsandbytes quantization, continuous batching, safetensors fast loading, and token streaming over Server-Sent Events.",
    diagram: (
      <Frame w={740} h={210}>
        {["tensor parallelism", "flash-attention", "bitsandbytes quant", "continuous batching", "safetensors", "token streaming"].map((t, i) => (
          <Pill key={t} x={30 + (i % 3) * 240} y={60 + Math.floor(i / 3) * 60} text={t} accent={I} w={220} />
        ))}
      </Frame>
    ),
  },
  /* p404 — IAM roles */
  {
    page: 404, chapter: 10, stage: "inference", accent: I, archetype: "single-concept",
    section: "Deploying the LLM Twin model to AWS SageMaker",
    term: "IAM", title: "A narrow user + an execution role",
    caption:
      "Two IAM principals: a narrow IAM user (create/delete only SageMaker, ECR, S3) and an execution role attached to SageMaker so it can reach S3, CloudWatch, and ECR on your behalf. Both go into the .env file.",
    diagram: (
      <Frame w={740} h={210}>
        <UserGlyph x={30} y={70} w={80} h={80} accent={I} />
        <Label x={70} y={163} size={11}>IAM user</Label>
        <BrandNode x={170} y={85} name="AWS SageMaker" w={180} />
        <LabelBox x={400} y={45} w={170} h={46} text="execution role" accent={I} strong />
        {["AWS S3", "AWS ECR", "AWS CloudWatch"].map((t, i) => (
          <BrandNode key={t} x={600} y={30 + i * 56} name={t} w={130} />
        ))}
        <Arrow x1={110} y1={110} x2={168} y2={110} accent={I} />
        <Arrow x1={350} y1={100} x2={398} y2={70} accent={I} animated={false} />
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={570} y1={68} x2={598} y2={53 + i * 56} accent={I} animated={false} />
        ))}
      </Frame>
    ),
  },
  /* p405 — Fig 10.5 deploy steps */
  {
    page: 405, chapter: 10, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "Deploying the LLM Twin model to AWS SageMaker",
    term: "DEPLOY STEPS", title: "IAMs → instances → deploy endpoint (Fig 10.5)",
    caption:
      "Deployment is fully automated by poe deploy-inference-endpoint: create the IAMs, instantiate ResourceManager + DeploymentService, inject resources into the strategy, and deploy the SageMaker inference endpoint (LLM via HTTP API).",
    diagram: (
      <Frame w={740} h={200}>
        {["create IAMs", "create instances", "inject resources", "deploy endpoint"].map((t, i) => (
          <g key={t}>
            <LabelBox x={15 + i * 185} y={70} w={160} h={60} text={`${i + 1}. ${t}`} accent={I} strong={i === 3} />
            {i < 3 && <Arrow x1={175 + i * 185} y1={100} x2={198 + i * 185} y2={100} accent={I} animated={i === 0} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p406 — create_endpoint */
  {
    page: 406, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Deploying the LLM Twin model to AWS SageMaker",
    term: "create_endpoint", title: "DLC image + manager + service + strategy",
    caption:
      "create_endpoint fetches the latest HF DLC image, builds a ResourceManager and DeploymentService, and hands them to SagemakerHuggingfaceStrategy.deploy with the role, image, config, and GPU instance type.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={460}
          lines={[
            { t: "llm_image = get_huggingface_llm_image_uri()", hi: false },
            { t: "ResourceManager() + DeploymentService()", hi: false },
            { t: "SagemakerHuggingfaceStrategy(svc).deploy(", hi: true },
            { t: "  role_arn, llm_image, config, ...)", hi: false },
          ]}
        />
        <BrandNode x={510} y={75} name="AWS SageMaker" w={170} />
      </Frame>
    ),
  },
  /* p407 — ResourceManager */
  {
    page: 407, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Deploying the LLM Twin model to AWS SageMaker",
    term: "ResourceManager", title: "Check what already exists (boto3)",
    caption:
      "ResourceManager wraps a boto3 SageMaker client with endpoint_config_exists and endpoint_exists checks — so deployment can skip redundant work if the configuration or endpoint is already in place.",
    diagram: (
      <Frame w={720} h={200}>
        <Code
          x={30}
          y={45}
          w={400}
          lines={[
            { t: "boto3.client('sagemaker', ...)", hi: true },
            { t: "endpoint_config_exists(name) -> bool", hi: false },
            { t: "endpoint_exists(name) -> bool", hi: false },
          ]}
        />
        <DecisionGlyph x={500} y={70} w={100} h={90} accent={I} mark="exists?" />
      </Frame>
    ),
  },
  /* p408 — DeploymentService.deploy */
  {
    page: 408, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Deploying the LLM Twin model to AWS SageMaker",
    term: "DeploymentService", title: "deploy() orchestrates the rollout",
    caption:
      "DeploymentService holds a boto3 client + ResourceManager. Its deploy() checks whether the endpoint config exists; if not, it calls prepare_and_deploy_model, wrapping the whole rollout in error handling.",
    diagram: (
      <Frame w={720} h={200}>
        <Code
          x={30}
          y={45}
          w={420}
          lines={[
            { t: "def deploy(...):", hi: true },
            { t: "  if config_exists: use it", hi: false },
            { t: "  else: prepare_and_deploy_model(...)", hi: true },
            { t: "  except: log + raise", hi: false },
          ]}
        />
        <DecisionGlyph x={500} y={70} w={100} h={90} accent={I} mark="↳" />
      </Frame>
    ),
  },
  /* p409 — deploy flow */
  {
    page: 409, chapter: 10, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "Deploying the LLM Twin model to AWS SageMaker",
    term: "DEPLOY FLOW", title: "Check config, then prepare + deploy",
    caption:
      "deploy() avoids redundant redeployment by checking the endpoint configuration first; only when it’s missing does it invoke prepare_and_deploy_model to actually push the model to the endpoint.",
    diagram: (
      <Frame w={740} h={190}>
        <LabelBox x={30} y={75} w={150} h={56} text="deploy()" accent={I} />
        <DecisionGlyph x={250} y={60} w={100} h={80} accent={I} mark="config?" />
        <LabelBox x={420} y={45} w={170} h={46} text="reuse config" accent={I} />
        <LabelBox x={420} y={120} w={230} h={46} text="prepare_and_deploy_model" accent={I} strong />
        <Arrow x1={180} y1={103} x2={248} y2={100} accent={I} />
        <Arrow x1={350} y1={90} x2={418} y2={66} accent={I} animated={false} />
        <Arrow x1={350} y1={120} x2={418} y2={140} accent={I} animated={false} />
      </Frame>
    ),
  },
  /* p410 — prepare_and_deploy_model */
  {
    page: 410, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Deploying the LLM Twin model to AWS SageMaker",
    term: "HuggingFaceModel", title: "Build the model, then .deploy()",
    caption:
      "prepare_and_deploy_model creates a SageMaker HuggingFaceModel (role, DLC image URI, config) and calls .deploy() with the GPU instance type, instance count, resources, and endpoint type.",
    diagram: (
      <Frame w={740} h={190}>
        <Code
          x={30}
          y={45}
          w={450}
          lines={[
            { t: "HuggingFaceModel(role, image_uri, env)", hi: true },
            { t: "  .deploy(instance_type=gpu,", hi: false },
            { t: "    initial_instance_count=1, resources)", hi: false },
          ]}
        />
        <BrandNode x={510} y={75} name="Hugging Face" w={180} />
      </Frame>
    ),
  },
  /* p411 — strategy params */
  {
    page: 411, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Deploying the LLM Twin model to AWS SageMaker",
    term: "STRATEGY", title: "SagemakerHuggingfaceStrategy.deploy",
    caption:
      "The strategy’s deploy() takes role_arn, llm_image, config, endpoint names, gpu_instance_type, resources, and endpoint_type (MODEL_BASED or INFERENCE_COMPONENT), then delegates to the deployment service — the strategy pattern keeping high-level logic stable.",
    diagram: (
      <Frame w={740} h={200}>
        <LabelBox x={40} y={80} w={220} h={56} text="HuggingfaceStrategy" sub="deploy(...)" accent={I} strong />
        <DecisionGlyph x={330} y={70} w={90} h={80} accent={I} mark="→" />
        <LabelBox x={480} y={80} w={220} h={56} text="DeploymentService" sub="delegated" accent={I} />
        <Arrow x1={260} y1={108} x2={328} y2={108} accent={I} />
        <Arrow x1={420} y1={108} x2={478} y2={108} accent={I} />
      </Frame>
    ),
  },
  /* p412 — ResourceRequirements */
  {
    page: 412, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Deploying the LLM Twin model to AWS SageMaker",
    term: "RESOURCES", title: "copies, GPUs, CPUs, memory",
    caption:
      "ResourceRequirements declares the infra per endpoint: copies (replicas for latency/throughput), num_accelerators (GPUs), num_cpus (pre/post-processing), and memory — tuned to the LLM’s size and load.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={45}
          w={400}
          lines={[
            { t: "ResourceRequirements(requests={", hi: true },
            { t: '  "copies": 4, "num_accelerators": 4,', hi: false },
            { t: '  "num_cpus": 8, "memory": 5*1024})', hi: false },
          ]}
        />
        {["4 copies", "4 GPUs", "8 CPUs"].map((t, i) => (
          <Pill key={t} x={470} y={55 + i * 44} text={t} accent={I} w={150} />
        ))}
      </Frame>
    ),
  },
  /* p413 — HF deploy config */
  {
    page: 413, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Deploying the LLM Twin model to AWS SageMaker",
    term: "ENGINE CONFIG", title: "Which model, GPUs, quantization",
    caption:
      "hugging_face_deploy_config controls the TGI engine: HF_MODEL_ID (mlabonne/TwinLlama-3.1-8B), SM_NUM_GPUS per replica, max input/total tokens, the Hub token, and HF_MODEL_QUANTIZE=bitsandbytes.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={45}
          w={460}
          lines={[
            { t: '"HF_MODEL_ID": "TwinLlama-3.1-8B",', hi: true },
            { t: '"SM_NUM_GPUS": 1,', hi: false },
            { t: '"MAX_TOTAL_TOKENS": ...,', hi: false },
            { t: '"HF_MODEL_QUANTIZE": "bitsandbytes"', hi: true },
          ]}
        />
        <BrandNode x={510} y={75} name="bitsandbytes" w={180} />
      </Frame>
    ),
  },
  /* p414 — deploy CLI */
  {
    page: 414, chapter: 10, stage: "inference", accent: I, archetype: "single-concept",
    section: "Deploying the LLM Twin model to AWS SageMaker",
    term: "DEPLOY CLI", title: "One command, 15–30 minutes",
    caption:
      "poe deploy-inference-endpoint runs the whole flow (~15–30 min). Change any value in .env (e.g. GPU_INSTANCE_TYPE ml.g5.xlarge, SM_NUM_GPUS) to redeploy a different configuration without touching code. Check the SageMaker dashboard + CloudWatch logs (Fig 10.6/10.7).",
    diagram: (
      <Frame w={720} h={180}>
        <Label x={120} y={60} size={12} font={MONO} color="#5E6B76">poe deploy-inference-endpoint</Label>
        <DecisionGlyph x={300} y={75} w={100} h={80} accent={I} mark="15–30m" />
        <BrandNode x={470} y={90} name="AWS SageMaker" sub="endpoint live" w={180} />
        <Arrow x1={400} y1={115} x2={468} y2={115} accent={I} />
      </Frame>
    ),
  },
  /* p415 — calling endpoint */
  {
    page: 415, chapter: 10, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "Calling the AWS SageMaker Inference endpoint",
    term: "CALL ENDPOINT", title: "Two classes: endpoint + executor",
    caption:
      "Two classes call the deployed LLM: LLMInferenceSagemakerEndpoint (talks to SageMaker), wrapped by InferenceExecutor which prepares the prompt, sends the request, and decodes the answer.",
    diagram: (
      <Frame w={740} h={190}>
        <LabelBox x={30} y={75} w={180} h={56} text="InferenceExecutor" accent={I} />
        <LabelBox x={280} y={75} w={230} h={56} text="LLMInferenceSagemakerEndpoint" accent={I} strong />
        <BrandNode x={580} y={77} name="AWS SageMaker" w={130} />
        <Arrow x1={210} y1={103} x2={278} y2={103} accent={I} />
        <Arrow x1={510} y1={103} x2={578} y2={103} accent={I} animated={false} />
      </Frame>
    ),
  },
  /* p416 — endpoint constructor */
  {
    page: 416, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Calling the AWS SageMaker Inference endpoint",
    term: "CONSTRUCTOR", title: "boto3 sagemaker-runtime client",
    caption:
      "LLMInferenceSagemakerEndpoint builds a boto3 sagemaker-runtime client, stores the endpoint name, and sets a default payload (inputs + parameters: max_new_tokens, top_p, temperature).",
    diagram: (
      <Frame w={740} h={190}>
        <Code
          x={30}
          y={45}
          w={460}
          lines={[
            { t: "boto3.client('sagemaker-runtime', ...)", hi: true },
            { t: "self.endpoint_name = endpoint_name", hi: false },
            { t: "self.payload = _default_payload()", hi: false },
          ]}
        />
        <Pill x={520} y={80} text="inputs + params" accent={I} w={170} />
      </Frame>
    ),
  },
  /* p417 — set_payload + inference */
  {
    page: 417, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Calling the AWS SageMaker Inference endpoint",
    term: "INFERENCE", title: "set_payload then invoke_endpoint",
    caption:
      "set_payload updates inputs (and optional parameters); inference() packages the payload, optionally adds an InferenceComponentName, calls invoke_endpoint, and decodes the JSON response.",
    diagram: (
      <Frame w={740} h={190}>
        <Code
          x={30}
          y={45}
          w={450}
          lines={[
            { t: "set_payload(inputs, parameters)", hi: false },
            { t: "client.invoke_endpoint(", hi: true },
            { t: "  EndpointName, Body=json(payload))", hi: false },
          ]}
        />
        <BrandNode x={520} y={75} name="AWS SageMaker" w={170} />
      </Frame>
    ),
  },
  /* p418 — InferenceExecutor */
  {
    page: 418, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Calling the AWS SageMaker Inference endpoint",
    term: "InferenceExecutor", title: "Wraps llm + query + context + prompt",
    caption:
      "InferenceExecutor takes any Inference implementation (so strategies are swappable), the user query, an optional RAG context, and an optional prompt template — defaulting to a content-creator prompt.",
    diagram: (
      <Frame w={740} h={190}>
        <Code
          x={30}
          y={45}
          w={440}
          lines={[
            { t: "InferenceExecutor(", hi: true },
            { t: "  llm: Inference, query,", hi: false },
            { t: "  context=None, prompt=None)", hi: false },
          ]}
        />
        <Pill x={510} y={80} text="swappable Inference" accent={I} w={190} />
      </Frame>
    ),
  },
  /* p419 — execute() */
  {
    page: 419, chapter: 10, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "Building the business microservice using FastAPI",
    term: "execute()", title: "Format prompt → inference → text",
    caption:
      "execute() formats the prompt with query + context, sets parameters (max_new_tokens, repetition_penalty, temperature), calls inference, and returns the generated_text. Decoupling via the Inference interface lets strategies be swapped freely.",
    diagram: (
      <Frame w={740} h={190}>
        <LabelBox x={30} y={75} w={140} h={56} text="format prompt" accent={I} />
        <LabelBox x={220} y={75} w={150} h={56} text="set parameters" accent={I} />
        <LabelBox x={420} y={75} w={130} h={56} text="inference()" accent={I} />
        <LabelBox x={600} y={75} w={110} h={56} text="answer" accent={I} strong />
        <Arrow x1={170} y1={103} x2={218} y2={103} accent={I} />
        <Arrow x1={370} y1={103} x2={418} y2={103} accent={I} />
        <Arrow x1={550} y1={103} x2={598} y2={103} accent={I} />
      </Frame>
    ),
  },
  /* p420 — FastAPI + rag */
  {
    page: 420, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Building the business microservice using FastAPI",
    term: "FASTAPI", title: "QueryRequest → rag() → QueryResponse",
    caption:
      "FastAPI defines QueryRequest/QueryResponse Pydantic models. rag() retrieves k=9 docs, builds context, and call_llm_service hits the SageMaker LLM — all CPU/I/O-bound, so the API runs on a cheap GPU-less machine.",
    diagram: (
      <Frame w={740} h={200}>
        <BrandNode x={30} y={50} name="FastAPI" w={150} />
        <Code
          x={210}
          y={50}
          w={310}
          lines={[
            { t: "def rag(query):", hi: true },
            { t: "  documents = retriever.search(q)", hi: false },
            { t: "  context = to_context(documents)", hi: false },
            { t: "  return call_llm_service(q, context)", hi: false },
          ]}
        />
        <BrandNode x={550} y={75} name="Pydantic" w={150} />
      </Frame>
    ),
  },
  /* p421 — rag_endpoint + uvicorn */
  {
    page: 421, chapter: 10, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Building the business microservice using FastAPI",
    term: "/rag", title: "POST /rag, served by uvicorn",
    caption:
      "rag_endpoint exposes the RAG logic as a POST /rag route returning a QueryResponse (HTTP 500 on error). The app is served with uvicorn (poe run-inference-ml-service) and called via curl.",
    diagram: (
      <Frame w={740} h={190}>
        <Code
          x={30}
          y={45}
          w={420}
          lines={[
            { t: '@app.post("/rag")', hi: true },
            { t: "async def rag_endpoint(request):", hi: false },
            { t: "  return {answer: rag(request.query)}", hi: false },
          ]}
        />
        <BrandNode x={510} y={75} name="uvicorn" sub="ASGI server" w={170} />
      </Frame>
    ),
  },
  /* p422 — deploy FastAPI to EKS/ECS */
  {
    page: 422, chapter: 10, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "Autoscaling capabilities to handle spikes in usage",
    term: "DEPLOY API", title: "Dockerize → ECR → EKS/ECS",
    caption:
      "The FastAPI server runs locally; to ship it, provision an EKS/ECS cluster (often via Terraform IaC), Dockerize the app, push the image to ECR, and run an ECS/EKS deployment from it (covered for ZenML in Chapter 11).",
    diagram: (
      <Frame w={740} h={190}>
        <BrandNode x={20} y={75} name="Terraform" sub="provision" w={150} />
        <BrandNode x={200} y={75} name="Docker" w={130} />
        <BrandNode x={360} y={75} name="AWS ECR" w={130} />
        <BrandNode x={520} y={75} name="AWS EKS" sub="+ ECS" w={150} />
        <Arrow x1={170} y1={100} x2={198} y2={100} accent={I} />
        <Arrow x1={330} y1={100} x2={358} y2={100} accent={I} />
        <Arrow x1={490} y1={100} x2={518} y2={100} accent={I} />
      </Frame>
    ),
  },
  /* p423 — static replicas */
  {
    page: 423, chapter: 10, stage: "inference", accent: I, archetype: "pitfall",
    section: "Autoscaling capabilities to handle spikes in usage",
    term: "STATIC REPLICAS", title: "Fixed replicas waste money or fail",
    caption:
      "With ResourceRequirements set to a fixed 4 copies, the service always runs 4 GPU replicas regardless of traffic — paying for idle GPUs at quiet times and failing under spikes. The fix is autoscaling.",
    diagram: (
      <Frame w={720} h={200}>
        {[0, 1, 2, 3].map((i) => (
          <ModelGlyph key={i} x={60 + i * 110} y={60} w={70} h={60} accent={I} />
        ))}
        <Label x={280} y={150} size={11}>always 4 replicas</Label>
        <Warn x={120} y={175} text="idle cost when quiet" />
        <Warn x={420} y={175} text="overload on spikes" />
      </Frame>
    ),
  },
  /* p424 — Fig 10.8 autoscaling */
  {
    page: 424, chapter: 10, stage: "inference", accent: I, archetype: "architecture",
    section: "Autoscaling capabilities to handle spikes in usage",
    term: "AUTOSCALING", title: "Replicas track the load (Fig 10.8)",
    caption:
      "Autoscaling adjusts replicas to traffic: 1 replica when idle, 2 at ~10 RPS, 20 at ~100 RPS. An Application Load Balancer (ALB) sits in front and routes requests (e.g. round-robin) across the live replicas.",
    diagram: (
      <Frame w={740} h={210}>
        <UserGlyph x={20} y={75} w={70} h={70} accent={I} />
        <LabelBox x={130} y={85} w={120} h={56} text="ALB" sub="round-robin" accent={I} strong />
        {[
          ["idle", 1, 40],
          ["10 RPS", 2, 100],
          ["100 RPS", 20, 170],
        ].map(([t, n, y], i) => (
          <g key={i}>
            <Pill x={310} y={y as number} text={`${t} → ${n} replicas`} accent={I} w={200} />
            <Arrow x1={250} y1={113} x2={306} y2={(y as number) + 15} accent={I} animated={i === 2} />
          </g>
        ))}
        <Arrow x1={90} y1={110} x2={128} y2={113} accent={I} />
      </Frame>
    ),
  },
  /* p425 — scalable target */
  {
    page: 425, chapter: 10, stage: "inference", accent: I, archetype: "list-cluster",
    section: "Registering a scalable target",
    term: "SCALABLE TARGET", title: "Tell AWS what to scale + the bounds",
    caption:
      "Registering a scalable target tells Application Auto Scaling what to scale (resource ID, service namespace, scalable dimension) and the bounds (MinCapacity, MaxCapacity) — but not yet when or how.",
    diagram: (
      <Frame w={740} h={200}>
        {["resource ID", "namespace", "scalable dimension", "min / max"].map((t, i) => (
          <LabelBox key={t} x={20 + i * 180} y={70} w={160} h={70} text={t} accent={I} strong={i === 3} />
        ))}
      </Frame>
    ),
  },
  /* p426 — scalable policy */
  {
    page: 426, chapter: 10, stage: "inference", accent: I, archetype: "single-concept",
    section: "Creating a scalable policy",
    term: "SCALING POLICY", title: "TargetTrackingScaling on a metric",
    caption:
      "A scaling policy defines how to scale: TargetTrackingScaling keeps a metric (e.g. InvocationsPerCopy or GPU utilization ~70%) at a target value, auto-managing CloudWatch alarms to scale out above and in below — like a thermostat.",
    diagram: (
      <Frame w={720} h={200}>
        <DecisionGlyph x={300} y={70} w={110} h={90} accent={I} mark="70%" />
        <Label x={355} y={180} size={11} color="#5E6B76">target metric</Label>
        <Pill x={40} y={95} text="above → scale out" accent={I} w={200} />
        <Pill x={490} y={95} text="below → scale in" accent={I} w={200} />
        <Arrow x1={300} y1={100} x2={240} y2={110} accent={I} animated={false} />
        <Arrow x1={410} y1={100} x2={488} y2={110} accent={I} animated={false} />
      </Frame>
    ),
  },
  /* p427 — limits + cooldown */
  {
    page: 427, chapter: 10, stage: "inference", accent: I, archetype: "single-concept",
    section: "Cooldown period",
    term: "LIMITS + COOLDOWN", title: "Min ≥ 1, max open, cooldown stabilizes",
    caption:
      "Set min (≥1, always some capacity) and max (≥min, no hard cap) scaling limits. A cooldown period pauses between scaling events — delaying scale-in removals and scale-out additions — to prevent rapid, costly fluctuations.",
    diagram: (
      <Frame w={720} h={200}>
        <line x1={60} y1={120} x2={660} y2={120} stroke="#CBD3D8" strokeWidth={2} />
        <circle cx={120} cy={120} r={7} fill={I} />
        <Label x={120} y={150} size={11}>min ≥ 1</Label>
        <circle cx={600} cy={120} r={7} fill={I} />
        <Label x={600} y={150} size={11}>max (open)</Label>
        <Pill x={300} y={60} text="cooldown: stabilize" accent={I} w={180} />
      </Frame>
    ),
  },
  /* p428 — autoscaling pitfalls */
  {
    page: 428, chapter: 10, stage: "inference", accent: I, archetype: "pitfall",
    section: "Summary",
    term: "PITFALLS", title: "Over-scaling vs under-scaling",
    caption:
      "Autoscaling has two failure modes: over-scaling (too-sensitive policy spins up idle machines → cost) and under-scaling (too-slow → bad UX). Stress-test in a dev environment to find the cost/latency/throughput sweet spot.",
    diagram: (
      <Frame w={720} h={200}>
        <LabelBox x={40} y={70} w={250} h={70} text="over-scaling" sub="idle machines" accent={I} />
        <Warn x={70} y={170} text="wasted cost" />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={70} w={260} h={70} text="under-scaling" sub="can’t keep up" accent={I} />
        <Warn x={460} y={170} text="bad user experience" />
      </Frame>
    ),
  },
];
