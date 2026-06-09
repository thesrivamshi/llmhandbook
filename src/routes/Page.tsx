import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import DiagramCard from "../components/DiagramCard";
import { ALL_DIAGRAMS, diagramForPage, chapterForPage } from "../book";

const SORTED = [...ALL_DIAGRAMS].sort((a, b) => a.page - b.page);

export default function Page() {
  const { n } = useParams();
  const page = Number(n);
  const navigate = useNavigate();

  const idx = SORTED.findIndex((d) => d.page === page);
  const d = diagramForPage(page);
  const ch = chapterForPage(page) ?? d?.chapter ?? 1;
  const prev = idx > 0 ? SORTED[idx - 1] : undefined;
  const next = idx >= 0 && idx < SORTED.length - 1 ? SORTED[idx + 1] : undefined;

  // Arrow-key navigation
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prev) navigate(`/page/${prev.page}`);
      if (e.key === "ArrowRight" && next) navigate(`/page/${next.page}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, navigate]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {!d ? (
          <div className="font-body">
            <p className="text-ink2">No diagram for page {page} yet.</p>
            <Link to={`/read/${page}`} className="text-ink underline mt-3 inline-block">Open in reader</Link>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <Link to={`/chapter/${ch}`} className="font-body text-sm text-ink2 hover:text-ink">← Chapter {ch}</Link>
            </div>
            <DiagramCard d={d} big />
            <nav className="flex items-center justify-between mt-6 gap-3" aria-label="Page navigation">
              {prev ? (
                <button
                  onClick={() => navigate(`/page/${prev.page}`)}
                  className="flex-1 text-left rounded-card bg-surface border border-border shadow-card px-4 py-3 hover:shadow-card-hover transition-shadow"
                >
                  <div className="font-mono text-[11px] text-faint">← p.{prev.page}</div>
                  <div className="font-body text-sm font-semibold truncate">{prev.title}</div>
                </button>
              ) : <div className="flex-1" />}
              {next ? (
                <button
                  onClick={() => navigate(`/page/${next.page}`)}
                  className="flex-1 text-right rounded-card bg-surface border border-border shadow-card px-4 py-3 hover:shadow-card-hover transition-shadow"
                >
                  <div className="font-mono text-[11px] text-faint">p.{next.page} →</div>
                  <div className="font-body text-sm font-semibold truncate">{next.title}</div>
                </button>
              ) : <div className="flex-1" />}
            </nav>
            <p className="text-center font-mono text-[11px] text-faint mt-4">Use ← / → arrow keys to move between pages</p>
          </>
        )}
      </div>
    </Layout>
  );
}
