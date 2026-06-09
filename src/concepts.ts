// Concept cross-links + glossary. Two indexes:
//  • FOCUS pages — where a concept is a subject (matched in a diagram's
//    term/title/caption/section). These drive the cross-link "every page" list.
//  • TEXT pages — where the concept's term appears anywhere in the page's clean
//    text. These fill chip coverage so a page still shows its concepts even when
//    the caption didn't name them.
import glossaryData from "./data/glossary.json";
import { ALL_DIAGRAMS, PAGES_CLEAN } from "./book";

export interface GlossaryEntry {
  term: string;
  def: string;
  aliases?: string[];
}

export const GLOSSARY = glossaryData as GlossaryEntry[];

const wordRe = (phrase: string) => {
  const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, "i");
};

const MATCHERS = GLOSSARY.map((g) => ({
  entry: g,
  res: [g.term, ...(g.aliases ?? [])].map((p) => wordRe(p.toLowerCase())),
}));

const focusPages = new Map<string, number[]>();
const focusByPage = new Map<number, string[]>();
const textPages = new Map<string, number[]>();
const textByPage = new Map<number, string[]>();

// FOCUS: from each diagram's own metadata.
for (const d of ALL_DIAGRAMS) {
  const hay = `${d.term} ${d.title} ${d.caption} ${d.section}`.toLowerCase();
  for (const { entry, res } of MATCHERS) {
    if (res.some((re) => re.test(hay))) {
      (focusPages.get(entry.term) ?? focusPages.set(entry.term, []).get(entry.term)!).push(d.page);
      (focusByPage.get(d.page) ?? focusByPage.set(d.page, []).get(d.page)!).push(entry.term);
    }
  }
}
// TEXT: from each page's full clean text.
for (const p of PAGES_CLEAN) {
  const hay = p.text.toLowerCase();
  for (const { entry, res } of MATCHERS) {
    if (res.some((re) => re.test(hay))) {
      (textPages.get(entry.term) ?? textPages.set(entry.term, []).get(entry.term)!).push(p.page);
      (textByPage.get(p.page) ?? textByPage.set(p.page, []).get(p.page)!).push(entry.term);
    }
  }
}
const uniqSort = (a: number[]) => Array.from(new Set(a)).sort((x, y) => x - y);
for (const [k, v] of focusPages) focusPages.set(k, uniqSort(v));
for (const [k, v] of textPages) textPages.set(k, uniqSort(v));

const focusFreq = (term: string) => focusPages.get(term)?.length ?? 0;

export const defOf = (term: string): string => GLOSSARY.find((g) => g.term === term)?.def ?? "";

// Cross-link targets: focus pages if the concept is a subject anywhere; else the
// (capped) text pages so the link still goes somewhere useful.
export function pagesForConcept(term: string): number[] {
  const f = focusPages.get(term);
  if (f && f.length) return f;
  return (textPages.get(term) ?? []).slice(0, 40);
}

// Chips for a page: concepts that are a focus here OR appear in the page text,
// ranked by how central they are across the book, capped so it stays scannable.
export function conceptsForPage(page: number): GlossaryEntry[] {
  const terms = new Set([...(focusByPage.get(page) ?? []), ...(textByPage.get(page) ?? [])]);
  return GLOSSARY.filter((g) => terms.has(g.term))
    .sort((a, b) => focusFreq(b.term) - focusFreq(a.term))
    .slice(0, 10);
}
