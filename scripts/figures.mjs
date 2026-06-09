// Task 2 — Rasterize figures. Scan for /Figure \d+\.\d+/, render those PDF pages
// to PNG at ~150 DPI into data/figures/, and write data/figures.json.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const FIG_DIR = path.join(DATA, "figures");
fs.mkdirSync(FIG_DIR, { recursive: true });

const pages = JSON.parse(fs.readFileSync(path.join(DATA, "pages.clean.json"), "utf8"));
const PDF = path.join(ROOT, "book.pdf");

const FIG_RE = /Figure\s+(\d+\.\d+)/g;

// Collect figure ids + their caption line + page.
const figures = [];
const seen = new Set();
const pagesWithFigures = new Set();

for (const { page, text } of pages) {
  const lines = text.split("\n");
  for (const line of lines) {
    let m;
    FIG_RE.lastIndex = 0;
    while ((m = FIG_RE.exec(line)) !== null) {
      const id = m[1];
      pagesWithFigures.add(page);
      // Prefer the line that looks like a caption: "Figure X.Y: ..." or "Figure X.Y – ..."
      const isCaption = /Figure\s+\d+\.\d+\s*[:.–—-]/.test(line);
      const key = id;
      const existing = figures.find((f) => f.id === key);
      const caption = line.trim().replace(/\s+/g, " ");
      if (!existing) {
        figures.push({ id, page, caption, isCaption, image: `figures/p${page}.png` });
        seen.add(id);
      } else if (isCaption && !existing.isCaption) {
        // upgrade to the page that actually holds the caption
        existing.page = page;
        existing.caption = caption;
        existing.isCaption = true;
        existing.image = `figures/p${page}.png`;
      }
    }
  }
}

// Final set of pages to render = every page that holds a figure id (caption or ref).
const renderPages = [...new Set(figures.map((f) => f.page))].sort((a, b) => a - b);

console.log(`Found ${figures.length} distinct figure ids across ${pagesWithFigures.size} pages.`);
console.log(`Rendering ${renderPages.length} pages that contain a figure caption/reference...`);

for (const p of renderPages) {
  const outPrefix = path.join(FIG_DIR, `p${p}`);
  if (fs.existsSync(`${outPrefix}.png`)) continue;
  // pdftoppm -f p -l p -r 150 -png book.pdf prefix  -> prefix-<n>.png ; use -singlefile
  execFileSync("pdftoppm", [
    "-f", String(p), "-l", String(p),
    "-r", "150", "-png", "-singlefile",
    PDF, outPrefix,
  ]);
}

// Sort figures by numeric id for a tidy manifest.
figures.sort((a, b) => {
  const [a1, a2] = a.id.split(".").map(Number);
  const [b1, b2] = b.id.split(".").map(Number);
  return a1 - b1 || a2 - b2;
});

fs.writeFileSync(path.join(DATA, "figures.json"), JSON.stringify(figures, null, 2));

console.log(`\nWrote data/figures.json with ${figures.length} entries.`);
console.log(`Rendered ${renderPages.length} PNGs into data/figures/.`);
console.log("\n--- sample entries ---");
for (const f of figures.slice(0, 5)) console.log("  ", JSON.stringify(f));
// quick per-chapter tally
console.log("\n--- figure ids found ---");
console.log("  " + figures.map((f) => f.id).join(", "));
