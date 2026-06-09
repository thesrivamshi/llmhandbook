import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { ALL_DIAGRAMS, CHAPTERS, TOC, PAGES_CLEAN, accentForPage, type TocNode } from "../book";
import { ARCHETYPE_LABEL } from "../diagrams/types";
import { GLOSSARY, pagesForConcept } from "../concepts";

// Search the WHOLE book: authored diagrams (title/caption/term), TOC section
// names, the glossary, AND the full clean page text (so any word in the book is
// findable, not just words I put in a caption). Results link to /read/:page.
interface Hit {
  page: number;
  title: string;
  sub: string;
  kind: string;
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

// Pre-lowercased full page text for fast substring scanning.
const PAGE_TEXT = PAGES_CLEAN.map((p) => ({ page: p.page, lower: p.text.toLowerCase(), raw: p.text }));

function snippet(text: string, q: string): string {
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return text.replace(/\s+/g, " ").slice(0, 140);
  const start = Math.max(0, i - 50);
  const end = Math.min(text.length, i + q.length + 80);
  let s = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) s = "… " + s;
  if (end < text.length) s = s + " …";
  return s;
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="font-semibold" style={{ color: "#25313C", background: "#FCE9B8" }}>
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
  React.useEffect(() => void inputRef.current?.focus(), []);

  const query = q.trim().toLowerCase();

  const { results, pageTextCount, gloss } = React.useMemo(() => {
    if (query.length < 2) return { results: [] as Hit[], pageTextCount: 0, gloss: [] as typeof GLOSSARY };
    const match = (h: Hit) => (h.title + " " + h.sub + " " + h.kind).toLowerCase().includes(query);
    const diagrams = DIAGRAM_HITS.filter(match);
    const dpages = new Set(diagrams.map((d) => d.page));
    const sections = SECTION_HITS.filter((h) => h.title.toLowerCase().includes(query) && !dpages.has(h.page));
    const covered = new Set([...dpages, ...sections.map((s) => s.page)]);
    const pageHits: Hit[] = [];
    for (const pt of PAGE_TEXT) {
      if (covered.has(pt.page)) continue;
      if (pt.lower.includes(query)) {
        pageHits.push({ page: pt.page, title: `Page ${pt.page}`, sub: snippet(pt.raw, query), kind: "Book text", accent: accentForPage(pt.page) });
      }
    }
    const gloss = GLOSSARY.filter((g) => (g.term + " " + (g.aliases ?? []).join(" ") + " " + g.def).toLowerCase().includes(query)).slice(0, 6);
    return { results: [...diagrams, ...sections, ...pageHits].slice(0, 150), pageTextCount: pageHits.length, gloss };
  }, [query]);

  const chapterCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of results) {
      const sec = CHAPTERS.find((c) => h.page >= c.startPage && h.page <= c.endPage);
      counts.set(sec ? sec.title : "Other", (counts.get(sec ? sec.title : "Other") ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [results]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight mb-1">Search the book</h1>
        <p className="text-ink2 font-body text-sm mb-5">Full text, diagram titles + captions, section names, and the glossary.</p>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “PagedAttention”, “catastrophic forgetting”, “ChromeDriver”…"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] font-body shadow-card focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as string]: "#0EA5B7" }}
        />

        {query.length >= 2 && (
          <div className="mt-3 text-[12px] text-faint font-mono">
            {results.length} result{results.length === 1 ? "" : "s"} ({pageTextCount} in book text)
            {chapterCounts.length > 0 && (
              <span className="ml-2 text-ink2">· in {chapterCounts.map(([t, n]) => `${t.replace(/^Chapter (\d+).*/, "Ch$1")} (${n})`).join(", ")}</span>
            )}
          </div>
        )}

        {/* glossary matches first */}
        {gloss.length > 0 && (
          <div className="mt-4 rounded-xl bg-surface border border-border shadow-card p-3">
            <div className="text-[11px] font-mono text-faint mb-1.5">GLOSSARY</div>
            <div className="space-y-1">
              {gloss.map((g) => (
                <Link key={g.term} to={pagesForConcept(g.term)[0] ? `/read/${pagesForConcept(g.term)[0]}` : "/glossary"} className="block hover:bg-paper rounded-lg px-2 py-1">
                  <span className="font-display font-semibold text-[14px]">{highlight(g.term, q.trim())}</span>
                  <span className="font-body text-[13px] text-ink2"> — {highlight(g.def, q.trim())}</span>
                </Link>
              ))}
            </div>
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
          {query.length >= 2 && results.length === 0 && gloss.length === 0 && (
            <p className="text-ink2 font-body py-6 text-center">No matches anywhere in the book. Try a broader term.</p>
          )}
        </div>

        <div className="mt-6 text-[13px] text-ink2 flex gap-4">
          <Link to="/glossary" className="underline">Browse the glossary →</Link>
          <Link to="/map" className="underline">Whole-book map →</Link>
        </div>
      </div>
    </Layout>
  );
}
