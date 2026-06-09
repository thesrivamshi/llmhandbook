import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import tasksData from "../data/tasks.json";
import { useAnnotations, toggleTask } from "../annotations";
import { accentForChapter } from "../theme";

interface Item {
  id: string;
  label: string;
}
interface Phase {
  phase: string;
  chapter: number;
  page: number;
  items: Item[];
}
const PHASES = tasksData as Phase[];
const TOTAL = PHASES.reduce((n, p) => n + p.items.length, 0);

export default function Tasks() {
  const ann = useAnnotations();
  const done = new Set(ann.tasksDone);
  const completed = PHASES.reduce((n, p) => n + p.items.filter((i) => done.has(i.id)).length, 0);
  const pct = Math.round((completed / TOTAL) * 100);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight mb-1">Build the LLM Twin</h1>
        <p className="text-ink2 font-body text-sm mb-4">
          This book is a project: you build one end-to-end system. Here’s the checklist, in the order the chapters build it. Ticks save locally.
        </p>
        <div className="flex items-center gap-3 mb-7">
          <div className="flex-1 h-2 rounded-full bg-border/60 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#15A864" }} />
          </div>
          <span className="font-mono text-[12px] text-ink2">
            {completed}/{TOTAL} · {pct}%
          </span>
        </div>

        <div className="space-y-6">
          {PHASES.map((p) => {
            const accent = accentForChapter(p.chapter);
            const phaseDone = p.items.filter((i) => done.has(i.id)).length;
            return (
              <section key={p.phase}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
                  <h2 className="font-display font-semibold">{p.phase}</h2>
                  <Link to={`/read/${p.page}`} className="text-[11px] font-mono px-2 py-0.5 rounded-md hover:underline" style={{ color: accent, background: `${accent}14` }}>
                    Ch {p.chapter} · p.{p.page}
                  </Link>
                  <span className="ml-auto text-[11px] text-faint font-mono">
                    {phaseDone}/{p.items.length}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {p.items.map((it) => {
                    const checked = done.has(it.id);
                    return (
                      <li key={it.id}>
                        <button
                          onClick={() => toggleTask(it.id)}
                          className="w-full text-left flex items-start gap-2.5 rounded-lg px-3 py-2 border border-border bg-surface hover:bg-paper/60 transition-colors"
                        >
                          <span
                            className="mt-0.5 h-4 w-4 rounded shrink-0 border flex items-center justify-center text-[11px]"
                            style={checked ? { background: accent, borderColor: accent, color: "#fff" } : { borderColor: "#CBD3D8" }}
                          >
                            {checked ? "✓" : ""}
                          </span>
                          <span className={`font-body text-[14px] ${checked ? "line-through text-faint" : "text-ink"}`}>{it.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
