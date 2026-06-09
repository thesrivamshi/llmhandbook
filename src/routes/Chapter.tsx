import React from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import DiagramCard from "../components/DiagramCard";
import { diagramsForChapter, chapterMeta, accentOf } from "../book";
import { STAGES, stageForChapter } from "../theme";

export default function Chapter() {
  const { n } = useParams();
  const num = Number(n ?? 1);
  const diagrams = diagramsForChapter(num);
  const meta = chapterMeta(num);
  const accent = accentOf(num);
  const stage = STAGES[stageForChapter(num)];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-3 w-3 rounded-full" style={{ background: accent }} />
            <span className="font-body text-sm font-semibold" style={{ color: accent }}>{stage.label}</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            {meta?.title ?? `Chapter ${num}`}
          </h1>
          {meta && (
            <p className="font-body text-ink2 mt-2">
              Pages {meta.startPage}–{meta.endPage} · {diagrams.length} page diagrams. Scroll, or open a single page for big view + arrow-key navigation.
            </p>
          )}
        </header>

        {diagrams.length === 0 ? (
          <p className="font-body text-ink2">No diagrams authored for this chapter yet.</p>
        ) : (
          <div className="space-y-7">
            {diagrams.map((d) => (
              <Link key={d.page} to={`/page/${d.page}`} className="block focus-visible:outline-none">
                <DiagramCard d={d} id={`p${d.page}`} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
