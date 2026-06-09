// /legend — the key for the whole app. The abstract shape alphabet (generic
// concepts) AND the brand layer (specific named tools, real logos). Light theme.
import React from "react";
import { SHAPE_REGISTRY } from "../shapes";
import { STAGES, STAGE_ORDER, type Stage } from "../theme";
import { BrandIcon } from "../brand/BrandIcon";
import { TOOL_REGISTRY } from "../brand/registry";

// A curated dozen for the legend — mixes real logos with fallback pills so the
// brand layer is clearly visible.
const SHOWCASE = [
  "Python",
  "Hugging Face",
  "MongoDB",
  "Qdrant",
  "Docker",
  "GitHub",
  "LangChain",
  "Mistral",
  "Meta Llama",
  "AWS",
  "OpenAI",
  "Comet ML",
];

export default function Legend() {
  const [stage, setStage] = React.useState<Stage>("foundations");
  const accent = STAGES[stage].accent;

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 md:px-12 max-w-6xl mx-auto text-ink">
      {/* Header */}
      <header className="mb-10">
        <p className="font-body text-sm text-ink2 mb-2">Visual Book · The LLM Engineer&rsquo;s Handbook</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">The shape alphabet</h1>
        <p className="font-body text-ink2 mt-3 max-w-2xl leading-relaxed text-[15px]">
          One shape always means one thing, and colour always means the book&rsquo;s phase. Specific
          tools keep their real logos and brand colours; everything generic uses a clean shape. This
          page is the key to every diagram in the app.
        </p>
      </header>

      {/* Stage colour system */}
      <section aria-labelledby="stages-h" className="mb-12">
        <h2 id="stages-h" className="font-display text-xl font-semibold mb-1">Stage colours</h2>
        <p className="font-body text-sm text-ink2 mb-4">Accent = phase. Click a phase to recolour every shape below.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAGE_ORDER.map((s) => {
            const info = STAGES[s];
            const active = s === stage;
            return (
              <button
                key={s}
                onClick={() => setStage(s)}
                aria-pressed={active}
                className="text-left rounded-card bg-surface px-4 py-3.5 transition-shadow focus-visible:outline-none border"
                style={{
                  borderColor: active ? info.accent : "#ECE8DF",
                  boxShadow: active ? `0 0 0 2px ${info.accent}22, 0 10px 30px rgba(30,40,50,.06)` : "0 1px 2px rgba(30,40,50,.05)",
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3.5 w-3.5 rounded-full" style={{ background: info.accent }} />
                  <span className="font-display font-semibold text-[15px]">{info.label}</span>
                </span>
                <span className="block font-body text-[13px] text-ink2 mt-1.5">{info.chapters}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* The abstract alphabet */}
      <section aria-labelledby="shapes-h" className="mb-12">
        <h2 id="shapes-h" className="font-display text-xl font-semibold mb-1">Generic concepts — the shapes</h2>
        <p className="font-body text-sm text-ink2 mb-4">
          {SHAPE_REGISTRY.length} shapes. Previewing in{" "}
          <span className="font-semibold" style={{ color: accent }}>{STAGES[stage].label}</span>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SHAPE_REGISTRY.map((shape) => (
            <article key={shape.key} className="rounded-card bg-surface border border-border shadow-card overflow-hidden flex flex-col">
              <div className="flex items-center justify-center bg-paper/60 border-b border-border py-5">
                {shape.render(accent)}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold">{shape.name}</h3>
                <p className="font-body text-sm text-ink2 mt-1.5 leading-relaxed">{shape.meaning}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* The brand layer */}
      <section aria-labelledby="tools-h" className="mb-10">
        <h2 id="tools-h" className="font-display text-xl font-semibold mb-1">Real tools — the brand layer</h2>
        <p className="font-body text-sm text-ink2 mb-5 max-w-2xl">
          When a node is a specific product, it shows its real logo in its official colour — so the
          book&rsquo;s actual stack is recognisable at a glance. Tools without an official icon get a
          name-pill in their brand colour.
        </p>
        <div className="rounded-card bg-surface border border-border shadow-card p-6">
          <div className="flex flex-wrap gap-3">
            {SHOWCASE.map((name) => (
              <BrandIcon key={name} name={name} />
            ))}
          </div>
          <p className="font-body text-[13px] text-faint mt-5">
            {TOOL_REGISTRY.filter((t) => t.resolved).length} of {TOOL_REGISTRY.length} seeded tools
            resolve to a real logo; the rest use brand-colour pills.
          </p>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t border-border font-body text-[13px] text-faint">
        Same idea = same shape, everywhere. Real things in their real colours.
      </footer>
    </main>
  );
}
