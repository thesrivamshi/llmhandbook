// Chapter 9 — RAG Inference Pipeline (pp. 346–379). The advanced RAG retrieval
// module: query expansion + self-querying (pre-retrieval), filtered vector
// search (retrieval), reranking (post-retrieval), wired into a ContextRetriever
// and an end-to-end rag() flow calling the SageMaker LLM. Stage = Inference
// (coral). Figures 9.1–9.4 redrawn. pp.380–383 are References, skipped.
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

export const CHAPTER9: PageDiagram[] = [
  /* p346 */
  {
    page: 346, chapter: 9, stage: "inference", accent: I, archetype: "architecture",
    section: "Chapter 9: RAG Inference Pipeline",
    term: "RAG INFERENCE", title: "Retrieve, augment, generate",
    caption:
      "RAG inference splits into three modules: retrieval (query the vector DB), augmentation (build the prompt), and generation (call the LLM). The book implements a retrieval module and an inference service, glued into an end-to-end RAG flow.",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["retrieve", "query vector DB"],
          ["augment", "build prompt"],
          ["generate", "call LLM"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <PipelineGlyph x={20 + i * 245} y={55} w={210} h={90} accent={I} />
            <Label x={125 + i * 245} y={92} weight={700}>{t as string}</Label>
            <Label x={125 + i * 245} y={112} size={11} color="#5E6B76">{sub as string}</Label>
            {i < 2 && <Arrow x1={230 + i * 245} y1={100} x2={265 + i * 245} y2={100} accent={I} animated={i === 0} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p347 */
  {
    page: 347, chapter: 9, stage: "inference", accent: I, archetype: "single-concept",
    section: "Understanding the LLM twin’s RAG inference pipeline",
    term: "FOCUS", title: "The retrieval step is where the magic happens",
    caption:
      "Most RAG inference code lives in the retrieval step, where you wrangle the data to fetch the most relevant chunks. Augmentation is just a prompt template; generation is a call to the fine-tuned LLM (deployed in Chapter 10).",
    diagram: (
      <Frame w={720} h={200}>
        <LabelBox x={40} y={70} w={200} h={70} text="retrieval" sub="most of the code" accent={I} strong />
        <LabelBox x={280} y={75} w={150} h={56} text="augment" sub="template" accent={I} />
        <LabelBox x={470} y={75} w={150} h={56} text="generate" sub="LLM call" accent={I} />
        <Arrow x1={240} y1={105} x2={278} y2={103} accent={I} />
        <Arrow x1={430} y1={103} x2={468} y2={103} accent={I} />
      </Frame>
    ),
  },
  /* p348 — Fig 9.1 architecture */
  {
    page: 348, chapter: 9, stage: "inference", accent: I, archetype: "architecture",
    section: "Understanding the LLM twin’s RAG inference pipeline",
    term: "ARCHITECTURE", title: "The full RAG inference flow (Fig 9.1)",
    caption:
      "Query → expansion + self-query → filtered vector search (×N) against the vector DB → collect N×K chunks → rerank to top K → build prompt → the LLM on a SageMaker endpoint generates the answer.",
    diagram: (
      <Frame w={760} h={290}>
        <UserGlyph x={20} y={110} w={70} h={70} accent={I} />
        <LabelBox x={110} y={70} w={120} h={48} text="query expansion" accent={I} />
        <LabelBox x={110} y={150} w={120} h={48} text="self-query" accent={I} />
        <VectorDBGlyph x={270} y={95} w={90} h={90} accent={I} />
        <Label x={315} y={196} size={10.5}>filtered search ×N</Label>
        <DecisionGlyph x={400} y={100} w={90} h={80} accent={I} mark="rerank" />
        <SnapshotGlyph x={520} y={110} w={120} h={56} accent={I} title="top K chunks" usedFor="" />
        <BrandNode x={650} y={30} name="AWS SageMaker" sub="LLM endpoint" w={100} />
        <LabelBox x={650} y={150} w={100} h={50} text="answer" accent={I} strong />
        <Arrow x1={90} y1={130} x2={108} y2={100} accent={I} animated={false} />
        <Arrow x1={90} y1={150} x2={108} y2={170} accent={I} animated={false} />
        <Arrow x1={230} y1={120} x2={268} y2={130} accent={I} />
        <Arrow x1={360} y1={140} x2={398} y2={140} accent={I} />
        <Arrow x1={490} y1={140} x2={518} y2={140} accent={I} />
        <Arrow x1={640} y1={120} x2={690} y2={80} accent={I} animated={false} />
        <Arrow x1={700} y1={80} x2={700} y2={148} accent={I} />
      </Frame>
    ),
  },
  /* p349 — separation */
  {
    page: 349, chapter: 9, stage: "inference", accent: I, archetype: "comparison",
    section: "Understanding the LLM twin’s RAG inference pipeline",
    term: "SEPARATION", title: "Feature pipeline vs retrieval module",
    caption:
      "The two are independent: the feature pipeline runs on a schedule on its own machine to keep the vector DB fresh; the retrieval module runs on demand on every user request, always reading the latest features.",
    diagram: (
      <Frame w={740} h={210}>
        <PipelineGlyph x={40} y={70} w={210} h={70} accent={I} />
        <Label x={145} y={98} size={12} weight={700}>feature pipeline</Label>
        <Label x={145} y={118} size={10.5} color="#5E6B76">scheduled · freshness</Label>
        <VectorDBGlyph x={330} y={60} w={90} h={90} accent={I} />
        <PipelineGlyph x={490} y={70} w={210} h={70} accent={I} />
        <Label x={595} y={98} size={12} weight={700}>retrieval module</Label>
        <Label x={595} y={118} size={10.5} color="#5E6B76">on demand · per request</Label>
        <Arrow x1={250} y1={105} x2={328} y2={105} accent={I} animated={false} />
        <Arrow x1={420} y1={105} x2={488} y2={105} accent={I} />
      </Frame>
    ),
  },
  /* p350 — three advanced categories */
  {
    page: 350, chapter: 9, stage: "inference", accent: I, archetype: "list-cluster",
    section: "Exploring the LLM twin’s advanced RAG techniques",
    term: "ADVANCED RAG", title: "Pre, retrieval, post optimizations",
    caption:
      "The retrieval module uses advanced RAG at three stages: pre-retrieval (query expansion + self-querying), retrieval (filtered vector search), and post-retrieval (reranking).",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["pre-retrieval", "expansion + self-query"],
          ["retrieval", "filtered vector search"],
          ["post-retrieval", "reranking"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 245} y={70} w={210} h={70} text={t as string} sub={sub as string} accent={I} strong={i === 1} />
            {i < 2 && <Arrow x1={230 + i * 245} y1={105} x2={265 + i * 245} y2={105} accent={I} animated={i === 0} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p351 — interfaces */
  {
    page: 351, chapter: 9, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Exploring the LLM twin’s advanced RAG techniques",
    term: "INTERFACES", title: "PromptTemplateFactory + RAGStep",
    caption:
      "Two interfaces standardize the module: PromptTemplateFactory.create_template() returns a LangChain PromptTemplate; RAGStep.generate() defines each advanced step, with a mock flag to cut LLM costs while debugging.",
    diagram: (
      <Frame w={720} h={200}>
        <Code
          x={30}
          y={40}
          w={430}
          lines={[
            { t: "class PromptTemplateFactory(ABC):", hi: true },
            { t: "  def create_template() -> PromptTemplate", hi: false },
            { t: "class RAGStep(ABC):", hi: true },
            { t: "  def __init__(mock=False)", hi: false },
            { t: "  def generate(query, ...)", hi: false },
          ]}
        />
        <BrandNode x={500} y={70} name="LangChain" sub="PromptTemplate" w={180} />
      </Frame>
    ),
  },
  /* p352 — Query entity */
  {
    page: 352, chapter: 9, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Exploring the LLM twin’s advanced RAG techniques",
    term: "QUERY ENTITY", title: "Query wraps input + metadata",
    caption:
      "Query extends the OVM VectorBaseDocument so it’s vector-DB-friendly. It holds content, author_id, author_full_name, and a metadata dict, with from_str() and replace_content() helpers.",
    diagram: (
      <Frame w={720} h={200}>
        <Code
          x={30}
          y={40}
          w={420}
          lines={[
            { t: "class Query(VectorBaseDocument):", hi: true },
            { t: "  content: str", hi: false },
            { t: "  author_id / author_full_name", hi: false },
            { t: "  metadata: dict", hi: false },
          ]}
        />
        <SnapshotGlyph x={500} y={70} w={180} h={56} accent={I} title="Query" usedFor="advanced RAG" />
      </Frame>
    ),
  },
  /* p353 — EmbeddedQuery */
  {
    page: 353, chapter: 9, stage: "inference", accent: I, archetype: "single-concept",
    section: "Query expansion",
    term: "EmbeddedQuery", title: "Query + embedding for vector search",
    caption:
      "EmbeddedQuery extends Query with an embedding vector — encapsulating everything needed to run a vector search over Qdrant (the embedding plus the self-query metadata filters).",
    diagram: (
      <Frame w={720} h={200}>
        <LabelBox x={40} y={75} w={170} h={56} text="Query" sub="content + metadata" accent={I} />
        <Label x={250} y={105} size={16} weight={700} color="#97A0A8">+</Label>
        <Pill x={310} y={90} text="embedding[ ]" accent={I} w={160} />
        <Label x={510} y={105} size={16} weight={700} color="#97A0A8">→</Label>
        <SnapshotGlyph x={560} y={78} w={150} h={56} accent={I} title="EmbeddedQuery" usedFor="" />
      </Frame>
    ),
  },
  /* p354 — query expansion concept */
  {
    page: 354, chapter: 9, stage: "inference", accent: I, archetype: "single-concept",
    section: "Query expansion",
    term: "QUERY EXPANSION", title: "One query → N perspectives",
    caption:
      "A single query covers only a small region of embedding space. Query expansion uses an LLM to generate N variations capturing different facets, so xN searches cover more relevant ground — at the cost of more searches (parallelize them).",
    diagram: (
      <Frame w={720} h={210}>
        <Pill x={30} y={95} text="original query" accent={I} w={160} />
        <ModelGlyph x={250} y={70} w={90} h={80} accent={I} />
        <Label x={295} y={165} size={11}>LLM</Label>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <Pill x={440} y={40 + i * 50} text={`query ${i + 1}`} accent={I} w={150} />
            <Arrow x1={340} y1={110} x2={438} y2={55 + i * 50} accent={I} animated={i === 0} />
          </g>
        ))}
        <Arrow x1={190} y1={110} x2={248} y2={110} accent={I} />
      </Frame>
    ),
  },
  /* p355 — QueryExpansion.generate */
  {
    page: 355, chapter: 9, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Query expansion",
    term: "generate()", title: "Mock, prompt, chain, split",
    caption:
      "QueryExpansion.generate asserts expand_to_n > 0, returns copies in mock mode, else builds a QueryExpansionTemplate, pipes it into a temperature-0 ChatOpenAI (prompt | model), and splits the response on the separator into queries.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={450}
          lines={[
            { t: "def generate(query, expand_to_n):", hi: false },
            { t: "  if self._mock: return [query]*n", hi: false },
            { t: "  chain = prompt | ChatOpenAI(temp=0)", hi: true },
            { t: "  result.split(separator)", hi: true },
          ]}
        />
        <BrandNode x={510} y={70} name="OpenAI" sub="ChatOpenAI" w={170} />
      </Frame>
    ),
  },
  /* p356 — QueryExpansionTemplate */
  {
    page: 356, chapter: 9, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Query expansion",
    term: "TEMPLATE", title: "Generate N versions, split on a token",
    caption:
      "QueryExpansionTemplate instructs the model to generate N versions of the question to overcome distance-based similarity limits, separated by a unique token (#next-question#) for easy splitting.",
    diagram: (
      <Frame w={740} h={190}>
        <Code
          x={30}
          y={40}
          w={500}
          lines={[
            { t: "Generate {expand_to_n} versions of the", hi: true },
            { t: "question, separated by {separator}.", hi: false },
            { t: 'separator = "#next-question#"', hi: true },
          ]}
        />
        <Pill x={560} y={80} text="N queries" accent={I} w={150} />
      </Frame>
    ),
  },
  /* p357 — expansion example */
  {
    page: 357, chapter: 9, stage: "inference", accent: I, archetype: "single-concept",
    section: "Self-querying",
    term: "EXAMPLE", title: "Original + two reframings",
    caption:
      "Expanding “Write an article about the best advanced RAG methods” yields variations like “What are the most effective advanced RAG methods?” and “Can you provide an overview of the top techniques?” — the first item is always the original.",
    diagram: (
      <Frame w={720} h={210}>
        <Pill x={30} y={40} text="original: best advanced RAG methods" accent={I} w={340} />
        <Pill x={30} y={95} text="most effective methods, applied?" accent={I} w={340} />
        <Pill x={30} y={150} text="overview of top techniques?" accent={I} w={340} />
        <VectorDBGlyph x={520} y={70} w={100} h={100} accent={I} />
        {[55, 110, 165].map((y, i) => (
          <Arrow key={i} x1={370} y1={y} x2={518} y2={120} accent={I} animated={i === 0} />
        ))}
      </Frame>
    ),
  },
  /* p358 — self-querying concept */
  {
    page: 358, chapter: 9, stage: "inference", accent: I, archetype: "single-concept",
    section: "Self-querying",
    term: "SELF-QUERY", title: "Extract metadata as a search filter",
    caption:
      "You can’t guarantee the embedding carries enough signal for tags/IDs. Self-querying uses an LLM to extract metadata (here, the author’s name) from the query, used as an explicit filter in the vector search.",
    diagram: (
      <Frame w={720} h={200}>
        <Pill x={30} y={90} text="“I am Paul Iusztin…”" accent={I} w={200} />
        <ModelGlyph x={290} y={70} w={90} h={80} accent={I} />
        <Label x={335} y={165} size={11}>LLM extract</Label>
        <SnapshotGlyph x={460} y={80} w={210} h={56} accent={I} title="author_id filter" usedFor="vector search" />
        <Arrow x1={230} y1={110} x2={288} y2={110} accent={I} />
        <Arrow x1={380} y1={110} x2={458} y2={108} accent={I} />
      </Frame>
    ),
  },
  /* p359 — SelfQuery.generate */
  {
    page: 359, chapter: 9, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Self-querying",
    term: "generate()", title: "Extract name → resolve user",
    caption:
      "SelfQuery.generate prompts ChatOpenAI to extract the user name; if it returns ‘none’ it keeps the query unchanged, otherwise it splits the name, get-or-creates a UserDocument, and stamps author_id + author_full_name on the query.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={450}
          lines={[
            { t: "user_full_name = chain.invoke(query)", hi: true },
            { t: 'if user_full_name == "none": return query', hi: false },
            { t: "user = UserDocument.get_or_create(...)", hi: false },
            { t: "query.author_id = user.id", hi: true },
          ]}
        />
        <BrandNode x={510} y={75} name="MongoDB" sub="users" w={170} />
      </Frame>
    ),
  },
  /* p360 — SelfQueryTemplate */
  {
    page: 360, chapter: 9, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Self-querying",
    term: "TEMPLATE", title: "Few-shot: extract name or ‘none’",
    caption:
      "SelfQueryTemplate uses few-shot examples to instruct the model to return just the user name or id (e.g. ‘Paul Iusztin’), or the token ‘none’ if the question contains neither.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={520}
          lines={[
            { t: "Extract the user name or id.", hi: true },
            { t: "Q: My name is Paul Iusztin… → Paul Iusztin", hi: false },
            { t: "Q: I want to write a post… → none", hi: false },
            { t: "Q: My user id is 1345256… → 1345256", hi: false },
          ]}
        />
      </Frame>
    ),
  },
  /* p361 — plain vector search problem */
  {
    page: 361, chapter: 9, stage: "inference", accent: I, archetype: "pitfall",
    section: "Advanced RAG retrieval optimization: filtered vector search",
    term: "PLAIN SEARCH", title: "Plain vector search is ambiguous + slow",
    caption:
      "Plain vector search ranks only by numerical proximity, so it can return semantically similar but contextually wrong results (“Java” the language vs the island) and, at scale, must scan the whole space — hurting latency.",
    diagram: (
      <Frame w={720} h={200}>
        <VectorDBGlyph x={40} y={60} w={100} h={100} accent={I} />
        <Pill x={200} y={60} text="“Java” → language" accent={I} w={200} />
        <Pill x={200} y={110} text="“Java” → island" accent={I} w={200} />
        <Warn x={460} y={75} text="contextually wrong" />
        <Warn x={460} y={130} text="scans whole space → slow" />
      </Frame>
    ),
  },
  /* p362 — filtered vector search */
  {
    page: 362, chapter: 9, stage: "inference", accent: I, archetype: "single-concept",
    section: "Advanced RAG retrieval optimization: filtered vector search",
    term: "FILTERED SEARCH", title: "Filter first, then search a smaller space",
    caption:
      "Filtered vector search applies metadata filters (e.g. author_id from self-query) before computing similarities, narrowing the pool to contextually aligned chunks — boosting both accuracy and latency.",
    diagram: (
      <Frame w={720} h={200}>
        <Pill x={30} y={90} text="author_id filter" accent={I} w={160} />
        <DecisionGlyph x={250} y={70} w={90} h={80} accent={I} mark="filter" />
        <VectorDBGlyph x={420} y={65} w={90} h={90} accent={I} />
        <Pill x={560} y={95} text="relevant subset" accent={I} w={150} />
        <Arrow x1={190} y1={110} x2={248} y2={110} accent={I} />
        <Arrow x1={340} y1={110} x2={418} y2={110} accent={I} />
        <Arrow x1={510} y1={110} x2={558} y2={110} accent={I} />
      </Frame>
    ),
  },
  /* p363 — Qdrant filter code */
  {
    page: 363, chapter: 9, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Advanced RAG post-retrieval optimization: reranking",
    term: "QDRANT FILTER", title: "FieldCondition on author_id",
    caption:
      "In Qdrant, a filter that matches author_id metadata is built from Filter(must=[FieldCondition(key='author_id', match=MatchValue(...))]) and passed to search() alongside the query vector.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={450}
          lines={[
            { t: "qdrant.search(query_vector, limit=3,", hi: false },
            { t: "  query_filter=Filter(must=[", hi: true },
            { t: '    FieldCondition(key="author_id",', hi: false },
            { t: "      match=MatchValue(...))]))", hi: false },
          ]}
        />
        <BrandNode x={510} y={75} name="Qdrant" w={150} />
      </Frame>
    ),
  },
  /* p364 — reranking flow */
  {
    page: 364, chapter: 9, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "Advanced RAG post-retrieval optimization: reranking",
    term: "RERANKING", title: "N×K chunks → rerank → top K",
    caption:
      "Reranking refines retrieval: search N×K chunks across expanded queries, score each against the original query with a cross-encoder, sort, and keep the top K — removing noise that would bloat or mislead the prompt.",
    diagram: (
      <Frame w={740} h={200}>
        <SnapshotGlyph x={20} y={75} w={150} h={56} accent={I} title="N×K chunks" usedFor="" />
        <DecisionGlyph x={230} y={60} w={100} h={90} accent={I} mark="rerank" />
        <Label x={280} y={170} size={10.5} color="#5E6B76">cross-encoder score</Label>
        <SnapshotGlyph x={420} y={75} w={130} h={56} accent={I} title="sorted" usedFor="" />
        <Pill x={590} y={90} text="top K" accent={I} w={120} />
        <Arrow x1={170} y1={103} x2={228} y2={103} accent={I} />
        <Arrow x1={330} y1={103} x2={418} y2={103} accent={I} />
        <Arrow x1={550} y1={103} x2={588} y2={103} accent={I} />
      </Frame>
    ),
  },
  /* p365 — Reranker class */
  {
    page: 365, chapter: 9, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Advanced RAG post-retrieval optimization: reranking",
    term: "Reranker", title: "Score pairs, sort, keep top K",
    caption:
      "Reranker.generate pairs the query with each chunk, scores them via a CrossEncoderModelSingleton, zips scores to chunks, sorts descending, and returns the top keep_top_k chunks.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={460}
          lines={[
            { t: "pairs = [(query, chunk) for chunk in chunks]", hi: false },
            { t: "scores = self._model(pairs)", hi: true },
            { t: "sort by score, desc", hi: false },
            { t: "return top keep_top_k", hi: true },
          ]}
        />
        <ModelGlyph x={520} y={70} w={90} h={80} accent={I} />
        <Label x={565} y={160} size={10.5}>cross-encoder</Label>
      </Frame>
    ),
  },
  /* p366 — CrossEncoderModelSingleton */
  {
    page: 366, chapter: 9, stage: "inference", accent: I, archetype: "single-concept",
    section: "Advanced RAG post-retrieval optimization: reranking",
    term: "SINGLETON", title: "One cross-encoder, loaded once",
    caption:
      "CrossEncoderModelSingleton wraps Sentence Transformers’ CrossEncoder with the singleton pattern, loading the reranking model once and exposing it to the whole app in eval mode.",
    diagram: (
      <Frame w={720} h={200}>
        <BrandNode x={40} y={85} name="Sentence Transformers" sub="CrossEncoder" w={210} />
        <DecisionGlyph x={310} y={70} w={90} h={80} accent={I} mark="1×" />
        <ModelGlyph x={470} y={65} w={100} h={90} accent={I} />
        <Label x={520} y={170} size={11}>shared instance</Label>
        <Arrow x1={250} y1={110} x2={308} y2={110} accent={I} />
        <Arrow x1={400} y1={110} x2={468} y2={110} accent={I} />
      </Frame>
    ),
  },
  /* p367 — __call__ + wrapper rationale */
  {
    page: 367, chapter: 9, stage: "inference", accent: I, archetype: "single-concept",
    section: "Implementing the LLM twin’s RAG inference pipeline",
    term: "WRAPPER", title: "A swappable scoring interface",
    caption:
      "The singleton’s __call__ scores text pairs via model.predict(). Wrapping CrossEncoder serves two ends: a single in-memory instance, and a stable interface — swap the wrapper (e.g. an API reranker) without touching the rest.",
    diagram: (
      <Frame w={720} h={200}>
        <Code
          x={30}
          y={50}
          w={380}
          lines={[
            { t: "def __call__(pairs):", hi: true },
            { t: "  return self._model.predict(pairs)", hi: false },
          ]}
        />
        <Pill x={450} y={60} text="singleton" accent={I} w={150} />
        <Pill x={450} y={110} text="swappable interface" accent={I} w={200} />
      </Frame>
    ),
  },
  /* p368 — Fig 9.2 search logic */
  {
    page: 368, chapter: 9, stage: "inference", accent: I, archetype: "architecture",
    section: "Implementing the retrieval module",
    term: "ContextRetriever", title: "search() glues every step (Fig 9.2)",
    caption:
      "ContextRetriever.search wires it all: expand + self-query the input, then per query run three filtered searches (articles, posts, repositories), each returning ≤ K/3 — so each query yields ≤ K chunks.",
    diagram: (
      <Frame w={760} h={250}>
        <Pill x={20} y={110} text="query" accent={I} w={100} />
        <LabelBox x={150} y={70} w={110} h={44} text="expansion" accent={I} />
        <LabelBox x={150} y={130} w={110} h={44} text="self-query" accent={I} />
        <VectorDBGlyph x={300} y={90} w={90} h={90} accent={I} />
        {["articles", "posts", "repos"].map((t, i) => (
          <g key={t}>
            <Pill x={430} y={45 + i * 62} text={`${t} ≤K/3`} accent={I} w={150} />
            <Arrow x1={390} y1={135} x2={428} y2={67 + i * 62} accent={I} animated={i === 0} />
          </g>
        ))}
        <DecisionGlyph x={620} y={95} w={90} h={80} accent={I} mark="rerank" />
        <Arrow x1={120} y1={130} x2={148} y2={100} accent={I} animated={false} />
        <Arrow x1={120} y1={140} x2={148} y2={152} accent={I} animated={false} />
        <Arrow x1={260} y1={130} x2={298} y2={135} accent={I} />
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={580} y1={60 + i * 62} x2={628} y2={130} accent={I} animated={false} />
        ))}
      </Frame>
    ),
  },
  /* p369 — search per category */
  {
    page: 369, chapter: 9, stage: "inference", accent: I, archetype: "single-concept",
    section: "Implementing the retrieval module",
    term: "PER CATEGORY", title: "Three searches per query, ≤ K total",
    caption:
      "For each of N queries, the module searches all three data categories for ≤ K/3 items each — using the self-query author filter — summing to ≤ K chunks per query (fewer if a category/author lacks matches).",
    diagram: (
      <Frame w={720} h={210}>
        <Pill x={30} y={90} text="1 query" accent={I} w={130} />
        {["K/3 articles", "K/3 posts", "K/3 repos"].map((t, i) => (
          <g key={t}>
            <Pill x={300} y={40 + i * 50} text={t} accent={I} w={180} />
            <Arrow x1={160} y1={110} x2={298} y2={55 + i * 50} accent={I} animated={i === 0} />
          </g>
        ))}
        <Pill x={540} y={90} text="≤ K chunks" accent={I} w={150} />
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={480} y1={55 + i * 50} x2={538} y2={110} accent={I} animated={false} />
        ))}
      </Frame>
    ),
  },
  /* p370 — Fig 9.3 process results */
  {
    page: 370, chapter: 9, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "Implementing the retrieval module",
    term: "PROCESS RESULTS", title: "Aggregate → dedup → rerank → top K (Fig 9.3)",
    caption:
      "The N searches yield ≤ N×K chunks aggregated into one list; overlaps are deduplicated; the rerank model orders them; the top K most relevant chunks become the RAG context.",
    diagram: (
      <Frame w={740} h={190}>
        {["≤ N×K", "dedup", "rerank", "top K"].map((t, i) => (
          <g key={t}>
            <LabelBox x={20 + i * 180} y={70} w={150} h={56} text={t} accent={I} strong={i === 3} />
            {i < 3 && <Arrow x1={170 + i * 180} y1={98} x2={198 + i * 180} y2={98} accent={I} animated={i === 0} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p371 — thread pool */
  {
    page: 371, chapter: 9, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Implementing the retrieval module",
    term: "PARALLEL", title: "Thread-pool the expanded searches",
    caption:
      "search() runs all expanded queries concurrently via a ThreadPoolExecutor, flattens the per-query results, deduplicates with set(), then reranks to keep the top k documents.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={460}
          lines={[
            { t: "with ThreadPoolExecutor() as ex:", hi: true },
            { t: "  submit(_search, q, k) for q in queries", hi: false },
            { t: "flatten + list(set(...))   # dedup", hi: true },
            { t: "rerank(query, chunks, keep_top_k=k)", hi: false },
          ]}
        />
        <Pill x={510} y={85} text="parallel" accent={I} w={150} />
      </Frame>
    ),
  },
  /* p372 — _search filter */
  {
    page: 372, chapter: 9, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Implementing the retrieval module",
    term: "_search", title: "Embed, then filter by author_id",
    caption:
      "_search dispatches the query through the SAME EmbeddingDispatcher used at ingestion (so query and chunks share an embedding model), then searches each category with an optional author_id Qdrant filter.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={450}
          lines={[
            { t: "embedded = EmbeddingDispatcher.dispatch(q)", hi: true },
            { t: "if author_id: query_filter = Filter(...)", hi: false },
            { t: "odm.search(embedded.embedding,", hi: false },
            { t: "  limit=k//3, query_filter=...)", hi: false },
          ]}
        />
        <BrandNode x={510} y={75} name="Qdrant" w={150} />
      </Frame>
    ),
  },
  /* p373 — combine + rerank */
  {
    page: 373, chapter: 9, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "Implementing the retrieval module",
    term: "COMBINE", title: "Post + article + repo → rerank",
    caption:
      "Each category’s chunks are concatenated into retrieved_chunks; rerank() then converts a string query to a Query if needed and calls the Reranker to keep the top K.",
    diagram: (
      <Frame w={740} h={200}>
        {["posts", "articles", "repos"].map((t, i) => (
          <Pill key={t} x={30} y={40 + i * 50} text={t} accent={I} w={130} />
        ))}
        <DecisionGlyph x={250} y={70} w={90} h={80} accent={I} mark="⊕" />
        <LabelBox x={400} y={85} w={130} h={50} text="rerank" accent={I} strong />
        <Pill x={580} y={95} text="top K" accent={I} w={120} />
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={160} y1={55 + i * 50} x2={248} y2={110} accent={I} animated={i === 0} />
        ))}
        <Arrow x1={340} y1={110} x2={398} y2={110} accent={I} />
        <Arrow x1={530} y1={110} x2={578} y2={110} accent={I} />
      </Frame>
    ),
  },
  /* p374 — usage */
  {
    page: 374, chapter: 9, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Implementing the retrieval module",
    term: "USAGE", title: "Whole advanced RAG in one call",
    caption:
      "All the advanced techniques collapse into one call: ContextRetriever(mock=False).search(query, k=3) returns the ranked context documents.",
    diagram: (
      <Frame w={720} h={180}>
        <Code
          x={30}
          y={45}
          w={460}
          lines={[
            { t: "retriever = ContextRetriever(mock=False)", hi: false },
            { t: "documents = retriever.search(query, k=3)", hi: true },
          ]}
        />
        <SnapshotGlyph x={520} y={65} w={180} h={56} accent={I} title="ranked context" usedFor="" />
      </Frame>
    ),
  },
  /* p375 — retrieved + metadata */
  {
    page: 375, chapter: 9, stage: "inference", accent: I, archetype: "single-concept",
    section: "Bringing everything together into the RAG inference pipeline",
    term: "REFERENCES", title: "Chunks carry rich metadata",
    caption:
      "Each retrieved chunk comes with metadata — embedding model, document id, author, and the source link — which can be surfaced as references in the answer, increasing trust in the result.",
    diagram: (
      <Frame w={720} h={200}>
        <SnapshotGlyph x={40} y={80} w={170} h={70} accent={I} title="chunk" usedFor="" />
        <Boundary x={290} y={45} w={400} h={130} title="metadata" accent={I} />
        {["embedding_model_id", "author_full_name", "source link"].map((t, i) => (
          <Label key={t} x={310} y={80 + i * 34} anchor="start" size={11.5} font={MONO} color="#5E6B76">{`• ${t}`}</Label>
        ))}
        <Arrow x1={210} y1={115} x2={288} y2={110} accent={I} />
      </Frame>
    ),
  },
  /* p376 — rag() + prompt */
  {
    page: 376, chapter: 9, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "Bringing everything together into the RAG inference pipeline",
    term: "rag()", title: "Retrieve → context → LLM",
    caption:
      "The rag() function is five lines: retrieve documents, map them to a context string, build the content-creator prompt (query + context), and call_llm_service hits the SageMaker LLM endpoint for the answer.",
    diagram: (
      <Frame w={740} h={200}>
        <LabelBox x={20} y={80} w={130} h={50} text="retrieve" accent={I} />
        <LabelBox x={190} y={80} w={130} h={50} text="→ context" accent={I} />
        <LabelBox x={360} y={80} w={130} h={50} text="build prompt" accent={I} />
        <BrandNode x={540} y={82} name="AWS SageMaker" sub="LLM" w={160} />
        <Arrow x1={150} y1={105} x2={188} y2={105} accent={I} />
        <Arrow x1={320} y1={105} x2={358} y2={105} accent={I} />
        <Arrow x1={490} y1={105} x2={538} y2={105} accent={I} />
      </Frame>
    ),
  },
  /* p377 — Fig 9.4 memory */
  {
    page: 377, chapter: 9, stage: "inference", accent: I, archetype: "comparison",
    section: "Bringing everything together into the RAG inference pipeline",
    term: "MEMORY", title: "Latest K vs summary + latest K (Fig 9.4)",
    caption:
      "Adding conversation memory lets the chatbot see history. To bound it: Option 1 keeps only the latest K turns (loses older context); Option 2 keeps a running summary plus the latest K turns.",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={40} y={70} w={250} h={70} text="Option 1" sub="latest K turns" accent={I} />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={70} w={260} h={70} text="Option 2" sub="summary + latest K" accent={I} strong />
      </Frame>
    ),
  },
  /* p378 — router */
  {
    page: 378, chapter: 9, stage: "inference", accent: I, archetype: "architecture",
    section: "Bringing everything together into the RAG inference pipeline",
    term: "ROUTER", title: "Route to the right collections + hybrid search",
    caption:
      "A router (multi-category classifier) predicts which collections a query needs, cutting three searches to one or two. Hybrid search additionally blends vector search with BM25 keyword search (normalized + merged) for exact-term accuracy.",
    diagram: (
      <Frame w={720} h={210}>
        <Pill x={30} y={90} text="query" accent={I} w={110} />
        <DecisionGlyph x={200} y={70} w={100} h={90} accent={I} mark="route" />
        {["articles", "repos"].map((t, i) => (
          <g key={t}>
            <Pill x={400} y={60 + i * 70} text={t} accent={I} w={150} />
            <Arrow x1={300} y1={115} x2={398} y2={75 + i * 70} accent={I} animated={i === 0} />
          </g>
        ))}
        <Arrow x1={140} y1={113} x2={198} y2={113} accent={I} />
        <Label x={500} y={185} size={10.5} color="#5E6B76">+ hybrid: vector ⊕ BM25</Label>
      </Frame>
    ),
  },
  /* p379 — multi-index */
  {
    page: 379, chapter: 9, stage: "inference", accent: I, archetype: "single-concept",
    section: "Bringing everything together into the RAG inference pipeline",
    term: "MULTI-INDEX", title: "Index more than just content",
    caption:
      "Multi-index vector structures combine several fields — e.g. content + platform + publish date — instead of content alone, improving accuracy. Superlinked makes defining such multi-field indexes a few lines.",
    diagram: (
      <Frame w={720} h={200}>
        {["content", "platform", "date"].map((t, i) => (
          <Pill key={t} x={30 + i * 165} y={50} text={t} accent={I} w={150} />
        ))}
        <DecisionGlyph x={250} y={110} w={90} h={70} accent={I} mark="⊕" />
        <BrandNode x={430} y={120} name="Superlinked" sub="multi-index" w={210} />
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={105 + i * 165} y1={80} x2={295} y2={120} accent={I} animated={i === 0} />
        ))}
        <Arrow x1={340} y1={145} x2={428} y2={145} accent={I} />
      </Frame>
    ),
  },
];
