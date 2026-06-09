import type { ReactNode } from "react";
import type { Stage } from "../theme";

export type Archetype =
  | "single-concept"
  | "pipeline-flow"
  | "architecture"
  | "comparison"
  | "list-cluster"
  | "cycle"
  | "hierarchy"
  | "code-anatomy"
  | "formula-as-blocks"
  | "pitfall";

export interface PageDiagram {
  page: number;
  chapter: number;
  stage: Stage;
  accent: string;
  archetype: Archetype;
  term: string; // short mono eyebrow, e.g. "FTI ARCHITECTURE"
  title: string; // plain title, e.g. "Feature, Training, Inference"
  caption: string; // 1–2 sentences, real terminology
  section: string; // which book section this page sits in
  diagram: ReactNode; // composed from the shape alphabet + brand logos
}

export const ARCHETYPE_LABEL: Record<Archetype, string> = {
  "single-concept": "Single concept",
  "pipeline-flow": "Pipeline flow",
  architecture: "Architecture",
  comparison: "Comparison",
  "list-cluster": "List cluster",
  cycle: "Cycle",
  hierarchy: "Hierarchy",
  "code-anatomy": "Code anatomy",
  "formula-as-blocks": "Formula as blocks",
  pitfall: "Pitfall",
};
