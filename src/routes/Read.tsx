import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DiagramCard from "../components/DiagramCard";
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

// Render the verbatim clean text as paragraphs, splicing the page's figure
// image(s) in after the first paragraph so nothing is lost.
const CleanText: React.FC<{ page: number; accent: string }> = ({ page, accent }) => {
  const text = cleanTextForPage(page);
  const figs = figuresForPage(page);
  const paras = reflow(text);

  if (paras.length === 0) {
    return <p className="text-faint italic">This page has no extracted text (blank or divider page). Use the Original view.</p>;
  }

  return (
    <div className="font-body text-ink leading-[1.7] text-[15px] max-w-[68ch] space-y-3.5">
      {paras.map((p, i) => (
        <React.Fragment key={i}>
          <p>{p}</p>
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

          {/* distraction-free reading: auto-hide sidebar + browser fullscreen */}
          <div className="flex items-center gap-1.5">
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
          {leftView === "original" ? (
            <div className="flex flex-col items-center">
              <img
                src={pageImage(page)}
                alt={`Book page ${page} (original)`}
                onClick={() => setZoom((z) => !z)}
                className={`rounded-xl border border-border shadow-card bg-white cursor-zoom-in transition-all ${
                  zoom ? "max-w-none w-[140%] cursor-zoom-out" : "w-full max-w-[640px]"
                }`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove("hidden");
                }}
              />
              <div className="hidden mt-6 text-center text-ink2 font-body max-w-md">
                <p className="font-semibold mb-1">Original page image not rendered yet.</p>
                <p className="text-sm">
                  Run <code className="font-mono text-[12px]">node scripts/render-pages.mjs</code> to generate it, or switch to{" "}
                  <button className="underline" onClick={() => setLeftView("text")}>
                    Clean text
                  </button>
                  .
                </p>
              </div>
            </div>
          ) : (
            <CleanText page={page} accent={accent} />
          )}
        </section>

        {/* RIGHT — the diagram */}
        <section
          className={`${mobilePane === "diagram" ? "block" : "hidden"} lg:block lg:overflow-y-auto px-4 sm:px-6 py-5 bg-paper/40`}
          aria-label="Diagram"
        >
          {d ? (
            <DiagramCard d={d} />
          ) : (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center rounded-card border border-dashed border-border bg-surface/60 px-6 py-12">
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
        </section>
      </div>
    </Layout>
  );
}
