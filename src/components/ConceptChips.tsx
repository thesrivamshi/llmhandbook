import React from "react";
import { useNavigate } from "react-router-dom";
import { conceptsForPage, pagesForConcept } from "../concepts";
import { accentForPage, diagramForPage, sectionForPage } from "../book";

// "Concepts on this page" — glossary + cross-links in one surface. Hover a chip
// for its definition; click to see (and jump to) every page where it appears.
export const ConceptChips: React.FC<{ page: number; accent: string }> = ({ page, accent }) => {
  const navigate = useNavigate();
  const concepts = conceptsForPage(page);
  const [open, setOpen] = React.useState<string | null>(null);
  if (concepts.length === 0) return null;

  return (
    <div className="mt-4 rounded-card bg-surface border border-border shadow-card px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
        <span className="font-display text-sm font-semibold">Concepts on this page</span>
        <span className="text-[11px] text-faint font-body">hover for meaning · click to find every page</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {concepts.map((c) => {
          const pages = pagesForConcept(c.term);
          return (
            <div key={c.term} className="relative group">
              <button
                onClick={() => setOpen((o) => (o === c.term ? null : c.term))}
                className="px-2.5 py-1 rounded-full text-[12px] border transition-colors"
                style={{ borderColor: `${accent}66`, color: accent, background: `${accent}0F` }}
              >
                {c.term}
                <span className="ml-1 text-[10px] opacity-70 font-mono">{pages.length}</span>
              </button>

              {/* hover tooltip: the definition */}
              <div className="pointer-events-none absolute left-0 top-full mt-1 z-50 w-60 rounded-lg bg-ink text-white text-[12px] leading-snug px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-card">
                {c.def}
              </div>

              {/* click popover: all pages with this concept */}
              {open === c.term && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpen(null)} aria-hidden />
                  <div className="absolute left-0 top-full mt-1 z-50 w-64 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface shadow-card p-1.5">
                    <div className="px-2 py-1.5 text-[11px] text-ink2 font-body border-b border-border mb-1">
                      <span className="font-semibold text-ink">{c.term}</span> · {pages.length} page{pages.length === 1 ? "" : "s"}
                    </div>
                    {pages.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setOpen(null);
                          navigate(`/read/${p}`);
                        }}
                        className={`w-full text-left rounded-lg px-2 py-1.5 hover:bg-paper flex items-baseline gap-2 ${p === page ? "bg-paper" : ""}`}
                      >
                        <span className="font-mono text-[10.5px] shrink-0" style={{ color: accentForPage(p) }}>
                          p.{p}
                        </span>
                        <span className="text-[12px] text-ink truncate">{diagramForPage(p)?.title ?? sectionForPage(p)?.title ?? "Page"}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConceptChips;
