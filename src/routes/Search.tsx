import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { ALL_DIAGRAMS, CHAPTERS, TOC, accentForPage, type TocNode } from "../book";
import { ARCHETYPE_LABEL } from "../diagrams/types";

// Flatten the book into a searchable index: every authored diagram (title,
// caption, term, section) plus every TOC section title. Results link to /read.
interface Hit {
  page: number;
  title: string;
  sub: string; // section or caption snippet
  kind: string; // archetype label or "Section"
  accent: string;
}

function tocSections(nodes: TocNode[], acc: Hit[]) {
  for (const n of nodes) {
    if (n.startPage) acc.push({ page: n.startPage, title: n.title, sub: `Section · p.${n.startPage}`, kind: "Section", accent: accentForPage(n.startPage) });
    if (n.children?.length) tocSections(n.children, acc);
  }
}

const DIAGRAM_HITS: Hit[] = ALL_DIAGRAMS.map((d) => ({
  page: d.page,
  title: d.title,
  sub: d.caption,
  kind: ARCHETYPE_LABEL[d.archetype],
  accent: d.accent,
}));

const SECTION_HITS: Hit[] = (() => {
  const acc: Hit[] = [];
  tocSections(TOC, acc);
  return acc;
})();

function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold" style={{ color: "#25313C", background: "#FCE9B8" }}>
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default function Search() {
  const [q, setQ] = React.useState("");
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const query = q.trim().toLowerCase();
  const results = React.useMemo(() => {
    if (query.length < 2) return [] as Hit[];
    const match = (h: Hit) => (h.title + " " + h.sub + " " + h.kind).toLowerCase().includes(query);
    const diagrams = DIAGRAM_HITS.filter(match);
    const sections = SECTION_HITS.filter((h) => h.title.toLowerCase().includes(query));
    // De-dup sections already covered by a diagram on the same page.
    const diagramPages = new Set(diagrams.map((d) => d.page));
    return [...diagrams, ...sections.filter((s) => !diagramPages.has(s.page))].slice(0, 80);
  }, [query]);

  // Which chapters own the matches (concept → chapter overview).
  const chapterCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of results) {
      const sec = CHAPTERS.find((c) => h.page >= c.startPage && h.page <= c.endPage);
      const key = sec ? sec.title : "Other";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [results]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight mb-1">Search the book</h1>
        <p className="text-ink2 font-body text-sm mb-5">Across diagram titles, captions, concepts, and section names.</p>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “RAG”, “LoRA”, “quantization”, “drift”…"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] font-body shadow-card focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as string]: "#0EA5B7" }}
        />

        {query.length >= 2 && (
          <div className="mt-3 text-[12px] text-faint font-mono">
            {results.length} result{results.length === 1 ? "" : "s"}
            {chapterCounts.length > 0 && (
              <span className="ml-2 text-ink2">
                · in {chapterCounts.map(([t, n]) => `${t.replace(/^Chapter (\d+).*/, "Ch$1")} (${n})`).join(", ")}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 space-y-2">
          {results.map((h, i) => (
            <button
              key={`${h.page}-${i}`}
              onClick={() => navigate(`/read/${h.page}`)}
              className="w-full text-left rounded-xl bg-surface border border-border shadow-card px-4 py-3 hover:shadow-card-hover transition-shadow flex gap-3 items-start"
            >
              <span className="font-mono text-[11px] px-2 py-1 rounded-md shrink-0 mt-0.5" style={{ background: `${h.accent}14`, color: h.accent }}>
                p.{h.page}
              </span>
              <span className="min-w-0">
                <span className="font-display font-semibold block leading-tight">{highlight(h.title, q.trim())}</span>
                <span className="font-body text-[13px] text-ink2 line-clamp-2 block">{highlight(h.sub, q.trim())}</span>
                <span className="font-body text-[11px] text-faint">{h.kind}</span>
              </span>
            </button>
          ))}
          {query.length >= 2 && results.length === 0 && (
            <p className="text-ink2 font-body py-6 text-center">No matches. Try a broader term.</p>
          )}
        </div>

        <div className="mt-6 text-[13px] text-ink2">
          <Link to="/map" className="underline">Or explore the whole-book map →</Link>
        </div>
      </div>
    </Layout>
  );
}
