import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { GLOSSARY, pagesForConcept } from "../concepts";
import { accentForPage } from "../book";

// Browse every glossary term + definition. Filter as you type; click a term to
// jump to where it's a subject in the book.
export default function Glossary() {
  const [q, setQ] = React.useState("");
  const navigate = useNavigate();
  const query = q.trim().toLowerCase();

  const terms = React.useMemo(
    () =>
      [...GLOSSARY]
        .filter((g) => !query || (g.term + " " + (g.aliases ?? []).join(" ") + " " + g.def).toLowerCase().includes(query))
        .sort((a, b) => a.term.localeCompare(b.term)),
    [query],
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight mb-1">Glossary</h1>
        <p className="text-ink2 font-body text-sm mb-4">{GLOSSARY.length} terms. Click one to jump to where it appears in the book.</p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter terms…"
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-[14px] font-body shadow-card focus:outline-none focus:ring-2 mb-5"
          style={{ ["--tw-ring-color" as string]: "#0EA5B7" }}
        />
        <div className="space-y-2">
          {terms.map((g) => {
            const pages = pagesForConcept(g.term);
            const first = pages[0];
            const accent = first ? accentForPage(first) : "#5E6B76";
            return (
              <div key={g.term} className="rounded-xl bg-surface border border-border shadow-card px-4 py-3">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-display font-semibold">{g.term}</span>
                  {pages.length > 0 && (
                    <button
                      onClick={() => navigate(`/read/${first}`)}
                      className="font-mono text-[10.5px] px-1.5 py-0.5 rounded hover:underline"
                      style={{ background: `${accent}14`, color: accent }}
                    >
                      p.{first}
                      {pages.length > 1 ? ` +${pages.length - 1}` : ""}
                    </button>
                  )}
                </div>
                <p className="font-body text-[13.5px] text-ink2 mt-0.5 leading-relaxed">{g.def}</p>
              </div>
            );
          })}
          {terms.length === 0 && <p className="text-ink2 font-body py-6 text-center">No terms match “{q}”.</p>}
        </div>
      </div>
    </Layout>
  );
}
