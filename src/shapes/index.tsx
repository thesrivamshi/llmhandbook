// Public surface of the shape alphabet: the glyphs, a <Canvas> to compose them
// on, a <ShapeTile> to show one standalone, and a SHAPE_REGISTRY that drives /legend.
import React from "react";
import {
  ModelGlyph,
  DataStoreGlyph,
  VectorDBGlyph,
  PipelineGlyph,
  DocumentGlyph,
  UserGlyph,
  FlowArrow,
  DecisionGlyph,
  SnapshotGlyph,
  TagGlyph,
  type GlyphProps,
} from "./primitives";

export * from "./primitives";

/* A blueprint canvas: a sized <svg> with a faint grid, to compose glyphs onto. */
export const Canvas: React.FC<{
  width?: number;
  height?: number;
  viewBox?: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}> = ({ width = 320, height = 200, viewBox, children, className, title }) => {
  const gridId = React.useId();
  return (
    <svg
      width="100%"
      viewBox={viewBox ?? `0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <defs>
        <pattern id={gridId} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ECE8DF" strokeWidth="1" opacity="0.7" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={width} height={height} fill={`url(#${gridId})`} />
      {children}
    </svg>
  );
};

/* One glyph shown standalone in its own square svg — used by the legend grid. */
export const ShapeTile: React.FC<{
  glyph: (p: GlyphProps) => React.ReactNode;
  accent: string;
  size?: number;
}> = ({ glyph, accent, size = 132 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" role="img" preserveAspectRatio="xMidYMid meet">
    {glyph({ accent, w: 120, h: 120 })}
  </svg>
);

export interface ShapeSpec {
  key: string;
  name: string;
  meaning: string;
  props: string;
  render: (accent: string) => React.ReactNode;
}

// The canonical alphabet — drives /legend and STYLE.md. Order = teaching order.
export const SHAPE_REGISTRY: ShapeSpec[] = [
  {
    key: "model",
    name: "Model / LLM",
    meaning: "A machine-learning model or LLM — a stack of connected nodes (a little neural net) in a rounded box.",
    props: "accent, x, y, w, h",
    render: (a) => <ShapeTile glyph={ModelGlyph} accent={a} />,
  },
  {
    key: "datastore",
    name: "Data store / DB / warehouse",
    meaning: "Any database, data warehouse, or persistent store — a cylinder.",
    props: "accent, x, y, w, h",
    render: (a) => <ShapeTile glyph={DataStoreGlyph} accent={a} />,
  },
  {
    key: "vectordb",
    name: "Vector DB / embeddings",
    meaning: "A vector database or embedding store — a cylinder overlaid with a dot grid.",
    props: "accent, x, y, w, h",
    render: (a) => <ShapeTile glyph={VectorDBGlyph} accent={a} />,
  },
  {
    key: "pipeline",
    name: "Pipeline / process / step",
    meaning: "A processing pipeline, job, or step — a rounded rectangle with a small flow chevron.",
    props: "accent, x, y, w, h",
    render: (a) => <ShapeTile glyph={PipelineGlyph} accent={a} />,
  },
  {
    key: "document",
    name: "Raw data / document",
    meaning: "A raw document, file, or unprocessed data — a page glyph with a folded corner.",
    props: "accent, x, y, w, h",
    render: (a) => <ShapeTile glyph={DocumentGlyph} accent={a} />,
  },
  {
    key: "user",
    name: "You / a user",
    meaning: "A person — you, an end user, or an author — a simple head-and-shoulders figure.",
    props: "accent, x, y, w, h",
    render: (a) => <ShapeTile glyph={UserGlyph} accent={a} />,
  },
  {
    key: "flow",
    name: "Flow (data moving)",
    meaning: "Data moving from one place to another — an arrow whose dashes animate so flow is visible.",
    props: "accent, x1, y1, x2, y2, animated",
    render: (a) => <ShapeTile glyph={(p) => <FlowArrow {...p} />} accent={a} />,
  },
  {
    key: "decision",
    name: "Decision / dispatcher / router",
    meaning: "A branch, router, or dispatcher that sends data different ways — a diamond.",
    props: "accent, x, y, w, h, mark",
    render: (a) => <ShapeTile glyph={(p) => <DecisionGlyph {...p} />} accent={a} />,
  },
  {
    key: "snapshot",
    name: "Snapshot / stored artifact",
    meaning: "A saved artifact or versioned snapshot — a dashed-border badge with a title + “→ used for…”.",
    props: "accent, title, usedFor, x, y, w, h",
    render: (a) => <ShapeTile glyph={(p) => <SnapshotGlyph {...p} title="dataset v3" usedFor="training" />} accent={a} />,
  },
  {
    key: "tag",
    name: "Category / tag",
    meaning: "A label, category, or tag attached to something — a pill chip.",
    props: "accent, text, x, y, w, h",
    render: (a) => <ShapeTile glyph={(p) => <TagGlyph {...p} text="instruct" />} accent={a} />,
  },
];
