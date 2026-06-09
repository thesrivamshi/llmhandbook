// Phase 0 — Extract the book's skeleton from book.pdf
// Produces: data/toc.json, data/pages.json, data/chapters.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PDF_PATH = path.join(ROOT, "book.pdf");
const DATA = path.join(ROOT, "data");
fs.mkdirSync(DATA, { recursive: true });

const data = new Uint8Array(fs.readFileSync(PDF_PATH));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
const numPages = doc.numPages;
console.log(`Loaded PDF: ${numPages} pages`);

// ---- Build a map from internal destination refs -> page index (1-based) ----
async function destToPageNumber(dest) {
  try {
    let explicit = dest;
    if (typeof dest === "string") {
      explicit = await doc.getDestination(dest);
    }
    if (!Array.isArray(explicit) || !explicit[0]) return null;
    const ref = explicit[0];
    const pageIndex = await doc.getPageIndex(ref); // 0-based
    return pageIndex + 1;
  } catch (e) {
    return null;
  }
}

// ---- Walk the outline (bookmarks) recursively ----
const outline = await doc.getOutline();
let nodeId = 0;
async function walk(items, depth) {
  const out = [];
  if (!items) return out;
  for (const it of items) {
    const page = await destToPageNumber(it.dest);
    const node = {
      id: ++nodeId,
      title: (it.title || "").trim(),
      depth,
      startPage: page,
      children: await walk(it.items, depth + 1),
    };
    out.push(node);
  }
  return out;
}
const toc = await walk(outline, 0);

// ---- Extract per-page text ----
const pages = [];
for (let p = 1; p <= numPages; p++) {
  const page = await doc.getPage(p);
  const content = await page.getTextContent();
  // Reconstruct text with rough line breaks based on y position
  let text = "";
  let lastY = null;
  for (const item of content.items) {
    if (!("str" in item)) continue;
    const y = item.transform[5];
    if (lastY !== null && Math.abs(y - lastY) > 2) text += "\n";
    text += item.str;
    if (item.hasEOL) text += "\n";
    lastY = y;
  }
  text = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  pages.push({ page: p, text });
  if (p % 50 === 0) console.log(`  ...extracted ${p}/${numPages} pages`);
}

// ---- Flatten top-level outline into chapters ----
// Heuristic: top-level nodes whose title looks like a chapter, plus front/back matter.
function flatten(nodes, acc = []) {
  for (const n of nodes) {
    acc.push(n);
    if (n.children) flatten(n.children, acc);
  }
  return acc;
}
const allNodes = flatten(toc);

// Identify chapter nodes: depth 0 entries. The book also has Preface, ToC, Index, etc.
const topLevel = toc.slice();

// Map a node to a chapter number if its title matches a chapter pattern
function chapterNumber(title) {
  const m = title.match(/^\s*(?:Chapter\s+)?(\d{1,2})\b[\s.:–-]/i);
  if (m) return parseInt(m[1], 10);
  return null;
}

// Build chapters: use top-level nodes; compute end page from next node's start.
const sorted = topLevel
  .filter((n) => n.startPage != null)
  .sort((a, b) => a.startPage - b.startPage);

const chapters = [];
for (let i = 0; i < sorted.length; i++) {
  const n = sorted[i];
  const next = sorted[i + 1];
  const endPage = next ? next.startPage - 1 : numPages;
  // count headings (descendant nodes) inside this top-level node
  const headingCount = n.children ? flatten(n.children).length : 0;
  chapters.push({
    id: n.id,
    title: n.title,
    chapterNumber: chapterNumber(n.title),
    startPage: n.startPage,
    endPage,
    pageCount: endPage - n.startPage + 1,
    headingCount,
  });
}

fs.writeFileSync(path.join(DATA, "toc.json"), JSON.stringify(toc, null, 2));
fs.writeFileSync(path.join(DATA, "pages.json"), JSON.stringify(pages, null, 2));
fs.writeFileSync(path.join(DATA, "chapters.json"), JSON.stringify(chapters, null, 2));

// ---- Print summary ----
console.log("\n================ SKELETON SUMMARY ================");
console.log(`Total PDF pages: ${numPages}`);
console.log(`Top-level outline entries: ${toc.length}`);
console.log(`Total outline nodes (all depths): ${allNodes.length}`);
console.log("\n--- Top-level structure (title | startPage–endPage | pages | sub-headings) ---");
for (const c of chapters) {
  const cn = c.chapterNumber != null ? `Ch${String(c.chapterNumber).padStart(2)}` : "  · ";
  console.log(
    `${cn}  p.${String(c.startPage).padStart(3)}–${String(c.endPage).padStart(3)}  ` +
    `(${String(c.pageCount).padStart(3)}p, ${String(c.headingCount).padStart(2)} headings)  ${c.title}`
  );
}
console.log("==================================================");
