import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAnnotations, toggleBookmark, removeHighlight, exportJSON } from "../annotations";
import { accentForPage, diagramForPage, sectionForPage } from "../book";

// One place to see everything you've marked across the book: bookmarks, notes,
// and highlights — each linking back to its page.
type Tab = "bookmarks" | "notes" | "highlights";

const titleOf = (p: number) => diagramForPage(p)?.title ?? sectionForPage(p)?.title ?? "Page";

export default function Marks() {
  const ann = useAnnotations();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<Tab>("bookmarks");

  const notePages = Object.keys(ann.notes).map(Number).sort((a, b) => a - b);
  const hlPages = Object.keys(ann.highlights).map(Number).sort((a, b) => a - b);
  const counts = { bookmarks: ann.bookmarks.length, notes: notePages.length, highlights: hlPages.length };
  const total = counts.bookmarks + counts.notes + counts.highlights;

  const PageChip: React.FC<{ p: number }> = ({ p }) => (
    <button onClick={() => navigate(`/read/${p}`)} className="font-mono text-[11px] px-2 py-0.5 rounded shrink-0 hover:underline" style={{ background: `${accentForPage(p)}14`, color: accentForPage(p) }}>
      p.{p}
    </button>
  );

  const seg = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`px-3 py-1 text-[13px] rounded-lg border transition-colors ${tab === t ? "font-semibold text-ink bg-paper border-border" : "text-ink2 border-border hover:bg-paper/70"}`}
    >
      {label} <span className="font-mono text-[11px] text-faint">{counts[t]}</span>
    </button>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-baseline gap-3 flex-wrap mb-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">My marks</h1>
          {total > 0 && (
            <button onClick={exportJSON} className="text-[12px] text-ink2 underline">Export all ⤓</button>
          )}
        </div>
        <p className="text-ink2 font-body text-sm mb-4">Everything you've saved — stored locally in this browser.</p>

        <div className="flex gap-1.5 mb-5">
          {seg("bookmarks", "Bookmarks")}
          {seg("notes", "Notes")}
          {seg("highlights", "Highlights")}
        </div>

        {total === 0 && <p className="text-ink2 font-body py-8 text-center">Nothing saved yet. Bookmark a page, highlight text, or jot a note while reading.</p>}

        {tab === "bookmarks" && (
          <div className="space-y-2">
            {ann.bookmarks.map((p) => (
              <div key={p} className="rounded-xl bg-surface border border-border shadow-card px-4 py-2.5 flex items-center gap-3">
                <PageChip p={p} />
                <span className="font-body text-[14px] text-ink truncate flex-1">{titleOf(p)}</span>
                <button onClick={() => toggleBookmark(p)} className="text-[12px] text-faint hover:text-ink" title="Remove bookmark">remove</button>
              </div>
            ))}
            {counts.bookmarks === 0 && <p className="text-faint font-body text-sm">No bookmarks yet.</p>}
          </div>
        )}

        {tab === "notes" && (
          <div className="space-y-2">
            {notePages.map((p) => (
              <button key={p} onClick={() => navigate(`/read/${p}`)} className="w-full text-left rounded-xl bg-surface border border-border shadow-card px-4 py-3 hover:shadow-card-hover transition-shadow flex gap-3 items-start">
                <PageChip p={p} />
                <span className="font-body text-[14px] text-ink2 whitespace-pre-wrap line-clamp-3">{ann.notes[p]}</span>
              </button>
            ))}
            {counts.notes === 0 && <p className="text-faint font-body text-sm">No notes yet.</p>}
          </div>
        )}

        {tab === "highlights" && (
          <div className="space-y-2">
            {hlPages.map((p) => (
              <div key={p} className="rounded-xl bg-surface border border-border shadow-card px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <PageChip p={p} />
                  <span className="font-body text-[12px] text-faint">{titleOf(p)}</span>
                </div>
                <div className="space-y-1">
                  {(ann.highlights[p] ?? []).map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span
                        className="font-body text-[13.5px] flex-1"
                        style={h.s === "ul" ? { textDecoration: "underline", textDecorationColor: "#EE9613" } : { background: "#FCE9B8", borderRadius: 3, padding: "0 2px" }}
                      >
                        {h.t}
                      </span>
                      <button onClick={() => removeHighlight(p, h.t)} className="text-[11px] text-faint hover:text-ink shrink-0" title="Remove">×</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {counts.highlights === 0 && <p className="text-faint font-body text-sm">No highlights yet.</p>}
          </div>
        )}
      </div>
    </Layout>
  );
}
