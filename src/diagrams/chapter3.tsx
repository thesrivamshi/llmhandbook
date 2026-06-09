// Chapter 3 — Data Engineering (pp. 84–124). The data collection ETL: crawl
// Medium/Substack/GitHub/LinkedIn → standardize → MongoDB warehouse, all
// orchestrated by ZenML, with a dispatcher + crawler hierarchy and a custom ODM.
// Stage = Feature / Data (green). Figures 3.1–3.7 are redrawn as schematics:
// 3.2 (sources→crawlers→categories→warehouse) and 3.4 (the dispatcher) are the
// two architecture figures; the rest are dashboard/UI shots redrawn as meaning.
// pp.125–127 are References (non-content) and are skipped.
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
        <text key={i} x={x + 14} y={y + 16 + i * lh} fontFamily={MONO} fontSize={size} fill={l.hi ? G : "#25313C"} fontWeight={l.hi ? 700 : 500}>
          {l.t}
        </text>
      ))}
    </g>
  );
};

export const CHAPTER3: PageDiagram[] = [
  /* p84 — chapter intro: ETL crawls platforms → MongoDB */
  {
    page: 84, chapter: 3, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Chapter 3: Data Engineering",
    term: "DATA ENGINEERING", title: "Crawl the web into a warehouse",
    caption:
      "The chapter builds an ETL pipeline that crawls social platforms (Medium, Substack, GitHub), standardizes the data, and loads it into a MongoDB data warehouse — the raw data behind every later LLM use case.",
    diagram: (
      <Frame w={720} h={250}>
        {["Medium", "Substack", "GitHub"].map((t, i) => (
          <Pill key={t} x={20} y={55 + i * 55} text={t} accent={G} w={130} />
        ))}
        <PipelineGlyph x={250} y={75} w={180} h={100} accent={G} />
        <Label x={340} y={125} weight={700}>ETL pipeline</Label>
        <BrandNode x={520} y={100} name="MongoDB" sub="data warehouse" w={190} />
        {[55, 110, 165].map((y, i) => (
          <Arrow key={i} x1={152} y1={y + 15} x2={248} y2={125} accent={G} animated={i === 0} />
        ))}
        <Arrow x1={430} y1={125} x2={518} y2={125} accent={G} />
      </Frame>
    ),
  },
  /* p85 — ETL = Extract, Transform, Load */
  {
    page: 85, chapter: 3, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Designing the LLM Twin’s data collection pipeline",
    term: "ETL", title: "Extract → Transform → Load",
    caption:
      "An ETL pipeline has three steps: extract raw data by crawling sources, transform it by cleaning and standardizing to a consistent format, and load it into the MongoDB NoSQL warehouse.",
    diagram: (
      <Frame w={740} h={220}>
        {[
          ["Extract", "crawl sources"],
          ["Transform", "clean · standardize"],
          ["Load", "→ MongoDB"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <PipelineGlyph x={20 + i * 245} y={50} w={210} h={100} accent={G} />
            <Label x={125 + i * 245} y={92} weight={700}>{t as string}</Label>
            <Label x={125 + i * 245} y={112} size={11} color="#5E6B76">{sub as string}</Label>
            {i < 2 && <Arrow x1={230 + i * 245} y1={100} x2={265 + i * 245} y2={100} accent={G} />}
          </g>
        ))}
      </Frame>
    ),
  },
  /* p86 — Fig 3.1 ETL architecture */
  {
    page: 86, chapter: 3, stage: "feature", accent: G, archetype: "architecture",
    section: "Designing the LLM Twin’s data collection pipeline",
    term: "ETL ARCHITECTURE", title: "User + links in, raw docs out (Fig 3.1)",
    caption:
      "The pipeline takes a user and a list of links, crawls each link individually, standardizes the content, and saves it under that author in MongoDB.",
    diagram: (
      <Frame w={740} h={250}>
        <UserGlyph x={20} y={40} w={90} h={90} accent={G} />
        <Label x={65} y={145} size={11}>user</Label>
        {["link", "link", "link"].map((t, i) => (
          <Pill key={i} x={20} y={150 + i * 0} text="links[ ]" accent={G} w={90} />
        )).slice(0, 1)}
        <PipelineGlyph x={210} y={55} w={180} h={110} accent={G} />
        <Label x={300} y={100} weight={700}>crawl each link</Label>
        <Label x={300} y={120} size={11} color="#5E6B76">standardize</Label>
        <BrandNode x={490} y={85} name="MongoDB" sub="saved under author" w={210} />
        <Arrow x1={112} y1={95} x2={208} y2={100} accent={G} />
        <Arrow x1={112} y1={165} x2={208} y2={130} accent={G} animated={false} />
        <Arrow x1={390} y1={110} x2={488} y2={110} accent={G} />
      </Frame>
    ),
  },
  /* p87 — Fig 3.2 sources → crawlers → categories → warehouse */
  {
    page: 87, chapter: 3, stage: "feature", accent: G, archetype: "architecture",
    section: "Designing the LLM Twin’s data collection pipeline",
    term: "CRAWLERS ↔ CATEGORIES", title: "Four crawlers, three categories (Fig 3.2)",
    caption:
      "Every source maps through a crawler to one of three data categories — article, repository, or post — each its own MongoDB collection. Reducing to three categories lets new sources be added with just a new crawler.",
    diagram: (
      <Frame w={760} h={360}>
        <Label x={70} y={20} size={11} weight={700} color={G}>SOURCES</Label>
        {["Medium", "Substack", "GitHub", "LinkedIn"].map((t, i) => (
          <Pill key={t} x={20} y={36 + i * 52} text={t} accent={G} w={120} />
        ))}
        <Label x={300} y={20} size={11} weight={700} color={G}>CRAWLERS</Label>
        {["Medium", "Custom Article", "GitHub", "LinkedIn"].map((t, i) => (
          <LabelBox key={t} x={210} y={36 + i * 52} w={170} h={40} text={t} accent={G} />
        ))}
        <Label x={520} y={20} size={11} weight={700} color={G}>CATEGORIES</Label>
        {[["Article", 60], ["Repository", 140], ["Post", 220]].map(([t, y], i) => (
          <g key={i}>
            <DocumentGlyph x={460} y={y as number} w={56} h={56} accent={G} />
            <Label x={540} y={(y as number) + 28} anchor="start" size={12} weight={600}>{t as string}</Label>
          </g>
        ))}
        <BrandNode x={560} y={300} name="MongoDB" sub="warehouse" w={180} />
        {/* sources → crawlers */}
        {[0, 1, 2, 3].map((i) => (
          <Arrow key={i} x1={140} y1={56 + i * 52} x2={208} y2={56 + i * 52} accent={G} animated={false} />
        ))}
        {/* crawlers → categories: Medium+Custom→Article, GitHub→Repo, LinkedIn→Post */}
        <Arrow x1={380} y1={56} x2={458} y2={88} accent={G} animated={false} />
        <Arrow x1={380} y1={108} x2={458} y2={92} accent={G} animated={false} />
        <Arrow x1={380} y1={160} x2={458} y2={168} accent={G} animated={false} />
        <Arrow x1={380} y1={212} x2={458} y2={248} accent={G} animated={false} />
        {/* categories → warehouse */}
        {[88, 168, 248].map((y, i) => (
          <Arrow key={i} x1={516} y1={y} x2={620} y2={300} accent={G} animated={i === 0} />
        ))}
      </Frame>
    ),
  },
  /* p88 — four crawlers → document outputs */
  {
    page: 88, chapter: 3, stage: "feature", accent: G, archetype: "list-cluster",
    section: "Designing the LLM Twin’s data collection pipeline",
    term: "FOUR CRAWLERS", title: "What each crawler outputs",
    caption:
      "Medium and the Custom Article crawler emit article documents; the Custom Article crawler is the fallback for unknown domains. GitHub emits a repository document; LinkedIn emits post documents.",
    diagram: (
      <Frame w={740} h={300}>
        {[
          ["Medium crawler", "login + HTML", "Article", 30],
          ["Custom Article", "fallback · any site", "Article", 110],
          ["GitHub crawler", "git clone", "Repository", 190],
          ["LinkedIn crawler", "feed posts", "Post", 270],
        ].map(([n, sub, out, y], i) => (
          <g key={i}>
            <LabelBox x={20} y={(y as number) - 18} w={220} h={42} text={n as string} sub={sub as string} accent={G} />
            <Arrow x1={240} y1={(y as number) + 3} x2={420} y2={(y as number) + 3} accent={G} animated={i === 0} />
            <DocumentGlyph x={430} y={(y as number) - 22} w={44} h={44} accent={G} />
            <Label x={490} y={(y as number) + 3} anchor="start" size={12} weight={600}>{`${out} document`}</Label>
          </g>
        ))}
      </Frame>
    ),
  },
  /* p89 — ETL ↔ feature pipeline via MongoDB */
  {
    page: 89, chapter: 3, stage: "feature", accent: G, archetype: "architecture",
    section: "Designing the LLM Twin’s data collection pipeline",
    term: "DECOUPLING", title: "ETL and feature pipeline meet at MongoDB",
    caption:
      "The two pipelines are independent and talk only through MongoDB: the ETL writes raw data; the feature pipeline reads it on its own schedule, processes it, and stores features in Qdrant. (Big data → Snowflake/BigQuery instead.)",
    diagram: (
      <Frame w={760} h={250}>
        <PipelineGlyph x={20} y={90} w={150} h={80} accent={G} />
        <Label x={95} y={130} size={12} weight={700}>ETL</Label>
        <Label x={95} y={148} size={10.5} color="#5E6B76">write</Label>
        <BrandNode x={250} y={100} name="MongoDB" sub="shared warehouse" w={200} />
        <PipelineGlyph x={520} y={40} w={150} h={70} accent={G} />
        <Label x={595} y={75} size={12} weight={700}>feature pipeline</Label>
        <BrandNode x={520} y={150} name="Qdrant" sub="features · RAG" w={190} />
        <Arrow x1={170} y1={130} x2={248} y2={135} accent={G} />
        <Arrow x1={452} y1={120} x2={518} y2={85} accent={G} animated={false} />
        <Arrow x1={595} y1={110} x2={595} y2={148} accent={G} animated={false} />
        <Label x={360} y={210} size={11} color="#5E6B76">independent schedules · communicate only via MongoDB</Label>
      </Frame>
    ),
  },
  /* p90 — ZenML digital_data_etl pipeline */
  {
    page: 90, chapter: 3, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "ZenML pipeline and steps",
    term: "ZENML PIPELINE", title: "digital_data_etl: two steps",
    caption:
      "The entry point is the ZenML digital_data_etl pipeline: it gets or creates the user, then crawls every link under that author — the same pipeline introduced in Chapter 2, now seen in full.",
    diagram: (
      <Frame w={740} h={230}>
        <Code
          x={30}
          y={35}
          w={420}
          lines={[
            { t: "@pipeline", hi: true },
            { t: "def digital_data_etl(", hi: false },
            { t: "    user_full_name, links):", hi: false },
            { t: "  user = get_or_create_user(name)", hi: false },
            { t: "  crawl_links(user=user, links=links)", hi: false },
          ]}
        />
        <LabelBox x={500} y={50} w={200} h={48} text="get_or_create_user" accent={G} />
        <LabelBox x={500} y={120} w={200} h={48} text="crawl_links" accent={G} />
        <Arrow x1={500} y1={74} x2={470} y2={100} accent={G} animated={false} />
        <Arrow x1={500} y1={144} x2={470} y2={120} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p91 — get_or_create_user → UserDocument artifact */
  {
    page: 91, chapter: 3, stage: "feature", accent: G, archetype: "single-concept",
    section: "ZenML pipeline and steps",
    term: "STEP 1", title: "get_or_create_user (Fig 3.3)",
    caption:
      "The first step takes a full name and returns a UserDocument — retrieving the existing user from MongoDB or creating a new one — emitted as the typed “user” ZenML artifact.",
    diagram: (
      <Frame w={720} h={220}>
        <Label x={90} y={60} size={11.5} font={MONO}>user_full_name</Label>
        <LabelBox x={40} y={75} w={150} h={56} text="get_or_create_user" accent={G} />
        <BrandNode x={270} y={80} name="MongoDB" sub="users" w={170} />
        <SnapshotGlyph x={500} y={70} w={200} h={70} accent={G} title="user" usedFor="artifact" />
        <Arrow x1={190} y1={103} x2={268} y2={105} accent={G} />
        <Arrow x1={442} y1={105} x2={498} y2={105} accent={G} />
      </Frame>
    ),
  },
  /* p92 — get_or_create_user logic + metadata */
  {
    page: 92, chapter: 3, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "ZenML pipeline and steps",
    term: "STEP LOGIC", title: "Split name, get-or-create, tag metadata",
    caption:
      "A utility splits the full name; get_or_create looks up or inserts the user in MongoDB; then add_output_metadata attaches the query and retrieved user to the artifact for traceability.",
    diagram: (
      <Frame w={740} h={230}>
        {[
          ["split name", "first / last"],
          ["get_or_create", "MongoDB"],
          ["+ metadata", "query · retrieved"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 240} y={70} w={190} h={60} text={t as string} sub={sub as string} accent={G} />
            {i < 2 && <Arrow x1={210 + i * 240} y1={100} x2={258 + i * 240} y2={100} accent={G} />}
          </g>
        ))}
        <SnapshotGlyph x={520} y={150} w={190} h={56} accent={G} title="user artifact" usedFor="" />
        <Arrow x1={615} y1={130} x2={615} y2={148} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p93 — crawl_links builder chain */
  {
    page: 93, chapter: 3, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "ZenML pipeline and steps",
    term: "STEP 2", title: "crawl_links builds the dispatcher",
    caption:
      "The crawl_links step builds a CrawlerDispatcher by chaining register_linkedin().register_medium().register_github(), then iterates the links, crawling each and accumulating per-domain metadata.",
    diagram: (
      <Frame w={740} h={230}>
        <Code
          x={30}
          y={45}
          w={470}
          lines={[
            { t: "@step", hi: true },
            { t: "def crawl_links(user, links):", hi: false },
            { t: "  dispatcher = CrawlerDispatcher.build()", hi: false },
            { t: "    .register_linkedin()", hi: true },
            { t: "    .register_medium().register_github()", hi: true },
            { t: "  for link in tqdm(links): _crawl_link(...)", hi: false },
          ]}
        />
        <DecisionGlyph x={540} y={70} w={120} h={110} accent={G} mark="↳" />
        <Label x={600} y={200} size={11} color="#5E6B76">builder pattern</Label>
      </Frame>
    ),
  },
  /* p94 — _crawl_link helper */
  {
    page: 94, chapter: 3, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "ZenML pipeline and steps",
    term: "_crawl_link", title: "Pick crawler, extract, record",
    caption:
      "For each link, _crawl_link asks the dispatcher for the right crawler, calls its extract(), and returns (success, domain); a helper folds that into the run’s metadata of totals and successes per domain.",
    diagram: (
      <Frame w={740} h={230}>
        <Pill x={20} y={95} text="link" accent={G} w={90} />
        <DecisionGlyph x={150} y={60} w={100} h={100} accent={G} mark="get" />
        <Label x={200} y={175} size={10.5} color="#5E6B76">get_crawler</Label>
        <LabelBox x={300} y={82} w={150} h={56} text="crawler.extract()" accent={G} />
        <SnapshotGlyph x={510} y={50} w={200} h={60} accent={G} title="(success, domain)" usedFor="" />
        <Pill x={520} y={140} text="metadata: totals" accent={G} w={180} />
        <Arrow x1={110} y1={110} x2={148} y2={110} accent={G} />
        <Arrow x1={250} y1={110} x2={298} y2={110} accent={G} />
        <Arrow x1={450} y1={100} x2={508} y2={80} accent={G} animated={false} />
        <Arrow x1={450} y1={115} x2={518} y2={150} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p95 — Fig 3.4 the dispatcher */
  {
    page: 95, chapter: 3, stage: "feature", accent: G, archetype: "architecture",
    section: "The dispatcher: How do you instantiate the right crawler?",
    term: "DISPATCHER", title: "One dispatcher routes by domain (Fig 3.4)",
    caption:
      "The CrawlerDispatcher is the intermediate layer between links and crawlers: it reads each URL’s domain and instantiates the matching crawler — e.g. medium.com → MediumCrawler.",
    diagram: (
      <Frame w={760} h={300}>
        {["medium.com", "substack.com", "github.com", "linkedin.com"].map((t, i) => (
          <Label key={t} x={20} y={50 + i * 40} anchor="start" size={11.5} font={MONO} color="#5E6B76">{t}</Label>
        ))}
        <Pill x={20} y={200} text="all links" accent={G} w={120} />
        <DecisionGlyph x={300} y={90} w={130} h={130} accent={G} mark="DISPATCH" />
        <Label x={365} y={235} size={11} weight={600} color={G}>CrawlerDispatcher</Label>
        {["MediumCrawler", "CustomArticleCrawler", "GitHubCrawler", "LinkedInCrawler"].map((t, i) => (
          <g key={t}>
            <LabelBox x={540} y={30 + i * 62} w={200} h={44} text={t} accent={G} />
            <Arrow x1={432} y1={155} x2={536} y2={52 + i * 62} accent={G} animated={i === 0} />
          </g>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <Arrow key={i} x1={150} y1={50 + i * 40} x2={298} y2={150} accent={G} animated={false} />
        ))}
      </Frame>
    ),
  },
  /* p96 — builder pattern code */
  {
    page: 96, chapter: 3, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "The dispatcher: How do you instantiate the right crawler?",
    term: "BUILDER PATTERN", title: "build() returns a configurable dispatcher",
    caption:
      "The dispatcher uses the builder creational pattern: a build() class method returns an instance whose register_*() methods each return self, so registrations can be chained fluently.",
    diagram: (
      <Frame w={720} h={220}>
        <Code
          x={30}
          y={40}
          w={460}
          lines={[
            { t: "class CrawlerDispatcher:", hi: false },
            { t: "  def __init__(self): self._crawlers = {}", hi: false },
            { t: "  @classmethod", hi: true },
            { t: "  def build(cls): return cls()", hi: false },
            { t: "  def register_medium(self):", hi: false },
            { t: "    ...; return self   # chainable", hi: true },
          ]}
        />
        <Pill x={520} y={100} text="returns self →" accent={G} w={170} />
      </Frame>
    ),
  },
  /* p97 — register / get_crawler matching + default */
  {
    page: 97, chapter: 3, stage: "feature", accent: G, archetype: "single-concept",
    section: "The dispatcher: How do you instantiate the right crawler?",
    term: "DOMAIN MATCH", title: "Match URL to crawler, else default",
    caption:
      "register() normalizes each domain into a regex key in the registry; get_crawler() matches a URL against those patterns and returns the crawler, defaulting to CustomArticleCrawler when nothing matches.",
    diagram: (
      <Frame w={740} h={230}>
        <Pill x={20} y={95} text="url" accent={G} w={90} />
        <DecisionGlyph x={170} y={60} w={120} h={110} accent={G} mark="regex" />
        <Label x={230} y={185} size={10.5} color="#5E6B76">match registry</Label>
        <LabelBox x={360} y={45} w={180} h={48} text="matched crawler" accent={G} strong />
        <LabelBox x={360} y={135} w={220} h={48} text="CustomArticleCrawler" sub="default fallback" accent={G} />
        <Arrow x1={110} y1={110} x2={168} y2={113} accent={G} />
        <Arrow x1={290} y1={100} x2={358} y2={69} accent={G} animated={false} />
        <Arrow x1={290} y1={130} x2={358} y2={159} accent={G} animated={false} />
        <Label x={300} y={95} size={10.5} color={G}>match</Label>
        <Label x={300} y={150} size={10.5} color="#97A0A8">no match</Label>
      </Frame>
    ),
  },
  /* p98 — BaseCrawler hierarchy */
  {
    page: 98, chapter: 3, stage: "feature", accent: G, archetype: "hierarchy",
    section: "Base classes",
    term: "BASE CLASSES", title: "One interface, many crawlers",
    caption:
      "Every crawler implements the same extract(link) interface, so the dispatcher can use them polymorphically. BaseCrawler is the abstract root; BaseSeleniumCrawler adds browser automation for login-gated sites.",
    diagram: (
      <Frame w={740} h={290}>
        <LabelBox x={280} y={20} w={180} h={50} text="BaseCrawler" sub="abstract · extract()" accent={G} strong />
        <LabelBox x={30} y={130} w={170} h={48} text="GitHubCrawler" accent={G} />
        <LabelBox x={230} y={130} w={190} h={48} text="CustomArticleCrawler" accent={G} />
        <LabelBox x={460} y={130} w={210} h={50} text="BaseSeleniumCrawler" sub="browser automation" accent={G} />
        <LabelBox x={460} y={220} w={100} h={44} text="Medium" accent={G} />
        <LabelBox x={575} y={220} w={100} h={44} text="LinkedIn" accent={G} />
        <Arrow x1={330} y1={70} x2={120} y2={128} accent={G} animated={false} />
        <Arrow x1={365} y1={70} x2={320} y2={128} accent={G} animated={false} />
        <Arrow x1={400} y1={70} x2={550} y2={128} accent={G} animated={false} />
        <Arrow x1={520} y1={180} x2={510} y2={218} accent={G} animated={false} />
        <Arrow x1={560} y1={180} x2={620} y2={218} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p99 — Selenium controls Chrome */
  {
    page: 99, chapter: 3, stage: "feature", accent: G, archetype: "single-concept",
    section: "Base classes",
    term: "SELENIUM", title: "Selenium drives a headless browser",
    caption:
      "For login-gated, scroll-loaded sites (Medium, LinkedIn), Selenium uses chromedriver_autoinstaller to drive a headless Google Chrome — logging in, scrolling, and extracting the rendered HTML.",
    diagram: (
      <Frame w={740} h={220}>
        <BrandNode x={30} y={85} name="Selenium" sub="automation" w={170} />
        <BrandNode x={270} y={85} name="Google Chrome" sub="headless" w={210} />
        {["log in", "scroll", "extract HTML"].map((t, i) => (
          <Pill key={t} x={540} y={40 + i * 56} text={t} accent={G} w={170} />
        ))}
        <Arrow x1={200} y1={110} x2={268} y2={110} accent={G} />
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={480} y1={110} x2={538} y2={55 + i * 56} accent={G} animated={i === 2} />
        ))}
      </Frame>
    ),
  },
  /* p100 — Chrome options */
  {
    page: 100, chapter: 3, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "Base classes",
    term: "HEADLESS OPTIONS", title: "Chrome options for headless crawling",
    caption:
      "BaseSeleniumCrawler’s constructor sets standard headless Chrome options — disabling GPU, extensions, notifications, and the sandbox — to keep automated browsing fast and stable.",
    diagram: (
      <Frame w={720} h={240}>
        <Code
          x={30}
          y={35}
          w={440}
          lines={[
            { t: "options = webdriver.ChromeOptions()", hi: false },
            { t: '  --headless=new', hi: true },
            { t: "  --no-sandbox", hi: false },
            { t: "  --disable-gpu / extensions / notifications", hi: false },
            { t: "  --disable-dev-shm-usage", hi: false },
          ]}
        />
        <BrandNode x={510} y={90} name="Google Chrome" sub="headless session" w={190} />
      </Frame>
    ),
  },
  /* p101 — scroll_page loop (cycle) */
  {
    page: 101, chapter: 3, stage: "feature", accent: G, archetype: "cycle",
    section: "Base classes",
    term: "INFINITE SCROLL", title: "scroll_page until the end or a limit",
    caption:
      "scroll_page() repeatedly scrolls to the bottom, waits for new content, and compares page height — looping until the height stops changing or the scroll limit is hit. Essential for feeds that lazy-load.",
    diagram: (
      <Frame w={720} h={250}>
        {[
          ["scroll to bottom", 280, 50],
          ["wait for load", 470, 130],
          ["height changed?", 280, 200],
          ["scroll_limit?", 90, 130],
        ].map(([t, x, y], i) => (
          <LabelBox key={i} x={(x as number) - 80} y={(y as number) - 22} w={160} h={44} text={t as string} accent={G} />
        ))}
        <Arrow x1={300} y1={72} x2={450} y2={130} accent={G} animated={false} />
        <Arrow x1={450} y1={152} x2={300} y2={200} accent={G} animated={false} />
        <Arrow x1={210} y1={200} x2={120} y2={152} accent={G} animated={false} />
        <Arrow x1={100} y1={108} x2={230} y2={66} accent={G} />
        <Warn x={360} y={228} text="stop at end of page or scroll limit" />
      </Frame>
    ),
  },
  /* p102 — GitHubCrawler init */
  {
    page: 102, chapter: 3, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "GitHubCrawler class",
    term: "GITHUB CRAWLER", title: "No browser — just git clone",
    caption:
      "GitHubCrawler extends BaseCrawler (no Selenium needed). Its model is RepositoryDocument; the constructor sets ignore patterns (.git, .toml, .lock, .png) and extract() skips repos already in the database.",
    diagram: (
      <Frame w={720} h={220}>
        <Code
          x={30}
          y={35}
          w={420}
          lines={[
            { t: "class GithubCrawler(BaseCrawler):", hi: false },
            { t: "  model = RepositoryDocument", hi: true },
            { t: '  ignore = (".git",".toml",".lock",".png")', hi: false },
            { t: "  def extract(self, link):", hi: false },
            { t: "    if self.model.find(link): return", hi: true },
          ]}
        />
        <BrandNode x={500} y={60} name="GitHub" w={170} />
        <DocumentGlyph x={540} y={120} w={50} h={50} accent={G} />
        <Label x={600} y={145} anchor="start" size={11} weight={600}>Repository</Label>
      </Frame>
    ),
  },
  /* p103 — GitHub clone → walk → save */
  {
    page: 103, chapter: 3, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "GitHubCrawler class",
    term: "CLONE & WALK", title: "Clone, walk the tree, save",
    caption:
      "The crawler git-clones into a temp dir, walks the file tree (skipping ignored files), folds each file into a dict keyed by path, then builds a RepositoryDocument and saves it to MongoDB.",
    diagram: (
      <Frame w={760} h={220}>
        {[
          ["git clone", "temp dir"],
          ["walk tree", "skip ignored"],
          ["tree dict", "path → content"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 185} y={70} w={160} h={56} text={t as string} sub={sub as string} accent={G} />
            <Arrow x1={180 + i * 185} y1={98} x2={205 + i * 185} y2={98} accent={G} />
          </g>
        ))}
        <DocumentGlyph x={580} y={50} w={56} h={56} accent={G} />
        <Label x={608} y={120} size={11} weight={600}>Repository</Label>
        <BrandNode x={560} y={140} name="MongoDB" w={170} />
        <Arrow x1={575} y1={98} x2={605} y2={70} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p104 — CustomArticleCrawler via LangChain */
  {
    page: 104, chapter: 3, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "CustomArticleCrawler class",
    term: "CUSTOM ARTICLE", title: "LangChain loads any page",
    caption:
      "The Custom Article crawler (the fallback) uses LangChain’s AsyncHtmlLoader to read a page’s HTML and Html2TextTransformer to turn it into plain text — then saves an ArticleDocument. GitHub temp dirs are always cleaned up.",
    diagram: (
      <Frame w={760} h={220}>
        <Pill x={20} y={90} text="any link" accent={G} w={110} />
        <BrandNode x={160} y={50} name="LangChain" sub="AsyncHtmlLoader" w={210} />
        <BrandNode x={160} y={120} name="LangChain" sub="Html2TextTransformer" w={210} />
        <DocumentGlyph x={430} y={70} w={56} h={56} accent={G} />
        <Label x={458} y={140} size={11} weight={600}>Article</Label>
        <BrandNode x={540} y={85} name="MongoDB" w={170} />
        <Arrow x1={130} y1={110} x2={158} y2={80} accent={G} />
        <Arrow x1={130} y1={115} x2={158} y2={145} accent={G} animated={false} />
        <Arrow x1={370} y1={95} x2={428} y2={95} accent={G} />
        <Arrow x1={486} y1={98} x2={538} y2={110} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p105 — CustomArticle dedupe + fallback tradeoff */
  {
    page: 105, chapter: 3, stage: "feature", accent: G, archetype: "single-concept",
    section: "CustomArticleCrawler class",
    term: "FALLBACK", title: "Fast to build, hard to customize",
    caption:
      "Delegating extraction to LangChain’s two utilities is fast to implement but offers little control over parsing — which is why it serves as the fallback for domains with no custom crawler, and why many avoid LangChain in production.",
    diagram: (
      <Frame w={720} h={220}>
        <BrandNode x={40} y={85} name="LangChain" sub="utility extraction" w={210} />
        <Pill x={320} y={50} text="✓ fast to implement" accent={G} w={230} />
        <Warn x={340} y={150} text="hard to customize · parsing not controlled" />
        <Arrow x1={250} y1={105} x2={316} y2={65} accent={G} animated={false} />
        <Arrow x1={250} y1={115} x2={330} y2={150} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p106 — MediumCrawler(BaseSeleniumCrawler) */
  {
    page: 106, chapter: 3, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "MediumCrawler class",
    term: "MEDIUM CRAWLER", title: "A Selenium-based crawler",
    caption:
      "MediumCrawler inherits BaseSeleniumCrawler, its model is ArticleDocument, and it overrides set_extra_driver_options to tweak the Chrome profile; extract() first checks the DB to avoid duplicates.",
    diagram: (
      <Frame w={720} h={210}>
        <Code
          x={30}
          y={35}
          w={430}
          lines={[
            { t: "class MediumCrawler(", hi: false },
            { t: "    BaseSeleniumCrawler):", hi: true },
            { t: "  model = ArticleDocument", hi: false },
            { t: "  def set_extra_driver_options(...)", hi: false },
            { t: "  def extract(self, link): ...", hi: false },
          ]}
        />
        <BrandNode x={500} y={70} name="Selenium" w={170} />
        <DocumentGlyph x={540} y={125} w={48} h={48} accent={G} />
        <Label x={598} y={149} anchor="start" size={11} weight={600}>Article</Label>
      </Frame>
    ),
  },
  /* p107 — Medium extract: navigate, scroll, BeautifulSoup */
  {
    page: 107, chapter: 3, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "MediumCrawler class",
    term: "PARSE HTML", title: "Navigate, scroll, parse with BeautifulSoup",
    caption:
      "For a new article the crawler navigates to the link, scrolls to load everything, then uses BeautifulSoup to pull the title, subtitle, and full text into a dict.",
    diagram: (
      <Frame w={760} h={220}>
        {[
          ["driver.get", "navigate"],
          ["scroll_page", "load all"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 175} y={75} w={150} h={56} text={t as string} sub={sub as string} accent={G} />
            <Arrow x1={170 + i * 175} y1={103} x2={195 + i * 175} y2={103} accent={G} />
          </g>
        ))}
        <BrandNode x={370} y={78} name="BeautifulSoup" sub="parse HTML" w={200} />
        <SnapshotGlyph x={590} y={70} w={150} h={70} accent={G} title="title · subtitle · text" usedFor="" />
        <Arrow x1={570} y1={105} x2={588} y2={105} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p108 — three crawling techniques compared */
  {
    page: 108, chapter: 3, stage: "feature", accent: G, archetype: "comparison",
    section: "The NoSQL data warehouse documents",
    term: "THREE TECHNIQUES", title: "Three ways to crawl",
    caption:
      "The chapter implements three crawling styles: git clone in a subprocess (GitHub), LangChain utilities for a single page (Custom Article), and Selenium for login/scroll-heavy sites (Medium, LinkedIn). Scrapy and Crawl4AI are higher-level alternatives.",
    diagram: (
      <Frame w={760} h={250}>
        {[
          ["GitHub", "git clone (subprocess)", "GitHub"],
          ["Custom Article", "LangChain utilities", "LangChain"],
          ["Medium / LinkedIn", "Selenium browser", "Selenium"],
        ].map(([t, sub, tool], i) => (
          <g key={i}>
            <BrandNode x={30 + i * 245} y={40} name={tool as string} w={200} />
            <Pill x={30 + i * 245} y={110} text={t as string} accent={G} w={200} />
            <Label x={130 + i * 245} y={165} size={11} color="#5E6B76">{sub as string}</Label>
          </g>
        ))}
        <Label x={380} y={215} size={11} color="#5E6B76">higher-level alternatives: Scrapy · Crawl4AI</Label>
      </Frame>
    ),
  },
  /* p109 — ODM based on ORM, Pydantic */
  {
    page: 109, chapter: 3, stage: "feature", accent: G, archetype: "single-concept",
    section: "The ORM and ODM software patterns",
    term: "ODM", title: "Document classes with read/write",
    caption:
      "Article, Post, and Repository documents aren’t plain dataclasses — they carry read/write operations via the Object-Document Mapping (ODM) pattern (built on ORM) and gain type validation from Pydantic.",
    diagram: (
      <Frame w={740} h={240}>
        {["ArticleDocument", "PostDocument", "RepositoryDocument"].map((t, i) => (
          <g key={t}>
            <DocumentGlyph x={40} y={30 + i * 64} w={44} h={44} accent={G} />
            <Label x={100} y={52 + i * 64} anchor="start" size={12} weight={600}>{t}</Label>
          </g>
        ))}
        <LabelBox x={350} y={70} w={150} h={60} text="ODM" sub="read + write" accent={G} strong />
        <BrandNode x={540} y={40} name="Pydantic" sub="type validation" w={180} />
        <BrandNode x={540} y={120} name="MongoDB" w={180} />
        <Arrow x1={290} y1={100} x2={348} y2={100} accent={G} animated={false} />
        <Arrow x1={500} y1={90} x2={538} y2={70} accent={G} animated={false} />
        <Arrow x1={500} y1={105} x2={538} y2={140} accent={G} />
      </Frame>
    ),
  },
  /* p110 — ORM maps class ↔ table */
  {
    page: 110, chapter: 3, stage: "feature", accent: G, archetype: "single-concept",
    section: "The ORM and ODM software patterns",
    term: "ORM", title: "A Python class maps to a SQL table",
    caption:
      "ORM lets you query and mutate a SQL database through objects instead of raw SQL. A SQLAlchemy User class maps to the users table; creating and committing an instance inserts a row — all CRUD, no SQL.",
    diagram: (
      <Frame w={720} h={220}>
        <LabelBox x={40} y={70} w={170} h={70} text="class User(Base)" sub="id · name" accent={G} />
        <BrandNode x={280} y={80} name="SQLAlchemy" sub="ORM" w={180} />
        <DataStoreGlyph x={520} y={55} w={120} h={110} accent={G} />
        <Label x={580} y={178} size={11.5} font={MONO}>users table</Label>
        <Arrow x1={210} y1={105} x2={278} y2={110} accent={G} />
        <Arrow x1={460} y1={110} x2={518} y2={110} accent={G} />
        <Label x={365} y={150} size={10.5} color="#5E6B76">CRUD, no raw SQL</Label>
      </Frame>
    ),
  },
  /* p111 — ORM vs ODM */
  {
    page: 111, chapter: 3, stage: "feature", accent: G, archetype: "comparison",
    section: "Implementing the ODM class",
    term: "ORM vs ODM", title: "Tables vs JSON collections",
    caption:
      "ODM mirrors ORM but targets NoSQL: instead of rows in SQL tables it maps objects to JSON-like documents in MongoDB collections. The book implements a light ODM (NoSQLBaseDocument) from scratch.",
    diagram: (
      <Frame w={720} h={250}>
        <LabelBox x={30} y={20} w={140} h={44} text="ORM" accent={G} />
        <BrandNode x={30} y={80} name="SQLAlchemy" w={170} />
        <DataStoreGlyph x={60} y={140} w={90} h={84} accent={G} />
        <Label x={105} y={236} size={11}>SQL · tables/rows</Label>
        <Label x={360} y={120} size={20} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={500} y={20} w={140} h={44} text="ODM" accent={G} strong />
        <BrandNode x={500} y={80} name="MongoDB" w={170} />
        <DocumentGlyph x={540} y={140} w={84} h={80} accent={G} />
        <Label x={582} y={236} size={11}>NoSQL · JSON docs</Label>
      </Frame>
    ),
  },
  /* p112 — NoSQLBaseDocument */
  {
    page: 112, chapter: 3, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "Implementing the ODM class",
    term: "ODM BASE", title: "NoSQLBaseDocument = Pydantic + Generic + ABC",
    caption:
      "The base ODM class inherits Pydantic’s BaseModel (validation), Generic[T] (typed subclasses), and ABC (abstract). It gives every document a UUID4 id plus __eq__/__hash__ and Mongo (de)serialization.",
    diagram: (
      <Frame w={720} h={220}>
        <Code
          x={30}
          y={35}
          w={450}
          lines={[
            { t: "class NoSQLBaseDocument(", hi: false },
            { t: "    BaseModel, Generic[T], ABC):", hi: true },
            { t: "  id: UUID4 = Field(uuid.uuid4)", hi: false },
            { t: "  def __eq__/__hash__ (by id)", hi: false },
            { t: "  from_mongo() / to_mongo()", hi: false },
          ]}
        />
        <BrandNode x={510} y={70} name="Pydantic" w={180} />
        <Pill x={520} y={130} text="UUID4 id" accent={G} w={150} />
      </Frame>
    ),
  },
  /* p113 — to_mongo + save */
  {
    page: 113, chapter: 3, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Implementing the ODM class",
    term: "SAVE", title: "Instance → dict → insert_one",
    caption:
      "to_mongo() converts a model into a MongoDB-ready dict (stringifying UUIDs and mapping id → _id); save() grabs the collection and inserts the document, handling write errors.",
    diagram: (
      <Frame w={740} h={220}>
        <DocumentGlyph x={30} y={70} w={110} h={90} accent={G} />
        <Label x={85} y={172} size={11}>instance</Label>
        <LabelBox x={210} y={85} w={150} h={56} text="to_mongo()" sub="id → _id" accent={G} />
        <LabelBox x={420} y={85} w={150} h={56} text="insert_one()" accent={G} />
        <BrandNode x={600} y={90} name="MongoDB" w={120} />
        <Arrow x1={140} y1={115} x2={208} y2={113} accent={G} />
        <Arrow x1={360} y1={113} x2={418} y2={113} accent={G} />
        <Arrow x1={570} y1={113} x2={598} y2={113} accent={G} />
      </Frame>
    ),
  },
  /* p114 — get_or_create decision */
  {
    page: 114, chapter: 3, stage: "feature", accent: G, archetype: "single-concept",
    section: "Implementing the ODM class",
    term: "GET OR CREATE", title: "Find one, or create and save",
    caption:
      "get_or_create() runs find_one with the filter: if a document exists it’s returned via from_mongo; otherwise a new instance is created and saved — the pattern used for every user.",
    diagram: (
      <Frame w={720} h={230}>
        <Pill x={20} y={95} text="filter_options" accent={G} w={150} />
        <DecisionGlyph x={210} y={60} w={120} h={110} accent={G} mark="find" />
        <Label x={270} y={185} size={10.5} color="#5E6B76">find_one</Label>
        <LabelBox x={400} y={40} w={220} h={48} text="from_mongo(instance)" sub="exists" accent={G} strong />
        <LabelBox x={400} y={130} w={220} h={48} text="create() + save()" sub="not found" accent={G} />
        <Arrow x1={170} y1={113} x2={208} y2={113} accent={G} />
        <Arrow x1={330} y1={100} x2={398} y2={64} accent={G} animated={false} />
        <Arrow x1={330} y1={130} x2={398} y2={154} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p115 — ODM CRUD methods cluster */
  {
    page: 115, chapter: 3, stage: "feature", accent: G, archetype: "list-cluster",
    section: "Implementing the ODM class",
    term: "CRUD", title: "The ODM’s shared CRUD methods",
    caption:
      "NoSQLBaseDocument centralizes CRUD: save, bulk_insert, find, bulk_find, get_or_create — plus get_collection_name(), which reads the collection from each subclass’s nested Settings.",
    diagram: (
      <Frame w={720} h={290}>
        <LabelBox x={270} y={115} w={180} h={64} text="NoSQLBaseDocument" accent={G} strong />
        {["save()", "bulk_insert()", "find()", "bulk_find()", "get_or_create()", "get_collection_name()"].map((t, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const cx = 360 + Math.cos(angle) * 250;
          const cy = 147 + Math.sin(angle) * 105;
          return (
            <g key={t}>
              <Pill x={cx - 75} y={cy - 15} text={t} accent={G} w={150} />
              <line x1={360} y1={147} x2={cx} y2={cy} stroke="#ECE8DF" strokeWidth={1.4} />
            </g>
          );
        })}
      </Frame>
    ),
  },
  /* p116 — Settings + DataCategory enum intro */
  {
    page: 116, chapter: 3, stage: "feature", accent: G, archetype: "single-concept",
    section: "Data categories and user document classes",
    term: "COLLECTION NAME", title: "A nested Settings names the collection",
    caption:
      "Each subclass configures itself with a nested Settings class (e.g. the collection name). A DataCategory StrEnum centralizes the category constants used to configure every ODM class. (mongoengine is a fuller off-the-shelf ODM.)",
    diagram: (
      <Frame w={720} h={220}>
        <Code
          x={30}
          y={45}
          w={360}
          lines={[
            { t: "class ArticleDocument(Document):", hi: false },
            { t: "  class Settings:", hi: true },
            { t: "    name = DataCategory.ARTICLES", hi: false },
          ]}
        />
        <DataStoreGlyph x={460} y={50} w={120} h={110} accent={G} />
        <Label x={520} y={172} size={11.5} font={MONO}>articles</Label>
        <Arrow x1={390} y1={90} x2={458} y2={100} accent={G} />
      </Frame>
    ),
  },
  /* p117 — DataCategory enum + Document base */
  {
    page: 117, chapter: 3, stage: "feature", accent: G, archetype: "list-cluster",
    section: "Data categories and user document classes",
    term: "DATA CATEGORIES", title: "One enum of categories, one base Document",
    caption:
      "DataCategory enumerates every category used across the book (posts, articles, repositories, plus the dataset types). The abstract Document base holds the shared fields: content, platform, author_id, author_full_name.",
    diagram: (
      <Frame w={740} h={290}>
        <LabelBox x={500} y={110} w={210} h={70} text="Document (base)" sub="content · platform · author" accent={G} strong />
        {["posts", "articles", "repositories", "instruct_dataset", "preference_dataset", "prompt / queries"].map((t, i) => (
          <Pill key={t} x={30 + (i % 2) * 200} y={30 + Math.floor(i / 2) * 70} text={t} accent={G} w={180} />
        ))}
        <Label x={220} y={250} size={11} color="#5E6B76">DataCategory (StrEnum)</Label>
      </Frame>
    ),
  },
  /* p118 — document subclasses hierarchy */
  {
    page: 118, chapter: 3, stage: "feature", accent: G, archetype: "hierarchy",
    section: "Gathering raw data into the data warehouse",
    term: "DOCUMENT CLASSES", title: "Three documents + the user",
    caption:
      "Repository, Post, and Article documents extend the shared Document base (adding their own fields + Settings collection). UserDocument extends NoSQLBaseDocument directly, with a full_name property.",
    diagram: (
      <Frame w={740} h={280}>
        <LabelBox x={150} y={20} w={180} h={50} text="Document" sub="abstract base" accent={G} strong />
        {["RepositoryDocument", "PostDocument", "ArticleDocument"].map((t, i) => (
          <g key={t}>
            <LabelBox x={20 + i * 235} y={130} w={210} h={48} text={t} accent={G} />
            <Arrow x1={240} y1={70} x2={125 + i * 235} y2={128} accent={G} animated={false} />
          </g>
        ))}
        <LabelBox x={510} y={20} w={210} h={50} text="NoSQLBaseDocument" sub="ODM root" accent={G} />
        <LabelBox x={520} y={210} w={190} h={50} text="UserDocument" sub="full_name property" accent={G} />
        <Arrow x1={615} y1={70} x2={615} y2={208} accent={G} animated={false} />
      </Frame>
    ),
  },
  /* p119 — run per author config */
  {
    page: 119, chapter: 3, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Gathering raw data into the data warehouse",
    term: "RUN PIPELINE", title: "One config per author",
    caption:
      "ZenML runs the collection pipeline manually per author: poe run-digital-data-etl-maxime feeds Maxime’s YAML (full name + blog/Substack links) into digital_data_etl.",
    diagram: (
      <Frame w={740} h={220}>
        <Label x={120} y={45} size={11} font={MONO} color="#5E6B76">poe run-digital-data-etl-maxime</Label>
        <DocumentGlyph x={40} y={70} w={110} h={90} accent={G} />
        <Label x={95} y={172} size={11} font={MONO}>maxime.yaml</Label>
        <PipelineGlyph x={260} y={75} w={200} h={90} accent={G} />
        <Label x={360} y={120} weight={700}>digital_data_etl</Label>
        <BrandNode x={540} y={90} name="MongoDB" w={170} />
        <Arrow x1={150} y1={115} x2={258} y2={120} accent={G} />
        <Arrow x1={460} y1={120} x2={538} y2={120} accent={G} />
      </Frame>
    ),
  },
  /* p120 — Fig 3.5 user artifact */
  {
    page: 120, chapter: 3, stage: "feature", accent: G, archetype: "single-concept",
    section: "Gathering raw data into the data warehouse",
    term: "USER ARTIFACT", title: "The user output artifact (Fig 3.5)",
    caption:
      "The run produces a user output artifact whose metadata shows the query (user_full_name) and the retrieved user (id, first/last name) pulled from MongoDB for this specific run.",
    diagram: (
      <Frame w={720} h={230}>
        <SnapshotGlyph x={40} y={85} w={180} h={70} accent={G} title="user" usedFor="artifact" />
        <Boundary x={300} y={40} w={380} h={160} title="metadata" accent={G} />
        {[
          ["query", "user_full_name: Maxime Labonne"],
          ["retrieved", "user_id · first_name · last_name"],
        ].map(([k, v], i) => (
          <g key={i}>
            <Label x={320} y={80 + i * 60} anchor="start" size={12} weight={600} color={G}>{k as string}</Label>
            <Label x={320} y={100 + i * 60} anchor="start" size={11} font={MONO} color="#5E6B76">{v as string}</Label>
          </g>
        ))}
        <Arrow x1={222} y1={120} x2={298} y2={120} accent={G} />
      </Frame>
    ),
  },
  /* p121 — Fig 3.6 crawled_links artifact + UUID download */
  {
    page: 121, chapter: 3, stage: "feature", accent: G, archetype: "single-concept",
    section: "Gathering raw data into the data warehouse",
    term: "CRAWLED_LINKS", title: "The crawled_links artifact (Fig 3.6)",
    caption:
      "The crawled_links artifact records, per domain, the total links crawled and how many succeeded — making each run easy to monitor. Any artifact version is downloadable by its UUID.",
    diagram: (
      <Frame w={720} h={230}>
        <SnapshotGlyph x={40} y={85} w={190} h={70} accent={G} title="crawled_links" usedFor="artifact" />
        <Boundary x={300} y={35} w={380} h={130} title="per-domain metadata" accent={G} />
        {[
          ["medium.com", "12 / 14"],
          ["substack.com", "8 / 8"],
          ["github.com", "5 / 6"],
        ].map(([k, v], i) => (
          <g key={i}>
            <Label x={320} y={65 + i * 32} anchor="start" size={11.5} font={MONO}>{k as string}</Label>
            <Label x={560} y={65 + i * 32} anchor="start" size={11.5} font={MONO} color={G}>{v as string}</Label>
          </g>
        ))}
        <Label x={400} y={195} size={11} font={MONO} color="#5E6B76">get_artifact_version(uuid).load()</Label>
        <Arrow x1={232} y1={120} x2={298} y2={110} accent={G} />
      </Frame>
    ),
  },
  /* p122 — swap config (Paul) + query via ODM */
  {
    page: 122, chapter: 3, stage: "feature", accent: G, archetype: "pipeline-flow",
    section: "Gathering raw data into the data warehouse",
    term: "SWAP CONFIG", title: "Same pipeline, Paul’s config",
    caption:
      "Swapping in Paul Iusztin’s YAML (poe run-digital-data-etl-paul) runs the identical pipeline on his Medium/Substack links; run-digital-data-etl runs every author. Collected data is then queryable via the ODM classes.",
    diagram: (
      <Frame w={740} h={220}>
        {["maxime.yaml", "paul.yaml"].map((t, i) => (
          <g key={t}>
            <DocumentGlyph x={30} y={45 + i * 90} w={80} h={70} accent={G} />
            <Label x={130} y={80 + i * 90} anchor="start" size={11} font={MONO}>{t}</Label>
            <line x1={110} y1={80 + i * 90} x2={330} y2={110} stroke="#ECE8DF" strokeWidth={1.4} />
          </g>
        ))}
        <PipelineGlyph x={330} y={75} w={180} h={80} accent={G} />
        <Label x={420} y={115} weight={700}>digital_data_etl</Label>
        <BrandNode x={560} y={90} name="MongoDB" w={160} />
        <Arrow x1={510} y1={115} x2={558} y2={115} accent={G} />
      </Frame>
    ),
  },
  /* p123 — query MongoDB via ODM */
  {
    page: 123, chapter: 3, stage: "feature", accent: G, archetype: "code-anatomy",
    section: "Troubleshooting",
    term: "QUERY ODM", title: "Two lines to query the warehouse",
    caption:
      "With the ODM, querying is trivial: get_or_create the user, then bulk_find their articles by author_id. A MongoDB IDE plugin and the local URI let you inspect collections directly.",
    diagram: (
      <Frame w={740} h={210}>
        <Code
          x={30}
          y={40}
          w={460}
          lines={[
            { t: 'user = UserDocument.get_or_create(', hi: false },
            { t: '    first_name="Paul", last_name="Iusztin")', hi: false },
            { t: "articles = ArticleDocument.bulk_find(", hi: true },
            { t: "    author_id=str(user.id))", hi: false },
            { t: "# → 50 articles", hi: false },
          ]}
        />
        <BrandNode x={520} y={90} name="MongoDB" w={180} />
        <Arrow x1={490} y1={110} x2={518} y2={110} accent={G} />
      </Frame>
    ),
  },
  /* p124 — troubleshooting Selenium (pitfall) */
  {
    page: 124, chapter: 3, stage: "feature", accent: G, archetype: "pitfall",
    section: "Import our backed-up data",
    term: "TROUBLESHOOTING", title: "If Selenium breaks, fall back (Fig 3.7)",
    caption:
      "ChromeDriver issues can break Selenium crawlers. Workaround: comment out the Medium URLs in the YAML configs (Substack/blog links use the Selenium-free CustomArticleCrawler). If all else fails, import the backed-up data warehouse.",
    diagram: (
      <Frame w={740} h={250}>
        <BrandNode x={30} y={40} name="Selenium" sub="MediumCrawler" w={180} />
        <Warn x={60} y={130} text="ChromeDriver / browser-driver failures" />
        <Boundary x={300} y={30} w={420} h={190} title="workarounds" accent={G} />
        <Pill x={320} y={55} text="comment out Medium URLs in YAML" accent={G} w={380} />
        <LabelBox x={320} y={100} w={380} h={44} text="Substack / blog → CustomArticleCrawler (no Selenium)" accent={G} />
        <Pill x={320} y={160} text="poe run-import-data-warehouse-from-json" accent={G} w={380} />
        <Arrow x1={210} y1={90} x2={298} y2={120} accent={G} animated={false} />
      </Frame>
    ),
  },
];
