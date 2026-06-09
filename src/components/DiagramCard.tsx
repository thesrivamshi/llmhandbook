import React from "react";
import type { PageDiagram } from "../diagrams/types";
import { ARCHETYPE_LABEL } from "../diagrams/types";

// A single page's diagram, framed: page chip, archetype tag, term eyebrow,
// title, the diagram canvas, and the caption.
export const DiagramCard: React.FC<{ d: PageDiagram; big?: boolean; id?: string }> = ({ d, big, id }) => {
  return (
    <article id={id} className="rounded-card bg-surface border border-border shadow-card overflow-hidden scroll-mt-6">
      <div className="px-5 sm:px-7 pt-5 sm:pt-6">
        <div className="flex items-center gap-2.5 flex-wrap mb-3">
          <span className="font-mono text-[11px] px-2 py-1 rounded-md" style={{ background: `${d.accent}14`, color: d.accent }}>
            p.{d.page}
          </span>
          <span className="font-body text-[11px] px-2 py-1 rounded-md bg-paper text-ink2 border border-border">
            {ARCHETYPE_LABEL[d.archetype]}
          </span>
          <span className="font-mono text-[11px] tracking-wide text-faint">{d.term}</span>
        </div>
        <h2 className={`font-display font-semibold tracking-tight ${big ? "text-3xl" : "text-xl"}`}>{d.title}</h2>
      </div>

      <div className="px-5 sm:px-7 py-5">
        <div className="rounded-xl bg-paper/70 border border-border p-3 sm:p-4">{d.diagram}</div>
      </div>

      <div className="px-5 sm:px-7 pb-6 -mt-1">
        <p className={`font-body text-ink2 leading-relaxed ${big ? "text-[15px]" : "text-sm"}`}>{d.caption}</p>
      </div>
    </article>
  );
};

export default DiagramCard;
