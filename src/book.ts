// Book model: the table of contents (for the sidebar) + the authored diagrams.
import tocData from "./data/toc.json";
import chaptersData from "./data/chapters.json";
import pagesCleanData from "./data/pages.clean.json";
import figuresData from "./data/figures.json";
import { CHAPTER1 } from "./diagrams/chapter1";
import { CHAPTER2 } from "./diagrams/chapter2";
import { CHAPTER3 } from "./diagrams/chapter3";
import { CHAPTER4 } from "./diagrams/chapter4";
import { CHAPTER5 } from "./diagrams/chapter5";
import { CHAPTER6 } from "./diagrams/chapter6";
import { CHAPTER7 } from "./diagrams/chapter7";
import { CHAPTER8 } from "./diagrams/chapter8";
import { CHAPTER9 } from "./diagrams/chapter9";
import { CHAPTER10 } from "./diagrams/chapter10";
import { CHAPTER11 } from "./diagrams/chapter11";
import { CHAPTER12 } from "./diagrams/chapter12";
import type { PageDiagram } from "./diagrams/types";
import { stageForChapter, accentForChapter, type Stage } from "./theme";

export interface TocNode {
  id: number;
  title: string;
  depth: number;
  startPage: number | null;
  children: TocNode[];
}

export interface ChapterMeta {
  id: number;
  title: string;
  chapterNumber: number | null;
  startPage: number;
  endPage: number;
  pageCount: number;
  headingCount: number;
}

export interface CleanPage {
  page: number;
  text: string;
}
export interface FigureEntry {
  id: string;
  page: number;
  caption: string;
  isCaption: boolean;
  image: string;
}

export const TOC = tocData as TocNode[];
export const CHAPTERS = chaptersData as ChapterMeta[];
export const PAGES_CLEAN = pagesCleanData as CleanPage[];
export const FIGURES = figuresData as FigureEntry[];

export const TOTAL_PAGES = PAGES_CLEAN.length; // 523

const CLEAN_BY_PAGE = new Map<number, string>(PAGES_CLEAN.map((p) => [p.page, p.text]));

// Full, verbatim cleaned text for a page (the reader's LEFT pane). Never a summary.
export function cleanTextForPage(page: number): string {
  return CLEAN_BY_PAGE.get(page) ?? "";
}

// Figures that appear on a given page (for inline display in the clean-text view).
export function figuresForPage(page: number): FigureEntry[] {
  return FIGURES.filter((f) => f.page === page);
}

// The path to the original rendered page image (served from public/page-images).
export function pageImage(page: number): string {
  return `./page-images/p${page}.png`;
}

// Which chapters.json section owns a page (covers front/back matter too).
export function sectionForPage(page: number): ChapterMeta | undefined {
  return CHAPTERS.find((c) => page >= c.startPage && page <= c.endPage);
}

// Chapter number for a page (null for front/back matter / appendix).
export function chapterForPage(page: number): number | null {
  return sectionForPage(page)?.chapterNumber ?? null;
}

// Stage accent for a page; front/back matter falls back to a neutral ink tone.
export function accentForPage(page: number): string {
  const ch = chapterForPage(page);
  // Appendix (no chapterNumber but titled "Appendix") → operations stage.
  const sec = sectionForPage(page);
  if (ch == null && sec && /Appendix/i.test(sec.title)) return accentForChapter(12);
  return ch == null ? "#5E6B76" : accentForChapter(ch);
}

// Diagrams authored so far, keyed by chapter.
export const DIAGRAMS_BY_CHAPTER: Record<number, PageDiagram[]> = { 1: CHAPTER1, 2: CHAPTER2, 3: CHAPTER3, 4: CHAPTER4, 5: CHAPTER5, 6: CHAPTER6, 7: CHAPTER7, 8: CHAPTER8, 9: CHAPTER9, 10: CHAPTER10, 11: CHAPTER11, 12: CHAPTER12 };
export const ALL_DIAGRAMS: PageDiagram[] = Object.values(DIAGRAMS_BY_CHAPTER).flat();

export function diagramsForChapter(n: number): PageDiagram[] {
  return DIAGRAMS_BY_CHAPTER[n] ?? [];
}

export function diagramForPage(page: number): PageDiagram | undefined {
  return ALL_DIAGRAMS.find((d) => d.page === page);
}

// The Chapter N outline node (its children are the sections shown in the sidebar).
export function chapterTocNode(n: number): TocNode | undefined {
  return TOC.find((t) => new RegExp(`Chapter ${n}:`).test(t.title));
}

export function chapterMeta(n: number): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.chapterNumber === n);
}

export function stageOf(n: number): Stage {
  return stageForChapter(n);
}
export function accentOf(n: number): string {
  return accentForChapter(n);
}
