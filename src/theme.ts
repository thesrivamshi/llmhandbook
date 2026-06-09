// Shared stage-color system. accent = phase, consistent everywhere
// (diagrams, sidebar, map). Keyed by chapter number.

export type Stage =
  | "foundations"
  | "feature"
  | "training"
  | "inference"
  | "operations";

export interface StageInfo {
  stage: Stage;
  label: string;
  accent: string; // hex
  chapters: string; // human-readable chapter range
}

export const STAGES: Record<Stage, StageInfo> = {
  foundations: { stage: "foundations", label: "Foundations", accent: "#0EA5B7", chapters: "Ch 1–2" },
  feature: { stage: "feature", label: "Feature / Data", accent: "#15A864", chapters: "Ch 3–4" },
  training: { stage: "training", label: "Training", accent: "#EE9613", chapters: "Ch 5–7" },
  inference: { stage: "inference", label: "Inference", accent: "#EF5C46", chapters: "Ch 8–10" },
  operations: { stage: "operations", label: "Operations", accent: "#7B61E8", chapters: "Ch 11 + Appendix" },
};

export const STAGE_ORDER: Stage[] = [
  "foundations",
  "feature",
  "training",
  "inference",
  "operations",
];

// Map a chapter number (1–11; Appendix counts as 12) to its stage.
export function stageForChapter(chapter: number): Stage {
  if (chapter <= 2) return "foundations";
  if (chapter <= 4) return "feature";
  if (chapter <= 7) return "training";
  if (chapter <= 10) return "inference";
  return "operations"; // Ch 11 + Appendix
}

export function accentForChapter(chapter: number): string {
  return STAGES[stageForChapter(chapter)].accent;
}

// Surface theme tokens (also defined in tailwind.config.js — kept here for SVG use).
// LIGHT theme. `panel`/`hairline` kept as aliases so existing glyph code stays valid.
export const THEME = {
  paper: "#FBFAF6", // page background
  surface: "#FFFFFF", // card / glyph body fill
  border: "#ECE8DF", // hairlines
  ink: "#25313C", // primary text
  ink2: "#5E6B76", // secondary text
  faint: "#97A0A8",
  // aliases used by the shape glyphs:
  panel: "#FFFFFF", // glyph body fill (was dark panel)
  hairline: "#CBD3D8", // structural strokes on white
} as const;
