// Concept cross-links + glossary. Builds a concept→pages index by scanning each
// authored diagram's own metadata (term/title/caption/section) for glossary
// terms and their aliases. Lets the reader hover a concept for its definition
// and jump to every page where it appears.
import glossaryData from "./data/glossary.json";
import { ALL_DIAGRAMS } from "./book";

export interface GlossaryEntry {
  term: string;
  def: string;
  aliases?: string[];
}

export const GLOSSARY = glossaryData as GlossaryEntry[];

const wordRe = (phrase: string) => {
  const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // word-ish boundaries that tolerate punctuation around tech terms
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, "i");
};

// Precompile matchers per concept.
const MATCHERS = GLOSSARY.map((g) => ({
  entry: g,
  res: [g.term, ...(g.aliases ?? [])].map((p) => wordRe(p.toLowerCase())),
}));

// concept term (lowercased) → sorted unique pages
const pagesByConcept = new Map<string, number[]>();
// page → concept terms present on it
const conceptsByPage = new Map<number, string[]>();

for (const d of ALL_DIAGRAMS) {
  const hay = `${d.term} ${d.title} ${d.caption} ${d.section}`.toLowerCase();
  for (const { entry, res } of MATCHERS) {
    if (res.some((re) => re.test(hay))) {
      const key = entry.term;
      const arr = pagesByConcept.get(key) ?? [];
      arr.push(d.page);
      pagesByConcept.set(key, arr);
      const cp = conceptsByPage.get(d.page) ?? [];
      cp.push(key);
      conceptsByPage.set(d.page, cp);
    }
  }
}
for (const [k, v] of pagesByConcept) pagesByConcept.set(k, Array.from(new Set(v)).sort((a, b) => a - b));

export const defOf = (term: string): string => GLOSSARY.find((g) => g.term === term)?.def ?? "";
export const pagesForConcept = (term: string): number[] => pagesByConcept.get(term) ?? [];
export function conceptsForPage(page: number): GlossaryEntry[] {
  const terms = conceptsByPage.get(page) ?? [];
  return GLOSSARY.filter((g) => terms.includes(g.term)).sort((a, b) => pagesForConcept(b.term).length - pagesForConcept(a.term).length);
}
