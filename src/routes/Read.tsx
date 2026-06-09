import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DiagramCard from "../components/DiagramCard";
import TimerPill from "../components/TimerPill";
import NotesPanel from "../components/NotesPanel";
import ConceptChips from "../components/ConceptChips";
import { useAnnotations, toggleBookmark, addHighlight, removeHighlight, type Highlight } from "../annotations";
import {
  TOTAL_PAGES,
  cleanTextForPage,
  figuresForPage,
  pageImage,
  sectionForPage,
  accentForPage,
  diagramForPage,
} from "../book";

type LeftView = "original" | "text";
type MobilePane = "page" | "diagram";

const clamp = (n: number) => Math.max(1, Math.min(TOTAL_PAGES, n));

// Reflow the verbatim page text into readable paragraphs WITHOUT dropping a word:
// the source stores every printed line as its own `\n\n`-delimited segment (PDF
// line-wrapping), so we join wrapped lines, fix end-of-line hyphenation, and start
// a fresh paragraph only on bullets or after a short (ragged) line. The Original
// page image remains the exact, lossless view.
function reflow(text: string): string[] {
  const lines = text.split(/\n{2,}/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const sorted = lines.map((l) => l.length).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 0;
  const isBullet = (l: string) => /^([••*–]|-\s|\d+\.)\s*/.test(l);
  const paras: string[] = [];
  let cur = "";
  const push = () => {
    if (cur.trim()) paras.push(cur.trim());
    cur = "";
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i > 0) {
      const prev = lines[i - 1];
      const prevShort = prev.length < median * 0.72;
      const startsNew = /^[A-Z0-9“"(••*]/.test(line) || isBullet(line);
      if (isBullet(line) || (prevShort && startsNew)) push();
    }
    if (cur) {
      if (/[A-Za-z]-$/.test(cur)) cur = cur.replace(/-$/, "") + line; // de-hyphenate
      else cur += " " + line;
    } else {
      cur = line;
    }
  }
  push();
  return paras;
}

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Wrap saved highlights/underlines (longest first) in clickable <mark>s.
function renderHighlighted(text: string, highlights: Highlight[], onRemove: (p: string) => void): React.ReactNode {
  if (!highlights.length) return text;
  const styleOf = new Map(highlights.map((h) => [h.t, h.s]));
  const sorted = highlights.map((h) => h.t).sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${sorted.map(escRe).join("|")})`, "g");
  return text.split(re).map((part, i) => {
    const s = styleOf.get(part);
    if (!s) return <React.Fragment key={i}>{part}</React.Fragment>;
    const style: React.CSSProperties =
      s === "ul"
        ? { textDecoration: "underline", textDecorationColor: "#EE9613", textDecorationThickness: 2, textUnderlineOffset: 3, cursor: "pointer" }
        : { background: "#FCE9B8", color: "#25313C", borderRadius: 3, padding: "0 1px", cursor: "pointer" };
    return (
      <mark key={i} onClick={() => onRemove(part)} title="Click to remove" style={{ background: "transparent", color: "inherit", ...style }}>
        {part}
      </mark>
    );
  });
}

// Render the verbatim clean text as paragraphs, splicing the page's figure
// image(s) in after the first paragraph so nothing is lost. Select text to
// highlight it (saved per page); click a highlight to remove it.
const CleanText: React.FC<{ page: number; accent: string }> = ({ page, accent }) => {
  const text = cleanTextForPage(page);
  const figs = figuresForPage(page);
  const paras = reflow(text);
  const ann = useAnnotations();
  const phrases: Highlight[] = ann.highlights[page] ?? [];
  const [sel, setSel] = React.useState<{ x: number; y: number; text: string } | null>(null);
  const mark = (style: "hl" | "ul") => (e: React.MouseEvent) => {
    e.preventDefault();
    if (sel) addHighlight(page, sel.text, style);
    window.getSelection()?.removeAllRanges();
    setSel(null);
  };

  const onMouseUp = () => {
    const s = window.getSelection();
    const t = s?.toString().trim() ?? "";
    if (t.length >= 2 && t.length <= 300 && s && s.rangeCount > 0) {
      const r = s.getRangeAt(0).getBoundingClientRect();
      setSel({ x: r.left + r.width / 2, y: r.top, text: t });
    } else {
      setSel(null);
    }
  };

  if (paras.length === 0) {
    return <p className="text-faint italic">This page has no extracted text (blank or divider page). Use the Original view.</p>;
  }

  return (
    <div
      className="font-body text-ink leading-[1.7] text-[15px] max-w-[68ch] space-y-3.5"
      onMouseUp={onMouseUp}
      onMouseDown={() => setSel(null)}
    >
      {sel && (
        <div
          style={{ position: "fixed", left: sel.x, top: sel.y - 44, transform: "translateX(-50%)", zIndex: 60 }}
          className="flex gap-1 rounded-lg bg-ink p-1 shadow-card"
        >
          <button onMouseDown={mark("hl")} className="rounded-md px-2.5 py-1 text-[12px] text-white hover:bg-white/15" title="Highlight">
            ▮ Highlight
          </button>
          <button onMouseDown={mark("ul")} className="rounded-md px-2.5 py-1 text-[12px] text-white hover:bg-white/15" title="Underline">
            <span style={{ textDecoration: "underline", textDecorationColor: "#EE9613", textDecorationThickness: 2 }}>U</span> Underline
          </button>
        </div>
      )}
      {paras.map((p, i) => (
        <React.Fragment key={i}>
          <p>{renderHighlighted(p, phrases, (ph) => removeHighlight(page, ph))}</p>
          {i === 0 &&
            figs.map((f) => (
              <figure key={f.id} className="my-4 rounded-xl border border-border bg-paper/60 p-2">
                <img
                  src={`./${f.image}`}
                  alt={f.caption}
                  loading="lazy"
                  className="w-full rounded-lg"
                />
                <figcaption className="mt-2 text-[12px] text-ink2 font-mono" style={{ color: accent }}>
                  {f.caption}
                </figcaption>
              </figure>
            ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function Read() {
  const { page: pageParam } = useParams();
  const page = clamp(Number(pageParam ?? 30));
  const navigate = useNavigate();

  const [leftView, setLeftView] = React.useState<LeftView>("original");
  const [mobilePane, setMobilePane] = React.useState<MobilePane>("page");
  const [zoom, setZoom] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  React.useEffect(() => {
    setImgError(false);
    setZoom(false);
    try {
      localStorage.setItem("vb-last-page", String(page));
    } catch {
      /* ignore */
    }
  }, [page]);
  const [focus, setFocus] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem("vb-focus") === "1";
    } catch {
      return false;
    }
  });
  const [isFull, setIsFull] = React.useState(false);

  React.useEffect(() => {
    try {
      localStorage.setItem("vb-focus", focus ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [focus]);

  React.useEffect(() => {
    const onFs = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  };

  const section = sectionForPage(page);
  const accent = accentForPage(page);
  const d = diagramForPage(page);
  const ann = useAnnotations();
  const bookmarked = ann.bookmarks.includes(page);
  const [bmOpen, setBmOpen] = React.useState(false);

  const go = React.useCallback(
    (p: number) => {
      const np = clamp(p);
      setZoom(false);
      navigate(`/read/${np}`);
    },
    [navigate],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") go(page - 1);
      if (e.key === "ArrowRight") go(page + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, go]);

  const segBtn = (active: boolean) =>
    `px-3 py-1 text-[12.5px] rounded-lg border transition-colors ${
      active ? "font-semibold text-ink" : "text-ink2 hover:bg-paper/70"
    }`;

  return (
    <Layout immersive={focus}>
      {/* sticky reader toolbar */}
      <div className="sticky top-0 z-10 bg-paper/90 backdrop-blur border-b border-border px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => go(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-border px-2.5 py-1 text-sm hover:bg-surface disabled:opacity-40"
              aria-label="Previous page"
            >
              ←
            </button>
            <span className="font-mono text-[12px] px-2 py-1 rounded-md" style={{ background: `${accent}14`, color: accent }}>
              p.{page} / {TOTAL_PAGES}
            </span>
            <button
              onClick={() => go(page + 1)}
              disabled={page >= TOTAL_PAGES}
              className="rounded-lg border border-border px-2.5 py-1 text-sm hover:bg-surface disabled:opacity-40"
              aria-label="Next page"
            >
              →
            </button>
          </div>

          {/* bookmark this page (+ jump to any bookmark) */}
          <div className="relative flex items-center">
            <button
              onClick={() => toggleBookmark(page)}
              className="rounded-lg border border-border px-2 py-1 text-sm leading-none hover:bg-surface"
              style={{ color: bookmarked ? accent : "#97A0A8" }}
              title={bookmarked ? "Remove bookmark" : "Bookmark this page"}
              aria-pressed={bookmarked}
            >
              {bookmarked ? "★" : "☆"}
            </button>
            {ann.bookmarks.length > 0 && (
              <button
                onClick={() => setBmOpen((o) => !o)}
                className="ml-0.5 rounded-lg border border-border px-1.5 py-1 text-[11px] text-ink2 hover:bg-surface"
                title="Your bookmarks"
                aria-expanded={bmOpen}
              >
                {ann.bookmarks.length} ▾
              </button>
            )}
            {bmOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBmOpen(false)} aria-hidden />
                <div className="absolute left-0 top-full mt-1.5 z-50 w-64 max-h-80 overflow-y-auto rounded-xl border border-border bg-surface shadow-card p-1.5 font-body">
                  {ann.bookmarks.map((bp) => (
                    <button
                      key={bp}
                      onClick={() => {
                        setBmOpen(false);
                        go(bp);
                      }}
                      className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-paper flex items-baseline gap-2"
                    >
                      <span className="font-mono text-[10.5px] shrink-0" style={{ color: accentForPage(bp) }}>
                        p.{bp}
                      </span>
                      <span className="text-[12.5px] text-ink truncate">{diagramForPage(bp)?.title ?? sectionForPage(bp)?.title ?? "Page"}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="text-[13px] text-ink2 truncate min-w-0 flex-1">
            {section?.title ?? "—"}
          </div>

          {/* left-pane view toggle (desktop + mobile) */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-0.5">
            <button className={segBtn(leftView === "original")} onClick={() => setLeftView("original")}>
              Original
            </button>
            <button className={segBtn(leftView === "text")} onClick={() => setLeftView("text")}>
              Clean text
            </button>
          </div>

          {/* mobile pane toggle */}
          <div className="flex lg:hidden items-center gap-1 rounded-xl border border-border bg-surface p-0.5">
            <button className={segBtn(mobilePane === "page")} onClick={() => setMobilePane("page")}>
              Page
            </button>
            <button className={segBtn(mobilePane === "diagram")} onClick={() => setMobilePane("diagram")}>
              Diagram
            </button>
          </div>

          {/* distraction-free reading: auto-hide sidebar + browser fullscreen + a tiny timer */}
          <div className="flex items-center gap-1.5">
            <TimerPill accent={accent} />
            <button
              onClick={() => setFocus((f) => !f)}
              className={`hidden lg:inline-block px-3 py-1 text-[12.5px] rounded-lg border transition-colors ${
                focus ? "font-semibold text-ink border-ink/30 bg-paper" : "text-ink2 border-border hover:bg-paper/70"
              }`}
              title="Focus mode: auto-hide the sidebar; move the mouse to the left edge to bring it back"
              aria-pressed={focus}
            >
              {focus ? "◉ Focus" : "◌ Focus"}
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 text-[12.5px] rounded-lg border border-border text-ink2 hover:bg-paper/70 transition-colors"
              title="Toggle full screen"
              aria-pressed={isFull}
            >
              {isFull ? "Exit ⤧" : "⛶ Full screen"}
            </button>
          </div>
        </div>
        {/* you-are-here progress across the whole book */}
        <div className="mt-2 h-1 rounded-full bg-border/60 overflow-hidden" aria-hidden>
          <div className="h-full rounded-full transition-all" style={{ width: `${(page / TOTAL_PAGES) * 100}%`, background: accent }} />
        </div>
      </div>

      {/* two synced panes */}
      <div className="lg:grid lg:grid-cols-2 lg:h-[calc(100vh-57px)]">
        {/* LEFT — the exact page */}
        <section
          className={`${mobilePane === "page" ? "block" : "hidden"} lg:block lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-border px-4 sm:px-6 py-5`}
          aria-label={`Book page ${page}`}
        >
          {leftView === "original" && !imgError ? (
            <div className="flex flex-col items-center">
              <img
                key={page}
                src={pageImage(page)}
                alt={`Book page ${page} (original)`}
                onClick={() => setZoom((z) => !z)}
                className={`rounded-xl border border-border shadow-card bg-white cursor-zoom-in transition-all ${
                  zoom ? "max-w-none w-[140%] cursor-zoom-out" : "w-full max-w-[640px]"
                }`}
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div>
              {leftView === "original" && imgError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-paper px-3 py-2 text-[12.5px] text-ink2">
                  <span>The page image didn’t load — showing the full text instead.</span>
                  <button
                    onClick={() => setImgError(false)}
                    className="ml-auto rounded-md border border-border px-2 py-0.5 hover:bg-surface"
                  >
                    Retry image
                  </button>
                </div>
              )}
              <CleanText page={page} accent={accent} />
            </div>
          )}
        </section>

        {/* RIGHT — the diagram + your notes */}
        <section
          className={`${mobilePane === "diagram" ? "flex" : "hidden"} lg:flex flex-col lg:overflow-y-auto px-4 sm:px-6 py-5 bg-paper/40`}
          aria-label="Diagram and notes"
        >
          {d ? (
            <DiagramCard d={d} />
          ) : (
            <div className="min-h-[220px] flex flex-col items-center justify-center text-center rounded-card border border-dashed border-border bg-surface/60 px-6 py-10">
              <div
                className="h-10 w-10 rounded-full mb-3 flex items-center justify-center font-mono text-sm"
                style={{ background: `${accent}1A`, color: accent }}
              >
                {page}
              </div>
              <p className="font-display text-lg font-semibold">Diagram coming for this page</p>
              <p className="font-body text-sm text-ink2 mt-1 max-w-xs">{section?.title ?? "—"}</p>
              <p className="font-body text-xs text-faint mt-3">The full page is on the left — nothing is missing.</p>
            </div>
          )}
          <ConceptChips page={page} accent={accent} />
          <NotesPanel page={page} accent={accent} />
        </section>
      </div>
    </Layout>
  );
}
