import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import interviewData from "../data/interview.json";
import { CHAPTERS, accentOf } from "../book";
import { useAnnotations, setQuiz, resetQuiz } from "../annotations";

interface Q {
  id: string;
  q: string;
  a: string;
  page: number;
  level: string;
}
const BANK = interviewData as Record<string, Q[]>;
const CHAPTER_NUMS = Object.keys(BANK)
  .map(Number)
  .sort((a, b) => a - b);
const TOTAL_AUTHORED = Object.values(BANK).reduce((n, arr) => n + arr.length, 0);

// Deterministic shuffle (seeded) so a "Final test" is stable within a session.
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const chapterTitle = (n: number) => CHAPTERS.find((c) => c.chapterNumber === n)?.title ?? `Chapter ${n}`;

const QCard: React.FC<{ q: Q; accent: string }> = ({ q, accent }) => {
  const ann = useAnnotations();
  const [open, setOpen] = React.useState(false);
  const rating = ann.quiz[q.id];
  return (
    <article className="rounded-card bg-surface border border-border shadow-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[10.5px] px-1.5 py-0.5 rounded" style={{ color: accent, background: `${accent}14` }}>
          {q.level}
        </span>
        <Link to={`/read/${q.page}`} className="font-mono text-[10.5px] text-faint hover:underline">
          p.{q.page}
        </Link>
        {rating && (
          <span className="ml-auto text-[11px] font-mono" style={{ color: rating === "known" ? "#15A864" : "#EE9613" }}>
            {rating === "known" ? "✓ got it" : "↻ revisit"}
          </span>
        )}
      </div>
      <p className="font-body text-[15px] text-ink leading-relaxed">{q.q}</p>

      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-3 text-[13px] rounded-lg border border-border px-3 py-1.5 hover:bg-paper/60">
          Answer in your head, then reveal →
        </button>
      ) : (
        <div className="mt-3">
          <div className="rounded-xl bg-paper/70 border border-border p-3 font-body text-[14px] text-ink2 leading-relaxed">{q.a}</div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[12px] text-faint">How did you do?</span>
            <button
              onClick={() => setQuiz(q.id, "known")}
              className="text-[12.5px] rounded-lg px-3 py-1 border"
              style={rating === "known" ? { background: "#15A864", borderColor: "#15A864", color: "#fff" } : { borderColor: "#CBD3D8" }}
            >
              Got it
            </button>
            <button
              onClick={() => setQuiz(q.id, "revisit")}
              className="text-[12.5px] rounded-lg px-3 py-1 border"
              style={rating === "revisit" ? { background: "#EE9613", borderColor: "#EE9613", color: "#fff" } : { borderColor: "#CBD3D8" }}
            >
              Revisit
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default function Quiz() {
  const [sel, setSel] = React.useState<number | "test">(CHAPTER_NUMS[0] ?? "test");
  const [revisitOnly, setRevisitOnly] = React.useState(false);
  const ann = useAnnotations();

  const allQuestions: Q[] = sel === "test" ? shuffle(Object.values(BANK).flat(), 7) : BANK[String(sel)] ?? [];
  const questions = revisitOnly ? allQuestions.filter((q) => ann.quiz[q.id] === "revisit") : allQuestions;
  const accent = sel === "test" ? "#7B61E8" : accentOf(sel as number);
  const known = allQuestions.filter((q) => ann.quiz[q.id] === "known").length;
  const revisit = allQuestions.filter((q) => ann.quiz[q.id] === "revisit").length;
  const rated = known + revisit;
  const pct = allQuestions.length ? Math.round((known / allQuestions.length) * 100) : 0;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight mb-1">Interview yourself</h1>
        <p className="text-ink2 font-body text-sm mb-4">
          Deep, technical questions you can only answer once you’ve read the pages — reason it out, then reveal. {TOTAL_AUTHORED} questions authored so far;
          more chapters are being added.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {CHAPTER_NUMS.map((n) => (
            <button
              key={n}
              onClick={() => setSel(n)}
              className="px-3 py-1 text-[12.5px] rounded-lg border transition-colors"
              style={sel === n ? { background: accentOf(n), borderColor: accentOf(n), color: "#fff" } : { borderColor: "#ECE8DF", color: "#5E6B76" }}
            >
              Ch {n}
            </button>
          ))}
          <button
            onClick={() => setSel("test")}
            className="px-3 py-1 text-[12.5px] rounded-lg border transition-colors"
            style={sel === "test" ? { background: "#7B61E8", borderColor: "#7B61E8", color: "#fff" } : { borderColor: "#7B61E8", color: "#7B61E8" }}
          >
            ★ Final test
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3 flex-wrap text-[12px] font-mono text-ink2">
          <span>{sel === "test" ? "Final test (all authored chapters)" : chapterTitle(sel as number)}</span>
          <span className="text-faint">·</span>
          <span style={{ color: "#15A864" }}>{known} got it</span>
          <span style={{ color: "#EE9613" }}>{revisit} revisit</span>
          <span className="text-faint">· {rated}/{allQuestions.length} rated</span>
          {revisit > 0 && (
            <button onClick={() => setRevisitOnly((v) => !v)} className={`px-2 py-0.5 rounded-md border ${revisitOnly ? "bg-paper font-semibold text-ink border-border" : "border-border hover:bg-paper/70"}`}>
              {revisitOnly ? "show all" : "review revisit only"}
            </button>
          )}
          {rated > 0 && (
            <button onClick={() => resetQuiz(allQuestions.map((q) => q.id))} className="px-2 py-0.5 rounded-md border border-border hover:bg-paper/70" title="Clear ratings for this set">
              reset
            </button>
          )}
        </div>

        {/* score bar */}
        <div className="h-2 rounded-full bg-border/60 overflow-hidden mb-5">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#15A864" }} />
        </div>

        <div className="space-y-3.5">
          {allQuestions.length === 0 ? (
            <p className="text-ink2 font-body">No questions for this chapter yet — being authored.</p>
          ) : questions.length === 0 ? (
            <p className="text-ink2 font-body">Nothing marked “revisit” here. <button className="underline" onClick={() => setRevisitOnly(false)}>Show all</button>.</p>
          ) : (
            questions.map((q) => <QCard key={q.id} q={q} accent={accent} />)
          )}
        </div>
      </div>
    </Layout>
  );
}
