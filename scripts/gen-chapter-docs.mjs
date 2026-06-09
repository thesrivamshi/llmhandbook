// Generate docs/chapters/CHnn.md — one grounded brief per chapter for Claude Code.
// Pulls real structure from data/{toc,chapters,figures,pages.clean}.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const OUT = path.join(ROOT, "docs", "chapters");
fs.mkdirSync(OUT, { recursive: true });

const toc = JSON.parse(fs.readFileSync(path.join(DATA, "toc.json"), "utf8"));
const chapters = JSON.parse(fs.readFileSync(path.join(DATA, "chapters.json"), "utf8"));
const figures = JSON.parse(fs.readFileSync(path.join(DATA, "figures.json"), "utf8"));
const pages = JSON.parse(fs.readFileSync(path.join(DATA, "pages.clean.json"), "utf8"));
const pageText = new Map(pages.map((p) => [p.page, p.text]));

// stage mapping
const stageFor = (n) =>
  n <= 2 ? ["Foundations", "#0EA5B7", "teal"]
  : n <= 4 ? ["Feature / Data", "#15A864", "green"]
  : n <= 7 ? ["Training", "#EE9613", "amber"]
  : n <= 10 ? ["Inference", "#EF5C46", "coral"]
  : ["Operations", "#7B61E8", "violet"];

// named tools/products worth a real logo (Claude Code adds to TOOL_REGISTRY)
const TOOLS = [
  "Python", "Poetry", "Poe the Poet", "ZenML", "Hugging Face", "Comet ML", "Comet", "Opik",
  "MongoDB", "Qdrant", "AWS", "SageMaker", "Bedrock", "Docker", "GitHub Actions", "GitHub",
  "Selenium", "FastAPI", "Pydantic", "LangChain", "OpenAI", "Mistral", "Llama", "Bytewax",
  "Superlinked", "vLLM", "Unsloth", "Gradio", "Streamlit", "Terraform", "RunPod", "Beam",
  "Qwak", "TGI", "Ollama", "Pulumi", "GitHub Copilot",
];

// flatten toc to find section for a page + the chapter node
function flatten(nodes, acc = []) {
  for (const n of nodes) { acc.push(n); if (n.children) flatten(n.children, acc); }
  return acc;
}
const chapterNodes = toc.filter((n) => /Chapter \d+:/.test(n.title) || /^Appendix/.test(n.title));

function sectionForPage(chNode, page) {
  const flat = flatten(chNode.children || []).filter((n) => n.startPage != null).sort((a, b) => a.startPage - b.startPage);
  let cur = chNode.title;
  for (const s of flat) { if (s.startPage <= page) cur = s.title; else break; }
  return cur;
}

function excerpt(page) {
  const t = (pageText.get(page) || "").replace(/\s+/g, " ").trim();
  return t.slice(0, 150);
}

function toolsInRange(start, end) {
  const found = new Set();
  let blob = "";
  for (let p = start; p <= end; p++) blob += " " + (pageText.get(p) || "");
  for (const t of TOOLS) {
    const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(blob)) found.add(t);
  }
  // de-dupe Comet/Comet ML and GitHub/GitHub Actions overlaps left to Claude Code
  return [...found];
}

const map = chapters
  .filter((c) => c.chapterNumber != null || /Appendix/.test(c.title))
  .map((c) => ({ ...c, num: c.chapterNumber ?? 12 }));

// Build a doc for each chapter node we have a meta for
function buildDoc(meta) {
  const num = meta.chapterNumber ?? 12;
  const isAppendix = meta.chapterNumber == null;
  const [stageLabel, hex] = stageFor(num);
  const node = chapterNodes.find((n) => n.title === meta.title) || chapterNodes.find((n) => new RegExp(`Chapter ${num}:`).test(n.title));
  const figs = figures.filter((f) => {
    const major = parseInt(f.id.split(".")[0], 10);
    return major === num;
  });
  const tools = toolsInRange(meta.startPage, meta.endPage);
  const idNum = String(num).padStart(2, "0");
  const fname = isAppendix ? "CH12-APPENDIX.md" : `CH${idNum}.md`;

  const sections = node ? flatten(node.children || []).filter((n) => n.startPage != null) : [];

  let md = "";
  md += `# ${isAppendix ? "Appendix" : `Chapter ${num}`} — brief for Claude Code\n\n`;
  md += `> ${meta.title}\n\n`;
  md += `- **Stage:** ${stageLabel} (accent \`${hex}\`) — use \`stageForChapter(${num})\` / \`accentForChapter(${num})\`.\n`;
  md += `- **PDF pages:** ${meta.startPage}–${meta.endPage}  (**${meta.pageCount} pages**, ${meta.headingCount} headings)\n`;
  md += `- **Target:** one bespoke diagram per *content* page. Skip pure dividers, the references list, and the "Join our Discord" page.\n`;
  md += `- **Output file:** \`src/diagrams/chapter${num}.tsx\` exporting \`const CHAPTER${num}: PageDiagram[]\`, then register it in \`src/book.ts\`.\n\n`;

  if (num === 1) {
    md += `> ✅ **Chapter 1 is already DONE** — see \`src/diagrams/chapter1.tsx\`. Use it as the reference for style, density, and the brand-logo usage. Do not redo it.\n\n`;
  }

  md += `## Figures to redraw faithfully (schematic, NOT bitmap)\n\n`;
  if (figs.length === 0) md += `_None detected in this chapter._\n\n`;
  else {
    md += `Look at the rendered PNG in \`data/figures/p{page}.png\`, then rebuild the meaning with the shape alphabet + brand logos.\n\n`;
    md += `| Figure | PDF page | PNG | Caption |\n|---|---|---|---|\n`;
    for (const f of figs) md += `| ${f.id} | ${f.page} | \`data/figures/p${f.page}.png\` | ${f.caption.replace(/\|/g, "/")} |\n`;
    md += `\n`;
  }

  md += `## Named tools introduced here (add to \`TOOL_REGISTRY\` with real logos)\n\n`;
  md += tools.length ? tools.map((t) => `\`${t}\``).join(", ") + "\n\n" : "_No new named products detected; mostly generic concepts._\n\n";
  md += `For each: try its \`simple-icons\` slug first; if missing, add a fallback pill with the vendor's brand colour (see DESIGN-SYSTEM.md). Specific products = real logos; generic ideas = shape alphabet.\n\n`;

  md += `## Sections (from the book's real outline)\n\n`;
  for (const s of sections) {
    const indent = "  ".repeat(Math.max(0, s.depth - 1));
    md += `${indent}- p.${s.startPage} — ${s.title}\n`;
  }
  md += `\n`;

  md += `## Per-page worksheet (fill archetype + concept, then build the diagram)\n\n`;
  md += `Read the **full** cleaned text of each page in \`data/pages.clean.json\` before drawing — the excerpt below is only a hint. Pick ONE archetype per page from: single-concept · pipeline-flow · architecture · comparison · list-cluster · cycle · hierarchy · code-anatomy · formula-as-blocks · pitfall. No generic unlabeled boxes.\n\n`;
  md += `| Page | Section | Archetype (you fill) | First line of the real text (hint) |\n|---|---|---|---|\n`;
  for (let p = meta.startPage; p <= meta.endPage; p++) {
    const sec = sectionForPage(node || { title: meta.title, children: [] }, p);
    const ex = excerpt(p).replace(/\|/g, "/");
    md += `| ${p} |  ${sec.replace(/\|/g, "/").slice(0, 40)} | _____ | ${ex} |\n`;
  }
  md += `\n`;

  md += `## Done when\n\n`;
  md += `- Every content page in ${meta.startPage}–${meta.endPage} has a non-generic diagram with term eyebrow + plain title + 1–2 sentence caption (real terminology) + ${stageLabel} accent + page number.\n`;
  md += `- All figures above are redrawn as clean schematics (no bitmaps); architecture figures use real tool logos as nodes.\n`;
  md += `- \`CHAPTER${num}\` is registered in \`src/book.ts\` and shows in the sidebar + reader.\n`;
  md += `- \`npx tsc -b\` and \`npm run build\` are clean; you screenshot the chapter and self-critique for shape consistency before moving on.\n`;

  fs.writeFileSync(path.join(OUT, fname), md);
  return fname;
}

const written = map.map(buildDoc);
console.log("Wrote chapter docs:\n  " + written.join("\n  "));
console.log(`\nTotal: ${written.length} files in docs/chapters/`);
