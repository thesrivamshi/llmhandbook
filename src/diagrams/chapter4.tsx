// Chapter 4 — RAG Feature Pipeline (pp. 128–202). The big chapter: RAG theory
// (ingestion/retrieval/generation, embeddings, vector DBs), advanced RAG
// (pre-/retrieval/post-retrieval), then the LLM Twin's batch feature pipeline —
// ZenML steps, Pydantic domain entities, a custom OVM, and factory+strategy
// handler layers. Stage = Feature / Data (green). Figures 4.1–4.17 redrawn as
// schematics (4.1, 4.5, 4.7, 4.9, 4.16, 4.17 are the architecture/figure redraws).
// pp.203–205 are References (non-content) and are skipped.
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

const G = STAGES.feature.accent; // green
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
        <text key={i} x={x + 14} y={y + 16 + i * lh} fontFamily={MONO} fontSize={size} fill={l.hi ? G : "#25313C"} fontWeight={l.hi ? 700 : 500}>
          {l.t}
        </text>
      ))}
    </g>
  );
};

export const CHAPTER4: PageDiagram[] = [
  /* p128 — chapter intro */
  {
    page: 128, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "Chapter 4: RAG Feature Pipeline",
    term: "RAG", title: "Inject custom data into the LLM",
    caption:
      "RAG injects custom, private, or new data into an LLM’s prompt so it can act on data it wasn’t trained on — a cheaper alternative to constant fine-tuning. This chapter builds the LLM Twin’s RAG ingestion (feature) pipeline.",
    diagram: (
      <Frame w={720} h={230}>
        <DocumentGlyph x={20} y={70} w={120} h={100} accent={G} />
        <Label x={80} y={185}>external data</Label>
        <DecisionGlyph x={210} y={75} w={100} h={90} accent={G} mark="+" />
        <Label x={260} y={180} size={11} color="#5E6B76">augment prompt</Label>
        <ModelGlyph x={400} y={60} w={130} h={120} accent={G} />
        <Label x={465} y={195} weight={700}>LLM</Label>
        <LabelBox x={590} y={95} w={110} h={52} text="answer" accent={G} strong />
        <Arrow x1={140} y1={115} x2={208} y2={118} accent={G} />
        <Arrow x1={310} y1={118} x2={398} y2={118} accent={G} />
        <Arrow x1={530} y1={118} x2={588} y2={120} accent={G} />
      </Frame>
    ),
  },
  /* p129 — R + A + G */
  {
    page: 129, chapter: 4, stage: "feature", accent: G, archetype: "formula-as-blocks",
    section: "Why use RAG?",
    term: "R + A + G", title: "Retrieval, Augmented, Generation",
    caption:
      "RAG = Retrieval (search relevant data) + Augmented (add it as context to the prompt) + Generation (let the LLM answer). It overcomes the LLM’s bounded parametrized knowledge and its tendency to hallucinate.",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["Retrieval", "search relevant data"],
          ["Augmented", "add as context"],
          ["Generation", "LLM answers"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 245} y={60} w={210} h={80} text={t as string} sub={sub as string} accent={G} strong={i === 2} />
            {i < 2 && <Label x={240 + i * 245} y={100} size={22} weight={700} color="#97A0A8">+</Label>}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p130 — hallucinations + old info (pitfall) */
  {
    page: 130, chapter: 4, stage: "feature", accent: G, archetype: "pitfall",
    section: "The vanilla RAG framework",
    term: "TWO PROBLEMS", title: "What RAG fixes: hallucination + stale data",
    caption:
      "Without RAG an LLM confidently hallucinates on data outside its parametrized knowledge, and it can’t see private, new, or costly-to-train data. RAG grounds the answer in injected context as the single source of truth.",
    diagram: (
      <Frame w={740} h={250}>
        <ModelGlyph x={40} y={60} w={120} h={110} accent={G} />
        <Label x={100} y={185}>LLM alone</Label>
        <Warn x={240} y={70} text="confident hallucination" />
        <Warn x={240} y={110} text="no private / new data" />
        <Warn x={240} y={150} text="retraining is costly" />
        <Label x={470} y={130} size={18} weight={700} color="#97A0A8">→ + RAG</Label>
        <DocumentGlyph x={560} y={55} w={70} h={64} accent={G} />
        <Pill x={540} y={150} text="grounded answer" accent={G} w={170} />
        <Label x={595} y={130} size={10.5} color="#5E6B76">single source of truth</Label>
      </Frame>
    ),
  },
  /* p131 — three modules */
  {
    page: 131, chapter: 4, stage: "feature", accent: G, archetype: "architecture",
    section: "The vanilla RAG framework",
    term: "THREE MODULES", title: "Ingestion, retrieval, generation",
    caption:
      "A RAG system is three independent modules: the ingestion pipeline populates the vector DB; retrieval queries it for entries similar to the user’s input; generation augments the prompt and an LLM produces the answer.",
    diagram: (
      <Frame w={760} h={260}>
        <PipelineGlyph x={20} y={30} w={170} h={80} accent={G} />
        <Label x={105} y={70} weight={700}>Ingestion</Label>
        <VectorDBGlyph x={260} y={20} w={110} h={110} accent={G} />
        <Label x={315} y={142} size={11} weight={600}>vector DB</Label>
        <UserGlyph x={20} y={160} w={80} h={80} accent={G} />
        <Label x={60} y={250} size={11}>user</Label>
        <PipelineGlyph x={170} y={170} w={160} h={70} accent={G} />
        <Label x={250} y={205} weight={700}>Retrieval</Label>
        <PipelineGlyph x={400} y={170} w={160} h={70} accent={G} />
        <Label x={480} y={205} weight={700}>Generation</Label>
        <ModelGlyph x={610} y={150} w={110} h={100} accent={G} />
        <Label x={665} y={250} size={11} weight={700}>LLM</Label>
        <Arrow x1={190} y1={70} x2={258} y2={75} accent={G} animated={false} />
        <Arrow x1={100} y1={200} x2={168} y2={205} accent={G} />
        <Arrow x1={315} y1={130} x2={250} y2={168} accent={G} animated={false} />
        <Arrow x1={330} y1={205} x2={398} y2={205} accent={G} />
        <Arrow x1={560} y1={200} x2={608} y2={200} accent={G} />
      </Frame>
    ),
  },
  /* p132 — Fig 4.1 vanilla RAG architecture */
  {
    page: 132, chapter: 4, stage: "feature", accent: G, archetype: "architecture",
    section: "The vanilla RAG framework",
    term: "VANILLA RAG", title: "The full vanilla RAG architecture (Fig 4.1)",
    caption:
      "Data sources flow through the ingestion pipeline (clean → chunk → embed) into the vector DB. At query time the user input is embedded, similar chunks are retrieved, and the prompt template + context + query feed the LLM.",
    diagram: (
      <Frame w={760} h={360}>
        <Boundary x={150} y={16} w={470} h={120} title="ingestion pipeline" accent={G} />
        <DataStoreGlyph x={30} y={40} w={90} h={84} accent={G} />
        <Label x={75} y={134} size={10.5}>sources</Label>
        {["clean", "chunk", "embed"].map((t, i) => (
          <g key={t}>
            <LabelBox x={170 + i * 150} y={55} w={120} h={44} text={t} accent={G} />
            {i < 2 && <Arrow x1={290 + i * 150} y1={77} x2={318 + i * 150} y2={77} accent={G} animated={false} />}
          </g>
        ))}
        <Arrow x1={120} y1={82} x2={168} y2={77} accent={G} />
        <VectorDBGlyph x={640} y={30} w={100} h={110} accent={G} />
        <Label x={690} y={152} size={11} weight={600}>vector DB</Label>
        <Arrow x1={620} y1={77} x2={648} y2={82} accent={G} />
        {/* retrieval + generation */}
        <UserGlyph x={30} y={250} w={80} h={80} accent={G} />
        <Label x={70} y={250} size={11}>query</Label>
        <LabelBox x={150} y={265} w={120} h={50} text="embed query" accent={G} />
        <Boundary x={300} y={220} w={300} h={120} title="prompt elements" accent={G} />
        <Pill x={315} y={240} text="template" accent={G} w={120} />
        <Pill x={315} y={282} text="+ context (top-K)" accent={G} w={170} />
        <Pill x={450} y={240} text="+ query" accent={G} w={120} />
        <ModelGlyph x={620} y={240} w={100} h={90} accent={G} />
        <Label x={670} y={250} size={11} weight={700}>LLM</Label>
        <Arrow x1={110} y1={290} x2={148} y2={290} accent={G} />
        <Arrow x1={270} y1={290} x2={298} y2={290} accent={G} animated={false} />
        <Arrow x1={210} y1={262} x2={690} y2={140} accent={G} animated={false} />
        <Arrow x1={600} y1={285} x2={618} y2={285} accent={G} />
      </Frame>
    ),
  },
  /* p133 — ingestion pipeline detail */
  {
    page: 133, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Ingestion pipeline",
    term: "INGESTION", title: "Extract → clean → chunk → embed → load",
    caption:
      "The ingestion pipeline extracts raw documents from sources, cleans them, chunks them to fit the embedding model, embeds each chunk into a dense vector, and loads the embedded chunks plus metadata into the vector DB.",
    diagram: (
      <Frame w={760} h={210}>
        <DocumentGlyph x={10} y={60} w={70} h={70} accent={G} />
        {["clean", "chunk", "embed"].map((t, i) => (
          <g key={t}>
            <LabelBox x={110 + i * 130} y={68} w={110} h={52} text={t} accent={G} />
            <Arrow x1={90 + i * 130} y1={94} x2={108 + i * 130} y2={94} accent={G} animated={i === 0} />
          </g>
        ))}
        <Arrow x1={500} y1={94} x2={525} y2={94} accent={G} />
        <VectorDBGlyph x={530} y={45} w={100} h={100} accent={G} />
        <Label x={580} y={158} size={11} weight={600}>vector DB</Label>
        <Label x={580} y={30} size={10.5} color="#5E6B76">+ metadata</Label>
      </Frame>
    ),
  },
  /* p134 — retrieval pipeline */
  {
    page: 134, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Generation pipeline",
    term: "RETRIEVAL", title: "Embed query → top-K by cosine",
    caption:
      "Retrieval embeds the user input into the SAME vector space as the index, then finds the top-K most similar entries (usually by cosine distance, −1…1). The query must be preprocessed exactly like the documents — or you hit training-serving skew.",
    diagram: (
      <Frame w={760} h={220}>
        <UserGlyph x={20} y={60} w={80} h={80} accent={G} />
        <LabelBox x={140} y={75} w={110} h={50} text="embed query" accent={G} />
        <VectorDBGlyph x={310} y={40} w={110} h={110} accent={G} />
        <Label x={365} y={162} size={11} weight={600}>vector DB</Label>
        <Pill x={300} y={170} text="cosine −1…1" accent={G} w={130} />
        <SnapshotGlyph x={500} y={70} w={200} h={70} accent={G} title="top-K chunks" usedFor="prompt context" />
        <Arrow x1={100} y1={100} x2={138} y2={100} accent={G} />
        <Arrow x1={250} y1={100} x2={308} y2={95} accent={G} />
        <Arrow x1={420} y1={95} x2={498} y2={100} accent={G} />
        <Label x={175} y={150} size={10} color="#5E6B76">same vector space!</Label>
      </Frame>
    ),
  },
  /* p135 — generation pipeline */
  {
    page: 135, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Generation pipeline",
    term: "GENERATION", title: "Template + context + query → LLM",
    caption:
      "The final prompt comes from a system + prompt template populated with the user’s query and retrieved context. Prompt templates evolve, so version them (Git, a DB, or a tool like LangFuse) per MLOps best practice.",
    diagram: (
      <Frame w={760} h={230}>
        {["system + template", "retrieved context", "user query"].map((t, i) => (
          <g key={t}>
            <Pill x={20} y={40 + i * 52} text={t} accent={G} w={200} />
            <Arrow x1={222} y1={55 + i * 52} x2={300} y2={108} accent={G} animated={i === 2} />
          </g>
        ))}
        <LabelBox x={300} y={80} w={120} h={56} text="prompt" accent={G} strong />
        <ModelGlyph x={470} y={60} w={110} h={100} accent={G} />
        <Label x={525} y={175} weight={700}>LLM</Label>
        <LabelBox x={630} y={85} w={100} h={48} text="answer" accent={G} />
        <Arrow x1={420} y1={108} x2={468} y2={108} accent={G} />
        <Arrow x1={580} y1={108} x2={628} y2={108} accent={G} />
        <BrandNode x={300} y={170} name="LangFuse" sub="version prompts" w={190} />
      </Frame>
    ),
  },
  /* p136 — what are embeddings */
  {
    page: 136, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "What are embeddings?",
    term: "EMBEDDINGS", title: "Objects → dense vectors",
    caption:
      "An embedding is a dense numerical vector in a continuous space; similar objects land close together, capturing semantic meaning. Words/images/items with similar meaning cluster in the vector space.",
    diagram: (
      <Frame w={720} h={240}>
        {["king", "queen", "apple"].map((t, i) => (
          <Pill key={t} x={30} y={50 + i * 56} text={t} accent={G} w={120} />
        ))}
        <ModelGlyph x={220} y={75} w={110} h={100} accent={G} />
        <Label x={275} y={190} size={11} weight={600}>embedding model</Label>
        {/* vector space cluster */}
        <Boundary x={430} y={40} w={270} h={170} title="vector space" accent={G} />
        <circle cx={500} cy={90} r={6} fill={G} />
        <circle cx={520} cy={105} r={6} fill={G} />
        <Label x={540} y={97} anchor="start" size={10.5} color="#5E6B76">king · queen (close)</Label>
        <circle cx={640} cy={175} r={6} fill={G} />
        <Label x={560} y={175} anchor="start" size={10.5} color="#5E6B76">apple (far)</Label>
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={152} y1={65 + i * 56} x2={218} y2={120} accent={G} animated={i === 0} />
        ))}
        <Arrow x1={330} y1={125} x2={428} y2={120} accent={G} />
      </Frame>
    ),
  },
  /* p137 — UMAP visualization */
  {
    page: 137, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "What are embeddings?",
    term: "VISUALIZE", title: "Project to 2D/3D with UMAP (Fig 4.3)",
    caption:
      "Embeddings have 64–2048 dimensions, so to inspect them you reduce dimensionality. UMAP preserves geometric relationships when projecting to 2D/3D; t-SNE is an alternative but more stochastic and less topology-preserving.",
    diagram: (
      <Frame w={720} h={230}>
        <DataStoreGlyph x={30} y={70} w={110} h={100} accent={G} />
        <Label x={85} y={183} size={11}>768-dim vectors</Label>
        <DecisionGlyph x={250} y={75} w={110} h={100} accent={G} mark="UMAP" />
        <Label x={305} y={190} size={10.5} color="#5E6B76">dim. reduction</Label>
        <Boundary x={450} y={50} w={250} h={150} title="2D map" accent={G} />
        {[[510, 90], [540, 110], [560, 95], [620, 160], [640, 150], [600, 170]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={6} fill={G} opacity={0.8} />
        ))}
        <Arrow x1={140} y1={120} x2={248} y2={123} accent={G} />
        <Arrow x1={360} y1={123} x2={448} y2={120} accent={G} />
        <Pill x={250} y={30} text="t-SNE · PCA too" accent={G} w={150} />
      </Frame>
    ),
  },
  /* p138 — why powerful: ML needs numbers, one-hot curse */
  {
    page: 138, chapter: 4, stage: "feature", accent: G, archetype: "comparison",
    section: "Why embeddings are so powerful",
    term: "WHY #1", title: "Numbers without the dimensionality curse",
    caption:
      "ML models only take numbers. One-hot encoding a 10,000-token vocabulary makes each token a length-10,000 vector — the curse of dimensionality. Embeddings give a small dense vector instead, keeping semantic relationships.",
    diagram: (
      <Frame w={740} h={240}>
        <LabelBox x={30} y={40} w={300} h={44} text="one-hot encoding" accent={G} />
        <Label x={50} y={110} anchor="start" size={11.5} font={MONO} color="#5E6B76">[0,0,…,1,…,0]  length 10,000</Label>
        <Warn x={60} y={160} text="huge · sparse · no semantics" />
        <Label x={370} y={120} size={18} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={40} w={300} h={44} text="embedding" accent={G} strong />
        <Label x={440} y={110} anchor="start" size={11.5} font={MONO} color={G}>[0.21, −0.4, …]  length 384</Label>
        <Pill x={440} y={150} text="dense · semantic · small" accent={G} w={260} />
      </Frame>
    ),
  },
  /* p139 — one-hot vs hashing vs embedding */
  {
    page: 139, chapter: 4, stage: "feature", accent: G, archetype: "comparison",
    section: "Why embeddings are so powerful",
    term: "THREE ENCODINGS", title: "One-hot vs hashing vs embedding",
    caption:
      "One-hot preserves all info but explodes in size; feature hashing fixes the size but risks collisions and loses interpretability and semantics; embeddings control the output dimension AND keep semantic relationships.",
    diagram: (
      <Frame w={740} h={250}>
        {[
          ["one-hot", "all info, huge & sparse", false],
          ["hashing", "fixed size, collisions", false],
          ["embedding", "dense + semantic", true],
        ].map(([t, sub, best], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 245} y={50} w={210} h={70} text={t as string} sub={sub as string} accent={G} strong={best as boolean} />
            {best ? (
              <Pill x={45 + i * 245} y={150} text="✓ controls dimension" accent={G} w={160} />
            ) : (
              <Warn x={60 + i * 245} y={165} text={i === 0 ? "curse of dim." : "loses semantics"} />
            )}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p140 — Fig 4.4 CNN image embedding */
  {
    page: 140, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "How are embeddings created?",
    term: "CNN EMBEDDING", title: "Image → CNN → vector (Fig 4.4)",
    caption:
      "For images a CNN alternates convolution (learning features) and subsampling (shrinking); a final fully-connected layer turns the processed information into the vector embedding — a numerical representation of the image.",
    diagram: (
      <Frame w={760} h={210}>
        <LabelBox x={20} y={75} w={90} h={56} text="image" accent={G} />
        {["conv", "subsample", "conv"].map((t, i) => (
          <g key={i}>
            <PipelineGlyph x={140 + i * 120} y={70} w={100} h={64} accent={G} />
            <Label x={190 + i * 120} y={102} size={11.5}>{t}</Label>
          </g>
        ))}
        <LabelBox x={500} y={75} w={100} h={56} text="FC layer" accent={G} />
        <SnapshotGlyph x={620} y={78} w={120} h={56} accent={G} title="embedding" usedFor="" />
        <Arrow x1={110} y1={103} x2={138} y2={103} accent={G} />
        <Arrow x1={600} y1={103} x2={618} y2={103} accent={G} />
      </Frame>
    ),
  },
  /* p141 — SentenceTransformer code */
  {
    page: 141, chapter: 4, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "How are embeddings created?",
    term: "SBERT", title: "Encode sentences, compare similarity",
    caption:
      "SentenceTransformer encodes sentences into vectors; cosine similarity between them is 1 for identical, ~0 for unrelated (“dog” vs “swimming”), and higher when context overlaps. Text encoders are typically BERT/RoBERTa.",
    diagram: (
      <Frame w={740} h={210}>
        <Code
          x={30}
          y={35}
          w={430}
          lines={[
            { t: 'model = SentenceTransformer(', hi: true },
            { t: '   "all-MiniLM-L6-v2")', hi: false },
            { t: "emb = model.encode(sentences)", hi: false },
            { t: "model.similarity(emb, emb)", hi: true },
            { t: "# [[1.0, -0.04, 0.27], ...]", hi: false },
          ]}
        />
        <BrandNode x={500} y={50} name="Sentence Transformers" w={210} />
        <BrandNode x={500} y={120} name="Hugging Face" w={170} />
      </Frame>
    ),
  },
  /* p142 — pick model via MTEB */
  {
    page: 142, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "How are embeddings created?",
    term: "MODEL CHOICE", title: "Pick a model from the MTEB leaderboard",
    caption:
      "The best embedding model changes over time and per use case; the MTEB leaderboard on Hugging Face ranks them by accuracy, size, and footprint. Hugging Face and SentenceTransformer make switching trivial.",
    diagram: (
      <Frame w={720} h={230}>
        <BrandNode x={30} y={90} name="Hugging Face" sub="MTEB leaderboard" w={200} />
        <DecisionGlyph x={290} y={70} w={110} h={100} accent={G} mark="pick" />
        {["best accuracy", "smallest footprint", "your hardware"].map((t, i) => (
          <g key={t}>
            <Pill x={460} y={40 + i * 56} text={t} accent={G} w={230} />
            <Arrow x1={400} y1={120} x2={456} y2={55 + i * 56} accent={G} animated={i === 0} />
          </g>
        ))}
        <Arrow x1={230} y1={120} x2={288} y2={120} accent={G} />
      </Frame>
    ),
  },
  /* p143 — CLIP text + image same space */
  {
    page: 143, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "Applications of embeddings",
    term: "CLIP", title: "Text and image in one vector space",
    caption:
      "Specialized models like CLIP embed text and images into the SAME vector space, so you can compare a sentence to a picture by cosine similarity — enabling cross-modal search. Embeddings power search, recsys, clustering, and classification.",
    diagram: (
      <Frame w={720} h={230}>
        <LabelBox x={30} y={50} w={110} h={50} text="image" accent={G} />
        <Pill x={30} y={130} text="“a crazy cat”" accent={G} w={140} />
        <BrandNode x={220} y={85} name="CLIP" sub="shared encoder" w={150} />
        <Boundary x={420} y={40} w={280} h={160} title="shared vector space" accent={G} />
        <circle cx={500} cy={100} r={7} fill={G} />
        <Label x={515} y={100} anchor="start" size={10.5} color="#5E6B76">img emb</Label>
        <circle cx={520} cy={120} r={7} fill={G} />
        <Label x={535} y={120} anchor="start" size={10.5} color="#5E6B76">text emb (close!)</Label>
        <Arrow x1={140} y1={75} x2={218} y2={105} accent={G} animated={false} />
        <Arrow x1={170} y1={150} x2={218} y2={125} accent={G} animated={false} />
        <Arrow x1={370} y1={115} x2={418} y2={115} accent={G} />
      </Frame>
    ),
  },
  /* p144 — vector DB: ANN vs exact */
  {
    page: 144, chapter: 4, stage: "feature", accent: G, archetype: "comparison",
    section: "How does a vector DB work?",
    term: "VECTOR DB", title: "Approximate nearest neighbors, not exact match",
    caption:
      "Traditional DBs return exact matches; vector DBs return the closest neighbors of a query vector using Approximate Nearest Neighbor (ANN) algorithms — trading a little accuracy for big latency wins. Unlike a bare index (FAISS), they add full data management.",
    diagram: (
      <Frame w={740} h={230}>
        <DataStoreGlyph x={40} y={60} w={110} h={100} accent={G} />
        <Label x={95} y={175} size={11}>traditional DB</Label>
        <Pill x={30} y={185} text="exact match" accent={G} w={130} />
        <Label x={360} y={110} size={18} weight={700} color="#97A0A8">vs</Label>
        <VectorDBGlyph x={470} y={50} w={110} h={110} accent={G} />
        <Label x={525} y={172} size={11}>vector DB</Label>
        <Pill x={460} y={185} text="ANN nearest neighbors" accent={G} w={220} />
      </Frame>
    ),
  },
  /* p145 — ANN index algorithms */
  {
    page: 145, chapter: 4, stage: "feature", accent: G, archetype: "list-cluster",
    section: "DB operations",
    term: "ANN INDEXES", title: "Algorithms that build the vector index",
    caption:
      "Vector DBs index high-dimensional vectors with algorithms like random projection, product quantization (PQ), locality-sensitive hashing (LSH), and HNSW — then query by similarity (cosine, Euclidean, dot product) and post-process for accuracy.",
    diagram: (
      <Frame w={720} h={250}>
        <VectorDBGlyph x={290} y={90} w={120} h={120} accent={G} />
        <Label x={350} y={224} size={11} weight={600}>vector index</Label>
        {[
          ["Random projection", 30, 30],
          ["Product quantization", 470, 30],
          ["LSH", 30, 150],
          ["HNSW", 540, 150],
        ].map(([t, x, y], i) => (
          <g key={i}>
            <Pill x={x as number} y={y as number} text={t as string} accent={G} w={200} />
            <line x1={350} y1={150} x2={(x as number) + 100} y2={(y as number) + 15} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* p146 — vector DB operations */
  {
    page: 146, chapter: 4, stage: "feature", accent: G, archetype: "list-cluster",
    section: "An overview of advanced RAG",
    term: "DB OPS", title: "Production-grade DB operations",
    caption:
      "Beyond search, vector DBs offer production DB operations: sharding and replication for scale and availability, monitoring of latency/RAM/CPU/disk, role-based access control, and automated backups for disaster recovery.",
    diagram: (
      <Frame w={720} h={230}>
        <VectorDBGlyph x={300} y={70} w={120} h={110} accent={G} />
        {["sharding + replication", "monitoring", "access control", "backups"].map((t, i) => {
          const pos = [[30, 40], [470, 40], [30, 150], [470, 150]][i];
          return (
            <g key={t}>
              <Pill x={pos[0]} y={pos[1]} text={t} accent={G} w={220} />
              <line x1={360} y1={125} x2={pos[0] + 110} y2={pos[1] + 15} stroke="#ECE8DF" strokeWidth={1.4} />
            </g>
          );
        })}
      </Frame>
    ),
  },
  /* p147 — Fig 4.5 advanced RAG 3 stages */
  {
    page: 147, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "An overview of advanced RAG",
    term: "ADVANCED RAG", title: "Three stages to optimize (Fig 4.5)",
    caption:
      "Vanilla RAG can be optimized at three stages: pre-retrieval (structure & preprocess data, optimize the query), retrieval (better embedding models + metadata filtering), and post-retrieval (filter noise, compress the prompt).",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["Pre-retrieval", "index + query opt."],
          ["Retrieval", "embeddings + filters"],
          ["Post-retrieval", "denoise + compress"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <PipelineGlyph x={20 + i * 245} y={50} w={210} h={90} accent={G} />
            <Label x={125 + i * 245} y={88} weight={700}>{t as string}</Label>
            <Label x={125 + i * 245} y={108} size={11} color="#5E6B76">{sub as string}</Label>
            {i < 2 && <Arrow x1={230 + i * 245} y1={95} x2={265 + i * 245} y2={95} accent={G} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p148 — pre-retrieval data indexing */
  {
    page: 148, chapter: 4, stage: "feature", accent: G, archetype: "list-cluster",
    section: "Pre-retrieval",
    term: "PRE-RETRIEVAL", title: "Index optimizations + query optimizations",
    caption:
      "Pre-retrieval splits into data indexing (sliding window, data granularity, metadata tags, index structures, small-to-big) done in the ingestion pipeline, and query optimization done on the user’s query before embedding.",
    diagram: (
      <Frame w={740} h={250}>
        <LabelBox x={30} y={20} w={300} h={44} text="data indexing" sub="in ingestion pipeline" accent={G} strong />
        {["sliding window", "data granularity", "metadata tags", "small-to-big"].map((t, i) => (
          <Pill key={t} x={30 + (i % 2) * 160} y={80 + Math.floor(i / 2) * 50} text={t} accent={G} w={150} />
        ))}
        <LabelBox x={420} y={20} w={300} h={44} text="query optimization" sub="on the user query" accent={G} />
        {["query routing", "query rewriting", "query expansion", "self-query"].map((t, i) => (
          <Pill key={t} x={420 + (i % 2) * 160} y={80 + Math.floor(i / 2) * 50} text={t} accent={G} w={150} />
        ))}
      </Frame>
    ),
  },
  /* p149 — small-to-big */
  {
    page: 149, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "Pre-retrieval",
    term: "SMALL-TO-BIG", title: "Small chunk to embed, big chunk for context",
    caption:
      "Small-to-big decouples retrieval from generation: embed a small, focused text span (sharper retrieval, less noise) while storing a wider window around it in metadata to give the LLM more context at answer time.",
    diagram: (
      <Frame w={720} h={230}>
        <LabelBox x={40} y={80} w={120} h={56} text="small chunk" accent={G} strong />
        <Label x={100} y={150} size={10.5} color="#5E6B76">→ embed (sharp)</Label>
        <DecisionGlyph x={230} y={70} w={90} h={80} accent={G} mark="↔" />
        <LabelBox x={380} y={50} w={300} h={50} text="wider window (in metadata)" accent={G} />
        <Label x={530} y={120} size={10.5} color="#5E6B76">→ richer context for the LLM</Label>
        <Arrow x1={160} y1={108} x2={228} y2={110} accent={G} />
        <Arrow x1={320} y1={100} x2={378} y2={80} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p150 — Fig 4.6 query routing */
  {
    page: 150, chapter: 4, stage: "feature", accent: G, archetype: "architecture",
    section: "Pre-retrieval",
    term: "QUERY ROUTING", title: "Route the query like a natural-language if/else (Fig 4.6)",
    caption:
      "A query router decides, from the user’s input, where to fetch context — a vector DB (vector search), a SQL DB (translated query), or the internet (REST API) — and can even skip retrieval or pick the best prompt template.",
    diagram: (
      <Frame w={740} h={240}>
        <UserGlyph x={20} y={75} w={80} h={80} accent={G} />
        <DecisionGlyph x={180} y={60} w={120} h={110} accent={G} mark="route" />
        <Label x={240} y={185} size={11} color="#5E6B76">query router (LLM)</Label>
        {[
          ["vector DB", "vector search"],
          ["SQL DB", "translated query"],
          ["internet", "REST API"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <LabelBox x={420} y={20 + i * 72} w={200} h={56} text={t as string} sub={sub as string} accent={G} />
            <Arrow x1={300} y1={115} x2={416} y2={48 + i * 72} accent={G} animated={i === 0} />
          </g>
        ))}
        <Arrow x1={100} y1={115} x2={178} y2={115} accent={G} />
      </Frame>
    ),
  },
  /* p151 — retrieval: improve embedding model */
  {
    page: 151, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "Retrieval",
    term: "RETRIEVAL OPT", title: "Tune the embedding model to your domain",
    caption:
      "Retrieval improves by tailoring the embedding model to your domain’s jargon: either fine-tune the pre-trained model, or — cheaper — use an instructor model that steers embeddings with a domain instruction.",
    diagram: (
      <Frame w={720} h={220}>
        <ModelGlyph x={40} y={60} w={120} h={110} accent={G} />
        <Label x={100} y={185} size={11}>embedding model</Label>
        <DecisionGlyph x={250} y={70} w={100} h={90} accent={G} mark="↳" />
        {[
          ["fine-tune", "more compute"],
          ["instructor model", "guide with instruction"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <LabelBox x={430} y={45 + i * 78} w={250} h={56} text={t as string} sub={sub as string} accent={G} strong={i === 1} />
            <Arrow x1={350} y1={115} x2={426} y2={73 + i * 78} accent={G} animated={false} />
          </g>
        ))}
        <Arrow x1={160} y1={115} x2={248} y2={115} accent={G} />
      </Frame>
    ),
  },
  /* p152 — hybrid vs filtered vector search */
  {
    page: 152, chapter: 4, stage: "feature", accent: G, archetype: "comparison",
    section: "Retrieval",
    term: "SEARCH MODES", title: "Hybrid vs filtered vector search",
    caption:
      "Hybrid search blends vector + keyword search (an alpha weight balances them, results normalized then merged) for exact-match accuracy. Filtered vector search retrieves with the vector index, then filters on metadata to shrink the search space.",
    diagram: (
      <Frame w={740} h={240}>
        <LabelBox x={30} y={30} w={300} h={44} text="hybrid search" accent={G} strong />
        <Pill x={40} y={95} text="vector" accent={G} w={120} />
        <Pill x={190} y={95} text="+ keyword" accent={G} w={120} />
        <Label x={180} y={160} size={11} color="#5E6B76">α weight → normalize → merge</Label>
        <Label x={370} y={120} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={30} w={300} h={44} text="filtered vector search" accent={G} />
        <Pill x={430} y={95} text="vector index" accent={G} w={150} />
        <Pill x={590} y={95} text="+ metadata filter" accent={G} w={130} />
        <Label x={570} y={160} size={11} color="#5E6B76">shrink the search space</Label>
      </Frame>
    ),
  },
  /* p153 — post-retrieval */
  {
    page: 153, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "Post-retrieval",
    term: "POST-RETRIEVAL", title: "Compress the prompt, re-rank the chunks",
    caption:
      "Post-retrieval protects the LLM from noisy or oversized context. Two methods: prompt compression (drop redundancy, keep essence) and re-ranking (a cross-encoder scores each retrieved chunk; keep only the top N).",
    diagram: (
      <Frame w={740} h={230}>
        <SnapshotGlyph x={20} y={85} w={170} h={70} accent={G} title="retrieved chunks" usedFor="" />
        {[
          ["prompt compression", "drop redundancy"],
          ["re-ranking", "cross-encoder · top N"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={270} y={40 + i * 90} w={250} h={64} text={t as string} sub={sub as string} accent={G} strong={i === 1} />
        ))}
        <LabelBox x={600} y={85} w={120} h={56} text="clean context" accent={G} />
        <Arrow x1={190} y1={120} x2={268} y2={72} accent={G} animated={false} />
        <Arrow x1={190} y1={120} x2={268} y2={162} accent={G} animated={false} />
        <Arrow x1={520} y1={115} x2={598} y2={113} accent={G} />
      </Frame>
    ),
  },
  /* p154 — Fig 4.7 bi vs cross encoder */
  {
    page: 154, chapter: 4, stage: "feature", accent: G, archetype: "comparison",
    section: "Post-retrieval",
    term: "ENCODERS", title: "Bi-encoder vs cross-encoder (Fig 4.7)",
    caption:
      "A bi-encoder embeds query and document separately, then compares with cosine similarity (fast, used for retrieval). A cross-encoder feeds query + document together through BERT into a classifier — more accurate, but too costly for the first pass, so it’s used to re-rank.",
    diagram: (
      <Frame w={740} h={280}>
        {/* bi-encoder */}
        <Label x={180} y={20} size={12} weight={700} color={G}>bi-encoder</Label>
        <Pill x={40} y={210} text="query" accent={G} w={110} />
        <Pill x={230} y={210} text="doc" accent={G} w={110} />
        <ModelGlyph x={55} y={130} w={70} h={60} accent={G} />
        <ModelGlyph x={245} y={130} w={70} h={60} accent={G} />
        <Label x={90} y={120} size={10} color="#5E6B76">BERT</Label>
        <Label x={280} y={120} size={10} color="#5E6B76">BERT</Label>
        <LabelBox x={110} y={55} w={150} h={44} text="cosine sim" sub="−1…1" accent={G} />
        <Arrow x1={95} y1={208} x2={90} y2={192} accent={G} animated={false} />
        <Arrow x1={285} y1={208} x2={280} y2={192} accent={G} animated={false} />
        <Arrow x1={90} y1={128} x2={150} y2={100} accent={G} animated={false} />
        <Arrow x1={280} y1={128} x2={220} y2={100} accent={G} animated={false} />
        {/* cross-encoder */}
        <Label x={560} y={20} size={12} weight={700} color={G}>cross-encoder</Label>
        <Pill x={470} y={210} text="query" accent={G} w={100} />
        <Pill x={590} y={210} text="doc" accent={G} w={100} />
        <ModelGlyph x={520} y={120} w={120} h={70} accent={G} />
        <Label x={580} y={120} size={10} color="#5E6B76">BERT (joint)</Label>
        <LabelBox x={520} y={50} w={120} h={44} text="classifier" sub="0…1" accent={G} strong />
        <Arrow x1={520} y1={208} x2={560} y2={192} accent={G} animated={false} />
        <Arrow x1={640} y1={208} x2={600} y2={192} accent={G} animated={false} />
        <Arrow x1={580} y1={120} x2={580} y2={96} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p155 — Fig 4.8 re-ranking algorithm */
  {
    page: 155, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Post-retrieval",
    term: "RE-RANKING", title: "Retrieve by similarity, then re-rank (Fig 4.8)",
    caption:
      "The popular strategy: cheaply retrieve candidates with bi-encoder similarity search, then refine with a costly cross-encoder re-ranking model that finds richer query-chunk relationships. Most of these text techniques don’t transfer to multi-modal data.",
    diagram: (
      <Frame w={740} h={210}>
        <UserGlyph x={20} y={70} w={70} h={70} accent={G} />
        <VectorDBGlyph x={140} y={55} w={90} h={90} accent={G} />
        <SnapshotGlyph x={270} y={75} w={150} h={56} accent={G} title="candidates" usedFor="" />
        <LabelBox x={460} y={78} w={140} h={50} text="cross-encoder" sub="re-rank" accent={G} strong />
        <SnapshotGlyph x={630} y={78} w={100} h={50} accent={G} title="top N" usedFor="" />
        <Arrow x1={90} y1={100} x2={138} y2={100} accent={G} />
        <Arrow x1={230} y1={100} x2={268} y2={100} accent={G} />
        <Arrow x1={420} y1={103} x2={458} y2={103} accent={G} />
        <Arrow x1={600} y1={103} x2={628} y2={103} accent={G} />
      </Frame>
    ),
  },
  /* p156 — LLM Twin RAG: ingestion vs inference */
  {
    page: 156, chapter: 4, stage: "feature", accent: G, archetype: "architecture",
    section: "The problem we are solving",
    term: "TWO HALVES", title: "Ingestion now, inference later",
    caption:
      "Any RAG system splits in two: an ingestion pipeline (clean, chunk, embed, load into the vector DB) and an inference pipeline (query the DB for context, generate). This chapter builds ingestion; Chapter 9 builds inference.",
    diagram: (
      <Frame w={740} h={230}>
        <BrandNode x={20} y={90} name="MongoDB" sub="raw data" w={160} />
        <Boundary x={210} y={40} w={230} h={150} title="ingestion (this chapter)" accent={G} />
        <Pill x={225} y={70} text="clean · chunk · embed" accent={G} w={200} />
        <VectorDBGlyph x={290} y={110} w={80} h={70} accent={G} />
        <BrandNode x={300} y={185} name="Qdrant" w={120} />
        <Boundary x={470} y={40} w={250} h={150} title="inference (Ch. 9)" accent={G} danger={false} />
        <PipelineGlyph x={490} y={70} w={210} h={60} accent={G} />
        <Label x={595} y={100} size={12} weight={700}>retrieve + generate</Label>
        <ModelGlyph x={560} y={130} w={70} h={56} accent={G} />
        <Arrow x1={180} y1={120} x2={222} y2={110} accent={G} />
        <Arrow x1={370} y1={130} x2={488} y2={100} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p157 — feature store */
  {
    page: 157, chapter: 4, stage: "feature", accent: G, archetype: "architecture",
    section: "Where does the raw data come from?",
    term: "FEATURE STORE", title: "One store, two consumers",
    caption:
      "The logical feature store is the central access point: the training pipeline reads cleaned data (as ZenML artifacts) to fine-tune; the inference pipeline queries the Qdrant vector DB for chunks for RAG. Tokenization happens at runtime, so strings aren’t yet ‘features’.",
    diagram: (
      <Frame w={740} h={240}>
        <Boundary x={250} y={40} w={240} h={160} title="logical feature store" accent={G} />
        <SnapshotGlyph x={265} y={70} w={210} h={50} accent={G} title="cleaned data (artifacts)" usedFor="training" />
        <BrandNode x={300} y={135} name="Qdrant" sub="chunks · RAG" w={150} />
        <PipelineGlyph x={540} y={40} w={170} h={64} accent={G} />
        <Label x={625} y={75} size={12} weight={700}>training</Label>
        <PipelineGlyph x={540} y={140} w={170} h={64} accent={G} />
        <Label x={625} y={175} size={12} weight={700}>inference</Label>
        <Arrow x1={476} y1={95} x2={538} y2={75} accent={G} animated={false} />
        <Arrow x1={450} y1={160} x2={538} y2={170} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p158 — Fig 4.9 RAG feature pipeline architecture */
  {
    page: 158, chapter: 4, stage: "feature", accent: G, archetype: "architecture",
    section: "Designing the architecture of the RAG feature pipeline",
    term: "FEATURE PIPELINE", title: "The batch RAG feature pipeline (Fig 4.9)",
    caption:
      "A batch pipeline polls raw docs from MongoDB, cleans them, then forks: cleaned docs go to the feature store for fine-tuning, while chunk → embed feeds the Qdrant vector DB for RAG. Training and inference pipelines consume from there.",
    diagram: (
      <Frame w={760} h={300}>
        <BrandNode x={20} y={120} name="MongoDB" sub="raw docs" w={150} />
        <LabelBox x={200} y={120} w={100} h={50} text="clean" accent={G} />
        <SnapshotGlyph x={330} y={30} w={190} h={56} accent={G} title="cleaned docs" usedFor="fine-tuning" />
        {["chunk", "embed"].map((t, i) => (
          <g key={t}>
            <LabelBox x={330 + i * 120} y={130} w={100} h={48} text={t} accent={G} />
            {i < 1 && <Arrow x1={430} y1={154} x2={448} y2={154} accent={G} animated={false} />}
          </g>
        ))}
        <VectorDBGlyph x={580} y={110} w={100} h={100} accent={G} />
        <Label x={630} y={222} size={11} weight={600}>Qdrant · RAG</Label>
        <Arrow x1={170} y1={145} x2={198} y2={145} accent={G} />
        <Arrow x1={300} y1={140} x2={328} y2={70} accent={G} animated={false} />
        <Arrow x1={300} y1={150} x2={328} y2={154} accent={G} />
        <Arrow x1={550} y1={154} x2={578} y2={150} accent={G} />
        <PipelineGlyph x={540} y={240} w={180} h={50} accent={G} />
        <Label x={630} y={265} size={11} weight={600}>inference → answer</Label>
        <Arrow x1={630} y1={210} x2={630} y2={238} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p159 — batch pipeline */
  {
    page: 159, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Batch versus streaming pipelines",
    term: "BATCH", title: "Collect, schedule, process, load",
    caption:
      "A batch pipeline collects data until enough accumulates, processes it in bulk on a schedule (hourly/daily), and loads results into the target store. It’s efficient for large volumes, supports complex transforms, and is simpler than streaming.",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["collect", "accumulate"],
          ["scheduled process", "bulk, on interval"],
          ["load", "→ target store"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 245} y={60} w={210} h={80} text={t as string} sub={sub as string} accent={G} />
            {i < 2 && <Arrow x1={230 + i * 245} y1={100} x2={265 + i * 245} y2={100} accent={G} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p160 — streaming stack */
  {
    page: 160, chapter: 4, stage: "feature", accent: G, archetype: "architecture",
    section: "Batch versus streaming pipelines",
    term: "STREAMING STACK", title: "Event platform + streaming engine",
    caption:
      "Streaming applications pair an event platform (Apache Kafka or Redpanda) that stores events from many clients with a streaming engine (Apache Flink or Bytewax) that processes them. A queue like RabbitMQ can stand in for the event platform.",
    diagram: (
      <Frame w={740} h={230}>
        <Label x={120} y={30} size={11} weight={700} color={G}>EVENT PLATFORM</Label>
        <BrandNode x={30} y={50} name="Apache Kafka" w={190} />
        <BrandNode x={30} y={110} name="Redpanda" w={190} />
        <Label x={490} y={30} size={11} weight={700} color={G}>STREAMING ENGINE</Label>
        <BrandNode x={420} y={50} name="Apache Flink" w={180} />
        <BrandNode x={420} y={110} name="Bytewax" w={180} />
        <BrandNode x={250} y={175} name="RabbitMQ" sub="queue alternative" w={210} />
        <Arrow x1={220} y1={80} x2={418} y2={80} accent={G} />
        <Arrow x1={220} y1={135} x2={418} y2={135} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p161 — batch vs streaming use cases */
  {
    page: 161, chapter: 4, stage: "feature", accent: G, archetype: "comparison",
    section: "Batch versus streaming pipelines",
    term: "USE CASES", title: "When streaming, when batch",
    caption:
      "Streaming fits fast-changing, real-time needs: TikTok recommendations, Stripe/PayPal fraud detection, high-frequency trading. Batch fits when behavior changes slowly: nightly offline recommenders and ETL/analytics aggregation.",
    diagram: (
      <Frame w={740} h={240}>
        <LabelBox x={30} y={30} w={300} h={44} text="streaming" sub="real-time" accent={G} strong />
        {["TikTok recsys", "fraud detection", "HFT trading"].map((t, i) => (
          <Pill key={t} x={40} y={90 + i * 46} text={t} accent={G} w={250} />
        ))}
        <Label x={370} y={120} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={30} w={300} h={44} text="batch" sub="periodic" accent={G} />
        {["nightly recsys", "ETL / analytics", "data aggregation"].map((t, i) => (
          <Pill key={t} x={430} y={90 + i * 46} text={t} accent={G} w={250} />
        ))}
      </Frame>
    ),
  },
  /* p162 — why batch chosen */
  {
    page: 162, chapter: 4, stage: "feature", accent: G, archetype: "comparison",
    section: "Batch versus streaming pipelines",
    term: "WHY BATCH", title: "Why the LLM Twin uses batch",
    caption:
      "Batch was chosen because syncing the warehouse and feature store tolerates a few minutes’ delay (the data is only thousands of records), and batch is ~2× simpler than streaming — easier to build, debug, maintain, and cheaper. Start batch, move to streaming later.",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={250} y={80} w={220} h={70} text="batch chosen" accent={G} strong />
        {["no immediate processing needed", "small data (thousands)", "simplicity = lower cost"].map((t, i) => (
          <g key={t}>
            <Pill x={30} y={30 + i * 56} text={t} accent={G} w={200} />
            <Arrow x1={232} y1={45 + i * 56} x2={300} y2={100} accent={G} animated={i === 0} />
          </g>
        ))}
        <Label x={560} y={115} size={11} color="#5E6B76">stream later to cut cost</Label>
      </Frame>
    ),
  },
  /* p163 — Fig 4.10 quadrant */
  {
    page: 163, chapter: 4, stage: "feature", accent: G, archetype: "comparison",
    section: "Core steps",
    term: "TOOL QUADRANT", title: "Batch/streaming × small/big data (Fig 4.10)",
    caption:
      "Tool choice depends on architecture (streaming vs batch) and data size (small vs big). The LLM Twin sits in the small-data + batch quadrant — vanilla Python plus LangChain, Sentence Transformers, and Unstructured.",
    diagram: (
      <Frame w={720} h={280}>
        <line x1={360} y1={30} x2={360} y2={250} stroke="#CBD3D8" strokeWidth={1.5} />
        <line x1={60} y1={140} x2={680} y2={140} stroke="#CBD3D8" strokeWidth={1.5} />
        <Label x={200} y={20} size={10.5} color="#5E6B76">batch</Label>
        <Label x={540} y={20} size={10.5} color="#5E6B76">streaming</Label>
        <Label x={690} y={90} anchor="end" size={10.5} color="#5E6B76">small data</Label>
        <Label x={690} y={200} anchor="end" size={10.5} color="#5E6B76">big data</Label>
        <Boundary x={90} y={55} w={230} h={70} title="LLM Twin" accent={G} />
        <Pill x={105} y={78} text="Python · LangChain · SBERT" accent={G} w={200} />
        <BrandNode x={420} y={60} name="Bytewax" w={150} />
        <BrandNode x={420} y={170} name="Apache Flink" w={170} />
        <BrandNode x={120} y={170} name="Snowflake" sub="big batch" w={170} />
      </Frame>
    ),
  },
  /* p164 — 5 core steps */
  {
    page: 164, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Core steps",
    term: "CORE STEPS", title: "The five RAG feature steps",
    caption:
      "Every RAG feature pipeline has five steps: extract from MongoDB, clean (normalize ASCII, replace URLs, drop emojis), chunk per data category, embed each chunk (e.g. all-mpnet-base-v2), and load vectors + metadata to Qdrant.",
    diagram: (
      <Frame w={760} h={210}>
        {["extract", "clean", "chunk", "embed", "load"].map((t, i) => (
          <g key={t}>
            <PipelineGlyph x={15 + i * 148} y={70} w={120} h={70} accent={G} />
            <Label x={75 + i * 148} y={105} weight={700} size={13}>{t}</Label>
            {i < 4 && <Arrow x1={135 + i * 148} y1={105} x2={163 + i * 148} y2={105} accent={G} animated={i === 0} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p165 — CDC push vs pull */
  {
    page: 165, chapter: 4, stage: "feature", accent: G, archetype: "comparison",
    section: "Change data capture: syncing the data warehouse and feature store",
    term: "CDC", title: "Change Data Capture: push vs pull",
    caption:
      "CDC keeps two stores in sync by capturing CRUD operations and replicating them. Push: the source actively transmits changes (near-instant, needs a buffer). Pull: targets periodically request changes (lighter on the source, some delay).",
    diagram: (
      <Frame w={740} h={230}>
        <DataStoreGlyph x={40} y={70} w={100} h={90} accent={G} />
        <Label x={90} y={175} size={11}>source DB</Label>
        <VectorDBGlyph x={560} y={65} w={100} h={100} accent={G} />
        <Label x={610} y={178} size={11}>target</Label>
        <LabelBox x={250} y={45} w={220} h={48} text="push" sub="source transmits" accent={G} strong />
        <LabelBox x={250} y={140} w={220} h={48} text="pull" sub="target requests" accent={G} />
        <Arrow x1={140} y1={95} x2={248} y2={70} accent={G} />
        <Arrow x1={470} y1={70} x2={558} y2={95} accent={G} />
        <Arrow x1={558} y1={140} x2={470} y2={165} accent={G} animated={false} />
        <Arrow x1={248} y1={165} x2={140} y2={140} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p166 — CDC patterns */
  {
    page: 166, chapter: 4, stage: "feature", accent: G, archetype: "comparison",
    section: "Change data capture: syncing the data warehouse and feature store",
    term: "CDC PATTERNS", title: "Timestamp, trigger, or log-based",
    caption:
      "Three ways to detect changes: timestamp-based (a LAST_MODIFIED column; simple, misses deletes), trigger-based (DB triggers write to an event table; full tracking, write overhead), and log-based (read the transaction log; lowest overhead, captures all CRUD, but vendor-specific).",
    diagram: (
      <Frame w={740} h={230}>
        {[
          ["timestamp", "LAST_MODIFIED", "misses deletes"],
          ["trigger", "event table", "write overhead"],
          ["log-based", "transaction log", "✓ all CRUD, low overhead"],
        ].map(([t, sub, note], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 245} y={40} w={210} h={64} text={t as string} sub={sub as string} accent={G} strong={i === 2} />
            <Label x={125 + i * 245} y={150} size={10.5} color={i === 2 ? G : "#5E6B76"}>{note as string}</Label>
          </g>
        ))}
      </Frame>
    ),
  },
  /* p167 — two snapshots */
  {
    page: 167, chapter: 4, stage: "feature", accent: G, archetype: "architecture",
    section: "Orchestration",
    term: "TWO SNAPSHOTS", title: "Cleaned for fine-tuning, embedded for RAG",
    caption:
      "The feature store keeps two snapshots: cleaned documents (for fine-tuning) and chunked + embedded documents (for RAG) — both in Qdrant, whose metadata index also acts as a NoSQL store. ZenML orchestrates the batch run for continuous training.",
    diagram: (
      <Frame w={740} h={230}>
        <LabelBox x={30} y={90} w={110} h={50} text="clean" accent={G} />
        <SnapshotGlyph x={220} y={30} w={200} h={56} accent={G} title="cleaned docs" usedFor="fine-tuning" />
        <BrandNode x={230} y={130} name="Qdrant" sub="chunks → RAG" w={190} />
        <BrandNode x={520} y={85} name="ZenML" sub="orchestrates · CT" w={190} />
        <Arrow x1={140} y1={110} x2={218} y2={65} accent={G} animated={false} />
        <Arrow x1={140} y1={115} x2={228} y2={150} accent={G} />
      </Frame>
    ),
  },
  /* p168 — Settings class */
  {
    page: 168, chapter: 4, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "Settings",
    term: "SETTINGS", title: "Pydantic Settings from .env",
    caption:
      "A global Pydantic Settings class loads variables from a .env file with type validation — embedding model id, reranking cross-encoder id, device, and Qdrant connection. Wrong types crash early, making the app deterministic.",
    diagram: (
      <Frame w={740} h={220}>
        <Code
          x={30}
          y={35}
          w={430}
          lines={[
            { t: "class Settings(BaseSettings):", hi: true },
            { t: '  TEXT_EMBEDDING_MODEL_ID = "all-MiniLM-L6-v2"', hi: false },
            { t: "  RERANKING_CROSS_ENCODER_MODEL_ID = ...", hi: false },
            { t: "  QDRANT_DATABASE_PORT: int = 6333", hi: false },
            { t: '  class Config: env_file = ".env"', hi: true },
          ]}
        />
        <DocumentGlyph x={500} y={60} w={70} h={70} accent={G} />
        <Label x={535} y={142} size={11} font={MONO}>.env</Label>
        <BrandNode x={600} y={75} name="Pydantic" w={120} />
      </Frame>
    ),
  },
  /* p169 — feature_engineering pipeline */
  {
    page: 169, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "ZenML pipeline and steps",
    term: "ZENML PIPELINE", title: "feature_engineering: 5 phases",
    caption:
      "The ZenML feature_engineering pipeline is the entry point: query the warehouse → clean → load cleaned to the vector DB, and in parallel chunk_and_embed → load embedded. Each call is a ZenML step whose output is a versioned artifact.",
    diagram: (
      <Frame w={760} h={250}>
        <LabelBox x={20} y={95} w={150} h={52} text="query_data_warehouse" accent={G} />
        <LabelBox x={200} y={95} w={130} h={52} text="clean_documents" accent={G} />
        <LabelBox x={360} y={30} w={150} h={50} text="load_to_vector_db" sub="cleaned" accent={G} />
        <LabelBox x={360} y={160} w={150} h={50} text="chunk_and_embed" accent={G} />
        <LabelBox x={550} y={160} w={170} h={50} text="load_to_vector_db" sub="embedded" accent={G} />
        <Arrow x1={170} y1={121} x2={198} y2={121} accent={G} />
        <Arrow x1={330} y1={110} x2={358} y2={60} accent={G} animated={false} />
        <Arrow x1={330} y1={130} x2={358} y2={180} accent={G} />
        <Arrow x1={510} y1={185} x2={548} y2={185} accent={G} />
      </Frame>
    ),
  },
  /* p170 — Fig 4.11/4.12 DAG */
  {
    page: 170, chapter: 4, stage: "feature", accent: G, archetype: "architecture",
    section: "ZenML pipeline and steps",
    term: "PIPELINE DAG", title: "The feature pipeline DAG (Fig 4.12)",
    caption:
      "ZenML’s dashboard shows each run and its DAG: every step’s output is auto-saved as a versioned, shareable artifact in ZenML’s artifact registry — making runs traceable and debuggable.",
    diagram: (
      <Frame w={740} h={240}>
        <LabelBox x={30} y={95} w={140} h={50} text="query_warehouse" accent={G} />
        <SnapshotGlyph x={200} y={95} w={120} h={50} accent={G} title="raw_documents" usedFor="" />
        <LabelBox x={350} y={95} w={120} h={50} text="clean" accent={G} />
        <SnapshotGlyph x={500} y={30} w={200} h={50} accent={G} title="cleaned_documents" usedFor="artifact" />
        <SnapshotGlyph x={500} y={160} w={200} h={50} accent={G} title="embedded_documents" usedFor="artifact" />
        <Arrow x1={170} y1={120} x2={198} y2={120} accent={G} animated={false} />
        <Arrow x1={320} y1={120} x2={348} y2={120} accent={G} animated={false} />
        <Arrow x1={470} y1={110} x2={498} y2={60} accent={G} animated={false} />
        <Arrow x1={470} y1={130} x2={498} y2={180} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p171 — dynamic config */
  {
    page: 171, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "ZenML pipeline and steps",
    term: "CONFIG", title: "Authors injected via YAML",
    caption:
      "The pipeline’s only parameter is author_full_names, supplied by a YAML config at runtime via with_options — so you populate the feature store with different authors without touching code (poe run-feature-engineering-pipeline).",
    diagram: (
      <Frame w={720} h={210}>
        <DocumentGlyph x={40} y={60} w={100} h={90} accent={G} />
        <Label x={90} y={165} size={11} font={MONO}>feature_eng.yaml</Label>
        <Label x={90} y={50} size={10} color="#5E6B76">Alex · Maxime · Paul</Label>
        <PipelineGlyph x={280} y={70} w={220} h={80} accent={G} />
        <Label x={390} y={110} weight={700}>feature_engineering</Label>
        <VectorDBGlyph x={580} y={60} w={100} h={100} accent={G} />
        <Arrow x1={140} y1={105} x2={278} y2={110} accent={G} />
        <Arrow x1={500} y1={110} x2={578} y2={110} accent={G} />
        <Label x={210} y={95} size={10} color="#5E6B76">with_options()</Label>
      </Frame>
    ),
  },
  /* p172 — query_data_warehouse step */
  {
    page: 172, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Querying the data warehouse",
    term: "QUERY STEP", title: "Get users, fetch all, log metadata",
    caption:
      "The @step query_data_warehouse gets-or-creates a UserDocument per author, fetches all their raw data from MongoDB, extends the documents list, and logs a descriptive metadata dict tracked in ZenML.",
    diagram: (
      <Frame w={740} h={210}>
        {["get_or_create users", "fetch all data", "log metadata"].map((t, i) => (
          <g key={t}>
            <LabelBox x={20 + i * 245} y={70} w={210} h={60} text={t} accent={G} />
            {i < 2 && <Arrow x1={230 + i * 245} y1={100} x2={265 + i * 245} y2={100} accent={G} />}
          </g>
        ))}
        <SnapshotGlyph x={530} y={150} w={180} h={48} accent={G} title="raw_documents" usedFor="" />
        <Arrow x1={615} y1={130} x2={615} y2={148} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p173 — fetch_all_data threads */
  {
    page: 173, chapter: 4, stage: "feature", accent: G, archetype: "architecture",
    section: "Querying the data warehouse",
    term: "PARALLEL I/O", title: "One thread per collection query",
    caption:
      "fetch_all_data uses a ThreadPoolExecutor to query articles, posts, and repositories in parallel. These are I/O-bound (not GIL-locked), so total time becomes the slowest single query, not the sum.",
    diagram: (
      <Frame w={740} h={240}>
        <LabelBox x={30} y={95} w={150} h={56} text="ThreadPoolExecutor" accent={G} strong />
        {["__fetch_articles", "__fetch_posts", "__fetch_repositories"].map((t, i) => (
          <g key={t}>
            <Pill x={300} y={30 + i * 62} text={t} accent={G} w={230} />
            <Arrow x1={180} y1={123} x2={296} y2={45 + i * 62} accent={G} animated={i === 0} />
            <BrandNode x={560} y={30 + i * 62 - 8} name="MongoDB" w={150} />
            <Arrow x1={530} y1={45 + i * 62} x2={558} y2={45 + i * 62} accent={G} animated={false} />
          </g>
        ))}
        <Label x={200} y={185} size={10.5} color="#5E6B76">I/O-bound → not GIL-locked</Label>
      </Frame>
    ),
  },
  /* p174 — metadata counts */
  {
    page: 174, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "Querying the data warehouse",
    term: "METADATA", title: "Count documents per category",
    caption:
      "_get_metadata counts documents per collection and lists authors, then surfaces it in the ZenML dashboard — e.g. ‘76 documents from 3 authors’ — powerful for monitoring and debugging batch pipelines.",
    diagram: (
      <Frame w={720} h={220}>
        <SnapshotGlyph x={40} y={80} w={180} h={70} accent={G} title="raw_documents" usedFor="" />
        <Boundary x={300} y={35} w={380} h={150} title="metadata" accent={G} />
        {[
          ["num_documents", "76"],
          ["articles / posts / repos", "per-collection"],
          ["authors", "3"],
        ].map(([k, v], i) => (
          <g key={i}>
            <Label x={320} y={70 + i * 42} anchor="start" size={11.5} font={MONO}>{k as string}</Label>
            <Label x={650} y={70 + i * 42} anchor="end" size={11.5} font={MONO} color={G}>{v as string}</Label>
          </g>
        ))}
        <Arrow x1={222} y1={115} x2={298} y2={110} accent={G} />
      </Frame>
    ),
  },
  /* p175 — cleaning step dispatcher */
  {
    page: 175, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Cleaning the documents",
    term: "CLEAN STEP", title: "Delegate cleaning to a dispatcher",
    caption:
      "The clean_documents @step iterates raw documents and delegates each to the CleaningDispatcher, which picks the cleaning logic by data category — keeping per-category cleaning swappable.",
    diagram: (
      <Frame w={720} h={210}>
        <SnapshotGlyph x={20} y={80} w={150} h={60} accent={G} title="raw_documents" usedFor="" />
        <DecisionGlyph x={250} y={65} w={110} h={100} accent={G} mark="by cat." />
        <Label x={305} y={180} size={11} color="#5E6B76">CleaningDispatcher</Label>
        <SnapshotGlyph x={470} y={80} w={200} h={60} accent={G} title="cleaned_documents" usedFor="" />
        <Arrow x1={170} y1={110} x2={248} y2={113} accent={G} />
        <Arrow x1={360} y1={113} x2={468} y2={110} accent={G} />
      </Frame>
    ),
  },
  /* p176 — chunk_and_embed step */
  {
    page: 176, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Chunk and embed the cleaned documents",
    term: "CHUNK + EMBED", title: "Chunk then embed in batches",
    caption:
      "The chunk_and_embed @step delegates to the ChunkingDispatcher (returns a list of chunks) then batches them through the EmbeddingDispatcher — the chunking dispatcher returns many chunks per document.",
    diagram: (
      <Frame w={740} h={210}>
        <SnapshotGlyph x={20} y={80} w={150} h={56} accent={G} title="cleaned_docs" usedFor="" />
        <LabelBox x={230} y={78} w={150} h={56} text="ChunkingDispatcher" accent={G} />
        <LabelBox x={440} y={78} w={170} h={56} text="EmbeddingDispatcher" sub="batched" accent={G} />
        <SnapshotGlyph x={640} y={80} w={90} h={56} accent={G} title="embedded" usedFor="" />
        <Arrow x1={170} y1={106} x2={228} y2={106} accent={G} />
        <Arrow x1={380} y1={106} x2={438} y2={106} accent={G} />
        <Arrow x1={610} y1={106} x2={638} y2={106} accent={G} />
      </Frame>
    ),
  },
  /* p177 — Fig 4.14 chunk metadata */
  {
    page: 177, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "Chunk and embed the cleaned documents",
    term: "CHUNK METADATA", title: "76 docs → 2,373 chunks (Fig 4.14)",
    caption:
      "The chunking/embedding step logs metadata to ZenML: e.g. 76 documents became 2,373 chunks, with article chunking properties like chunk_size 500 and chunk_overlap 50.",
    diagram: (
      <Frame w={720} h={210}>
        <Pill x={40} y={90} text="76 documents" accent={G} w={160} />
        <DecisionGlyph x={270} y={60} w={100} h={90} accent={G} mark="chunk" />
        <Pill x={460} y={90} text="2,373 chunks" accent={G} w={170} />
        <Arrow x1={200} y1={105} x2={268} y2={105} accent={G} />
        <Arrow x1={370} y1={105} x2={458} y2={105} accent={G} />
        <Label x={520} y={160} size={11} font={MONO} color="#5E6B76">chunk_size 500 · overlap 50</Label>
      </Frame>
    ),
  },
  /* p178 — Fig 4.15 embedding metadata */
  {
    page: 178, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "Chunk and embed the cleaned documents",
    term: "EMBED METADATA", title: "The embedding model, logged (Fig 4.15)",
    caption:
      "The same step’s metadata also records the embedding model and its properties — model id, embedding size, max input length — so each run is fully reproducible and auditable.",
    diagram: (
      <Frame w={720} h={220}>
        <ModelGlyph x={40} y={70} w={110} h={100} accent={G} />
        <Label x={95} y={185} size={11}>embedding model</Label>
        <Boundary x={280} y={40} w={400} h={150} title="logged metadata" accent={G} />
        {[
          ["embedding_model_id", "all-MiniLM-L6-v2"],
          ["embedding_size", "384"],
          ["max_input_length", "256"],
        ].map(([k, v], i) => (
          <g key={i}>
            <Label x={300} y={75 + i * 42} anchor="start" size={11.5} font={MONO}>{k as string}</Label>
            <Label x={660} y={75 + i * 42} anchor="end" size={11.5} font={MONO} color={G}>{v as string}</Label>
          </g>
        ))}
        <Arrow x1={150} y1={115} x2={278} y2={115} accent={G} />
      </Frame>
    ),
  },
  /* p179 — load_to_vector_db */
  {
    page: 179, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Pydantic domain entities",
    term: "LOAD STEP", title: "Group by class, bulk-insert to Qdrant",
    caption:
      "load_to_vector_db groups documents by their class (each category lives in its own Qdrant collection), then bulk-inserts each group in batches. Monitoring the ingested data via metadata can save costly debugging days.",
    diagram: (
      <Frame w={740} h={210}>
        <SnapshotGlyph x={20} y={80} w={140} h={56} accent={G} title="documents" usedFor="" />
        <DecisionGlyph x={210} y={62} w={100} h={90} accent={G} mark="group" />
        <Label x={260} y={170} size={10.5} color="#5E6B76">by class</Label>
        <LabelBox x={370} y={80} w={150} h={56} text="bulk_insert" sub="batches" accent={G} />
        <BrandNode x={560} y={82} name="Qdrant" w={160} />
        <Arrow x1={160} y1={108} x2={208} y2={108} accent={G} />
        <Arrow x1={310} y1={108} x2={368} y2={108} accent={G} />
        <Arrow x1={520} y1={108} x2={558} y2={108} accent={G} />
      </Frame>
    ),
  },
  /* p180 — category × state matrix */
  {
    page: 180, chapter: 4, stage: "feature", accent: G, archetype: "comparison",
    section: "Pydantic domain entities",
    term: "DDD ENTITIES", title: "Category × state = 9 entities",
    caption:
      "Following DDD, domain entities span two dimensions: data category (post, article, repository) × state (cleaned, chunk, embedded). A base abstract class per state, subclassed per category, yields nine Pydantic entities.",
    diagram: (
      <Frame w={720} h={250}>
        {["cleaned", "chunk", "embedded"].map((s, c) => (
          <Label key={s} x={210 + c * 165} y={40} size={12} weight={700} color={G}>{s}</Label>
        ))}
        {["post", "article", "repo"].map((cat, r) => (
          <g key={cat}>
            <Label x={120} y={85 + r * 56} anchor="end" size={12} weight={600}>{cat}</Label>
            {[0, 1, 2].map((c) => (
              <rect key={c} x={150 + c * 165} y={68 + r * 56} width={150} height={42} rx={10} fill={`${G}14`} stroke={G} strokeWidth={1.5} />
            ))}
          </g>
        ))}
        <Label x={400} y={230} size={11} color="#5E6B76">9 domain entity classes</Label>
      </Frame>
    ),
  },
  /* p181 — Fig 4.16 domain hierarchy */
  {
    page: 181, chapter: 4, stage: "feature", accent: G, archetype: "hierarchy",
    section: "Pydantic domain entities",
    term: "ENTITY HIERARCHY", title: "VectorBaseDocument tree (Fig 4.16)",
    caption:
      "All entities inherit VectorBaseDocument (the OVM). Three abstract state classes — CleanedDocument, Chunk, EmbeddedChunk — each branch into post/article/repository subclasses; new data categories plug in by inheriting.",
    diagram: (
      <Frame w={760} h={290}>
        <LabelBox x={300} y={16} w={180} h={44} text="VectorBaseDocument" sub="OVM root" accent={G} strong />
        {["CleanedDocument", "Chunk", "EmbeddedChunk"].map((t, i) => (
          <g key={t}>
            <LabelBox x={20 + i * 250} y={95} w={210} h={44} text={t} accent={G} />
            <Arrow x1={390} y1={60} x2={125 + i * 250} y2={93} accent={G} animated={false} />
            {["post", "article", "repo"].map((c, j) => (
              <Pill key={c} x={25 + i * 250 + j * 65} y={170} text={c} accent={G} w={58} />
            ))}
            <line x1={125 + i * 250} y1={139} x2={125 + i * 250} y2={165} stroke="#CBD3D8" strokeWidth={1.4} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* p182 — CleanedDocument Config */
  {
    page: 182, chapter: 4, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "Pydantic domain entities",
    term: "CONFIG", title: "Each subclass names its collection",
    caption:
      "Each cleaned subclass adds its fields and a Config inner class that sets the Qdrant collection name, the DataCategory, and use_vector_index — cleaned docs set it False since they’re stored without vectors.",
    diagram: (
      <Frame w={720} h={210}>
        <Code
          x={30}
          y={35}
          w={420}
          lines={[
            { t: "class CleanedArticleDocument(", hi: false },
            { t: "    CleanedDocument):", hi: false },
            { t: "  link: str", hi: false },
            { t: "  class Config:", hi: true },
            { t: '    name = "cleaned_articles"', hi: false },
            { t: "    use_vector_index = False", hi: true },
          ]}
        />
        <DataStoreGlyph x={500} y={60} w={110} h={100} accent={G} />
        <Label x={555} y={172} size={11} font={MONO}>cleaned_articles</Label>
        <Arrow x1={450} y1={100} x2={498} y2={105} accent={G} />
      </Frame>
    ),
  },
  /* p183 — Chunk + EmbeddedChunk + enum */
  {
    page: 183, chapter: 4, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "OVM",
    term: "STATE CLASSES", title: "Chunk and EmbeddedChunk base classes",
    caption:
      "Chunk holds content + ids + metadata; EmbeddedChunk adds the embedding vector. A DataCategory StrEnum (posts, articles, repositories) centralizes the category constants used to configure every entity.",
    diagram: (
      <Frame w={740} h={210}>
        <Code
          x={30}
          y={35}
          w={420}
          lines={[
            { t: "class Chunk(VectorBaseDocument, ABC):", hi: false },
            { t: "  content; document_id; metadata", hi: false },
            { t: "class EmbeddedChunk(...):", hi: true },
            { t: "  embedding: list[float] | None", hi: true },
          ]}
        />
        <Pill x={500} y={60} text="DataCategory" accent={G} w={180} />
        {["posts", "articles", "repositories"].map((t, i) => (
          <Label key={t} x={510} y={105 + i * 26} anchor="start" size={11} font={MONO} color="#5E6B76">{`• ${t}`}</Label>
        ))}
      </Frame>
    ),
  },
  /* p184 — OVM from_record / to_point */
  {
    page: 184, chapter: 4, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "OVM",
    term: "OVM", title: "VectorBaseDocument ↔ Qdrant",
    caption:
      "The OVM (object-vector mapping, the vector-DB analog of an ORM) maps between Pydantic models and Qdrant: from_record() builds an entity from a Qdrant Record, to_point() turns an instance into a PointStruct. Generic[T] makes subclass signatures self-typing.",
    diagram: (
      <Frame w={740} h={210}>
        <LabelBox x={40} y={75} w={170} h={64} text="VectorBaseDocument" sub="Pydantic + Generic[T]" accent={G} strong />
        <DecisionGlyph x={300} y={65} w={100} h={90} accent={G} mark="↔" />
        <Label x={350} y={45} size={11} font={MONO} color="#5E6B76">from_record()</Label>
        <Label x={350} y={170} size={11} font={MONO} color="#5E6B76">to_point()</Label>
        <BrandNode x={500} y={85} name="Qdrant" sub="PointStruct" w={180} />
        <Arrow x1={210} y1={107} x2={298} y2={107} accent={G} />
        <Arrow x1={400} y1={110} x2={498} y2={115} accent={G} />
      </Frame>
    ),
  },
  /* p185 — to_point → PointStruct */
  {
    page: 185, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "OVM",
    term: "TO POINT", title: "Instance → PointStruct → Qdrant",
    caption:
      "to_point() pops the id and embedding from the model dict, converts numpy arrays to lists, and returns a Qdrant PointStruct(id, vector, payload). bulk_insert maps each document to a point and upserts them into the collection.",
    diagram: (
      <Frame w={740} h={210}>
        <DocumentGlyph x={20} y={70} w={90} h={80} accent={G} />
        <Label x={65} y={163} size={11}>instance</Label>
        <LabelBox x={170} y={80} w={140} h={56} text="to_point()" accent={G} />
        <SnapshotGlyph x={360} y={78} w={170} h={60} accent={G} title="PointStruct" usedFor="id · vector · payload" />
        <BrandNode x={580} y={82} name="Qdrant" w={140} />
        <Arrow x1={110} y1={108} x2={168} y2={108} accent={G} />
        <Arrow x1={310} y1={108} x2={358} y2={108} accent={G} />
        <Arrow x1={530} y1={108} x2={578} y2={108} accent={G} />
      </Frame>
    ),
  },
  /* p186 — bulk_insert error handling */
  {
    page: 186, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "OVM",
    term: "RESILIENT INSERT", title: "Insert, or create the collection and retry",
    caption:
      "bulk_insert tries to upsert; on an UnexpectedResponse it creates the collection and retries once. A public method handles failures while a private _bulk_insert holds the logic. The collection name comes from each subclass’s Config.",
    diagram: (
      <Frame w={720} h={230}>
        <LabelBox x={30} y={90} w={130} h={56} text="bulk_insert" accent={G} />
        <DecisionGlyph x={230} y={65} w={100} h={90} accent={G} mark="ok?" />
        <BrandNode x={420} y={40} name="Qdrant" sub="inserted" w={150} />
        <LabelBox x={420} y={140} w={230} h={50} text="create_collection() + retry" accent={G} />
        <Arrow x1={160} y1={115} x2={228} y2={112} accent={G} />
        <Arrow x1={330} y1={100} x2={418} y2={68} accent={G} animated={false} />
        <Arrow x1={330} y1={130} x2={418} y2={160} accent={G} animated={false} />
        <Label x={360} y={95} size={10.5} color={G}>yes</Label>
        <Warn x={345} y={160} text="UnexpectedResponse" />
      </Frame>
    ),
  },
  /* p187 — bulk_find scroll */
  {
    page: 187, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "OVM",
    term: "BULK FIND", title: "Scroll records, map to entities",
    caption:
      "bulk_find scrolls (lists) records from a Qdrant collection — limit controls how many per call, offset the starting point — then maps each Record back to an entity via from_record(), returning the docs and a next_offset.",
    diagram: (
      <Frame w={740} h={210}>
        <BrandNode x={20} y={85} name="Qdrant" sub="scroll" w={150} />
        <SnapshotGlyph x={220} y={80} w={150} h={56} accent={G} title="records" usedFor="limit · offset" />
        <LabelBox x={430} y={80} w={150} h={56} text="from_record()" accent={G} />
        <SnapshotGlyph x={620} y={82} w={110} h={52} accent={G} title="entities" usedFor="" />
        <Arrow x1={170} y1={110} x2={218} y2={108} accent={G} />
        <Arrow x1={370} y1={108} x2={428} y2={108} accent={G} />
        <Arrow x1={580} y1={108} x2={618} y2={108} accent={G} />
      </Frame>
    ),
  },
  /* p188 — search() vector similarity */
  {
    page: 188, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "The dispatcher layer",
    term: "VECTOR SEARCH", title: "search(): similarity over a query vector",
    caption:
      "The search() method performs a vector similarity search: it passes a query_vector to connection.search(), then maps the returned records to entities with from_record(). A public/private split keeps error handling separate from logic.",
    diagram: (
      <Frame w={740} h={210}>
        <Pill x={20} y={90} text="query_vector" accent={G} w={150} />
        <BrandNode x={220} y={82} name="Qdrant" sub="connection.search()" w={200} />
        <LabelBox x={470} y={82} w={140} h={56} text="from_record()" accent={G} />
        <SnapshotGlyph x={640} y={84} w={90} h={52} accent={G} title="docs" usedFor="" />
        <Arrow x1={170} y1={108} x2={218} y2={108} accent={G} />
        <Arrow x1={420} y1={108} x2={468} y2={108} accent={G} />
        <Arrow x1={610} y1={110} x2={638} y2={110} accent={G} />
      </Frame>
    ),
  },
  /* p189 — dispatcher → factory → handler */
  {
    page: 189, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "The dispatcher layer",
    term: "DISPATCH", title: "Dispatcher → factory → handler",
    caption:
      "CleaningDispatcher.dispatch() reads the document’s data category, asks the CleaningHandlerFactory for the matching handler, runs handler.clean(), and returns the cleaned model. Chunking and embedding dispatchers follow the same shape.",
    diagram: (
      <Frame w={740} h={210}>
        <SnapshotGlyph x={20} y={80} w={120} h={56} accent={G} title="document" usedFor="" />
        <LabelBox x={190} y={80} w={140} h={56} text="dispatch()" sub="read category" accent={G} />
        <LabelBox x={380} y={80} w={150} h={56} text="Factory" sub="create_handler" accent={G} />
        <LabelBox x={580} y={80} w={140} h={56} text="handler.clean()" accent={G} strong />
        <Arrow x1={140} y1={108} x2={188} y2={108} accent={G} />
        <Arrow x1={330} y1={108} x2={378} y2={108} accent={G} />
        <Arrow x1={530} y1={108} x2={578} y2={108} accent={G} />
      </Frame>
    ),
  },
  /* p190 — factory create_handler */
  {
    page: 190, chapter: 4, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "The dispatcher layer",
    term: "FACTORY", title: "create_handler picks by category",
    caption:
      "CleaningHandlerFactory.create_handler maps a DataCategory to its handler (POSTS → PostCleaningHandler, etc.). This respects DRY: a new category means extending only the factory, not scattering if/else across the codebase.",
    diagram: (
      <Frame w={740} h={220}>
        <Code
          x={30}
          y={35}
          w={380}
          lines={[
            { t: "def create_handler(category):", hi: false },
            { t: "  if POSTS: PostCleaningHandler()", hi: true },
            { t: "  if ARTICLES: ArticleCleaningHandler()", hi: false },
            { t: "  if REPOS: RepositoryCleaningHandler()", hi: false },
          ]}
        />
        {["PostCleaningHandler", "ArticleCleaningHandler", "RepositoryCleaningHandler"].map((t, i) => (
          <Pill key={t} x={450} y={45 + i * 50} text={t} accent={G} w={250} />
        ))}
      </Frame>
    ),
  },
  /* p191 — factory + strategy combined */
  {
    page: 191, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "The handlers",
    term: "FACTORY + STRATEGY", title: "Decide the strategy at runtime",
    caption:
      "Because the data category is known only at runtime, the Handler interface is the strategy; the abstract factory creates the right handler for each data point; the dispatcher then executes it. Result: isolated logic, polymorphism, no if/else sprawl.",
    diagram: (
      <Frame w={720} h={230}>
        <Pill x={30} y={95} text="data point (runtime)" accent={G} w={180} />
        <LabelBox x={260} y={80} w={150} h={60} text="abstract factory" sub="create handler" accent={G} />
        <LabelBox x={460} y={80} w={150} h={60} text="strategy" sub="Handler.clean()" accent={G} strong />
        <Arrow x1={210} y1={120} x2={258} y2={110} accent={G} />
        <Arrow x1={410} y1={110} x2={458} y2={110} accent={G} />
        <Label x={360} y={185} size={11} color="#5E6B76">isolate logic · polymorphism · extendable</Label>
      </Frame>
    ),
  },
  /* p192 — Fig 4.17 handler hierarchy */
  {
    page: 192, chapter: 4, stage: "feature", accent: G, archetype: "hierarchy",
    section: "The cleaning handlers",
    term: "HANDLER TREE", title: "Nine handlers, three families (Fig 4.17)",
    caption:
      "The Handler hierarchy mirrors the domain: three families — Cleaning, Chunking, Embedding — each with post/article/repository handlers, giving nine handler classes that implement the clean/chunk/embed strategy interfaces.",
    diagram: (
      <Frame w={760} h={290}>
        <LabelBox x={310} y={16} w={140} h={42} text="Handler" accent={G} strong />
        {["Cleaning", "Chunking", "Embedding"].map((t, i) => (
          <g key={t}>
            <LabelBox x={30 + i * 250} y={95} w={200} h={44} text={`${t}Handler`} accent={G} />
            <Arrow x1={380} y1={58} x2={130 + i * 250} y2={93} accent={G} animated={false} />
            {["Post", "Article", "Repo"].map((c, j) => (
              <Pill key={c} x={35 + i * 250 + j * 62} y={170} text={c} accent={G} w={56} />
            ))}
            <line x1={130 + i * 250} y1={139} x2={130 + i * 250} y2={165} stroke="#CBD3D8" strokeWidth={1.4} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* p193 — cleaning handler interface */
  {
    page: 193, chapter: 4, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "The cleaning handlers",
    term: "CLEAN HANDLER", title: "One clean() per category",
    caption:
      "CleaningDataHandler is a generic strategy interface with an abstract clean(). PostCleaningHandler, ArticleCleaningHandler, and RepositoryCleaningHandler each turn a raw document into its CleanedDocument counterpart.",
    diagram: (
      <Frame w={740} h={210}>
        <Code
          x={30}
          y={45}
          w={360}
          lines={[
            { t: "class CleaningDataHandler(ABC):", hi: true },
            { t: "  @abstractmethod", hi: false },
            { t: "  def clean(data_model)", hi: false },
            { t: "    -> CleanedDocument", hi: false },
          ]}
        />
        {["PostCleaningHandler", "ArticleCleaningHandler", "RepositoryCleaningHandler"].map((t, i) => (
          <Pill key={t} x={430} y={50 + i * 48} text={t} accent={G} w={260} />
        ))}
      </Frame>
    ),
  },
  /* p194 — clean_text */
  {
    page: 194, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "The chunking handlers",
    term: "CLEAN TEXT", title: "All handlers share clean_text()",
    caption:
      "Each handler joins the raw content and runs clean_text() — the same normalization used to build instruction datasets (normalize ASCII, replace URLs, drop emojis). The strategy pattern makes per-category cleaning a one-line swap.",
    diagram: (
      <Frame w={720} h={220}>
        <DocumentGlyph x={30} y={75} w={100} h={90} accent={G} />
        <Label x={80} y={180} size={11}>raw content</Label>
        <LabelBox x={230} y={85} w={150} h={64} text="clean_text()" accent={G} strong />
        <SnapshotGlyph x={450} y={88} w={210} h={60} accent={G} title="cleaned content" usedFor="" />
        {["normalize ASCII", "replace URLs", "drop emojis"].map((t, i) => (
          <Label key={t} x={235} y={30 + i * 18} anchor="start" size={10} color="#5E6B76">{`• ${t}`}</Label>
        ))}
        <Arrow x1={130} y1={120} x2={228} y2={117} accent={G} />
        <Arrow x1={380} y1={117} x2={448} y2={117} accent={G} />
      </Frame>
    ),
  },
  /* p195 — chunking handler metadata */
  {
    page: 195, chapter: 4, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "The chunking handlers",
    term: "CHUNK HANDLER", title: "Chunking exposes its parameters",
    caption:
      "ChunkingDataHandler exposes a metadata property (chunk_size 500, chunk_overlap 50) logged to ZenML, plus an abstract chunk(cleaned) → list[Chunk]. Subclasses override metadata for their category (articles use min/max length).",
    diagram: (
      <Frame w={740} h={210}>
        <Code
          x={30}
          y={45}
          w={400}
          lines={[
            { t: "class ChunkingDataHandler(ABC):", hi: true },
            { t: "  metadata = {chunk_size: 500,", hi: false },
            { t: "              chunk_overlap: 50}", hi: false },
            { t: "  def chunk(cleaned) -> list[Chunk]", hi: false },
          ]}
        />
        <Pill x={470} y={70} text="chunk_size 500" accent={G} w={180} />
        <Pill x={470} y={115} text="chunk_overlap 50" accent={G} w={180} />
      </Frame>
    ),
  },
  /* p196 — article chunking + md5 id */
  {
    page: 196, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "The chunking handlers",
    term: "DEDUP", title: "Chunk id = MD5 of content",
    caption:
      "ArticleChunkingHandler splits content via chunk_article (min/max length), then builds an ArticleChunk per piece. The chunk_id is the MD5 hash of the chunk content — identical chunks get the same id, so duplicates collapse.",
    diagram: (
      <Frame w={720} h={210}>
        <SnapshotGlyph x={20} y={80} w={150} h={56} accent={G} title="cleaned article" usedFor="" />
        <LabelBox x={230} y={80} w={140} h={56} text="chunk_article()" accent={G} />
        <DecisionGlyph x={430} y={65} w={90} h={80} accent={G} mark="MD5" />
        <SnapshotGlyph x={570} y={82} w={150} h={56} accent={G} title="ArticleChunk" usedFor="dedup by id" />
        <Arrow x1={170} y1={108} x2={228} y2={108} accent={G} />
        <Arrow x1={370} y1={108} x2={428} y2={106} accent={G} />
        <Arrow x1={520} y1={106} x2={568} y2={108} accent={G} />
      </Frame>
    ),
  },
  /* p197 — chunk_article sentence grouping */
  {
    page: 197, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "The chunking handlers",
    term: "SENTENCE SPLIT", title: "Group sentences up to max_length",
    caption:
      "chunk_article uses a regex to split into sentences (avoiding abbreviations like “e.g.” or “Dr.”), then accumulates them into a chunk until max_length; once the chunk passes min_length it’s emitted.",
    diagram: (
      <Frame w={740} h={210}>
        <Pill x={20} y={90} text="text" accent={G} w={90} />
        <LabelBox x={140} y={80} w={140} h={56} text="regex split" sub="sentences" accent={G} />
        <LabelBox x={330} y={80} w={170} h={56} text="group ≤ max_length" accent={G} />
        <SnapshotGlyph x={550} y={82} w={170} h={56} accent={G} title="chunks" usedFor="≥ min_length" />
        <Arrow x1={110} y1={108} x2={138} y2={108} accent={G} />
        <Arrow x1={280} y1={108} x2={328} y2={108} accent={G} />
        <Arrow x1={500} y1={108} x2={548} y2={108} accent={G} />
      </Frame>
    ),
  },
  /* p198 — chunk_text two-step */
  {
    page: 198, chapter: 4, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "The embedding handlers",
    term: "CHUNK_TEXT", title: "Split by characters, then by tokens",
    caption:
      "The generic chunk_text is two-step: LangChain’s RecursiveCharacterTextSplitter splits on paragraphs/size, then a SentenceTransformersTokenTextSplitter re-splits to respect the embedding model’s max input length and applies chunk_overlap.",
    diagram: (
      <Frame w={740} h={210}>
        <Pill x={20} y={90} text="text" accent={G} w={80} />
        <LabelBox x={130} y={70} w={200} h={70} text="RecursiveCharacterTextSplitter" sub="LangChain · paragraphs" accent={G} />
        <LabelBox x={370} y={70} w={210} h={70} text="SentenceTransformersTokenTextSplitter" sub="respect max input + overlap" accent={G} strong />
        <SnapshotGlyph x={610} y={82} w={110} h={56} accent={G} title="chunks" usedFor="" />
        <Arrow x1={100} y1={105} x2={128} y2={105} accent={G} />
        <Arrow x1={330} y1={105} x2={368} y2={105} accent={G} />
        <Arrow x1={580} y1={108} x2={608} y2={108} accent={G} />
      </Frame>
    ),
  },
  /* p199 — embed batch for GPU */
  {
    page: 199, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "The embedding handlers",
    term: "BATCHING", title: "Batch chunks for 10× GPU throughput",
    caption:
      "EmbeddingDataHandler holds most logic in the base: embed() for a single point, embed_batch() to process many at once. Batching lets the GPU embed samples in parallel, often 10×+ faster, before map_model() maps each to an EmbeddedChunk.",
    diagram: (
      <Frame w={740} h={220}>
        {[0, 1, 2, 3].map((i) => (
          <SnapshotGlyph key={i} x={20} y={20 + i * 42} w={120} h={34} accent={G} title={`chunk ${i + 1}`} usedFor="" />
        ))}
        <LabelBox x={220} y={80} w={150} h={60} text="embed_batch()" sub="GPU parallel" accent={G} strong />
        <ModelGlyph x={430} y={70} w={100} h={90} accent={G} />
        <Label x={480} y={175} size={11}>embedding model</Label>
        <SnapshotGlyph x={580} y={85} w={150} h={56} accent={G} title="EmbeddedChunks" usedFor="" />
        {[0, 1, 2, 3].map((i) => (
          <Arrow key={i} x1={140} y1={37 + i * 42} x2={218} y2={110} accent={G} animated={i === 0} />
        ))}
        <Arrow x1={370} y1={110} x2={428} y2={112} accent={G} />
        <Arrow x1={530} y1={112} x2={578} y2={112} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p200 — map_model → EmbeddedArticleChunk */
  {
    page: 200, chapter: 4, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "The embedding handlers",
    term: "MAP MODEL", title: "map_model builds the embedded entity",
    caption:
      "Each embedding handler only implements map_model(), which packs a chunk + its embedding into the category’s embedded entity (e.g. EmbeddedArticleChunk) with metadata: embedding_model_id, embedding_size, max_input_length.",
    diagram: (
      <Frame w={740} h={210}>
        <Code
          x={30}
          y={50}
          w={380}
          lines={[
            { t: "def map_model(chunk, embedding):", hi: true },
            { t: "  return EmbeddedArticleChunk(", hi: false },
            { t: "    embedding=embedding,", hi: false },
            { t: "    metadata={model_id, size, ...})", hi: false },
          ]}
        />
        <SnapshotGlyph x={450} y={70} w={250} h={70} accent={G} title="EmbeddedArticleChunk" usedFor="→ Qdrant" />
      </Frame>
    ),
  },
  /* p201 — EmbeddingModelSingleton */
  {
    page: 201, chapter: 4, stage: "feature", accent: G, archetype: "single-concept",
    section: "The embedding handlers",
    term: "SINGLETON", title: "One embedding model, loaded once",
    caption:
      "EmbeddingModelSingleton wraps SentenceTransformer and uses the singleton pattern so the model is loaded into memory exactly once and reused everywhere. The wrapper means swapping the model is a config change, not a code change.",
    diagram: (
      <Frame w={720} h={210}>
        {["handler A", "handler B", "handler C"].map((t, i) => (
          <g key={t}>
            <Pill x={30} y={40 + i * 52} text={t} accent={G} w={150} />
            <Arrow x1={182} y1={55 + i * 52} x2={300} y2={105} accent={G} animated={i === 0} />
          </g>
        ))}
        <DecisionGlyph x={300} y={65} w={100} h={90} accent={G} mark="1×" />
        <ModelGlyph x={470} y={60} w={110} h={100} accent={G} />
        <Label x={525} y={175} size={11} weight={600}>one instance in memory</Label>
        <Arrow x1={400} y1={110} x2={468} y2={110} accent={G} />
      </Frame>
    ),
  },
  /* p202 — chapter summary */
  {
    page: 202, chapter: 4, stage: "feature", accent: G, archetype: "list-cluster",
    section: "Summary",
    term: "RECAP", title: "What the RAG feature pipeline covered",
    caption:
      "The chapter went from RAG fundamentals (embeddings, vector DBs) through advanced RAG to the LLM Twin’s batch feature pipeline — ZenML orchestration, Pydantic domain entities, a custom OVM, and factory+strategy handlers. Inference comes in Chapter 9.",
    diagram: (
      <Frame w={740} h={250}>
        <LabelBox x={290} y={100} w={160} h={56} text="RAG feature pipeline" accent={G} strong />
        {["RAG fundamentals", "embeddings + vector DB", "advanced RAG", "batch architecture", "OVM + domain entities", "factory + strategy handlers"].map((t, i) => {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const cx = 370 + Math.cos(angle) * 270;
          const cy = 128 + Math.sin(angle) * 95;
          return (
            <g key={t}>
              <Pill x={cx - 90} y={cy - 15} text={t} accent={G} w={180} />
              <line x1={370} y1={128} x2={cx} y2={cy} stroke="#ECE8DF" strokeWidth={1.4} />
            </g>
          );
        })}
      </Frame>
    ),
  },
];
