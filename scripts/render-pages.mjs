// Render EVERY PDF page to a PNG so the reader can show the exact printed page
// (text + figures + tables + equations) — guaranteeing nothing is missed.
// Output: data/page-images/p{n}.png  (150 DPI). Idempotent: skips existing.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PDF = path.join(ROOT, "book.pdf");
const OUT = path.join(ROOT, "data", "page-images");
fs.mkdirSync(OUT, { recursive: true });

// page count from pages.json
const pages = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "pages.json"), "utf8"));
const total = pages.length;
const dpi = process.env.DPI || "150";

let made = 0;
for (let p = 1; p <= total; p++) {
  const out = path.join(OUT, `p${p}`);
  if (fs.existsSync(`${out}.png`)) continue;
  execFileSync("pdftoppm", ["-f", String(p), "-l", String(p), "-r", dpi, "-png", "-singlefile", PDF, out]);
  made++;
  if (made % 50 === 0) console.log(`  ...rendered ${made}`);
}
console.log(`Done. ${total} pages total, ${made} newly rendered into data/page-images/`);
